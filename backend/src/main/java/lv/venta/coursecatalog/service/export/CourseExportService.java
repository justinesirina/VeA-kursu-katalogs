package lv.venta.coursecatalog.service.export;

import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import lv.venta.coursecatalog.service.courseinfo.CourseInfoService;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Stream;

/**
 * F11 prasība: fasāde, kas savieno datu ielādi un eksporta renderēšanu.
 *
 * <p>Lieto eksistējošo {@link CourseInfoService#getCourseDetailsByVersionId(UUID)},
 * lai iegūtu pilnu {@link CourseDetailsDTO}, un nodod to PDF vai DOCX
 * renderim. Eksporta DTO netiek veidots, jo CourseDetailsDTO jau satur visus
 * 7 sadaļu datus.</p>
 */
@Service
public class CourseExportService {

    private final CourseInfoService courseInfoService;
    private final PdfRenderer pdfRenderer;
    private final DocxRenderer docxRenderer;

    /** Konstruktors — Spring iesprauž datu servisu un abus renderus. */
    public CourseExportService(CourseInfoService courseInfoService,
                               PdfRenderer pdfRenderer,
                               DocxRenderer docxRenderer) {
        this.courseInfoService = courseInfoService;
        this.pdfRenderer = pdfRenderer;
        this.docxRenderer = docxRenderer;
    }

    /** Ielādē kursa versiju un atgriež PDF baitus, ko gatavoja {@link PdfRenderer}. */
    public byte[] exportPdf(UUID versionId) {
        CourseDetailsDTO course = courseInfoService.getCourseDetailsByVersionId(versionId);
        return pdfRenderer.render(course);
    }

    /** Ielādē kursa versiju un atgriež DOCX baitus, ko gatavoja {@link DocxRenderer}. */
    public byte[] exportDocx(UUID versionId) {
        CourseDetailsDTO course = courseInfoService.getCourseDetailsByVersionId(versionId);
        return docxRenderer.render(course);
    }

    /**
     * Faila nosaukums lejupielādei.
     * Forma: {@code <kursaKods>_<nosaukumsLatviski>_<gads>_<semestris>.<paplašinājums>}.
     * Latviešu rakstzīmes saglabājas; tiek aizstātas tikai operētājsistēmai aizliegtas
     * rakstzīmes (/, \, :, *, ?, ", &lt;, &gt;, |). HTTP Content-Disposition headerī
     * šis nosaukums tiek URL-kodēts ar UTF-8 (RFC 5987).
     */
    public String suggestedFileName(UUID versionId, String extension) {
        CourseDetailsDTO course = courseInfoService.getCourseDetailsByVersionId(versionId);
        String code = course.getCourseCode();
        String title = course.getTitleLv();
        String year = course.getAcademicYear();
        String semester = course.getSemester();

        // Akadēmiskais gads parasti ir "2024/2025" — slash filename nav atļauts
        if (year != null) year = year.replace('/', '-');

        String joined = Stream.of(code, title, year, semester)
                .filter(s -> s != null && !s.isBlank())
                .reduce((a, b) -> a + "_" + b)
                .orElse("kurss");

        // OS-aizliegtas rakstzīmes -> apakšsvītra
        String safe = joined.replaceAll("[/\\\\:*?\"<>|]", "_").trim();
        return safe + "." + extension;
    }
}
