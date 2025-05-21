package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris kursa versiju žurnāla API piekļuvei.
 */
@RestController
@RequestMapping("/api/course-version-logs")
public class CourseVersionLogController {

    @Autowired
    private CourseVersionLogService service;

    @GetMapping
    public List<CourseVersionLog> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CourseVersionLog create(@RequestBody CourseVersionLog input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public CourseVersionLog update(@PathVariable int id, @RequestBody CourseVersionLog input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
