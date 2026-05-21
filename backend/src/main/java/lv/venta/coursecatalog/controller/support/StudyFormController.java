package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.StudyForm;
import lv.venta.coursecatalog.service.support.StudyFormService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina studiju formu API piekļuvi.
 */
@RestController
@RequestMapping("/api/study-forms")
public class StudyFormController {

    @Autowired
    private StudyFormService service;

    @GetMapping
    public List<StudyForm> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public StudyForm create(@Valid @RequestBody StudyForm input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public StudyForm update(@PathVariable int id, @Valid @RequestBody StudyForm input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
