package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.service.program.CourseToStudyProgramsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

/**
 * Kontrolieris, kas nodrošina kursa versiju un studiju programmu sasaistes API.
 */
@RestController
@RequestMapping("/api/course-to-study-programs")
public class CourseToStudyProgramsController {

    @Autowired
    private CourseToStudyProgramsService service;

    @GetMapping
    public List<CourseToStudyPrograms> getAll() {
        return service.getAll();
    }

    @GetMapping("/by-version/{versionId}")
    public List<CourseToStudyPrograms> getByVersion(@PathVariable UUID versionId) {
        return service.getByCourseVersionId(versionId);
    }

    @PreAuthorize("hasRole('ADMIN')")

    @PostMapping
    public CourseToStudyPrograms create(@Valid @RequestBody CourseToStudyPrograms input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('ADMIN')")

    @PutMapping("/{id}")
    public CourseToStudyPrograms update(@PathVariable int id, @Valid @RequestBody CourseToStudyPrograms input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('ADMIN')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
