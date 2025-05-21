package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.log.CourseVersionComment;
import lv.venta.coursecatalog.service.log.CourseVersionCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris kursa versiju komentāru API piekļuvei.
 */
@RestController
@RequestMapping("/api/course-version-comments")
public class CourseVersionCommentController {

    @Autowired
    private CourseVersionCommentService service;

    @GetMapping
    public List<CourseVersionComment> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CourseVersionComment create(@RequestBody CourseVersionComment input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public CourseVersionComment update(@PathVariable int id, @RequestBody CourseVersionComment input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
