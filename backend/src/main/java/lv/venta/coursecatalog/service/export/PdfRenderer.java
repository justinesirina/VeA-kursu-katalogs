package lv.venta.coursecatalog.service.export;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder.FontStyle;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * F11 prasība: PDF eksporta render. Ievada {@link CourseDetailsDTO} Thymeleaf
 * šablonā, pārveido iegūto HTML par PDF ar openhtmltopdf bibliotēku.
 *
 * <p>Reģistrē Tinos fontu (saderīgs ar Times New Roman, Apache 2.0
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

    /** Konstruktors — Spring izveido Thymeleaf veidņu dzini un rich-text sanitaizeri. */
    public PdfRenderer(TemplateEngine templateEngine, RichTextSanitizer sanitizer) {
        this.templateEngine = templateEngine;
        this.sanitizer = sanitizer;
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

        String html = templateEngine.process(TEMPLATE_NAME, ctx);

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
