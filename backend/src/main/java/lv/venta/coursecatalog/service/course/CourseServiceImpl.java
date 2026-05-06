package lv.venta.coursecatalog.service.course;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.dto.ArchivedCourseDTO;
import lv.venta.coursecatalog.model.dto.CourseCatalogItemDTO;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import lv.venta.coursecatalog.service.security.RoleAccessChecker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Servisa slāņa implementācija darbībām ar studiju kursiem.
 *
 * <p>Nodrošina CRUD operācijas, mīksto dzēšanu un aktīvo kursu filtrēšanu.
 * Kursiem ar {@code deletedAt != null} tiek automātiski piemērota Hibernate
 * {@code @SQLRestriction}, tāpēc tie neparādās nevienā {@code findAll()} rezultātā.</p>
 */
@Service
public class CourseServiceImpl implements ICourseService {

    private final CourseRepository courseRepo;
    private final CourseVersionRepository courseVersionRepo;
    private final CourseAuthorRepository courseAuthorRepo;
    private final CourseTeacherRepository courseTeacherRepo;
    private final CourseToStudyProgramsRepository courseToProgramsRepo;
    private final CourseVersionLogService logService;
    private final RoleAccessChecker roleAccessChecker;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepo,
                             CourseVersionRepository courseVersionRepo,
                             CourseAuthorRepository courseAuthorRepo,
                             CourseTeacherRepository courseTeacherRepo,
                             CourseToStudyProgramsRepository courseToProgramsRepo,
                             CourseVersionLogService logService,
                             RoleAccessChecker roleAccessChecker) {
        this.courseRepo = courseRepo;
        this.courseVersionRepo = courseVersionRepo;
        this.courseAuthorRepo = courseAuthorRepo;
        this.courseTeacherRepo = courseTeacherRepo;
        this.courseToProgramsRepo = courseToProgramsRepo;
        this.logService = logService;
        this.roleAccessChecker = roleAccessChecker;
    }

    /**
     * Atgriež visus kursus no datubāzes.
     */
    @Override
    public List<Course> getAllCourses() {
        return courseRepo.findAll();
    }

    /**
     * Atgriež vienu kursu pēc tā UUID.
     * @param id kursa UUID
     * @throws Exception ja kurss nav atrasts
     */
    @Override
    public Course getCourseById(UUID id) throws Exception {
        return courseRepo.findById(id)
                .orElseThrow(() -> new Exception("Kurss ar ID " + id + " nav atrasts."));
    }

    /**
     * Saglabā jaunu kursu datubāzē.
     * @param course kursa objekts
     */
    @Override
    public Course createNewCourse(Course course) {
        return createNewCourse(course, null);
    }

    @Override
    @Transactional
    public Course createNewCourse(Course course, Integer actorUserId) {
        Course saved = courseRepo.save(course);
        logService.append(saved, null, actorUserId, "course_create", null);
        return saved;
    }

    /**
     * Atjaunina esošu kursu pēc tā ID.
     * @param id kursa ID
     * @param course jauna kursa informācija
     * @throws Exception ja kurss nav atrasts
     */
    @Override
    public Course updateCourseById(UUID id, Course course) throws Exception {
        Course existing = getCourseById(id);
        existing.setCourseCode(course.getCourseCode());
        existing.setTitleLv(course.getTitleLv());
        existing.setTitleEn(course.getTitleEn());
        existing.setSlug(course.getSlug());
        existing.setCredits(course.getCredits());
        existing.setArchived(course.isArchived());
        existing.setActive(course.isActive());
        existing.setDeletedAt(course.getDeletedAt());
        return courseRepo.save(existing);
    }

    /**
     * Veic kursa mīksto dzēšanu (soft delete), atzīmējot to kā neaktīvu.
     * @param id kursa UUID
     * @throws Exception ja kurss nav atrasts
     */
    @Override
    public void deleteCourseById(UUID id) throws Exception {
        deleteCourseById(id, null);
    }

    @Override
    @Transactional
    public void deleteCourseById(UUID id, Integer actorUserId) throws Exception {
        Course existing = getCourseById(id);
        existing.setActive(false);
        existing.setDeletedAt(LocalDateTime.now());
        courseRepo.save(existing);
        logService.append(existing, null, actorUserId, "course_archive", null);
    }

    @Override
    public List<Course> getAllActiveCourses() {
        return courseRepo.findAllByActiveTrueAndDeletedAtIsNull();
    }

    @Override
    public List<Course> getAllArchivedCourses() {
        return courseRepo.findAllArchived();
    }

    /**
     * Atgriež arhivētos kursus DTO formā ar apkopotu versiju info
     * (skaits + jaunākās versijas Nr. un statuss).
     */
    @Override
    public List<ArchivedCourseDTO> getAllArchivedCoursesAsDTO() {
        return courseRepo.findAllArchived().stream()
                .map(c -> ArchivedCourseDTO.from(c, courseVersionRepo.findByCourseId(c.getId())))
                .toList();
    }

    @Override
    @Transactional
    public void restoreCourseById(UUID id) throws Exception {
        restoreCourseById(id, null);
    }

    @Override
    @Transactional
    public void restoreCourseById(UUID id, Integer actorUserId) throws Exception {
        Course archived = courseRepo.findByIdIncludingArchived(id)
                .orElseThrow(() -> new Exception("Kurss ar ID " + id + " nav atrasts."));
        if (archived.getDeletedAt() == null) {
            throw new Exception("Kurss ar ID " + id + " nav arhivēts.");
        }
        int updated = courseRepo.restoreById(id);
        if (updated == 0) {
            throw new Exception("Neizdevās atjaunot kursu ar ID " + id);
        }
        logService.append(archived, null, actorUserId, "course_restore", null);
    }

    /**
     * Veic neatgriezenisku kursa fizisko dzēšanu no datubāzes.
     * Pieļaujams tikai jau arhivētiem (soft-delete'tiem) kursiem.
     *
     * <p>Veic manuālu kaskādi caur native vaicājumiem, jo Hibernate cascade nedarbojas
     * uz arhivētiem ierakstiem (@SQLRestriction filtrē LAZY relācijas).</p>
     */
    @Override
    @Transactional
    public void hardDeleteArchivedCourseById(UUID id) throws Exception {
        Course archived = courseRepo.findByIdIncludingArchived(id)
                .orElseThrow(() -> new Exception("Kurss ar ID " + id + " nav atrasts."));
        if (archived.getDeletedAt() == null) {
            throw new Exception("Tikai arhivētus kursus var dzēst neatgriezeniski. Vispirms arhivē kursu.");
        }

        // Dzēšana secībā no apakšas uz augšu (no FK leaf līdz course)
        // Atsauces uz course_versions caur course_info bērniem
        runDelete("DELETE FROM calendar_sessions WHERE topic_id IN (SELECT id FROM calendar_topics WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)))", id);
        runDelete("DELETE FROM calendar_topics WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_content WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_prerequisites WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM literature_sources WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_assessment_distribution WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_self_study_distribution WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_to_programme_results WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id))", id);
        runDelete("DELETE FROM course_info WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);

        // Course versijas log un komentāri
        runDelete("DELETE FROM course_version_log WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);
        runDelete("DELETE FROM course_version_comments WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);

        // CourseResult un tā bērni
        runDelete("DELETE FROM course_result_assessments WHERE course_result_id IN (SELECT id FROM course_results WHERE course_id = :id)", id);
        runDelete("DELETE FROM course_to_programme_results WHERE course_result_id IN (SELECT id FROM course_results WHERE course_id = :id)", id);
        runDelete("DELETE FROM course_results WHERE course_id = :id", id);

        // Versijas līmeņa sasaistes (autori, pasniedzēji, programmas tagad ir versionētas)
        runDelete("DELETE FROM course_teachers WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);
        runDelete("DELETE FROM course_authors WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);
        runDelete("DELETE FROM course_to_study_programs WHERE course_version_id IN (SELECT id FROM course_versions WHERE course_id = :id)", id);

        // Tiešas Course atsauces (citi kursi, kas norāda šo kā priekšnosacījumu)
        runDelete("DELETE FROM course_prerequisites WHERE required_course_id = :id", id);

        // Visas versijas un kurss
        runDelete("DELETE FROM course_versions WHERE course_id = :id", id);
        runDelete("DELETE FROM courses WHERE id = :id", id);
    }

    private void runDelete(String sql, UUID id) {
        entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate();
    }

    /**
     * F5 — publiskais katalogs ar meklēšanu, filtrēšanu un lapu izkārtojumu.
     * Pirmais solis: filtrē Course līmenī ar {@link CourseCatalogSpecifications}.
     * Otrais solis: katram lapā esošajam kursam izvēlas atspoguļošanai
     * piemērotāko versiju (publiskais režīms = aktīvā apstiprinātā;
     * staff režīms = augstākais versionNumber starp non-deleted versijām,
     * kas atbilst statusId, ja tas ir uzdots).
     * Trešais solis: vienā vaicājumā ielādē autorus, docētājus un programmu
     * sasaistes visām atspoguļotajām versijām, lai izvairītos no N+1.
     */
    @Override
    @Transactional(readOnly = true)
    public Page<CourseCatalogItemDTO> getCatalog(CourseCatalogFilter filter,
                                                 Pageable pageable,
                                                 Integer actorUserId) {
        boolean staffMode = roleAccessChecker.isStaff(actorUserId);
        CourseCatalogFilter effective = filter != null ? filter : new CourseCatalogFilter();

        Page<Course> coursePage = courseRepo.findAll(
                CourseCatalogSpecifications.withFilters(effective, staffMode),
                pageable
        );
        if (coursePage.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, coursePage.getTotalElements());
        }

        List<UUID> courseIds = coursePage.getContent().stream()
                .map(Course::getId)
                .toList();

        Map<UUID, CourseVersion> displayVersionByCourseId =
                resolveDisplayVersions(courseIds, effective, staffMode);

        Set<UUID> versionIds = displayVersionByCourseId.values().stream()
                .map(CourseVersion::getId)
                .collect(Collectors.toSet());

        Map<UUID, List<CourseAuthor>> authorsByVersion = versionIds.isEmpty()
                ? Map.of()
                : courseAuthorRepo.findByCourseVersionIdIn(versionIds).stream()
                        .collect(Collectors.groupingBy(a -> a.getCourseVersion().getId()));

        Map<UUID, List<CourseTeacher>> teachersByVersion = versionIds.isEmpty()
                ? Map.of()
                : courseTeacherRepo.findByCourseVersionIdIn(versionIds).stream()
                        .collect(Collectors.groupingBy(t -> t.getCourseVersion().getId()));

        Map<UUID, List<CourseToStudyPrograms>> programsByVersion = versionIds.isEmpty()
                ? Map.of()
                : courseToProgramsRepo.findByCourseVersionIdIn(versionIds).stream()
                        .collect(Collectors.groupingBy(p -> p.getCourseVersion().getId()));

        List<CourseCatalogItemDTO> items = coursePage.getContent().stream()
                .map(course -> toDTO(
                        course,
                        displayVersionByCourseId.get(course.getId()),
                        authorsByVersion,
                        teachersByVersion,
                        programsByVersion
                ))
                .toList();

        return new PageImpl<>(items, pageable, coursePage.getTotalElements());
    }

    private Map<UUID, CourseVersion> resolveDisplayVersions(List<UUID> courseIds,
                                                            CourseCatalogFilter filter,
                                                            boolean staffMode) {
        if (!staffMode) {
            List<CourseVersion> approved = courseVersionRepo.findByCourseIdsAndStatusName(
                    courseIds, CourseCatalogSpecifications.PUBLIC_VISIBLE_STATUS);
            return approved.stream().collect(Collectors.toMap(
                    v -> v.getCourse().getId(),
                    v -> v,
                    (a, b) -> a.getVersionNumber() >= b.getVersionNumber() ? a : b
            ));
        }

        List<CourseVersion> all = courseVersionRepo.findByCourseIdsNotDeleted(courseIds);
        if (filter.getStatusIds() != null && !filter.getStatusIds().isEmpty()) {
            Set<Integer> wanted = Set.copyOf(filter.getStatusIds());
            all = all.stream()
                    .filter(v -> v.getStatus() != null
                            && wanted.contains(v.getStatus().getId()))
                    .toList();
        }
        return all.stream().collect(Collectors.toMap(
                v -> v.getCourse().getId(),
                v -> v,
                (a, b) -> a.getVersionNumber() >= b.getVersionNumber() ? a : b
        ));
    }

    private CourseCatalogItemDTO toDTO(Course course,
                                       CourseVersion version,
                                       Map<UUID, List<CourseAuthor>> authorsByVersion,
                                       Map<UUID, List<CourseTeacher>> teachersByVersion,
                                       Map<UUID, List<CourseToStudyPrograms>> programsByVersion) {
        CourseCatalogItemDTO dto = new CourseCatalogItemDTO();
        dto.setCourseId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setTitleLv(course.getTitleLv());
        dto.setTitleEn(course.getTitleEn());
        dto.setCredits(course.getCredits());

        if (version == null) {
            dto.setAuthors(List.of());
            dto.setTeachers(List.of());
            dto.setPrograms(List.of());
            return dto;
        }

        dto.setVersionId(version.getId());
        dto.setVersionNumber(version.getVersionNumber());
        dto.setStatusName(version.getStatus() != null ? version.getStatus().getName() : null);
        dto.setFacultyName(version.getFaculty() != null ? version.getFaculty().getName() : null);
        dto.setAcademicYearName(version.getAcademicYear() != null
                ? version.getAcademicYear().getName() : null);
        dto.setSemesterName(version.getSemester() != null ? version.getSemester().getName() : null);

        List<CourseCatalogItemDTO.PersonRef> authors = authorsByVersion
                .getOrDefault(version.getId(), List.of()).stream()
                .filter(a -> a.getUser() != null)
                .sorted(Comparator.comparing(a -> safe(a.getUser().getSurname())))
                .map(a -> new CourseCatalogItemDTO.PersonRef(
                        a.getUser().getId(),
                        a.getUser().getName(),
                        a.getUser().getSurname()))
                .toList();
        dto.setAuthors(authors);

        List<CourseCatalogItemDTO.PersonRef> teachers = teachersByVersion
                .getOrDefault(version.getId(), List.of()).stream()
                .filter(t -> t.getUser() != null)
                .sorted(Comparator.comparing(t -> safe(t.getUser().getSurname())))
                .map(t -> new CourseCatalogItemDTO.PersonRef(
                        t.getUser().getId(),
                        t.getUser().getName(),
                        t.getUser().getSurname()))
                .toList();
        dto.setTeachers(teachers);

        List<CourseCatalogItemDTO.ProgramRef> programs = programsByVersion
                .getOrDefault(version.getId(), List.of()).stream()
                .map(p -> new CourseCatalogItemDTO.ProgramRef(
                        p.getProgram() != null ? p.getProgram().getId() : null,
                        p.getProgram() != null ? p.getProgram().getName() : null,
                        p.getProgramPart() != null ? p.getProgramPart().getId() : null,
                        p.getProgramPart() != null ? p.getProgramPart().getName() : null))
                .toList();
        dto.setPrograms(programs);

        return dto;
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

}
