package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.service.course.CourseAuthorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris kursa autoru API piekļuvei.
 */
@RestController
@RequestMapping("/api/course-authors")
public class CourseAuthorController {

    @Autowired
    private CourseAuthorService service;

    @GetMapping
    public List<CourseAuthor> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CourseAuthor create(@Valid @RequestBody CourseAuthor input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public CourseAuthor update(@PathVariable int id, @Valid @RequestBody CourseAuthor input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
