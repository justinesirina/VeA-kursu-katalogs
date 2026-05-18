package lv.venta.coursecatalog.controller.export;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lv.venta.coursecatalog.service.export.CourseExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

/**
 * F11 prasība: kursa apraksta eksports PDF un DOCX formātos.
 *
 * <p>Endpointi adresēti pēc kursa versijas ID, lai lietotājs var eksportēt
 * gan aktīvo, gan vēsturisku versiju. </p>
 */
@RestController
@RequestMapping("/api/course-versions")
@Tag(name = "Kursu eksports",
        description = "F11 prasība: viena kursa apraksta lejupielāde PDF vai DOCX formātā")
public class CourseExportController {

    private static final String DOCX_MIME_TYPE =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private final CourseExportService exportService;

    /** Konstruktors — Spring izveido eksporta servisa fasādi. */
    public CourseExportController(CourseExportService exportService) {
        this.exportService = exportService;
    }

    @Operation(summary = "Lejupielādēt vai apskatīt kursa aprakstu PDF formātā",
            description = "Pēc noklusējuma atgriež PDF ar Content-Disposition: attachment. "
                    + "Ar ?inline=true atgriež inline, ko pārlūks atver iebūvētajā PDF skatītājā.")
    @ApiResponse(responseCode = "200", description = "PDF baiti")
    @GetMapping("/{versionId}/export/pdf")
    public ResponseEntity<byte[]> exportPdf(
            @PathVariable UUID versionId,
            @RequestParam(value = "inline", defaultValue = "false") boolean inline) {
        // Servisa slānis sagatavo PDF baitus un ieteikto faila nosaukumu;
        // kontroliera uzdevums ir tikai pareizi noformēt HTTP atbildi.
        byte[] body = exportService.exportPdf(versionId);
        String filename = exportService.suggestedFileName(versionId, "pdf");
        return ResponseEntity.ok()
                .headers(buildHeaders(MediaType.APPLICATION_PDF, filename, inline))
                .body(body);
    }

    @Operation(summary = "Lejupielādēt kursa aprakstu DOCX formātā")
    @ApiResponse(responseCode = "200", description = "DOCX baiti ar attachment Content-Disposition")
    @GetMapping("/{versionId}/export/docx")
    public ResponseEntity<byte[]> exportDocx(@PathVariable UUID versionId) {
        // DOCX vienmēr ir attachment (inline=false), jo pārlūki to nevar to atvērt iebūvēti –
        // tas vienmēr tiek lejupielādēts un atvērts ārējā lietotnē (piem., Word).
        byte[] body = exportService.exportDocx(versionId);
        String filename = exportService.suggestedFileName(versionId, "docx");
        return ResponseEntity.ok()
                .headers(buildHeaders(MediaType.parseMediaType(DOCX_MIME_TYPE), filename, false))
                .body(body);
    }

    /**
     * Veido Content-Disposition headeri kā {@code attachment} (lejupielāde)
     * vai kā {@code inline} (apskatīšana pārlūka iebūvētajā skatītājā).
     * Visos gadījumos latviešu rakstzīmes failu nosaukumā tiek saglabātas
     * caur RFC 5987 {@code filename*=UTF-8''...}; ASCII fallback ir pievienots
     * vecākiem klientiem.
     */
    private static HttpHeaders buildHeaders(MediaType type, String filename, boolean inline) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(type);

        // RFC 5987 percent-kodēta vērtība mūsdienu pārlūkiem (saglabā ā, č, ē u.c.).
        // URLEncoder atstarpes pārveido par "+", bet RFC 5987 prasa %20, tāpēc to aizvietojam.
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        // ASCII rezerves variants vecākiem klientiem: visas ne-drukājamās/ne-ASCII rakstzīmes -> "_".
        String asciiFallback = filename.replaceAll("[^\\x20-\\x7E]", "_");
        // "inline" = atvērt pārlūkā (tikai PDF); "attachment" = piespiest lejupielādi.
        String disposition = inline ? "inline" : "attachment";

        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                disposition + "; filename=\"" + asciiFallback + "\"; filename*=UTF-8''" + encoded);
        // no-store: eksports vienmēr ir aktuālā versija; pārlūks/proxy nedrīkst kešot.
        headers.setCacheControl("no-store");
        return headers;
    }
}
