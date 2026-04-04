package lv.venta.coursecatalog.controller.user;

import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.service.user.UserRoleService;
import jakarta.validation.Valid;
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

    public UserRoleController(UserRoleService service) {
        this.service = service;
    }

    @GetMapping
    public List<UserRole> getAll() {
        return service.getAll();
    }

    @PostMapping
    public UserRole create(@Valid @RequestBody UserRole role) {
        return service.save(role);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserRole> update(@PathVariable int id, @Valid @RequestBody UserRole updated) {
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
