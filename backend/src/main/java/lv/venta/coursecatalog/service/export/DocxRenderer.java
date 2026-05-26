package lv.venta.coursecatalog.service.export;

import lv.venta.coursecatalog.model.dto.AssessmentComponentDTO;
import lv.venta.coursecatalog.model.dto.CalendarPlanDTO;
import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import lv.venta.coursecatalog.model.dto.LiteratureDTO;
import lv.venta.coursecatalog.model.dto.LiteratureGroupDTO;
import lv.venta.coursecatalog.model.dto.PrerequisiteDTO;
import lv.venta.coursecatalog.model.dto.ResultAssessmentDTO;
import lv.venta.coursecatalog.model.dto.SelfStudyDTO;
import lv.venta.coursecatalog.model.dto.StaffMemberDTO;
import lv.venta.coursecatalog.model.dto.StudyProgramLinkDTO;
import lv.venta.coursecatalog.model.dto.TopicDTO;
import org.apache.poi.xwpf.usermodel.Document;
import org.apache.poi.xwpf.usermodel.LineSpacingRule;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFFooter;
import org.apache.poi.xwpf.usermodel.XWPFHeader;
import org.apache.poi.xwpf.usermodel.XWPFHyperlinkRun;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.apache.poi.wp.usermodel.HeaderFooterType;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTBody;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageSz;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTblWidth;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STTblWidth;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * F11 prasība: DOCX eksporta render. Izveido Microsoft Word dokumentu
 * ar Apache POI XWPF API. Saturs un struktūra ir paralēla {@code course-pdf.html}
 * veidnei, atbilstoši VeA oficiālā kursa apraksta paraugam.
 *
 * <p>Galvenie formatējuma parametri ir šādi (lai nodrošinātu maksimālu saderību ar VeA PDF veidni):
 * <ul>
 *   <li>Fonts: Times New Roman visur (PDF lieto Tinos kā vizuāli saderīgu)</li>
 *   <li>Lapa: A4 (21cm × 29.7cm), margins 2cm visapkārt, izņemot no kreisās puses 3cm.</li>
 *   <li>Tabulu kopplatums: 16cm, header šūnu fons #F2F2F2</li>
 *   <li>Sekcijas: 14pt bold, apakšsekcijas 12pt bold, spacing before 6pt</li>
 *   <li>Kursa nosaukums: 14pt bold, UPPER CASE LV centrēts; 12pt italic EN centrēts</li>
 *   <li>Section Header: logo (kreisā) + statusa rekvizīti (labā, 9pt)</li>
 *   <li>Footer: vienkārša lapas numerācija</li>
 * </ul>
 */
@Component
public class DocxRenderer {

    private static final String FONT = "Times New Roman";
    private static final String LOGO_RESOURCE = "static/vea-logo.png";
    private static final String SHADE_COLOR = "F2F2F2";

    // Word vienības konvertēšana:
    //   1 cm = 567 DXA (twentieths of a point) tabulu un margin platumiem
    //   1 cm = 360 000 EMU (English Metric Units) attēlu izmēriem
    //   1 pt = 20 twips paragrāfu spacing parametriem
    private static final int CM_TO_DXA = 567;
    private static final int CM_TO_EMU = 360_000;
    private static final int PT_TO_TWIPS = 20;

    // Tabulu kopplatums un kolonnas (cm)
    private static final int TABLE_WIDTH_CM = 16;

    // SKR kategorijas — fiksēta kārtība, atbilst ResultAssessmentDTO.categoryName
    private static final List<String> SKR_CATEGORIES =
            List.of("Zināšanas", "Prasmes", "Kompetences");

    private final RichTextSanitizer sanitizer;

    /** Konstruktors — Spring izveido rich-text sanitaizera komponenti. */
    public DocxRenderer(RichTextSanitizer sanitizer) {
        this.sanitizer = sanitizer;
    }

    /**
     * Metode, kas saņem kursa datus un izveido pilnu DOCX dokumentu
     * ar visām 7 sadaļām. Atgriež baitu masīvu, ko kontrolieris nosūta klientam.
     */
    public byte[] render(CourseDetailsDTO course) {
        if (course == null) {
            throw new IllegalArgumentException("CourseDetailsDTO nedrīkst būt null");
        }

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            setupA4PageAndMargins(doc);
            buildSectionHeader(doc, course);
            buildFooter(doc);

            buildBodyDocLabel(doc);
            buildTitle(doc, course);

            buildSection1Pamatdati(doc, course);
            buildSection2Apraksts(doc, course);
            buildSection3SKR(doc, course);
            buildSection4Temas(doc, course);
            buildSection5Kalendars(doc, course);
            buildSection6Vertesana(doc, course);
            buildSection7Literatura(doc, course);

            doc.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            // RuntimeException -> GlobalExceptionHandler atgriež 500 (sistēmas kļūda),
            // nevis 400, kas ir rezervēts biznesa loģikas pārkāpumiem (F8 statusu pārejas).
            throw new RuntimeException("Neizdevās ģenerēt DOCX: " + e.getMessage(), e);
        }
    }

    // ====================================================================
    // Lapas formāts un Section Header / Footer
    // ====================================================================

    /**
     * Iestata A4 lapas izmēru (21 × 29.7 cm) un 2cm margins visapkārt, izņemot no kreisās puses 3cm.
     * Iespējo arī "Different First Page" (titlePg) — Word funkcija, kas ļauj
     * pirmajā lapā ievietot atšķirīgu header (šajā gadījumā ar logo un rekvizītiem),
     * bet pārējās lapās — atstāt tukšu.
    **/
    private void setupA4PageAndMargins(XWPFDocument doc) {
        CTBody body = doc.getDocument().getBody();
        CTSectPr sectPr = body.isSetSectPr() ? body.getSectPr() : body.addNewSectPr();

        CTPageSz pageSize = sectPr.isSetPgSz() ? sectPr.getPgSz() : sectPr.addNewPgSz();
        pageSize.setW(BigInteger.valueOf(11906)); // 21cm * 567 dxa
        pageSize.setH(BigInteger.valueOf(16838)); // 29.7cm * 567 dxa

        CTPageMar pageMar = sectPr.isSetPgMar() ? sectPr.getPgMar() : sectPr.addNewPgMar();
        pageMar.setTop(BigInteger.valueOf(1134));    // 2cm
        pageMar.setBottom(BigInteger.valueOf(1134)); // 2cm
        pageMar.setLeft(BigInteger.valueOf(1701));   // 3cm
        pageMar.setRight(BigInteger.valueOf(1134));  // 2cm
        pageMar.setHeader(BigInteger.valueOf(720));  // 1.27cm
        pageMar.setFooter(BigInteger.valueOf(720));
        pageMar.setGutter(BigInteger.ZERO);

        // Different First Page — logo un rekvizīti parādās tikai pirmās lapas header
        if (!sectPr.isSetTitlePg()) {
            sectPr.addNewTitlePg();
        }
    }

    /**
     * Veido Word Section Header — parādās TIKAI pirmās lapas augšā (HeaderFooterType.FIRST)
     * izmantojot titlePg iespējas {@link #setupA4PageAndMargins(XWPFDocument)} metodē.
     * Pārējās lapās header paliek tukšs (POI implicitly izveido tukšu DEFAULT header).
     *
     * <p>Saturs — 2 šūnu tabula bez robežām:
     * <ul>
     *   <li>Kreisā šūna (11.5cm) — VeA logo (1.7cm × 6.35cm)</li>
     *   <li>Labā šūna (4.5cm) — versijas statusa rekvizīti 9pt fontā</li>
     * </ul>
     */
    private void buildSectionHeader(XWPFDocument doc, CourseDetailsDTO course) {
        XWPFHeader header = doc.createHeader(HeaderFooterType.FIRST);

        // Noņem POI noklusēto tukšo paragrāfu, lai tabula sākas no header augšas.
        // XWPFHeaderFooter.removeParagraph pieņem tikai XWPFParagraph (ne indeksu),
        // tāpēc izmanto kopēto sarakstu (lai izvairītos no ConcurrentModificationException).
        List<XWPFParagraph> headerParas = new ArrayList<>(header.getParagraphs());
        headerParas.forEach(header::removeParagraph);

        XWPFTable table = header.createTable(1, 2);
        setTableWidthCm(table, TABLE_WIDTH_CM);
        removeAllBorders(table);

        XWPFTableRow row = table.getRow(0);

        // Kreisā šūna — VeA logo
        XWPFTableCell left = row.getCell(0);
        clearCell(left);
        setCellWidthCm(left, 10);
        XWPFParagraph leftP = left.addParagraph();
        leftP.setAlignment(ParagraphAlignment.LEFT);
        leftP.setSpacingAfter(0);
        try (InputStream logoIn = new ClassPathResource(LOGO_RESOURCE).getInputStream()) {
            XWPFRun logoR = leftP.createRun();
            int width = (int) (6.35 * CM_TO_EMU);
            int height = (int) (1.7 * CM_TO_EMU);
            logoR.addPicture(logoIn, Document.PICTURE_TYPE_PNG, "vea-logo.png", width, height);
        } catch (Exception ignored) {
            // Ja logo failu nevar nolasīt, header paliek bez attēla
        }

        // Labā šūna — versijas tehniskie rekvizīti
        XWPFTableCell right = row.getCell(1);
        clearCell(right);
        setCellWidthCm(right, 6);

        String statusLower = course.getVersionStatus() == null
                ? "" : course.getVersionStatus().toLowerCase();
        boolean isApproved = statusLower.contains("apstip");
        boolean isPending = statusLower.contains("iesniegts");
        boolean isDraft = statusLower.contains("melnraksts");
        boolean isRejected = statusLower.contains("noraid");

        if (isApproved) {
            addRightHeaderLine(right, "APSTIPRINĀTS", true);
            if (course.getApprovalDate() != null && !course.getApprovalDate().isBlank()) {
                addRightHeaderLine(right, "ar " + course.getApprovalDate() + " lēmumu", false);
            }
            if (course.getDecisionNumber() != null && !course.getDecisionNumber().isBlank()) {
                addRightHeaderLine(right, course.getDecisionNumber(), false);
            }
            if (course.getDecisionReference() != null && !course.getDecisionReference().isBlank()) {
                addRightHeaderLine(right, "Lēmējinstitūcija: " + course.getDecisionReference(), false);
            }
        } else if (isPending) {
            addRightHeaderLine(right, "IESNIEGTS APSTIPRINĀŠANAI", true);
        } else if (isDraft) {
            addRightHeaderLine(right, "MELNRAKSTS", true);
        } else if (isRejected) {
            addRightHeaderLine(right, "NORAIDĪTA VERSIJA", true);
        } else if (course.getVersionStatus() != null) {
            addRightHeaderLine(right, course.getVersionStatus(), true);
        }
        if (course.getVersionNumber() != null) {
            addRightHeaderLine(right, "Apraksta versija Nr. " + course.getVersionNumber(), false);
        }
    }

    /** Pievieno vienu labās puses header rindu (statusa vai lēmuma rekvizīta tekstu). */
    private void addRightHeaderLine(XWPFTableCell cell, String text, boolean bold) {
        XWPFParagraph p = cell.addParagraph();
        p.setAlignment(ParagraphAlignment.RIGHT);
        p.setSpacingAfter(0);
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(9);
        r.setBold(bold);
        r.setText(text);
    }

    /**
     * Veido Word Section Footer ar vienkāršu lapas numerāciju (PAGE field code).
     * Tā kā ir pievienots Different First Page (titlePg) — POI šādā gadījumā
     * pirmajai lapai izveido atsevišķu FIRST footer (kas pēc noklusējuma būtu tukšs).
     * Tāpēc footer tiek pievienots abiem tipiem (FIRST + DEFAULT) ar identisku saturu,
     * lai lapas numerācija parādās arī pirmajā lapā.
     */
    private void buildFooter(XWPFDocument doc) {
        addPageNumberFooter(doc.createFooter(HeaderFooterType.FIRST));
        addPageNumberFooter(doc.createFooter(HeaderFooterType.DEFAULT));
    }

    /**
     * Aizpilda doto footer ar centrētu PAGE field (vienkārša lapas numerācija 1, 2, 3).
     */
    private void addPageNumberFooter(XWPFFooter footer) {
        List<XWPFParagraph> footerParas = new ArrayList<>(footer.getParagraphs());
        footerParas.forEach(footer::removeParagraph);

        XWPFParagraph p = footer.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingAfter(0);

        // PAGE field code — Word automātiski aizvietos ar pašreizējās lapas numuru
        p.getCTP().addNewFldSimple().setInstr("PAGE \\* MERGEFORMAT");
    }

    // ====================================================================
    // Dokumenta body sākums: "STUDIJU KURSA APRAKSTS" + kursa nosaukums
    // ====================================================================

    /** "STUDIJU KURSA APRAKSTS" — 12pt, centrēts, parastais (ne bold). */
    private void buildBodyDocLabel(XWPFDocument doc) {
        XWPFParagraph p = doc.createParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingBefore(40);
        p.setSpacingAfter(80);
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(12);
        r.setText("STUDIJU KURSA APRAKSTS");
    }

    /**
     * Izvada centrētu kursa nosaukumu LV (14pt bold uppercase) un EN (12pt italic).
     */
    private void buildTitle(XWPFDocument doc, CourseDetailsDTO course) {
        XWPFParagraph titleP = doc.createParagraph();
        titleP.setAlignment(ParagraphAlignment.CENTER);
        titleP.setSpacingBefore(120); // 6pt
        titleP.setSpacingAfter(0);
        XWPFRun titleR = titleP.createRun();
        titleR.setBold(true);
        titleR.setFontFamily(FONT);
        titleR.setFontSize(14);
        titleR.setText(nullSafe(course.getTitleLv()).toUpperCase());

        if (course.getTitleEn() != null && !course.getTitleEn().isBlank()) {
            XWPFParagraph enP = doc.createParagraph();
            enP.setAlignment(ParagraphAlignment.CENTER);
            enP.setSpacingBefore(0);
            enP.setSpacingAfter(240); // 12pt
            XWPFRun enR = enP.createRun();
            enR.setItalic(true);
            enR.setFontFamily(FONT);
            enR.setFontSize(12);
            enR.setText(course.getTitleEn());
        }
    }

    // ====================================================================
    // 1. Pamatdati
    // ====================================================================

    /** 1. sadaļa — kursa pamatdatu tabula (kods, kredītpunkti, fakultāte, valoda, autori utt.). */
    private void buildSection1Pamatdati(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "1. Pamatdati");

        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Kursa kods", orDash(course.getCourseCode())});
        rows.add(new String[]{"Kredītpunkti / ECTS", String.valueOf(course.getCredits())});
        rows.add(new String[]{"Fakultāte", orDash(course.getFacultyName())});
        rows.add(new String[]{"Akadēmiskais gads", orDash(course.getAcademicYear())});
        rows.add(new String[]{"Semestris", orDash(course.getSemester())});
        rows.add(new String[]{"Mācību valoda", orDash(course.getLanguage())});
        rows.add(new String[]{"Pārbaudes forma", orDash(course.getAssessmentForm())});
        rows.add(new String[]{"Autors(-i)", joinStaff(course.getAuthors())});
        rows.add(new String[]{"Pasniedzējs(-i)", joinStaff(course.getTeachers())});
        rows.add(new String[]{"Studiju programma", joinPrograms(course.getStudyPrograms())});

        XWPFTable t = doc.createTable(rows.size(), 2);
        setTableWidthCm(t, TABLE_WIDTH_CM);
        for (int i = 0; i < rows.size(); i++) {
            XWPFTableRow row = t.getRow(i);
            fillCell(row.getCell(0), rows.get(i)[0], true, 11, true);
            fillCell(row.getCell(1), rows.get(i)[1], false, 11, false);
            setCellWidthCm(row.getCell(0), 5.6);
            setCellWidthCm(row.getCell(1), 10.4);
        }
    }

    /** Savieno autoru/pasniedzēju sarakstu vienā vairāku rindu tekstā ar lomu iekavās. */
    private String joinStaff(List<StaffMemberDTO> staff) {
        if (staff == null || staff.isEmpty()) return "–";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < staff.size(); i++) {
            StaffMemberDTO s = staff.get(i);
            sb.append(s.getFullTitle());
            if (s.getRole() != null && !s.getRole().isBlank()) {
                sb.append(" (").append(s.getRole()).append(")");
            }
            if (i < staff.size() - 1) sb.append("\n");
        }
        return sb.toString();
    }

    /** Savieno studiju programmu sarakstu vienā vairāku rindu tekstā, pievienojot programmas daļu). */
    private String joinPrograms(List<StudyProgramLinkDTO> programs) {
        if (programs == null || programs.isEmpty()) return "–";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < programs.size(); i++) {
            StudyProgramLinkDTO p = programs.get(i);
            sb.append(p.getProgramName());
            if (p.getPartName() != null && !p.getPartName().isBlank()) {
                sb.append(" (studiju programmas daļa: ").append(p.getPartName()).append(")");
            }
            if (i < programs.size() - 1) sb.append("\n");
        }
        return sb.toString();
    }

    // ====================================================================
    // 2. Apraksts — stundu sadalījums + anotācija + mērķis + priekšnosacījumi
    // ====================================================================

    /** 2. sadaļa — stundu sadalījums, anotācija, mērķis un priekšnosacījumi. */
    private void buildSection2Apraksts(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "2. Apraksts");

        XWPFTable hours = doc.createTable(4, 2);
        setTableWidthCm(hours, TABLE_WIDTH_CM);
        fillKeyValue(hours.getRow(0), "Kontaktstundas kopā", String.valueOf(course.getAcademicHoursTotal()));
        fillKeyValue(hours.getRow(1), "Lekcijas", String.valueOf(course.getLectureHours()));
        fillKeyValue(hours.getRow(2), "Praktiskās nodarbības", String.valueOf(course.getPractClassesHours()));
        fillKeyValue(hours.getRow(3), "Studējošo patstāvīgais darbs", String.valueOf(course.getIndependentWorkHours()));

        // Skaidrojošs teksts
        addCaption(doc, "Skaits norādīts akadēmiskajās stundās. 1 akadēmiskā stunda = 45 minūtes.");

        addSubHeading(doc, "Anotācija");
        addRichTextBlock(doc, course.getAnnotation(), "Nav norādīta.");

        addSubHeading(doc, "Studiju kursa mērķis");
        addRichTextBlock(doc, course.getGoal(), "Nav norādīts.");

        addSubHeading(doc, "Nepieciešamās zināšanas kursa uzsākšanai");
        boolean hasDesc = course.getPrerequisitesDescription() != null
                && !course.getPrerequisitesDescription().isBlank();
        boolean hasList = course.getPrerequisites() != null && !course.getPrerequisites().isEmpty();
        if (!hasDesc && !hasList) {
            addEmptyNote(doc, "Nav norādītas.");
        } else {
            if (hasDesc) addRichTextBlock(doc, course.getPrerequisitesDescription(), null);
            if (hasList) {
                for (PrerequisiteDTO p : course.getPrerequisites()) {
                    String line = p.getTitle()
                            + (p.getType() != null && !p.getType().isBlank()
                            ? " (" + p.getType() + ")" : "");
                    addBullet(doc, line);
                }
            }
        }
    }

    /** Aizpilda key-value tabulas rindu — kreisā šūna trekna ar pelēku fonu, labā parastā. */
    private void fillKeyValue(XWPFTableRow row, String key, String value) {
        fillCell(row.getCell(0), key, true, 11, true);
        fillCell(row.getCell(1), value, false, 11, false);
        setCellWidthCm(row.getCell(0), 5.6);
        setCellWidthCm(row.getCell(1), 10.4);
    }

    // ====================================================================
    // 3. SKR — 3 atsevišķas tabulas (Zināšanas / Prasmes / Kompetences)
    // ====================================================================

    /**
     * 3. sadaļa — studiju kursa rezultāti grupēti 3 atsevišķās tabulās pēc kategorijas.
     * Katra tabula ar 3 kolonnām (Nr. | Sasniedzamais rezultāts | SPSR).
     */
    private void buildSection3SKR(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "3. Studiju kursa rezultāti (SKR)");

        List<ResultAssessmentDTO> all = course.getResultAssessments();
        if (all == null || all.isEmpty()) {
            addEmptyNote(doc, "Nav norādīti.");
            return;
        }

        boolean any = false;
        for (String category : SKR_CATEGORIES) {
            List<ResultAssessmentDTO> rows = all.stream()
                    .filter(r -> category.equals(r.getCategoryName()))
                    .toList();
            if (rows.isEmpty()) continue;
            buildSKRTable(doc, category, rows);
            any = true;
        }
        if (!any) {
            addEmptyNote(doc, "Nav norādīti.");
        }
    }

    /** Veido vienu SKR kategorijas tabulu ar apakšvirsrakstu un 3 kolonām. */
    private void buildSKRTable(XWPFDocument doc, String category, List<ResultAssessmentDTO> rows) {
        addSubHeading(doc, category);

        XWPFTable t = doc.createTable(rows.size() + 1, 3);
        setTableWidthCm(t, TABLE_WIDTH_CM);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Nr.", true, 11, true);
        fillCell(head.getCell(1), "Sasniedzamais rezultāts", true, 11, true);
        fillCell(head.getCell(2), "SPSR", true, 11, true);
        setCellWidthCm(head.getCell(0), 2);
        setCellWidthCm(head.getCell(1), 12);
        setCellWidthCm(head.getCell(2), 2);

        for (int i = 0; i < rows.size(); i++) {
            ResultAssessmentDTO r = rows.get(i);
            XWPFTableRow row = t.getRow(i + 1);
            fillCell(row.getCell(0), nullSafe(r.getDisplayNumber()), true, 11, false);
            fillCell(row.getCell(1), nullSafe(r.getLearningOutcome()), false, 11, false);
            fillCell(row.getCell(2),
                    r.getSpsr() != null && !r.getSpsr().isBlank() ? r.getSpsr() : "–",
                    false, 11, false);
            setCellWidthCm(row.getCell(0), 2);
            setCellWidthCm(row.getCell(1), 12);
            setCellWidthCm(row.getCell(2), 2);
        }
    }

    // ====================================================================
    // 4. Tēmas — tabula (Nr | Tēma | Apraksts)
    // ====================================================================

    /** 4. sadaļa — kursa tēmu saraksts tabulā ar numuru, nosaukumu un rich-text aprakstu. */
    private void buildSection4Temas(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "4. Tēmas");
        List<TopicDTO> topics = course.getTopics();
        if (topics == null || topics.isEmpty()) {
            addEmptyNote(doc, "Nav norādītas.");
            return;
        }

        XWPFTable t = doc.createTable(topics.size() + 1, 3);
        setTableWidthCm(t, TABLE_WIDTH_CM);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Nr.", true, 11, true);
        fillCell(head.getCell(1), "Tēmas nosaukums", true, 11, true);
        fillCell(head.getCell(2), "Apraksts", true, 11, true);
        setCellWidthCm(head.getCell(0), 1);
        setCellWidthCm(head.getCell(1), 5.5);
        setCellWidthCm(head.getCell(2), 9.5);

        for (int i = 0; i < topics.size(); i++) {
            TopicDTO topic = topics.get(i);
            XWPFTableRow row = t.getRow(i + 1);
            fillCell(row.getCell(0), String.valueOf(topic.getSequenceNumber()), false, 11, false);
            fillCell(row.getCell(1), nullSafe(topic.getTitle()), false, 11, false);
            setCellWidthCm(row.getCell(0), 1);
            setCellWidthCm(row.getCell(1), 5.5);
            setCellWidthCm(row.getCell(2), 9.5);

            XWPFTableCell descCell = row.getCell(2);
            clearCell(descCell);
            if (topic.getDescription() != null && !topic.getDescription().isBlank()) {
                fillCellWithPlainParagraphs(descCell, sanitizer.toPlainParagraphs(topic.getDescription()));
            } else {
                XWPFParagraph p = descCell.addParagraph();
                XWPFRun r = p.createRun();
                r.setFontFamily(FONT);
                r.setFontSize(11);
                r.setItalic(true);
                r.setColor("555555");
                r.setText("–");
            }
        }
    }

    // ====================================================================
    // 5. Kalendārais plāns — tabula (Nr | Tēma | Nodarbības veids | Ak.st.)
    // ====================================================================

    /** 5. sadaļa — kalendārais plāns: katrai tēmai apkopo nodarbību veidus un kopējās akadēmiskās stundas. */
    private void buildSection5Kalendars(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "5. Kalendārais plāns");
        List<CalendarPlanDTO> plan = course.getCalendarPlan();
        if (plan == null || plan.isEmpty()) {
            addEmptyNote(doc, "Nav sastādīts.");
            return;
        }

        XWPFTable t = doc.createTable(plan.size() + 1, 4);
        setTableWidthCm(t, TABLE_WIDTH_CM);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Nr.", true, 11, true);
        fillCell(head.getCell(1), "Tēmas nosaukums", true, 11, true);
        fillCell(head.getCell(2), "Nodarbības veids", true, 11, true);
        fillCell(head.getCell(3), "Ak. st.", true, 11, true);
        setCellWidthCm(head.getCell(0), 1);
        setCellWidthCm(head.getCell(1), 7);
        setCellWidthCm(head.getCell(2), 6.5);
        setCellWidthCm(head.getCell(3), 1.5);

        for (int i = 0; i < plan.size(); i++) {
            CalendarPlanDTO c = plan.get(i);
            XWPFTableRow row = t.getRow(i + 1);

            fillCell(row.getCell(0), String.valueOf(c.getSequenceNumber()), false, 11, false);
            fillCell(row.getCell(1), nullSafe(c.getTopicTitle()), false, 11, false);

            StringBuilder sessionTypes = new StringBuilder();
            int totalHours = 0;
            if (c.getSessions() != null) {
                for (int j = 0; j < c.getSessions().size(); j++) {
                    var s = c.getSessions().get(j);
                    sessionTypes.append(s.getSessionType());
                    if (j < c.getSessions().size() - 1) sessionTypes.append("; ");
                    totalHours += s.getAcademicHours();
                }
            }
            fillCell(row.getCell(2), sessionTypes.toString(), false, 11, false);
            fillCell(row.getCell(3), String.valueOf(totalHours), false, 11, false);
            setCellWidthCm(row.getCell(0), 1);
            setCellWidthCm(row.getCell(1), 7);
            setCellWidthCm(row.getCell(2), 6.5);
            setCellWidthCm(row.getCell(3), 1.5);
        }
    }

    // ====================================================================
    // 6. Vērtēšana — sadalījums + SKR×komponenšu matrica + patstāvīgais darbs
    // ====================================================================

    /**
     * 6. sadaļa — vērtēšana ar trim apakšsadaļām:
     * 6.1 komponenšu procentuālais sadalījums, 6.2 SKR × komponenšu matrica,
     * 6.3 studējošo patstāvīgā darba sadalījums.
     */
    private void buildSection6Vertesana(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "6. Vērtēšana");

        // 6.1. Vērtēšanas sadalījums
        addSubHeading(doc, "6.1. Vērtēšanas sadalījums");
        List<AssessmentComponentDTO> dist = course.getAssessmentDistribution();
        if (dist == null || dist.isEmpty()) {
            addEmptyNote(doc, "Nav norādīts.");
        } else {
            XWPFTable t = doc.createTable(dist.size() + 1, 2);
            setTableWidthCm(t, TABLE_WIDTH_CM);
            fillCell(t.getRow(0).getCell(0), "Komponente", true, 11, true);
            fillCell(t.getRow(0).getCell(1), "%", true, 11, true);
            setCellWidthCm(t.getRow(0).getCell(0), 13);
            setCellWidthCm(t.getRow(0).getCell(1), 3);
            for (int i = 0; i < dist.size(); i++) {
                AssessmentComponentDTO a = dist.get(i);
                fillCell(t.getRow(i + 1).getCell(0), a.getComponentName(), false, 11, false);
                fillCell(t.getRow(i + 1).getCell(1), a.getPercentage() + "%", false, 11, false);
                setCellWidthCm(t.getRow(i + 1).getCell(0), 13);
                setCellWidthCm(t.getRow(i + 1).getCell(1), 3);
            }
        }

        // 6.2. SKR × komponenšu matrica
        addSubHeading(doc, "6.2. SKR × vērtēšanas komponenšu matrica");
        List<ResultAssessmentDTO> ras = course.getResultAssessments();
        if (ras == null || ras.isEmpty() || dist == null || dist.isEmpty()) {
            addEmptyNote(doc, "Matrica nav pieejama (nav norādīti SKR vai vērtēšanas komponentes).");
        } else {
            Set<String> componentNames = new LinkedHashSet<>();
            for (AssessmentComponentDTO a : dist) componentNames.add(a.getComponentName());
            List<String> compList = new ArrayList<>(componentNames);

            XWPFTable m = doc.createTable(ras.size() + 1, compList.size() + 1);
            setTableWidthCm(m, TABLE_WIDTH_CM);

            // Pirmā kolonna fiksēta 2cm (SKR), atlikušie 14cm vienādi sadalīti
            // pa komponenšu kolonnām (kompList.size()), lai header teksts var aplauzties.
            double compColWidth = 14.0 / compList.size();
            setCellWidthCm(m.getRow(0).getCell(0), 2);
            fillCell(m.getRow(0).getCell(0), "SKR", true, 10, true);
            for (int j = 0; j < compList.size(); j++) {
                fillCellCentered(m.getRow(0).getCell(j + 1), compList.get(j), true, 10, true);
                setCellWidthCm(m.getRow(0).getCell(j + 1), compColWidth);
            }
            for (int i = 0; i < ras.size(); i++) {
                ResultAssessmentDTO r = ras.get(i);
                XWPFTableRow row = m.getRow(i + 1);
                fillCell(row.getCell(0), nullSafe(r.getDisplayNumber()), false, 10, false);
                setCellWidthCm(row.getCell(0), 2);
                for (int j = 0; j < compList.size(); j++) {
                    boolean mark = r.getComponents() != null
                            && r.getComponents().contains(compList.get(j));
                    XWPFTableCell cell = row.getCell(j + 1);
                    clearCell(cell);
                    setCellWidthCm(cell, compColWidth);
                    XWPFParagraph p = cell.addParagraph();
                    p.setAlignment(ParagraphAlignment.CENTER);
                    p.setSpacingAfter(0);
                    XWPFRun rn = p.createRun();
                    rn.setFontFamily(FONT);
                    rn.setFontSize(10);
                    rn.setBold(false);
                    rn.setText(mark ? "X" : "");
                }
            }
        }

        // 6.3. Studējošo patstāvīgā darba sadalījums
        addSubHeading(doc, "6.3. Studējošo patstāvīgā darba sadalījums");
        List<SelfStudyDTO> selfStudy = course.getSelfStudyActivities();
        if (selfStudy == null || selfStudy.isEmpty()) {
            addEmptyNote(doc, "Nav norādīts.");
        } else {
            XWPFTable t = doc.createTable(selfStudy.size() + 1, 2);
            setTableWidthCm(t, TABLE_WIDTH_CM);
            fillCell(t.getRow(0).getCell(0), "Aktivitāte", true, 11, true);
            fillCell(t.getRow(0).getCell(1), "%", true, 11, true);
            setCellWidthCm(t.getRow(0).getCell(0), 13);
            setCellWidthCm(t.getRow(0).getCell(1), 3);
            for (int i = 0; i < selfStudy.size(); i++) {
                SelfStudyDTO s = selfStudy.get(i);
                fillCell(t.getRow(i + 1).getCell(0), s.getActivityName(), false, 11, false);
                fillCell(t.getRow(i + 1).getCell(1), s.getPercentage() + "%", false, 11, false);
                setCellWidthCm(t.getRow(i + 1).getCell(0), 13);
                setCellWidthCm(t.getRow(i + 1).getCell(1), 3);
            }
        }
    }

    // ====================================================================
    // 7. Literatūra — grupēta pēc tipa, ar URL un valodu
    // ====================================================================

    /**
     * 7. sadaļa — literatūras saraksts, grupēts pēc tipa:
     * Pamatliteratūra, Papildliteratūra, Citi avoti.
     */
    private void buildSection7Literatura(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "7. Literatūra");
        List<LiteratureGroupDTO> lit = course.getLiterature();
        if (lit == null || lit.isEmpty()) {
            addEmptyNote(doc, "Nav norādīta.");
            return;
        }
        for (LiteratureGroupDTO group : lit) {
            addSubHeading(doc, group.getType());
            if (group.getSources() == null || group.getSources().isEmpty()) {
                addEmptyNote(doc, "Nav norādīta.");
                continue;
            }
            int idx = 1;
            for (LiteratureDTO src : group.getSources()) {
                addLiteratureItem(doc, idx, src);
                idx++;
            }
        }
    }

    /**
     * Pievieno vienu numurētu literatūras vienību ar citātu un URL.
     * URL parādās nākamā rindā ar "Pieejams: " prefiksu un kā hipersaite.
     */
    private void addLiteratureItem(XWPFDocument doc, int idx, LiteratureDTO src) {
        XWPFParagraph p = doc.createParagraph();
        p.setIndentationLeft(360);
        p.setSpacingAfter(40);

        XWPFRun num = p.createRun();
        num.setFontFamily(FONT);
        num.setFontSize(11);
        num.setText(idx + ". ");

        XWPFRun citation = p.createRun();
        citation.setFontFamily(FONT);
        citation.setFontSize(11);
        citation.setText(nullSafe(src.getCitation()));

              if (src.getUrl() != null && !src.getUrl().isBlank()) {
            XWPFParagraph urlP = doc.createParagraph();
            urlP.setIndentationLeft(720);
            urlP.setSpacingAfter(60);

            XWPFRun prefix = urlP.createRun();
            prefix.setFontFamily(FONT);
            prefix.setFontSize(11);
            prefix.setText("Pieejams: ");

            XWPFHyperlinkRun link = urlP.createHyperlinkRun(src.getUrl());
            link.setFontFamily(FONT);
            link.setFontSize(11);
            link.setColor("0000FF");
            link.setUnderline(UnderlinePatterns.SINGLE);
            link.setText(src.getUrl());
        }
    }

    // ====================================================================
    // Palīgmetodes — sekciju virsraksti, šūnas, tabulu izveide
    // ====================================================================

    /**
     * Pievieno galvenā līmeņa sadaļas virsrakstu (14pt bold, spacing before 6pt after 0).
     * Spacing vērtības twips vienībās: 6pt × 20 = 120 twips.
     */
    private void addSectionHeading(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(6 * PT_TO_TWIPS);
        p.setSpacingAfter(0);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontFamily(FONT);
        r.setFontSize(14);
        r.setText(text);
    }

    /** Pievieno apakšsadaļas virsrakstu (12pt bold, spacing before 6pt after 0). */
    private void addSubHeading(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(6 * PT_TO_TWIPS);
        p.setSpacingAfter(0);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontFamily(FONT);
        r.setFontSize(12);
        r.setText(text);
    }

    /** Pievieno vienu bullet saraksta vienību ar manuālu "•" prefiksu un atkāpi. */
    private void addBullet(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setIndentationLeft(360);
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(11);
        r.setText("• " + nullSafe(text));
    }

    /** Pievieno tukšumu apzīmējošu pelēku kursīva teksta paragrāfu (piem., "Nav norādīts."). */
    private void addEmptyNote(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(11);
        r.setItalic(true);
        r.setColor("555555");
        r.setText(text);
    }

    /**
     * Pievieno mazu skaidrojošu paragrāfu (9pt italic) zem tabulām vai citiem
     * dokumenta elementiem. Piem., zem stundu sadalījuma tabulas — paskaidrojums
     * par akadēmiskās stundas ilgumu.
     */
    private void addCaption(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(40);
        p.setSpacingAfter(0);
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(9);
        r.setItalic(true);
        r.setText(text);
    }

    /**
     * Palīdz iegult sanitizētu rich-text saturu kā vairākus paragrāfus.
     * Tukšs saturs -> empty-note ar norādīto tekstu (vai netiek pievienots, ja fallback==null).
     */
    private void addRichTextBlock(XWPFDocument doc, String rawHtml, String emptyFallback) {
        List<String> paragraphs = sanitizer.toPlainParagraphs(rawHtml);
        if (paragraphs.isEmpty()) {
            if (emptyFallback != null) addEmptyNote(doc, emptyFallback);
            return;
        }
        for (String text : paragraphs) {
            XWPFParagraph p = doc.createParagraph();
            p.setSpacingAfter(40);
            XWPFRun r = p.createRun();
            r.setFontFamily(FONT);
            r.setFontSize(11);
            r.setText(text);
        }
    }

    /**
     * Aizpilda tabulas šūnu ar tekstu; atbalsta multi-line saturu (\n -> rindas lauzumi),
     * fonta lielumu, treknrakstu un fona ēnojumu key-šūnām.
     */
    private void fillCell(XWPFTableCell cell, String text, boolean bold, int fontSize, boolean shaded) {
        clearCell(cell);
        XWPFParagraph p = cell.addParagraph();
        p.setSpacingAfter(0);
        p.setSpacingBetween(1.15, LineSpacingRule.AUTO);
        String[] lines = nullSafe(text).split("\\n");
        for (int i = 0; i < lines.length; i++) {
            XWPFRun r = p.createRun();
            r.setFontFamily(FONT);
            r.setFontSize(fontSize);
            r.setBold(bold);
            r.setText(lines[i]);
            if (i < lines.length - 1) r.addBreak();
        }
        if (shaded) cell.setColor(SHADE_COLOR);
    }

    /** Tāpat kā fillCell, bet saturs centrēts (lieto SKR matricas header šūnām). */
    private void fillCellCentered(XWPFTableCell cell, String text, boolean bold, int fontSize, boolean shaded) {
        clearCell(cell);
        XWPFParagraph p = cell.addParagraph();
        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingAfter(0);
        p.setSpacingBetween(1.15, LineSpacingRule.AUTO);
        XWPFRun r = p.createRun();
        r.setFontFamily(FONT);
        r.setFontSize(fontSize);
        r.setBold(bold);
        r.setText(nullSafe(text));
        if (shaded) cell.setColor(SHADE_COLOR);
    }

    /** Aizpilda šūnu ar vairākiem paragrāfiem (izmantots tēmu rich-text aprakstam). */
    private void fillCellWithPlainParagraphs(XWPFTableCell cell, List<String> paragraphs) {
        if (paragraphs.isEmpty()) {
            XWPFParagraph p = cell.addParagraph();
            XWPFRun r = p.createRun();
            r.setFontFamily(FONT);
            r.setFontSize(11);
            r.setText("");
            return;
        }
        for (String text : paragraphs) {
            XWPFParagraph p = cell.addParagraph();
            p.setSpacingAfter(40);
            XWPFRun r = p.createRun();
            r.setFontFamily(FONT);
            r.setFontSize(11);
            r.setText(text);
        }
    }

    /** Iztīra visus paragrāfus no šūnas, lai jauni elementi nesāktos no liekās tukšās līnijas. */
    private void clearCell(XWPFTableCell cell) {
        while (cell.getParagraphs().size() > 0) {
            cell.removeParagraph(0);
        }
    }

    /** Iestata tabulu uz fiksētu cm platumu. */
    private void setTableWidthCm(XWPFTable table, double cm) {
        CTTblWidth width = table.getCTTbl().getTblPr().addNewTblW();
        width.setType(STTblWidth.DXA);
        width.setW(BigInteger.valueOf((long) (cm * CM_TO_DXA)));
    }

    /** Iestata vienas šūnas platumu cm vienībās (DXA = 1/20 punkta, 1cm = 567 DXA). */
    private void setCellWidthCm(XWPFTableCell cell, double cm) {
        CTTblWidth w = cell.getCTTc().addNewTcPr().addNewTcW();
        w.setType(STTblWidth.DXA);
        w.setW(BigInteger.valueOf((long) (cm * CM_TO_DXA)));
    }

    /** Noņem visas tabulas robežas (izmantots header tabulai, lai tā izskatās neredzama). */
    private void removeAllBorders(XWPFTable table) {
        table.setInsideHBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setInsideVBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setTopBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setBottomBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setLeftBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setRightBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
    }

    /** Null-drošs wrapper: atgriež tukšu virkni, ja ieraksts ir null. */
    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    /** Atgriež domuzīmi "–", ja virkne ir tukša vai null; pretējā gadījumā oriģinālo virkni. */
    private static String orDash(String s) {
        return s == null || s.isBlank() ? "–" : s;
    }
}
