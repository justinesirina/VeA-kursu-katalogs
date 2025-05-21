package lv.venta.coursecatalog.service.log;

import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.repository.log.CourseVersionActionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseVersionActionService {

    @Autowired
    private CourseVersionActionRepository repository;

    public List<CourseVersionAction> getAll() {
        return repository.findAll();
    }

    public CourseVersionAction create(CourseVersionAction input) {
        return repository.save(input);
    }

    public CourseVersionAction update(int id, CourseVersionAction input) throws Exception {
        CourseVersionAction existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Darbība nav atrasta pēc ID = " + id));
        existing.setCode(input.getCode());
        existing.setLabel(input.getLabel());
        existing.setDescription(input.getDescription());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
