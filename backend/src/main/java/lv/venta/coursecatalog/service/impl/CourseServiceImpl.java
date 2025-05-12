package lv.venta.coursecatalog.service.impl;

import lv.venta.coursecatalog.model.Course;
import lv.venta.coursecatalog.repository.CourseRepository;
import lv.venta.coursecatalog.service.ICourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Servisa slāņa implementācija, kas satur loģiku darbībām ar kursiem.
 */
@Service
public class CourseServiceImpl implements ICourseService {

    private final CourseRepository courseRepo;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepo) {
        this.courseRepo = courseRepo;
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
        return courseRepo.save(course);
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
        Course existing = getCourseById(id);
        existing.setActive(false);
        existing.setDeletedAt(LocalDateTime.now());
        courseRepo.save(existing);
    }

    @Override
    public List<Course> getAllActiveCourses() {
        return courseRepo.findAllByActiveTrueAndDeletedAtIsNull();
    }

}
