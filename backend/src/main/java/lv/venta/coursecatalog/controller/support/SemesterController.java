package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.Semester;
import lv.venta.coursecatalog.service.support.SemesterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API kontrolieris, kas nodrošina CRUD funkcionalitāti semestru entītijai.
 */
@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    private final SemesterService service;

    public SemesterController(SemesterService service) {
        this.service = service;
    }

    /**
     * Iegūst visus semestrus.
     */
    @GetMapping
    public List<Semester> getAll() {
        return service.getAll();
    }

    /**
     * Izveido jaunu semestri.
     */
    @PostMapping
    public Semester create(@Valid @RequestBody Semester semester) {
        return service.save(semester);
    }

    /**
     * Atjauno esošu semestri pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Semester> update(@PathVariable int id, @Valid @RequestBody Semester updated) {
        return service.getById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Dzēš semestri pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (service.getById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
