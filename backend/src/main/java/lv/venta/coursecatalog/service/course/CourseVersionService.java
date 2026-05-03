package lv.venta.coursecatalog.service.course;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.support.AcademicYearRepository;
import lv.venta.coursecatalog.repository.support.SemesterRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PersistenceContext
    private EntityManager entityManager;

    //Precizēts konstruktors
    @Autowired
    public CourseVersionService(
            CourseVersionRepository courseVersionRepository,
            CourseRepository courseRepository,
            VersionStatusRepository versionStatusRepository,
            AcademicYearRepository academicYearRepository,
            SemesterRepository semesterRepository) {
        this.courseVersionRepository = courseVersionRepository;
        this.courseRepository = courseRepository;
        this.versionStatusRepository = versionStatusRepository;
        this.academicYearRepository = academicYearRepository;
        this.semesterRepository = semesterRepository;
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
     * Ja versijai ir ID, tiks veikta atjaunināšana; ja nav – izveide.
     */
    @Transactional
    public CourseVersion saveCourseVersion(CourseVersion version) {
        UUID courseId = version.getCourse().getId();
        int statusId = version.getStatus().getId();

        version.setCourse(courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found")));
        version.setStatus(versionStatusRepository.findById(statusId).orElseThrow(() -> new RuntimeException("Status not found")));

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

        return courseVersionRepository.save(version);
    }


    /**
     * Veic versijas mīksto dzēšanu (soft delete) — uzstāda deletedAt un isActive=false.
     * Native UPDATE bypass'o @SQLRestriction filtru.
     */
    @Transactional
    public void deleteCourseVersionById(UUID id) {
        int updated = courseVersionRepository.softDeleteById(id);
        if (updated == 0) {
            throw new RuntimeException("Versija ar ID " + id + " nav atrasta.");
        }
    }

    /**
     * Atgriež visas arhivētās (soft-delete'tās) versijas.
     */
    public List<CourseVersion> getAllArchivedVersions() {
        return courseVersionRepository.findAllArchived();
    }

    /**
     * Atjauno arhivētu versiju, noņemot deletedAt.
     */
    @Transactional
    public void restoreCourseVersionById(UUID id) {
        CourseVersion archived = courseVersionRepository.findByIdIncludingArchived(id)
                .orElseThrow(() -> new RuntimeException("Versija ar ID " + id + " nav atrasta."));
        if (archived.getDeletedAt() == null) {
            throw new RuntimeException("Versija ar ID " + id + " nav arhivēta.");
        }
        int updated = courseVersionRepository.restoreById(id);
        if (updated == 0) {
            throw new RuntimeException("Neizdevās atjaunot versiju ar ID " + id);
        }
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
