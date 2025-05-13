package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.CourseVersion;
import lv.venta.coursecatalog.repository.*;
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
        int yearId = version.getAcademicYear().getId();
        int semesterId = version.getSemester().getId();

        version.setCourse(courseRepository.findById(courseId).orElseThrow(() -> new RuntimeException("Course not found")));
        version.setStatus(versionStatusRepository.findById(statusId).orElseThrow(() -> new RuntimeException("Status not found")));
        version.setAcademicYear(academicYearRepository.findById(yearId).orElseThrow(() -> new RuntimeException("Academic year not found")));
        version.setSemester(semesterRepository.findById(semesterId).orElseThrow(() -> new RuntimeException("Semester not found")));

       CourseVersion saved = courseVersionRepository.save(version);
        return saved;
    }


    /**
     * Dzēš (pilnībā) kursa versiju pēc tās ID.
     * Šī metode izmanto fizisko dzēšanu – vēlāk ieviesīsim "soft delete".
     */
    public void deleteCourseVersionById(UUID id) {
        courseVersionRepository.deleteById(id);
    }
}
