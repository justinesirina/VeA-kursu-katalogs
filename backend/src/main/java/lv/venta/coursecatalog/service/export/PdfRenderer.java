package lv.venta.coursecatalog.service.export;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import lv.venta.coursecatalog.model.dto.ResultAssessmentDTO;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * F11 prasība: PDF eksporta render. Ievada {@link CourseDetailsDTO} Thymeleaf
 * šablonā, pārveido iegūto HTML par PDF ar openhtmltopdf bibliotēku.
 *
 * <p>Izmanto Tinos fontu (saderīgs ar Times New Roman, Apache 2.0
 * licence) ar pilnu latviešu valodas atbalstu un ieguļ VeA logo PNG formātā kā
 * data: URI templates galvenē.</p>
 */
@Component
public class PdfRenderer {

    private static final String TEMPLATE_NAME = "export/course-pdf";
    private static final String CSS_RESOURCE = "templates/export/course-pdf.css";
    private static final String LOGO_RESOURCE = "static/vea-logo.png";

    private static final String[][] FONT_FILES = {
            {"fonts/Tinos-Regular.ttf",    "400", "normal"},
            {"fonts/Tinos-Bold.ttf",       "700", "normal"},
            {"fonts/Tinos-Italic.ttf",     "400", "italic"},
            {"fonts/Tinos-BoldItalic.ttf", "700", "italic"}
    };

    private final TemplateEngine templateEngine;
    private final RichTextSanitizer sanitizer;

    /**
     * Regex, kas atrod {@code <col ... />} (XHTML self-closing) un aizvieto ar
     * {@code <col ... ></col>} (pilns tag pāris). Vajadzīgs, jo Thymeleaf
     * HTML5 template mode izvada {@code <col>} kā void element (bez aizvēršanas),
     * bet openhtmltopdf SAX parser prasa pilnu XHTML tag pāri.
     * Word boundary {@code \b} pēc "col" garantē, ka {@code <colgroup>} netiek skarts.
     */
    private static final Pattern COL_VOID_PATTERN =
            Pattern.compile("<col\\b([^>]*)/?>(?!\\s*</col>)", Pattern.CASE_INSENSITIVE);

    /** Tā pati problēma ar {@code <colgroup>} — Thymeleaf HTML mode noņem closing tag. */
    private static final Pattern COLGROUP_OPEN_PATTERN =
            Pattern.compile("<colgroup\\b([^>]*)>", Pattern.CASE_INSENSITIVE);

    /**
     * Konstruktors. Izveido atsevišķu Thymeleaf engine ar XHTML template mode,
     * lai output ir XML-valid (openhtmltopdf SAX parser to prasa). Output vēl
     * tiek pēc-processēts ar {@link #COL_VOID_PATTERN}, jo Thymeleaf izvada
     * {@code <col>} bez closing tag arī XHTML mode.
     */
    public PdfRenderer(RichTextSanitizer sanitizer) {
        this.sanitizer = sanitizer;
        this.templateEngine = buildXhtmlTemplateEngine();
    }

    /** XHTML mode template engine */
    private static TemplateEngine buildXhtmlTemplateEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(true);

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }

    /**
     * Metode, kas apvieno DTO ar Thymeleaf veidni, ģenerē HTML un
     * pārveido to PDF baitu masīvā ar openhtmltopdf bibliotēku.
     */
    public byte[] render(CourseDetailsDTO course) {
        if (course == null) {
            throw new IllegalArgumentException("CourseDetailsDTO nedrīkst būt null");
        }

        Context ctx = new Context();
        ctx.setVariable("course", course);
        ctx.setVariable("css", readClasspathString(CSS_RESOURCE));
        ctx.setVariable("logoDataUri", buildLogoDataUri());
        ctx.setVariable("rt", sanitizer);

        // Negrupētie SKR pa kategorijām — 3 atsevišķi context variables, 
        // lai izvairītos no latviešu rakstzīmēm Thymeleaf izteiksmēs
        Map<String, List<ResultAssessmentDTO>> skr = groupSkrByCategory(course);
        ctx.setVariable("skrZinasanas", skr.get("Zināšanas"));
        ctx.setVariable("skrPrasmes", skr.get("Prasmes"));
        ctx.setVariable("skrKompetences", skr.get("Kompetences"));

        String html = templateEngine.process(TEMPLATE_NAME, ctx);
        // Pārliecinās, ka <col> un <colgroup> tagi ir XHTML well-formed pirms padod
        // openhtmltopdf SAX parserim. Thymeleaf HTML5 mode šos void elementus
        // izvada bez closing tag, kas SAX parser noraida.
        html = ensureXhtmlWellFormed(html);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            registerFonts(builder);
            builder.withHtmlContent(html, null);
            builder.toStream(out);
            builder.run();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Neizdevās ģenerēt PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Pārveido Thymeleaf renderēto HTML5 izvadi par XHTML well-formed, lai openhtmltopdf
     * SAX parser to varētu apstrādāt. Thymeleaf HTML5 mode izvada void elementus
     * ({@code <col>}, {@code <colgroup>}) bez closing tag, bet SAX parser to noraida.
     *
     * <p>Algoritms: vispirms aizvieto {@code <col ... />} ar {@code <col ... ></col>};
     * tad katrai {@code <colgroup>...} sekvencei pārbauda, vai nākamais aizvēršanas tag
     * jau ir {@code </colgroup>}, ja nav, ievieto to pirms nākamā atvēršanas tag vai
     * {@code </table>}.
     */
    private static String ensureXhtmlWellFormed(String html) {
        // 1. col elementu pārveide
        String fixed = COL_VOID_PATTERN.matcher(html).replaceAll("<col$1></col>");

        // 2. colgroup noslēgšana ar StringBuilder (lambda izvairīšanai)
        StringBuilder sb = new StringBuilder(fixed.length() + 64);
        int pos = 0;
        var matcher = COLGROUP_OPEN_PATTERN.matcher(fixed);
        while (matcher.find()) {
            sb.append(fixed, pos, matcher.end());
            int end = matcher.end();
            int closeIdx = fixed.indexOf("</colgroup>", end);
            int nextOpenIdx = fixed.indexOf("<colgroup", end);
            int tableEndIdx = fixed.indexOf("</table>", end);
            boolean alreadyClosed = closeIdx != -1
                    && (nextOpenIdx == -1 || closeIdx < nextOpenIdx)
                    && (tableEndIdx == -1 || closeIdx < tableEndIdx);
            if (!alreadyClosed) {
                sb.append("</colgroup>");
            }
            pos = end;
        }
        sb.append(fixed, pos, fixed.length());
        return sb.toString();
    }

    /**
     * Reģistrē Tinos fontu PDF rendererī visās četrās variācijās (regular/bold × normal/italic).
     * Fonta failus pārkopē uz pagaidu mapi, jo openhtmltopdf nepieņem classpath InputStream tieši.
     */
    private void registerFonts(PdfRendererBuilder builder) {
        for (String[] f : FONT_FILES) {
            String resourcePath = f[0];
            int weight = Integer.parseInt(f[1]);
            FontStyle style = "italic".equals(f[2]) ? FontStyle.ITALIC : FontStyle.NORMAL;
            Path tempFont = copyClasspathToTemp(resourcePath, ".ttf");
            if (tempFont != null) {
                builder.useFont(tempFont.toFile(), "Tinos", weight, style, true);
            }
        }
    }

    /** Pārkopē classpath resursu uz pagaidu failu, lai to varētu nodot bibliotēkām, kas pieprasa File objektu. */
    private Path copyClasspathToTemp(String classpath, String suffix) {
        try (InputStream in = new ClassPathResource(classpath).getInputStream()) {
            Path tmp = Files.createTempFile("export-", suffix);
            tmp.toFile().deleteOnExit();
            Files.write(tmp, in.readAllBytes());
            return tmp;
        } catch (IOException e) {
            return null;
        }
    }

    /**
     * Sagrupē SKR pēc kategorijas (Zināšanas/Prasmes/Kompetences) saglabājot kārtību.
     * Atgriež LinkedHashMap ar 3 entry — katrs ar sarakstu (var būt tukšs).
     * Grupēšana izmanto {@code categoryOrder} (Integer 1/2/3).
     */
    private static Map<String, List<ResultAssessmentDTO>> groupSkrByCategory(CourseDetailsDTO course) {
        Map<String, List<ResultAssessmentDTO>> result = new LinkedHashMap<>();
        result.put("Zināšanas", new ArrayList<>());
        result.put("Prasmes", new ArrayList<>());
        result.put("Kompetences", new ArrayList<>());

        if (course.getResultAssessments() != null) {
            for (ResultAssessmentDTO r : course.getResultAssessments()) {
                Integer order = r.getCategoryOrder();
                String key = null;
                if (order != null) {
                    if (order == 1) key = "Zināšanas";
                    else if (order == 2) key = "Prasmes";
                    else if (order == 3) key = "Kompetences";
                }
                if (key != null) {
                    result.get(key).add(r);
                }
            }
        }
        return result;
    }

    /** Nolasa classpath resursu kā UTF-8 virkni (izmantots CSS satura iegulšanai veidnē). */
    private String readClasspathString(String classpath) {
        try (InputStream in = new ClassPathResource(classpath).getInputStream()) {
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "";
        }
    }

    /** Konvertē VeA logo PNG par base64 data: URI virkni, ko iegulst Thymeleaf veidnes &lt;img&gt; tagā. */
    private String buildLogoDataUri() {
        try (InputStream in = new ClassPathResource(LOGO_RESOURCE).getInputStream()) {
            byte[] bytes = in.readAllBytes();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(bytes);
        } catch (IOException e) {
            return "";
        }
    }
}
