package lv.venta.coursecatalog.controller;

import lv.venta.coursecatalog.model.UserRole;
import lv.venta.coursecatalog.service.UserRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API kontrolieris lietotāju lomu pārvaldībai (pilns CRUD).
 */
@RestController
@RequestMapping("/api/user-roles")
public class UserRoleController {

    private final UserRoleService service;

    @Autowired
    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserRole> getAll() {
        return service.getAll();
    }

    @PostMapping
    public UserRole create(@RequestBody UserRole role) {
        return service.save(role);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRole> update(@PathVariable int id, @RequestBody UserRole updated) {
        return service.getById(id)
                .map(existing -> {
                    existing.setRoleName(updated.getRoleName());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (service.getById(id).isPresent()) {
            service.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
