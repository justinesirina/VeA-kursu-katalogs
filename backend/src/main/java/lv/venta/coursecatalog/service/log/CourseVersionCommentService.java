package lv.venta.coursecatalog.service.log;

import lv.venta.coursecatalog.model.log.CourseVersionComment;
import lv.venta.coursecatalog.repository.log.CourseVersionCommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviss kursa versiju komentāru apstrādei.
 */
@Service
public class CourseVersionCommentService {

    @Autowired
    private CourseVersionCommentRepository repository;

    public List<CourseVersionComment> getAll() {
        return repository.findAll();
    }

    public CourseVersionComment create(CourseVersionComment input) {
        return repository.save(input);
    }

    public CourseVersionComment update(int id, CourseVersionComment input) throws Exception {
        CourseVersionComment existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Komentārs nav atrasts pēc ID = " + id));
        existing.setCourseVersion(input.getCourseVersion());
        existing.setUser(input.getUser());
        existing.setComment(input.getComment());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
