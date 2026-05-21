package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.StudyProgramRealization;
import lv.venta.coursecatalog.service.program.StudyProgramRealizationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina studiju programmu realizāciju API piekļuvi.
 */
@RestController
@RequestMapping("/api/study-program-realizations")
public class StudyProgramRealizationController {

    @Autowired
    private StudyProgramRealizationService service;

    @GetMapping
    public List<StudyProgramRealization> getAll() {
        return service.getAll();
    }

    @PreAuthorize("hasRole('ADMIN')")

    @PostMapping
    public StudyProgramRealization create(@Valid @RequestBody StudyProgramRealization input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('ADMIN')")

    @PutMapping("/{id}")
    public StudyProgramRealization update(@PathVariable int id, @Valid @RequestBody StudyProgramRealization input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('ADMIN')")

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
