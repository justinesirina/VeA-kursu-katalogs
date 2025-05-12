package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.CourseVersion;
import lv.venta.coursecatalog.repository.CourseVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    public CourseVersionService(CourseVersionRepository courseVersionRepository) {
        this.courseVersionRepository = courseVersionRepository;
    }

    /**
     * Atgriež visas kursu versijas no datubāzes (t.sk. arī arhivētās vai neaktīvās).
     */
    public List<CourseVersion> getAllCourseVersions() {
        return courseVersionRepository.findAll();
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
    public CourseVersion saveCourseVersion(CourseVersion version) {
        return courseVersionRepository.save(version);
    }

    /**
     * Dzēš (pilnībā) kursa versiju pēc tās ID.
     * Šī metode izmanto fizisko dzēšanu – vēlāk ieviesīsim "soft delete".
     */
    public void deleteCourseVersionById(UUID id) {
        courseVersionRepository.deleteById(id);
    }
}
