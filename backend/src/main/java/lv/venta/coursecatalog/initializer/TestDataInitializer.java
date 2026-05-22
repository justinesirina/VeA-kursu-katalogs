
package lv.venta.coursecatalog.initializer;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.support.AcademicYear;
import lv.venta.coursecatalog.model.support.Semester;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.service.support.FacultyService;
import lv.venta.coursecatalog.service.support.LanguageService;
import lv.venta.coursecatalog.model.support.Language;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.courseinfo.AssessmentForm;
import lv.venta.coursecatalog.service.courseinfo.CourseInfoService;
import lv.venta.coursecatalog.service.courseinfo.AssessmentFormService;
import lv.venta.coursecatalog.service.course.CourseServiceImpl;
import lv.venta.coursecatalog.service.course.CourseVersionService;
import lv.venta.coursecatalog.service.support.AcademicYearService;
import lv.venta.coursecatalog.service.support.SemesterService;
import lv.venta.coursecatalog.service.support.VersionStatusService;
import lv.venta.coursecatalog.service.user.UserRoleService;
import lv.venta.coursecatalog.service.user.UserService;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

// @Component — atspējots. Demo seed dati nāk no V11__seed_demo_data.sql Flyway migrācijas.
// Lai pārieslēgtu uz Java seed (piem., izstrādes laikā jauniem entītiju laukiem),
// jāatkomentē @Component anotāciju zemāk.
@RequiredArgsConstructor
public class TestDataInitializer {

    private final CourseServiceImpl courseService;
    private final CourseVersionService courseVersionService;
    private final UserService userService;
    private final UserRoleService userRoleService;
    private final AcademicYearService yearService;
    private final SemesterService semesterService;
    private final VersionStatusService versionStatusService;
    private final FacultyService facultyService;
    private final CourseInfoService courseInfoService;
    private final AssessmentFormService assessmentFormService;
    private final LanguageService languageService;


    @PostConstruct
    public void init() {
        if (!courseService.getAllCourses().isEmpty()) return;

        // Izveidojam lietotāja lomu
        UserRole lecturerRole = new UserRole();
        lecturerRole.setRoleName("Lecturer");
        userRoleService.save(lecturerRole);

        // Izveidojam lietotāju
        User author = new User();
        author.setName("Dace");
        author.setSurname("Docētāja");
        author.setEmail("dace@venta.lv");
        author.setAcademicDegree("Mg.sc.comp.");
        author.setPosition("lektore");
        author.setRole(lecturerRole);
        userService.save(author);

        // Izveidojam fakultāti
        Faculty faculty = new Faculty();
        faculty.setName("ITF");
        faculty.setSlug("itf");
        facultyService.createFaculty(faculty);

        // Izveidojam kursu
        Course course = new Course();
        course.setCourseCode("ITB101");
        course.setTitleLv("Programmēšanas pamati");
        course.setTitleEn("Programming Basics");
        course.setSlug("programmesanas-pamati");
        course.setCredits(4);
        course.setArchived(false);
        course.setActive(true);
        courseService.createNewCourse(course);

        // Izveidojam akadēmisko gadu
        AcademicYear year = new AcademicYear();
        year.setName("2024/2025");
        year.setActive(true);
        yearService.save(year);

        // Izveidojam semestri
        Semester semester = new Semester();
        semester.setName("Rudens");
        semesterService.save(semester);

        // Izveidojam versijas statusu
        VersionStatus status = new VersionStatus();
        status.setName("Apstiprināts");
        status.setDescription("Apstiprināta kursa versija");
        versionStatusService.saveStatus(status);

        // Izveidojam kursa versiju
        CourseVersion version = new CourseVersion();
        version.setCourse(course);
        version.setVersionNumber(1);
        version.setStatus(status);
        version.setCreatedBy(author);
        version.setUpdatedBy(author);
        version.setActive(true);
        version.setArchived(false);
        version.setFaculty(faculty);
        version.setAcademicYear(year);
        version.setSemester(semester);
        version.setApprovalDate(LocalDate.of(2024, 6, 1));
        version.setDecisionNumber("Nr. ITF-2024/06");
        version.setDecisionReference("ITF domes sēde, 2024.06.01");

        courseVersionService.saveCourseVersion(version);

        // Izveidojam valodas
        Language latvian = new Language();
        latvian.setName("Latviešu");
        latvian.setCode("lv");
        languageService.create(latvian);

        Language english = new Language();
        english.setName("Angļu");
        english.setCode("en");
        languageService.create(english);

        // Izveidojam pārbaudes formu
        AssessmentForm examForm = new AssessmentForm();
        examForm.setName("Eksāmens");
        assessmentFormService.createForm(examForm);

        // Izveidojam CourseInfo
        CourseInfo info = new CourseInfo();
        info.setCourse(course);
        info.setCourseVersion(version);
        info.setAssessmentForm(examForm);
        info.setAcademicHoursTotal(36);
        info.setLectureHours(18);
        info.setPractClassesHours(18);
        info.setIndependentWorkHours(54);
        info.setLanguage("lv");
        info.setAnnotation("Šis kurss iepazīstina ar programmēšanas pamatiem.");
        info.setGoal("Iemācīt studentiem programmēšanas pamatprincipus.");
        info.setPrerequisitesDescription("Nepieciešamas pamatzināšanas matemātikā un loģikā.");
        info.setCreatedBy(author);
        info.setUpdatedBy(author);

        courseInfoService.create(info);
    }
}
