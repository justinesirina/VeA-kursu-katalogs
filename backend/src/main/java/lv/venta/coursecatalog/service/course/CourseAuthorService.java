package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

/**
 * Serviss kursa autoru apstrādei.
 */
@Service
public class CourseAuthorService {

    @Autowired
    private CourseAuthorRepository repository;

    public List<CourseAuthor> getAll() {
        return repository.findAll();
    }

    public List<CourseAuthor> getByCourseVersionId(UUID courseVersionId) {
        return repository.findByCourseVersionId(courseVersionId);
    }

    public CourseAuthor create(CourseAuthor input) {
        return repository.save(input);
    }

    public CourseAuthor update(int id, CourseAuthor input) throws Exception {
        CourseAuthor existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Autora ieraksts nav atrasts pēc ID = " + id));
        existing.setCourseVersion(input.getCourseVersion());
        existing.setUser(input.getUser());
        existing.setRole(input.getRole());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
