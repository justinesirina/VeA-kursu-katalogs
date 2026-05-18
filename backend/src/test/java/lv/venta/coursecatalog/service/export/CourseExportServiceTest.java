package lv.venta.coursecatalog.service.export;

import lv.venta.coursecatalog.model.dto.AssessmentComponentDTO;
import lv.venta.coursecatalog.model.dto.CalendarPlanDTO;
import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import lv.venta.coursecatalog.model.dto.CourseResultDTO;
import lv.venta.coursecatalog.model.dto.LiteratureDTO;
import lv.venta.coursecatalog.model.dto.LiteratureGroupDTO;
import lv.venta.coursecatalog.model.dto.SelfStudyDTO;
import lv.venta.coursecatalog.model.dto.SessionDTO;
import lv.venta.coursecatalog.model.dto.StaffMemberDTO;
import lv.venta.coursecatalog.model.dto.StudyProgramLinkDTO;
import lv.venta.coursecatalog.model.dto.TopicDTO;
import lv.venta.coursecatalog.service.courseinfo.CourseInfoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * F11 prasība: eksporta servisa un abu renderu smoke testi.
 *
 * <p>Verificē, ka:
 * <ul>
 *   <li>PDF baiti sākas ar magic header {@code %PDF-}</li>
 *   <li>DOCX baiti sākas ar ZIP magic header {@code PK\x03\x04}</li>
 *   <li>Faila nosaukums saglabā latviešu rakstzīmes un kursa kodu</li>
 * </ul>
 * Sīkākas satura validācijas (vai visi 7 sadaļas redzamas) tiks testētas vēlāk.</p>
 */
class CourseExportServiceTest {

    private static final byte[] PDF_MAGIC = {'%', 'P', 'D', 'F', '-'};
    private static final byte[] DOCX_MAGIC = {'P', 'K', 0x03, 0x04};

    private CourseInfoService courseInfoService;
    private CourseExportService exportService;

    /** Pirms katra testa sagatavo mockoto CourseInfoService un reālus renderus. */
    @BeforeEach
    void setUp() {
        courseInfoService = mock(CourseInfoService.class);
        RichTextSanitizer sanitizer = new RichTextSanitizer();
        PdfRenderer pdfRenderer = new PdfRenderer(buildTemplateEngine(), sanitizer);
        DocxRenderer docxRenderer = new DocxRenderer(sanitizer);
        exportService = new CourseExportService(courseInfoService, pdfRenderer, docxRenderer);
    }

    /** Pārbauda, ka PDF eksports atgriež baitus, kuru sākumā ir "%PDF-" magic header. */
    @Test
    void exportPdf_startsWithPdfMagic() {
        UUID id = UUID.randomUUID();
        when(courseInfoService.getCourseDetailsByVersionId(id)).thenReturn(sampleCourse());

        byte[] bytes = exportService.exportPdf(id);

        assertNotNull(bytes);
        assertTrue(bytes.length > 500, "PDF ir pārāk mazs — ģenerēšana, iespējams, izgāzās");
        assertArrayEquals(PDF_MAGIC, Arrays.copyOf(bytes, PDF_MAGIC.length),
                "PDF jāsākas ar '%PDF-' magic header");
    }

    /** Pārbauda, ka DOCX eksports atgriež baitus, kuru sākumā ir ZIP magic header (PK\x03\x04). */
    @Test
    void exportDocx_startsWithZipMagic() {
        UUID id = UUID.randomUUID();
        when(courseInfoService.getCourseDetailsByVersionId(id)).thenReturn(sampleCourse());

        byte[] bytes = exportService.exportDocx(id);

        assertNotNull(bytes);
        assertTrue(bytes.length > 500, "DOCX ir pārāk mazs — ģenerēšana, iespējams, izgāzās");
        assertArrayEquals(DOCX_MAGIC, Arrays.copyOf(bytes, DOCX_MAGIC.length),
                "DOCX (ZIP konteiners) jāsākas ar PK\\x03\\x04 magic header");
    }

    /** Pārbauda, ka ieteiktais faila nosaukums satur kursa kodu, LV nosaukumu un slash-aizvietoto akadēmisko gadu. */
    @Test
    void suggestedFileName_preservesLatvianCharsAndCourseCode() {
        UUID id = UUID.randomUUID();
        when(courseInfoService.getCourseDetailsByVersionId(id)).thenReturn(sampleCourse());

        String pdf = exportService.suggestedFileName(id, "pdf");
        String docx = exportService.suggestedFileName(id, "docx");

        assertTrue(pdf.endsWith(".pdf"));
        assertTrue(docx.endsWith(".docx"));
        assertTrue(pdf.contains("ITB101"), "Failā jāparādās kursa kodam");
        assertTrue(pdf.contains("Programmēšanas pamati"),
                "Failā jāparādās oriģinālajam LV nosaukumam ar latviešu rakstzīmēm");
        assertTrue(pdf.contains("2024-2025"), "Akadēmiskais gads jāparādās ar pārveidotu slash uz domuzīmi");
    }

    /** Pārbauda, ka OS-aizliegtās rakstzīmes (/, :, *, ?) tiek aizvietotas ar apakšsvītru. */
    @Test
    void suggestedFileName_replacesOsIllegalChars() {
        UUID id = UUID.randomUUID();
        CourseDetailsDTO weird = sampleCourse();
        weird.setTitleLv("Kurss / ar : aizliegtām * rakstzīmēm?");
        when(courseInfoService.getCourseDetailsByVersionId(id)).thenReturn(weird);

        String name = exportService.suggestedFileName(id, "pdf");

        assertTrue(!name.contains("/"));
        assertTrue(!name.contains(":"));
        assertTrue(!name.contains("*"));
        assertTrue(!name.contains("?"));
    }

    // ----- helpers -----

    /** Palīgmetode baitu masīvu salīdzināšanai ar paskaidrojošu kļūdas ziņojumu. */
    private static void assertArrayEquals(byte[] expected, byte[] actual, String msg) {
        assertEquals(Arrays.toString(expected), Arrays.toString(actual), msg);
    }

    /** Konfigurē Thymeleaf veidņu dzini testiem — atrod veidnes templates/ classpath direktorijā. */
    private static TemplateEngine buildTemplateEngine() {
        ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");
        resolver.setSuffix(".html");
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCharacterEncoding("UTF-8");
        resolver.setCacheable(false);

        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(resolver);
        return engine;
    }

    /** Veido pilnu CourseDetailsDTO testa kursu ar visām 7 sadaļām un latviešu rakstzīmēm. */
    private static CourseDetailsDTO sampleCourse() {
        CourseDetailsDTO dto = new CourseDetailsDTO();
        dto.setCourseInfoId(UUID.randomUUID());
        dto.setVersionStatus("Apstiprināts");
        dto.setVersionNumber(2);
        dto.setApprovalDate("2024-06-01");
        dto.setDecisionNumber("Nr. ITF-2024/06");
        dto.setDecisionReference("ITF domes sēde, 2024.06.01");

        dto.setTitleLv("Programmēšanas pamati");
        dto.setTitleEn("Programming Basics");
        dto.setCourseCode("ITB101");
        dto.setCredits(4);

        dto.setAuthorFullTitle("Mg.sc.comp. Dace Docētāja");
        dto.setAuthors(List.of(
                new StaffMemberDTO("Mg.sc.comp. Dace Docētāja", "Autors"),
                new StaffMemberDTO("Dr.sc.comp. Jānis Kalniņš", "Līdzautors")
        ));
        dto.setTeacherFullTitle("Dr.sc.comp. Jānis Kalniņš");
        dto.setTeachers(List.of(
                new StaffMemberDTO("Dr.sc.comp. Jānis Kalniņš", "Atbildīgais mācībspēks")
        ));

        StudyProgramLinkDTO link = new StudyProgramLinkDTO();
        link.setId(1);
        link.setProgramId(7);
        link.setProgramName("Datorzinātnes");
        link.setPartId(3);
        link.setPartName("A — Obligātā daļa");
        dto.setStudyPrograms(List.of(link));

        dto.setAcademicYear("2024/2025");
        dto.setSemester("Rudens");
        dto.setLanguage("Latviešu");
        dto.setLanguageCode("lv");
        dto.setFacultyName("Informācijas tehnoloģiju fakultāte");
        dto.setAssessmentForm("Eksāmens");

        dto.setAcademicHoursTotal(36);
        dto.setLectureHours(18);
        dto.setPractClassesHours(18);
        dto.setIndependentWorkHours(54);

        dto.setPrerequisitesDescription("Pamatzināšanas matemātikā un loģikā.");
        dto.setAnnotation("Kursa ievaddatu apraksts par programmēšanas pamatprincipiem.");
        dto.setGoal("Iemācīt studentiem programmēšanas pamatprincipus.");

        AssessmentComponentDTO ac = new AssessmentComponentDTO();
        ac.setId(1);
        ac.setComponentName("Eksāmens");
        ac.setPercentage(50);
        AssessmentComponentDTO ac2 = new AssessmentComponentDTO();
        ac2.setId(2);
        ac2.setComponentName("Mājasdarbi");
        ac2.setPercentage(50);
        dto.setAssessmentDistribution(List.of(ac, ac2));

        dto.setCourseResults(List.of(
                new CourseResultDTO("Zināšanas", "Pārzina programmēšanas pamatkonstrukcijas.", List.of()),
                new CourseResultDTO("Prasmes", "Spēj uzrakstīt vienkāršu programmu.", List.of())
        ));

        TopicDTO topic1 = new TopicDTO();
        topic1.setId(1);
        topic1.setSequenceNumber(1);
        topic1.setTitle("Ievads programmēšanā");
        topic1.setDescription("Mainīgie, datu tipi.");
        dto.setTopics(List.of(topic1));

        CalendarPlanDTO plan = new CalendarPlanDTO();
        plan.setSequenceNumber(1);
        plan.setTopicTitle("Ievads programmēšanā");
        SessionDTO session = new SessionDTO();
        session.setSessionType("Lekcija");
        session.setAcademicHours(2);
        plan.setSessions(List.of(session));
        dto.setCalendarPlan(List.of(plan));

        SelfStudyDTO ss = new SelfStudyDTO();
        ss.setId(1);
        ss.setActivityName("Literatūras studēšana");
        ss.setPercentage(100);
        dto.setSelfStudyActivities(List.of(ss));

        LiteratureDTO lit = new LiteratureDTO();
        lit.setId(1);
        lit.setCitation("Knuth, D. The Art of Computer Programming, Vol. 1, 1968.");
        dto.setLiterature(List.of(
                new LiteratureGroupDTO("Pamatliteratūra", List.of(lit))
        ));

        return dto;
    }
}
