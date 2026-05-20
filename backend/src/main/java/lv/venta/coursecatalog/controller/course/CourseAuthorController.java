package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.service.course.CourseAuthorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/by-version/{versionId}")
    public List<CourseAuthor> getByVersion(@PathVariable UUID versionId) {
        return service.getByCourseVersionId(versionId);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @PostMapping
    public CourseAuthor create(@Valid @RequestBody CourseAuthor input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @PutMapping("/{id}")
    public CourseAuthor update(@PathVariable int id, @Valid @RequestBody CourseAuthor input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
