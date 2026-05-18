package lv.venta.coursecatalog.service.export;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * F11 prasība: Rich-text HTML satura tīrīšana eksporta veidnēm.
 *
 * <p>RichTextEditor frontend (Tiptap) glabā saturu kā HTML — piemēram
 * <code>&lt;p&gt;teksts&lt;/p&gt;&lt;ul&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt;</code>.
 * PDF veidnē šis HTML tiek iegults caur <code>th:utext</code>, tāpēc lietotājs potenciāli varētu ievietot bīstamus birku veidus. Šī klase atstāj
 * tikai drošas formatēšanas birkas un noņem visus atribūtus.</p>
 *
 * <p>DOCX rendererim HTML birkas nav iespējams iegult tieši — tas saņem
 * <em>plain text</em> ar paragrāfu sadalījumu caur {@link #toPlainParagraphs}.</p>
 */
@Component
public class RichTextSanitizer {

    private static final Safelist SAFELIST = new Safelist()
            .addTags("p", "ul", "ol", "li", "strong", "b", "em", "i", "u", "br");

    /**
     * Atgriež drošu HTML PDF veidnei. Null vai tukšs ieraksts -> tukša virkne.
     */
    public String sanitizeForHtml(String rawHtml) {
        if (rawHtml == null || rawHtml.isBlank()) return "";
        return Jsoup.clean(rawHtml, SAFELIST);
    }

    /**
     * Atgriež satura tekstu kā plain-text paragrāfu sarakstu DOCX rendererim.
     * Katrs HTML &lt;p&gt; vai &lt;li&gt; kļūst par atsevišķu paragrāfu;
     * &lt;li&gt; tiek prefiksēts ar bullet zīmi vai numuru atkarībā no vecāka
     * elementa (&lt;ul&gt; vai &lt;ol&gt;).
     */
    public List<String> toPlainParagraphs(String rawHtml) {
        List<String> paragraphs = new ArrayList<>();
        if (rawHtml == null || rawHtml.isBlank()) return paragraphs;

        Document doc = Jsoup.parseBodyFragment(rawHtml);
        Element body = doc.body();

        for (Node child : body.childNodes()) {
            collectParagraphs(child, paragraphs);
        }

        if (paragraphs.isEmpty()) {
            String fallback = body.text().trim();
            if (!fallback.isEmpty()) paragraphs.add(fallback);
        }
        return paragraphs;
    }

    /**
     * Rekursīva palīgmetode — apstaigā HTML mezglu koku un izvelk paragrāfu tekstu.
     * &lt;ul&gt;/&lt;ol&gt; pārvērš par bullet/numurētiem sarakstiem; &lt;p&gt;, &lt;div&gt;, &lt;br&gt;
     * katrs kļūst par atsevišķu paragrāfu, iekļautās birkas (strong, em u.c.) apvieno kā vienu rindiņu.
     */
    private void collectParagraphs(Node node, List<String> out) {
        if (node instanceof TextNode tn) {
            String t = tn.text().trim();
            if (!t.isEmpty()) out.add(t);
            return;
        }
        if (!(node instanceof Element el)) return;

        String tag = el.tagName();
        if ("ul".equals(tag) || "ol".equals(tag)) {
            boolean ordered = "ol".equals(tag);
            int idx = 1;
            for (Element li : el.children()) {
                if ("li".equals(li.tagName())) {
                    String text = li.text().trim();
                    if (!text.isEmpty()) {
                        out.add((ordered ? (idx + ". ") : "• ") + text);
                        idx++;
                    }
                }
            }
            return;
        }
        if ("p".equals(tag) || "div".equals(tag) || "br".equals(tag)) {
            String text = el.text().trim();
            if (!text.isEmpty()) out.add(text);
            return;
        }
        // Iekļautas birkas (strong, em u.c.) — apvieno tekstu kā vienu paragrāfu
        String text = el.text().trim();
        if (!text.isEmpty()) out.add(text);
    }
}
