package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.service.log.CourseVersionActionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris darbību tipu API piekļuvei.
 */
@RestController
@RequestMapping("/api/course-version-actions")
public class CourseVersionActionController {

    @Autowired
    private CourseVersionActionService service;

    @GetMapping
    public List<CourseVersionAction> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CourseVersionAction create(@RequestBody CourseVersionAction input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public CourseVersionAction update(@PathVariable int id, @RequestBody CourseVersionAction input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
