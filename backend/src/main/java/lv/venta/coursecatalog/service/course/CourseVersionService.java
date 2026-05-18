package lv.venta.coursecatalog.service.course;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.dto.ArchivedVersionDTO;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.support.AcademicYearRepository;
import lv.venta.coursecatalog.repository.support.SemesterRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Servisa klase, kas satur biznesa loģiku saistībā ar CourseVersion entītiju.
 * Šī klase veic datu izgūšanu, filtrēšanu un saglabāšanu, izmantojot CourseVersionRepository.
 */
@Service
public class CourseVersionService {

    private final CourseVersionRepository courseVersionRepository;
    private final CourseRepository courseRepository;
    private final VersionStatusRepository versionStatusRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final CourseVersionLogService logService;

    @PersistenceContext
    private EntityManager entityManager;

    //Precizēts konstruktors
    public CourseVersionService(
            CourseVersionRepository courseVersionRepository,
            CourseRepository courseRepository,
            VersionStatusRepository versionStatusRepository,
            AcademicYearRepository academicYearRepository,
            SemesterRepository semesterRepository,
            CourseVersionLogService logService) {
        this.courseVersionRepository = courseVersionRepository;
        this.courseRepository = courseRepository;
        this.versionStatusRepository = versionStatusRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
        this.logService = logService;
    }

    /**
     * Atgriež visas kursu versijas no datubāzes (t.sk. arī arhivētās vai neaktīvās).
     */
    public List<CourseVersion> getAllCourseVersions() {
        List<CourseVersion> list = courseVersionRepository.findAll();
        System.out.println(">>> GET: atrasti kursa versiju ieraksti: " + list.size());
        return list;
    }

    /**
     * Atgriež visas versijas konkrētam kursam (pēc Course ID).
     */
    public List<CourseVersion> getVersionsByCourseId(UUID courseId) {
        return courseVersionRepository.findByCourseId(courseId);
    }

    /**
     * Atgriež visas versijas, kuras nav atzīmētas kā dzēstas.
     */
    public List<CourseVersion> getAllActiveVersionsNotDeleted() {
        return courseVersionRepository.findByDeletedAtIsNull();
    }

    /**
     * Atgriež konkrētu kursa versiju pēc tās ID, ja tāda eksistē.
     */
    public Optional<CourseVersion> getCourseVersionById(UUID id) {
        return courseVersionRepository.findById(id);
    }

    /**
     * Saglabā jaunu vai atjaunotu kursa versiju.
     * Ja versijai ir ID un tā jau eksistē, statuss un apstiprināšanas metadati tiek
     * pārmantoti no DB — tos drīkst mainīt tikai F8 apstiprināšanas plūsmas
     * galapunkti (/submit, /approve, /reject, /reopen).
     */
    @Transactional
    public CourseVersion saveCourseVersion(CourseVersion version) {
        return saveCourseVersion(version, null);
    }

    @Transactional
    public CourseVersion saveCourseVersion(CourseVersion version, Integer actorUserId) {
        UUID courseId = version.getCourse().getId();
        version.setCourse(courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found")));

        Optional<CourseVersion> existing = version.getId() != null
                ? courseVersionRepository.findById(version.getId())
                : Optional.empty();

        if (existing.isPresent()) {
            // F8: ģenēriskā saglabāšana nedrīkst mainīt status, isActive vai apstiprināšanas metadatus.
            CourseVersion current = existing.get();
            version.setStatus(current.getStatus());
            version.setActive(current.isActive());
            version.setApprovalDate(current.getApprovalDate());
            version.setDecisionNumber(current.getDecisionNumber());
            version.setDecisionReference(current.getDecisionReference());
        } else if (version.getStatus() != null && version.getStatus().getId() != 0) {
            int statusId = version.getStatus().getId();
            version.setStatus(versionStatusRepository.findById(statusId)
                    .orElseThrow(() -> new RuntimeException("Status not found")));
        } else {
            // Jaunas versijas bez norādīta statusa noklusē uz Melnrakstu (F8 plūsmas sākums).
            version.setStatus(versionStatusRepository.findByName("Melnraksts")
                    .orElseThrow(() -> new RuntimeException("Status 'Melnraksts' not seeded")));
        }

        // academicYear un semester ir nullable (Melnraksts versijā vēl nav piesaistes gadam)
        if (version.getAcademicYear() != null) {
            int yearId = version.getAcademicYear().getId();
            version.setAcademicYear(academicYearRepository.findById(yearId)
                    .orElseThrow(() -> new RuntimeException("Academic year not found")));
        }
        if (version.getSemester() != null) {
            int semesterId = version.getSemester().getId();
            version.setSemester(semesterRepository.findById(semesterId)
                    .orElseThrow(() -> new RuntimeException("Semester not found")));
        }

        boolean isNew = !existing.isPresent();
        CourseVersion saved = courseVersionRepository.save(version);
        if (isNew) {
            logService.append(saved.getCourse(), saved, actorUserId, "version_create", null);
        }
        return saved;
    }


    /**
     * Veic versijas mīksto dzēšanu (soft delete) — uzstāda deletedAt un isActive=false.
     * Native UPDATE bypass'o @SQLRestriction filtru.
     */
    @Transactional
    public void deleteCourseVersionById(UUID id) {
        deleteCourseVersionById(id, null);
    }

    @Transactional
    public void deleteCourseVersionById(UUID id, Integer actorUserId) {
        CourseVersion v = courseVersionRepository.findById(id).orElse(null);
        int updated = courseVersionRepository.softDeleteById(id);
        if (updated == 0) {
            throw new RuntimeException("Versija ar ID " + id + " nav atrasta.");
        }
        if (v != null) {
            logService.append(v.getCourse(), v, actorUserId, "version_archive", null);
        }
    }

    /**
     * Atgriež visas arhivētās (soft-delete'tās) versijas.
     */
    public List<CourseVersion> getAllArchivedVersions() {
        return courseVersionRepository.findAllArchived();
    }

    /**
     * Atgriež arhivētās versijas plakanas DTO formā ar saistītā kursa pamatinformāciju.
     * Risina problēmu, ka {@code CourseVersion.course} ir ar {@code @JsonBackReference}
     * un netiktu serializēts JSON atbildē.
     */
    public List<ArchivedVersionDTO> getAllArchivedVersionsAsDTO() {
        return courseVersionRepository.findAllArchived().stream()
                .map(ArchivedVersionDTO::from)
                .toList();
    }

    /**
     * Atjauno arhivētu versiju, noņemot deletedAt.
     */
    @Transactional
    public void restoreCourseVersionById(UUID id) {
        restoreCourseVersionById(id, null);
    }

    @Transactional
    public void restoreCourseVersionById(UUID id, Integer actorUserId) {
        CourseVersion archived = courseVersionRepository.findByIdIncludingArchived(id)
                .orElseThrow(() -> new RuntimeException("Versija ar ID " + id + " nav atrasta."));
        if (archived.getDeletedAt() == null) {
            throw new RuntimeException("Versija ar ID " + id + " nav arhivēta.");
        }
        int updated = courseVersionRepository.restoreById(id);
        if (updated == 0) {
            throw new RuntimeException("Neizdevās atjaunot versiju ar ID " + id);
        }
        logService.append(archived.getCourse(), archived, actorUserId, "version_restore", null);
    }

    /**
     * Veic neatgriezenisku versijas fizisko dzēšanu — pieejams tikai arhivētai versijai.
     * Manuālā kaskāde caur native vaicājumiem (skat. CourseServiceImpl.hardDeleteArchivedCourseById).
     */
    @Transactional
    public void hardDeleteArchivedVersionById(UUID id) {
        CourseVersion archived = courseVersionRepository.findByIdIncludingArchived(id)
                .orElseThrow(() -> new RuntimeException("Versija ar ID " + id + " nav atrasta."));
        if (archived.getDeletedAt() == null) {
            throw new RuntimeException("Tikai arhivētas versijas var dzēst neatgriezeniski.");
        }

        // Dzēš no zemākā līmeņa uz augšu
        runDelete("DELETE FROM calendar_sessions WHERE topic_id IN (SELECT id FROM calendar_topics WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id))", id);
        runDelete("DELETE FROM calendar_topics WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_content WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_prerequisites WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM literature_sources WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_assessment_distribution WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_self_study_distribution WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_to_programme_results WHERE course_info_id IN (SELECT id FROM course_info WHERE course_version_id = :id)", id);
        runDelete("DELETE FROM course_info WHERE course_version_id = :id", id);
        runDelete("DELETE FROM course_version_log WHERE course_version_id = :id", id);
        runDelete("DELETE FROM course_version_comments WHERE course_version_id = :id", id);

        // Versijas līmeņa sasaistes (autori, pasniedzēji, programmas)
        runDelete("DELETE FROM course_authors WHERE course_version_id = :id", id);
        runDelete("DELETE FROM course_teachers WHERE course_version_id = :id", id);
        runDelete("DELETE FROM course_to_study_programs WHERE course_version_id = :id", id);

        runDelete("DELETE FROM course_versions WHERE id = :id", id);
    }

    private void runDelete(String sql, UUID id) {
        entityManager.createNativeQuery(sql).setParameter("id", id).executeUpdate();
    }
}
