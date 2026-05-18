package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO klase, kas apkopo visus datus detalizētajam studiju kursa skatam.
 * Šie dati tiek ielādēti uz frontend, strukturēti pēc VeA oficiālā kursa apraksta parauga.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDetailsDTO {

    // --- CourseInfo identifikators (vajadzīgs rediģēšanai) ---
    private UUID courseInfoId;

    // --- CourseVersion identifikators (vajadzīgs eksportam un citām versijas-līmeņa darbībām) ---
    private UUID versionId;

    // --- Versijas apstiprinājuma informācija (augšā stūrī) ---
    private String versionStatus;
    private String approvalDate;       // datums kā teksts (piemēram, "2022-08-31")
    private String decisionNumber;
    private String decisionReference;
    private Integer versionNumber;     // tikai vēsturiska skata gadījumā (versijas numurs bannerim)

    // --- Kursa pamata informācija ---
    private String titleLv;
    private String titleEn;
    private String authorFullTitle;    // Kursa autors: "Mg.sc.comp., docents Kārlis Immers"
    private String teacherFullTitle;   // Atbildīgais mācībspēks (var mainīties katru gadu)
    private List<StaffMemberDTO> authors;   // Visi autori ar lomām
    private List<StaffMemberDTO> teachers;  // Visi mācībspēki ar lomām
    private String courseCode;
    private String assessmentForm;      // Piemēram: "Eksāmens"
    private Integer assessmentFormId;   // ID rediģēšanai
    private int credits;

    // --- Stundu sadalījums ---
    private int academicHoursTotal;
    private int lectureHours;
    private int practClassesHours;
    private int independentWorkHours;

    // --- Priekšnosacījumi kursa apguvei ---
    private String prerequisitesDescription;
    private List<PrerequisiteDTO> prerequisites;

    // --- Studiju programmas, semestris, gads, valoda ---
    private List<StudyProgramLinkDTO> studyPrograms;
    private String academicYear;
    private String semester;
    private String language;     // Pilnais nosaukums (skatam): "Latviešu"
    private String languageCode; // ISO kods (rediģēšanai): "lv"
    private String facultyName; // no CourseVersion -> Faculty

    // --- Anotācija un kursa mērķis ---
    private String annotation;
    private String goal;

    // --- Vērtēšanas sadalījums (100%) ---
    private List<AssessmentComponentDTO> assessmentDistribution;

    // --- Studiju kursa rezultāti (SKR) ---
    private List<CourseResultDTO> courseResults;

    // --- SKR vērtēšanas kritēriji ---
    private List<ResultAssessmentDTO> resultAssessments;

    // --- SKR × komponentes matricas pilni ieraksti (ID, rediģēšanai) ---
    private List<ResultAssessmentFullDTO> resultAssessmentsFull;

    // --- Patstāvīgā darba organizācija ---
    private List<SelfStudyDTO> selfStudyActivities;

    // --- Kursa tēmas ---
    private List<TopicDTO> topics;

    // --- Kalendārais plāns ---
    private List<CalendarPlanDTO> calendarPlan;

    // --- Literatūra sadalīta pēc veidiem ---
    private List<LiteratureGroupDTO> literature;
}
