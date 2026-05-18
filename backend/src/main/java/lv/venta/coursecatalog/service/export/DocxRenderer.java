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
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
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
 * veidnei.
 * <p>Times New Roman tiek ierakstīts kā fonta nosaukums.Nodrošina vizuālu atbilstību ar PDF
 * eksportu, kas izmanto Tinos fontu.</p>
 */
@Component
public class DocxRenderer {

    private static final String FONT = "Times New Roman";
    private static final String LOGO_RESOURCE = "static/vea-logo.png";

    private final RichTextSanitizer sanitizer;

    /** Konstruktors — Spring izveido rich-text sanitaiizera komponenti. */
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

            buildHeader(doc, course);
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
            throw new IllegalStateException("Neizdevās ģenerēt DOCX: " + e.getMessage(), e);
        }
    }

    // ====================================================================
    // Galvene: 3-daļīga tabula (kreisā pusē apraksts | logo | tehniskā info)
    // ====================================================================

    /**
     * Veido dokumenta galveni kā 3-kolonu tabulu bez robežām:
     * pa kreisi sadaļas etiķete, pa vidu VeA logo, pa labi — versijas statuss
     * un (ja apstiprināts) lēmuma rekvizīti.
     */
    //TODO: salabot galvenes saturu
    private void buildHeader(XWPFDocument doc, CourseDetailsDTO course) {
        XWPFTable table = doc.createTable(1, 3);
        setTableWidth100Pct(table);
        removeAllBorders(table);

        XWPFTableRow row = table.getRow(0);

        // Kreisā šūna — sadaļas etiķete
        XWPFTableCell left = row.getCell(0);
        clearCell(left);
        XWPFParagraph leftP = left.addParagraph();
        leftP.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun leftR = leftP.createRun();
        leftR.setBold(true);
        leftR.setFontFamily(FONT);
        leftR.setFontSize(10);
        leftR.setText("STUDIJU KURSA APRAKSTS");

        // Vidējā šūna — VeA logo PNG
        XWPFTableCell center = row.getCell(1);
        clearCell(center);
        XWPFParagraph centerP = center.addParagraph();
        centerP.setAlignment(ParagraphAlignment.CENTER);
        try (InputStream logoIn = new ClassPathResource(LOGO_RESOURCE).getInputStream()) {
            XWPFRun logoR = centerP.createRun();
            // Attēla izmēri EMU vienībās (1 cm = 360 000 EMU)
            // Saglabā oriģinālo proporciju 1200×320 → 4 cm × ~1,07 cm
            int width = (int) (4.0 * 360_000);
            int height = (int) (1.07 * 360_000);
            logoR.addPicture(logoIn, Document.PICTURE_TYPE_PNG, "vea-logo.png", width, height);
        } catch (Exception ignored) {
            // Logo neobligāts; bez tā tikai teksts paliek
        }

        // Labā šūna — versijas tehniskais info (statuss + lēmuma Nr/datums + versijas Nr)
        XWPFTableCell right = row.getCell(2);
        clearCell(right);
        String statusLower = course.getVersionStatus() == null
                ? "" : course.getVersionStatus().toLowerCase();
        boolean isApproved = statusLower.contains("apstip");
        boolean isPending = statusLower.contains("iesniegts");
        boolean isDraft = statusLower.contains("melnraksts");
        boolean isRejected = statusLower.contains("noraid");

        if (isApproved) {
            addRightHeaderLine(right, "APSTIPRINĀTS", true);
            String dateLine = course.getApprovalDate() != null && !course.getApprovalDate().isBlank()
                    ? "ar " + course.getApprovalDate() + " lēmumu"
                    : "ar Senāta lēmumu";
            addRightHeaderLine(right, dateLine, false);
            if (course.getDecisionNumber() != null && !course.getDecisionNumber().isBlank()) {
                addRightHeaderLine(right, "Nr. " + course.getDecisionNumber(), false);
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
            addRightHeaderLine(right, "Versija Nr. " + course.getVersionNumber(), false);
        }
    }

    /** Pievieno vienu labās puses galvenes rindu (statusa vai lēmuma rekvizīta tekstu). */
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

    // ====================================================================
    // Kursa nosaukums centrēts, lielajiem burtiem; angļu nosaukums kursīvā
    // ====================================================================

    /** Izvada centrētu kursa nosaukumu LV (lielajiem burtiem, treknrakstā) un EN (kursīvā). */
    private void buildTitle(XWPFDocument doc, CourseDetailsDTO course) {
        XWPFParagraph titleP = doc.createParagraph();
        titleP.setAlignment(ParagraphAlignment.CENTER);
        titleP.setSpacingBefore(240);
        titleP.setSpacingAfter(60);
        XWPFRun titleR = titleP.createRun();
        titleR.setBold(true);
        titleR.setFontFamily(FONT);
        titleR.setFontSize(16);
        titleR.setText(nullSafe(course.getTitleLv()).toUpperCase());

        if (course.getTitleEn() != null && !course.getTitleEn().isBlank()) {
            XWPFParagraph enP = doc.createParagraph();
            enP.setAlignment(ParagraphAlignment.CENTER);
            enP.setSpacingAfter(240);
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

    /** 1. sadaļa — kursa pamatdatu tabula (kods, kredīti, fakultāte, valoda, autori utt.). */
    private void buildSection1Pamatdati(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "1. Pamatdati");

        List<String[]> rows = new ArrayList<>();
        rows.add(new String[]{"Kursa kods", orDash(course.getCourseCode())});
        rows.add(new String[]{"Kredītpunkti", String.valueOf(course.getCredits())});
        rows.add(new String[]{"Fakultāte", orDash(course.getFacultyName())});
        rows.add(new String[]{"Akadēmiskais gads", orDash(course.getAcademicYear())});
        rows.add(new String[]{"Semestris", orDash(course.getSemester())});
        rows.add(new String[]{"Mācību valoda", orDash(course.getLanguage())});
        rows.add(new String[]{"Pārbaudes forma", orDash(course.getAssessmentForm())});
        rows.add(new String[]{"Autors(-i)", joinStaff(course.getAuthors())});
        rows.add(new String[]{"Pasniedzējs(-i)", joinStaff(course.getTeachers())});
        rows.add(new String[]{"Studiju programmas", joinPrograms(course.getStudyPrograms())});

        XWPFTable t = doc.createTable(rows.size(), 2);
        setTableWidth100Pct(t);
        for (int i = 0; i < rows.size(); i++) {
            XWPFTableRow row = t.getRow(i);
            fillCell(row.getCell(0), rows.get(i)[0], true, 11, true);
            fillCell(row.getCell(1), rows.get(i)[1], false, 11, false);
            setCellWidthPct(row.getCell(0), 35);
            setCellWidthPct(row.getCell(1), 65);
        }
    }

    /** Savieno autoru/pasniedzēju sarakstu vienā multi-line tekstā ar lomu iekavās. */
    private String joinStaff(List<StaffMemberDTO> staff) {
        if (staff == null || staff.isEmpty()) return "—";
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

    /** Savieno studiju programmu sarakstu vienā multi-line tekstā (programma — daļa). */
    private String joinPrograms(List<StudyProgramLinkDTO> programs) {
        if (programs == null || programs.isEmpty()) return "—";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < programs.size(); i++) {
            StudyProgramLinkDTO p = programs.get(i);
            sb.append(p.getProgramName());
            if (p.getPartName() != null && !p.getPartName().isBlank()) {
                sb.append(" — ").append(p.getPartName());
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
        setTableWidth100Pct(hours);
        fillKeyValue(hours.getRow(0), "Akadēmiskās stundas (kopā)", String.valueOf(course.getAcademicHoursTotal()));
        fillKeyValue(hours.getRow(1), "Lekcijas", String.valueOf(course.getLectureHours()));
        fillKeyValue(hours.getRow(2), "Praktiskās nodarbības", String.valueOf(course.getPractClassesHours()));
        fillKeyValue(hours.getRow(3), "Patstāvīgais darbs", String.valueOf(course.getIndependentWorkHours()));

        addSubHeading(doc, "Anotācija");
        addRichTextBlock(doc, course.getAnnotation(), "Nav norādīta.");

        addSubHeading(doc, "Studiju kursa mērķis");
        addRichTextBlock(doc, course.getGoal(), "Nav norādīts.");

        addSubHeading(doc, "Priekšnosacījumi studiju kursa apguvei");
        boolean hasDesc = course.getPrerequisitesDescription() != null
                && !course.getPrerequisitesDescription().isBlank();
        boolean hasList = course.getPrerequisites() != null && !course.getPrerequisites().isEmpty();
        if (!hasDesc && !hasList) {
            addEmptyNote(doc, "Nav norādīti.");
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
        setCellWidthPct(row.getCell(0), 35);
        setCellWidthPct(row.getCell(1), 65);
    }

    // ====================================================================
    // 3. SKR — tabula ar 4 kolonām (kategorija | SKR Nr | rezultāts | SPSR)
    // ====================================================================

    /** 3. sadaļa — studiju kursa rezultāti (SKR) ar kategoriju, numuru, aprakstu un SPSR sasaisti. */
    private void buildSection3SKR(XWPFDocument doc, CourseDetailsDTO course) {
        addSectionHeading(doc, "3. Studiju kursa rezultāti (SKR)");
        List<ResultAssessmentDTO> ras = course.getResultAssessments();
        if (ras == null || ras.isEmpty()) {
            addEmptyNote(doc, "Nav norādīti.");
            return;
        }

        XWPFTable t = doc.createTable(ras.size() + 1, 4);
        setTableWidth100Pct(t);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Kategorija", true, 11, true);
        fillCell(head.getCell(1), "Nr.", true, 11, true);
        fillCell(head.getCell(2), "Sasniedzamais rezultāts", true, 11, true);
        fillCell(head.getCell(3), "SPSR", true, 11, true);
        setCellWidthPct(head.getCell(0), 18);
        setCellWidthPct(head.getCell(1), 12);
        setCellWidthPct(head.getCell(2), 50);
        setCellWidthPct(head.getCell(3), 20);

        for (int i = 0; i < ras.size(); i++) {
            ResultAssessmentDTO r = ras.get(i);
            XWPFTableRow row = t.getRow(i + 1);
            String catLabel = r.getCategoryOrder() != null
                    ? r.getCategoryOrder() + ". " + nullSafe(r.getCategoryName())
                    : nullSafe(r.getCategoryName());
            fillCell(row.getCell(0), catLabel, false, 11, false);
            fillCell(row.getCell(1), nullSafe(r.getDisplayNumber()), true, 11, false);
            fillCell(row.getCell(2), nullSafe(r.getLearningOutcome()), false, 11, false);
            fillCell(row.getCell(3),
                    r.getSpsr() != null && !r.getSpsr().isBlank() ? r.getSpsr() : "—",
                    false, 11, false);
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
        setTableWidth100Pct(t);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Nr.", true, 11, true);
        fillCell(head.getCell(1), "Tēmas nosaukums", true, 11, true);
        fillCell(head.getCell(2), "Apraksts", true, 11, true);
        setCellWidthPct(head.getCell(0), 8);
        setCellWidthPct(head.getCell(1), 32);
        setCellWidthPct(head.getCell(2), 60);

        for (int i = 0; i < topics.size(); i++) {
            TopicDTO topic = topics.get(i);
            XWPFTableRow row = t.getRow(i + 1);
            fillCell(row.getCell(0), String.valueOf(topic.getSequenceNumber()), false, 11, false);
            fillCell(row.getCell(1), nullSafe(topic.getTitle()), false, 11, false);

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
                r.setText("—");
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
        setTableWidth100Pct(t);

        XWPFTableRow head = t.getRow(0);
        fillCell(head.getCell(0), "Nr.", true, 11, true);
        fillCell(head.getCell(1), "Tēmas nosaukums", true, 11, true);
        fillCell(head.getCell(2), "Nodarbības veids", true, 11, true);
        fillCell(head.getCell(3), "Ak. st.", true, 11, true);
        setCellWidthPct(head.getCell(0), 8);
        setCellWidthPct(head.getCell(1), 40);
        setCellWidthPct(head.getCell(2), 40);
        setCellWidthPct(head.getCell(3), 12);

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
            setTableWidth100Pct(t);
            fillCell(t.getRow(0).getCell(0), "Komponente", true, 11, true);
            fillCell(t.getRow(0).getCell(1), "%", true, 11, true);
            setCellWidthPct(t.getRow(0).getCell(0), 80);
            setCellWidthPct(t.getRow(0).getCell(1), 20);
            for (int i = 0; i < dist.size(); i++) {
                AssessmentComponentDTO a = dist.get(i);
                fillCell(t.getRow(i + 1).getCell(0), a.getComponentName(), false, 11, false);
                fillCell(t.getRow(i + 1).getCell(1), a.getPercentage() + "%", false, 11, false);
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
            setTableWidth100Pct(m);

            fillCell(m.getRow(0).getCell(0), "SKR", true, 10, true);
            for (int j = 0; j < compList.size(); j++) {
                fillCell(m.getRow(0).getCell(j + 1), compList.get(j), true, 10, true);
            }
            for (int i = 0; i < ras.size(); i++) {
                ResultAssessmentDTO r = ras.get(i);
                XWPFTableRow row = m.getRow(i + 1);
                fillCell(row.getCell(0), nullSafe(r.getDisplayNumber()), true, 10, false);
                for (int j = 0; j < compList.size(); j++) {
                    boolean mark = r.getComponents() != null
                            && r.getComponents().contains(compList.get(j));
                    XWPFTableCell cell = row.getCell(j + 1);
                    clearCell(cell);
                    XWPFParagraph p = cell.addParagraph();
                    p.setAlignment(ParagraphAlignment.CENTER);
                    XWPFRun rn = p.createRun();
                    rn.setFontFamily(FONT);
                    rn.setFontSize(10);
                    rn.setBold(true);
                    rn.setText(mark ? "●" : "");
                }
            }
        }

        // 6.3. Patstāvīgā darba sadalījums
        addSubHeading(doc, "6.3. Studējošo patstāvīgā darba sadalījums");
        List<SelfStudyDTO> selfStudy = course.getSelfStudyActivities();
        if (selfStudy == null || selfStudy.isEmpty()) {
            addEmptyNote(doc, "Nav norādīts.");
        } else {
            XWPFTable t = doc.createTable(selfStudy.size() + 1, 2);
            setTableWidth100Pct(t);
            fillCell(t.getRow(0).getCell(0), "Aktivitāte", true, 11, true);
            fillCell(t.getRow(0).getCell(1), "%", true, 11, true);
            setCellWidthPct(t.getRow(0).getCell(0), 80);
            setCellWidthPct(t.getRow(0).getCell(1), 20);
            for (int i = 0; i < selfStudy.size(); i++) {
                SelfStudyDTO s = selfStudy.get(i);
                fillCell(t.getRow(i + 1).getCell(0), s.getActivityName(), false, 11, false);
                fillCell(t.getRow(i + 1).getCell(1), s.getPercentage() + "%", false, 11, false);
            }
        }
    }

    // ====================================================================
    // 7. Literatūra — grupēta pēc tipa, ar URL un valodu
    // ====================================================================

    /** 7. sadaļa — literatūras saraksts, grupēts pēc tipa (pamatliteratūra, papildliteratūra, citi avoti). */
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

    /** Pievieno vienu numurētu literatūras vienību ar citātu, valodas atzīmi un URL. */
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

        if (src.getLanguage() != null && !src.getLanguage().isBlank()) {
            XWPFRun lang = p.createRun();
            lang.setFontFamily(FONT);
            lang.setFontSize(9);
            lang.setItalic(true);
            lang.setColor("555555");
            lang.setText(" [" + src.getLanguage() + "]");
        }

        if (src.getUrl() != null && !src.getUrl().isBlank()) {
            XWPFParagraph urlP = doc.createParagraph();
            urlP.setIndentationLeft(720);
            urlP.setSpacingAfter(60);
            XWPFRun url = urlP.createRun();
            url.setFontFamily(FONT);
            url.setFontSize(10);
            url.setColor("000000");
            url.setUnderline(UnderlinePatterns.SINGLE);
            url.setText(src.getUrl());
        }
    }

    // ====================================================================
    // Palīgmetodes
    // ====================================================================

    /** Pievieno galvenā līmeņa sadaļas virsrakstu (treknraksts, 14pt, ar atstarpi virs/zem). */
    private void addSectionHeading(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(260);
        p.setSpacingAfter(80);
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontFamily(FONT);
        r.setFontSize(14);
        r.setText(text);
    }

    /** Pievieno apakšsadaļas virsrakstu (treknraksts, 12pt). */
    private void addSubHeading(XWPFDocument doc, String text) {
        XWPFParagraph p = doc.createParagraph();
        p.setSpacingBefore(160);
        p.setSpacingAfter(40);
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
        // Multi-line saturs (sastopams piem. Studiju programmu sarakstā)
        String[] lines = nullSafe(text).split("\\n");
        for (int i = 0; i < lines.length; i++) {
            XWPFRun r = p.createRun();
            r.setFontFamily(FONT);
            r.setFontSize(fontSize);
            r.setBold(bold);
            r.setText(lines[i]);
            if (i < lines.length - 1) r.addBreak();
        }
        if (shaded) cell.setColor("F5F5F5");
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
        // Noņem POI noklusētu tukšu paragrāfu, lai pievienotie nesāktos no liekās līnijas
        while (cell.getParagraphs().size() > 0) {
            cell.removeParagraph(0);
        }
    }

    /** Iestata tabulu uz 100% lapas platumu (POI pakete vienībās — 5000 = 100%). */
    private void setTableWidth100Pct(XWPFTable table) {
        CTTblWidth width = table.getCTTbl().getTblPr().addNewTblW();
        width.setType(STTblWidth.PCT);
        width.setW(BigInteger.valueOf(5000));   // 5000 = 100% pakete
    }

    /** Iestata vienas šūnas platumu procentos no tabulas kopplatuma. */
    private void setCellWidthPct(XWPFTableCell cell, int pct) {
        CTTblWidth w = cell.getCTTc().addNewTcPr().addNewTcW();
        w.setType(STTblWidth.PCT);
        w.setW(BigInteger.valueOf(pct * 50L)); // 1% = 50 paketes
    }

    /** Noņem visas tabulas robežas (izmantots galvenes tabulai, lai tā izskatās neredzama). */
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
        return s == null || s.isBlank() ? "—" : s;
    }
}
