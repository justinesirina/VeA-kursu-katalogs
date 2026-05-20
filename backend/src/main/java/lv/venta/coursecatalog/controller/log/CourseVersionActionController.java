package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.service.log.CourseVersionActionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

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

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public CourseVersionAction create(@Valid @RequestBody CourseVersionAction input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public CourseVersionAction update(@PathVariable int id, @Valid @RequestBody CourseVersionAction input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
