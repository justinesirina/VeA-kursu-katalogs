package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Serviss kursa docētāju apstrādei.
 */
@Service
public class CourseTeacherService {

    @Autowired
    private CourseTeacherRepository repository;

    public List<CourseTeacher> getAll() {
        return repository.findAll();
    }

    public List<CourseTeacher> getByCourseId(UUID courseId) {
        return repository.findByCourseId(courseId);
    }

    public CourseTeacher create(CourseTeacher input) {
        return repository.save(input);
    }

    public CourseTeacher update(int id, CourseTeacher input) throws Exception {
        CourseTeacher existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Docētāja ieraksts nav atrasts pēc ID = " + id));
        existing.setCourse(input.getCourse());
        existing.setUser(input.getUser());
        existing.setRole(input.getRole());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
