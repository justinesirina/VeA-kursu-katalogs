package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.SessionType;
import lv.venta.coursecatalog.service.courseinfo.SessionTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/session-types")
public class SessionTypeController {

    @Autowired
    private SessionTypeService service;

    @GetMapping
    public List<SessionType> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionType> getById(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public ResponseEntity<SessionType> create(@Valid @RequestBody SessionType obj) {
        return ResponseEntity.ok(service.create(obj));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public ResponseEntity<SessionType> update(@PathVariable int id, @Valid @RequestBody SessionType obj) {
        return ResponseEntity.ok(service.update(id, obj));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
