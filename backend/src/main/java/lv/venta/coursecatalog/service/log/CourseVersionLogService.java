package lv.venta.coursecatalog.service.log;

import lv.venta.coursecatalog.model.dto.CourseVersionLogDTO;
import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.repository.log.CourseVersionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * Serviss kursa versiju žurnāla ierakstu apstrādei.
 */
@Service
public class CourseVersionLogService {

    @Autowired
    private CourseVersionLogRepository repository;

    public List<CourseVersionLog> getAll() {
        return repository.findAll();
    }

    /**
     * F9 — atgriež plakanu žurnāla projekciju, sakārtotu pēc laika dilstoši.
     */
    public List<CourseVersionLogDTO> getAllAsDTO() {
        return repository.findAll().stream()
                .sorted(Comparator.comparing(
                        CourseVersionLog::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(CourseVersionLogDTO::from)
                .toList();
    }

    public CourseVersionLog create(CourseVersionLog input) {
        return repository.save(input);
    }

    public CourseVersionLog update(int id, CourseVersionLog input) throws Exception {
        CourseVersionLog existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Žurnāla ieraksts nav atrasts pēc ID = " + id));
        existing.setCourseVersion(input.getCourseVersion());
        existing.setUser(input.getUser());
        existing.setAction(input.getAction());
        existing.setComment(input.getComment());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
