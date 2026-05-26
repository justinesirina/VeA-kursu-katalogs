package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.log.CourseVersionComment;
import lv.venta.coursecatalog.service.log.CourseVersionCommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris kursa versiju komentāru API piekļuvei.
 * Lasīšana pieejama jebkuram autentificētam lietotājam; modificēšana — no Pasniedzēja lomas,
 * jo komentāri ir daļa no F8 apstiprināšanas audita pēdas.
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

    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public CourseVersionComment create(@Valid @RequestBody CourseVersionComment input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public CourseVersionComment update(@PathVariable int id, @Valid @RequestBody CourseVersionComment input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
