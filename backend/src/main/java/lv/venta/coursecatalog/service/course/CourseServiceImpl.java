package lv.venta.coursecatalog.service.course;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.dto.ArchivedCourseDTO;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
    private final CourseVersionLogService logService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepo,
                             CourseVersionRepository courseVersionRepo,
                             CourseVersionLogService logService) {
        this.courseRepo = courseRepo;
        this.courseVersionRepo = courseVersionRepo;
        this.logService = logService;
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
     * Atgriež arhivētos kursus DTO formā ar agregētu versiju info
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

}
