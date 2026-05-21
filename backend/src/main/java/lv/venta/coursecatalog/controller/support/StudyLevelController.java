package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.StudyLevel;
import lv.venta.coursecatalog.service.support.StudyLevelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina studiju līmeņu API piekļuvi.
 */
@RestController
@RequestMapping("/api/study-levels")
public class StudyLevelController {

    @Autowired
    private StudyLevelService service;

    @GetMapping
    public List<StudyLevel> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public StudyLevel create(@Valid @RequestBody StudyLevel input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public StudyLevel update(@PathVariable int id, @Valid @RequestBody StudyLevel input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
