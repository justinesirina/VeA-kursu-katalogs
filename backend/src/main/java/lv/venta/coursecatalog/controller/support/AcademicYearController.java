package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.AcademicYear;
import lv.venta.coursecatalog.service.support.AcademicYearService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * REST API kontrolieris, kas nodrošina pilnu CRUD funkcionalitāti akadēmiskajiem gadiem.
 */
@RestController
@RequestMapping("/api/academic-years")
public class AcademicYearController {

    private final AcademicYearService service;

    public AcademicYearController(AcademicYearService service) {
        this.service = service;
    }

    /**
     * Iegūst visu akadēmisko gadu sarakstu.
     */
    @GetMapping
    public List<AcademicYear> getAll() {
        return service.getAll();
    }

    /**
     * Izveido jaunu akadēmisko gadu.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public AcademicYear create(@Valid @RequestBody AcademicYear year) {
        return service.save(year);
    }

    /**
     * Atjauno esošu akadēmisko gadu pēc ID.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<AcademicYear> update(@PathVariable int id, @Valid @RequestBody AcademicYear updated) {
        return service.getById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setStartDate(updated.getStartDate());
                    existing.setEndDate(updated.getEndDate());
                    existing.setActive(updated.isActive());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Dzēš akadēmisko gadu pēc ID.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (service.getById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}