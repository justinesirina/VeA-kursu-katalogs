package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.dto.CourseCatalogItemDTO;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.model.program.StudyProgram;
import lv.venta.coursecatalog.model.program.StudyProgramPart;
import lv.venta.coursecatalog.model.support.AcademicYear;
import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.model.support.Semester;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import lv.venta.coursecatalog.service.security.RoleAccessChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseCatalogServiceTest {

    @Mock CourseRepository courseRepo;
    @Mock CourseVersionRepository versionRepo;
    @Mock CourseAuthorRepository authorRepo;
    @Mock CourseTeacherRepository teacherRepo;
    @Mock CourseToStudyProgramsRepository programsRepo;
    @Mock CourseVersionLogService logService;
    @Mock RoleAccessChecker roleChecker;

    @InjectMocks CourseServiceImpl service;

    private Course courseA;
    private Course courseB;
    private CourseVersion versionA;
    private CourseVersion versionB;

    @BeforeEach
    void setUp() {
        courseA = newCourse("ALG101", "Algoritmi", "Algorithms", 6);
        courseB = newCourse("DBP201", "Datu bāzes", "Databases", 4);

        Faculty fac = newFaculty(1, "Informācijas tehnoloģiju fakultāte");
        AcademicYear year = newYear(10, "2024/2025");
        Semester sem = newSemester(20, "Rudens");
        VersionStatus approved = newStatus(3, "Apstiprināts");

        versionA = newVersion(courseA, 2, approved, fac, year, sem, true);
        versionB = newVersion(courseB, 1, approved, fac, year, sem, true);
    }

    @Test
    void publicMode_emptyResult_returnsEmptyPage() {
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(null)).thenReturn(false);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        Page<CourseCatalogItemDTO> page = service.getCatalog(new CourseCatalogFilter(), pageable, null);

        assertTrue(page.getContent().isEmpty());
        verify(versionRepo, never()).findByCourseIdsAndStatusName(anyCollection(), any());
        verify(authorRepo, never()).findByCourseVersionIdIn(anyCollection());
    }

    @Test
    void publicMode_loadsApprovedVersionsAndBatchAssociations() {
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(null)).thenReturn(false);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(courseA, courseB), pageable, 2));

        when(versionRepo.findByCourseIdsAndStatusName(anyCollection(), eq("Apstiprināts")))
                .thenReturn(List.of(versionA, versionB));

        User author = newUser(11, "Anna", "Bērziņa");
        CourseAuthor courseAuthor = new CourseAuthor();
        courseAuthor.setCourseVersion(versionA);
        courseAuthor.setUser(author);
        when(authorRepo.findByCourseVersionIdIn(anyCollection()))
                .thenReturn(List.of(courseAuthor));

        User teacher = newUser(12, "Jānis", "Kalniņš");
        CourseTeacher courseTeacher = new CourseTeacher();
        courseTeacher.setCourseVersion(versionB);
        courseTeacher.setUser(teacher);
        when(teacherRepo.findByCourseVersionIdIn(anyCollection()))
                .thenReturn(List.of(courseTeacher));

        StudyProgram prog = newProgram(7, "Datorzinātnes");
        StudyProgramPart part = newProgramPart(3, "C - Brīvās izvēles");
        CourseToStudyPrograms link = new CourseToStudyPrograms();
        link.setCourseVersion(versionA);
        link.setProgram(prog);
        link.setProgramPart(part);
        when(programsRepo.findByCourseVersionIdIn(anyCollection()))
                .thenReturn(List.of(link));

        Page<CourseCatalogItemDTO> page = service.getCatalog(
                new CourseCatalogFilter(), pageable, null);

        assertEquals(2, page.getTotalElements());
        assertEquals(2, page.getContent().size());

        CourseCatalogItemDTO dtoA = page.getContent().get(0);
        assertEquals(courseA.getId(), dtoA.getCourseId());
        assertEquals("ALG101", dtoA.getCourseCode());
        assertEquals("Algoritmi", dtoA.getTitleLv());
        assertEquals(versionA.getId(), dtoA.getVersionId());
        assertEquals(2, dtoA.getVersionNumber());
        assertEquals("Apstiprināts", dtoA.getStatusName());
        assertEquals("Informācijas tehnoloģiju fakultāte", dtoA.getFacultyName());
        assertEquals("2024/2025", dtoA.getAcademicYearName());
        assertEquals("Rudens", dtoA.getSemesterName());
        assertEquals(1, dtoA.getAuthors().size());
        assertEquals("Bērziņa", dtoA.getAuthors().get(0).getSurname());
        assertEquals(1, dtoA.getPrograms().size());
        assertEquals("C - Brīvās izvēles", dtoA.getPrograms().get(0).getProgramPartName());

        CourseCatalogItemDTO dtoB = page.getContent().get(1);
        assertEquals("DBP201", dtoB.getCourseCode());
        assertEquals(1, dtoB.getTeachers().size());
        assertTrue(dtoB.getAuthors().isEmpty());
        assertTrue(dtoB.getPrograms().isEmpty());

        verify(authorRepo, times(1)).findByCourseVersionIdIn(anyCollection());
        verify(teacherRepo, times(1)).findByCourseVersionIdIn(anyCollection());
        verify(programsRepo, times(1)).findByCourseVersionIdIn(anyCollection());
        verify(versionRepo, never()).findByCourseIdsNotDeleted(anyCollection());
    }

    @Test
    void staffMode_useNotDeletedQuery_andRespectsStatusIdFilter() {
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(7)).thenReturn(true);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(courseA), pageable, 1));

        VersionStatus draft = newStatus(1, "Melnraksts");
        CourseVersion draftVersionV1 = newVersion(courseA, 1, draft, null, null, null, false);
        CourseVersion draftVersionV3 = newVersion(courseA, 3, draft, null, null, null, false);
        CourseVersion approvedV2 = newVersion(courseA, 2, newStatus(3, "Apstiprināts"), null, null, null, true);

        when(versionRepo.findByCourseIdsNotDeleted(anyCollection()))
                .thenReturn(List.of(draftVersionV1, draftVersionV3, approvedV2));
        when(authorRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());
        when(teacherRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());
        when(programsRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());

        CourseCatalogFilter filter = CourseCatalogFilter.builder().statusIds(List.of(1)).build();
        Page<CourseCatalogItemDTO> page = service.getCatalog(filter, pageable, 7);

        assertEquals(1, page.getContent().size());
        CourseCatalogItemDTO dto = page.getContent().get(0);
        assertEquals(3, dto.getVersionNumber(),
                "Staff režīmā ar statusId=Melnraksts jāizvēlas augstākais Melnraksta versijas numurs");
        assertEquals("Melnraksts", dto.getStatusName());

        verify(versionRepo, never()).findByCourseIdsAndStatusName(anyCollection(), any());
    }

    @Test
    void staffMode_withoutStatusId_picksLatestVersion() {
        // Staff bez statusa filtra redz pēdējo versiju (jebkura statusa), lai katalogā
        // būtu redzami arī kursi bez apstiprinātās versijas. Frontend kartīte saglabā
        // versionId, lai klikšķis aizvestu tieši uz šo versiju.
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(7)).thenReturn(true);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(courseA), pageable, 1));

        CourseVersion v1 = newVersion(courseA, 1, newStatus(1, "Melnraksts"), null, null, null, false);
        CourseVersion v2 = newVersion(courseA, 2, newStatus(3, "Apstiprināts"), null, null, null, true);
        when(versionRepo.findByCourseIdsNotDeleted(anyCollection()))
                .thenReturn(List.of(v1, v2));
        when(authorRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());
        when(teacherRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());
        when(programsRepo.findByCourseVersionIdIn(anyCollection())).thenReturn(List.of());

        Page<CourseCatalogItemDTO> page = service.getCatalog(
                new CourseCatalogFilter(), pageable, 7);

        assertEquals(1, page.getContent().size());
        CourseCatalogItemDTO dto = page.getContent().get(0);
        assertEquals(2, dto.getVersionNumber());
        assertEquals("Apstiprināts", dto.getStatusName());
    }

    @Test
    void courseWithoutMatchingVersion_yieldsDtoWithoutVersionFields() {
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(null)).thenReturn(false);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(courseA), pageable, 1));

        when(versionRepo.findByCourseIdsAndStatusName(anyCollection(), eq("Apstiprināts")))
                .thenReturn(List.of()); // nothing approved (edge case)

        Page<CourseCatalogItemDTO> page = service.getCatalog(
                new CourseCatalogFilter(), pageable, null);

        assertEquals(1, page.getContent().size());
        CourseCatalogItemDTO dto = page.getContent().get(0);
        assertEquals(courseA.getId(), dto.getCourseId());
        assertNull(dto.getVersionId());
        assertNull(dto.getStatusName());
        assertNotNull(dto.getAuthors());
        assertTrue(dto.getAuthors().isEmpty());
    }

    @Test
    void nullFilter_treatedAsEmpty() {
        Pageable pageable = PageRequest.of(0, 25);
        when(roleChecker.isStaff(null)).thenReturn(false);
        when(courseRepo.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        Page<CourseCatalogItemDTO> page = service.getCatalog(null, pageable, null);

        assertTrue(page.getContent().isEmpty());
    }

    // ---- helpers ----

    private static Course newCourse(String code, String lv, String en, int credits) {
        Course c = new Course();
        c.setId(UUID.randomUUID());
        c.setCourseCode(code);
        c.setTitleLv(lv);
        c.setTitleEn(en);
        c.setCredits(credits);
        c.setActive(true);
        return c;
    }

    private static Faculty newFaculty(int id, String name) {
        Faculty f = new Faculty();
        f.setId(id);
        f.setName(name);
        return f;
    }

    private static AcademicYear newYear(int id, String name) {
        AcademicYear y = new AcademicYear();
        y.setId(id);
        y.setName(name);
        return y;
    }

    private static Semester newSemester(int id, String name) {
        Semester s = new Semester();
        s.setId(id);
        s.setName(name);
        return s;
    }

    private static VersionStatus newStatus(int id, String name) {
        VersionStatus s = new VersionStatus();
        s.setId(id);
        s.setName(name);
        return s;
    }

    private static CourseVersion newVersion(Course c, int versionNumber, VersionStatus status,
                                            Faculty faculty, AcademicYear year, Semester sem,
                                            boolean active) {
        CourseVersion v = new CourseVersion();
        v.setId(UUID.randomUUID());
        v.setCourse(c);
        v.setVersionNumber(versionNumber);
        v.setStatus(status);
        v.setFaculty(faculty);
        v.setAcademicYear(year);
        v.setSemester(sem);
        v.setActive(active);
        return v;
    }

    private static User newUser(int id, String name, String surname) {
        User u = new User();
        u.setId(id);
        u.setName(name);
        u.setSurname(surname);
        return u;
    }

    private static StudyProgram newProgram(int id, String name) {
        StudyProgram p = new StudyProgram();
        p.setId(id);
        p.setName(name);
        return p;
    }

    private static StudyProgramPart newProgramPart(int id, String name) {
        StudyProgramPart p = new StudyProgramPart();
        p.setId(id);
        p.setName(name);
        return p;
    }
}
