package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.service.course.CourseTeacherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

/**
 * Kontrolieris kursa docētāju API piekļuvei.
 */
@RestController
@RequestMapping("/api/course-teachers")
public class CourseTeacherController {

    @Autowired
    private CourseTeacherService service;

    @GetMapping
    public List<CourseTeacher> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-version/{versionId}")
    public List<CourseTeacher> getByVersion(@PathVariable UUID versionId) {
        return service.getByCourseVersionId(versionId);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @PostMapping
    public CourseTeacher create(@Valid @RequestBody CourseTeacher input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @PutMapping("/{id}")
    public CourseTeacher update(@PathVariable int id, @Valid @RequestBody CourseTeacher input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('TEACHER')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
