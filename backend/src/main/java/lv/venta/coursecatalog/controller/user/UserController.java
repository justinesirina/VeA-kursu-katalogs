package lv.venta.coursecatalog.controller.user;

import lv.venta.coursecatalog.model.dto.CreateUserRequest;
import lv.venta.coursecatalog.model.dto.ResetPasswordRequest;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.service.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * REST API kontrolieris, kas ļauj veikt pilnu CRUD operāciju kopumu ar sistēmas lietotājiem.
 * Lietotāju izveide un paroles atiestatīšana — F13 prasība, tikai SYSTEM_ADMIN.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    /**
     * Atgriež visus sistēmas lietotājus.
     * Pieejams autentificētiem lietotājiem no Pasniedzēja lomas — nepieciešams F1, F2
     * autora un mācībspēka izvēles plūsmā. Studentiem un Viesim pilns lietotāju saraksts
     * nav redzams.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @GetMapping
    public List<User> getAll() {
        return service.getAll();
    }

    /**
     * Izveido jaunu lietotāju ar paroli. Pārbauda paroles politiku.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest req) {
        try {
            User created = service.createWithPassword(req);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Atjauno lietotāju pēc ID (paroli šeit nemaina — atsevišķs endpoint).
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @Valid @RequestBody User updated) {
        return service.getById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setSurname(updated.getSurname());
                    existing.setEmail(updated.getEmail());
                    existing.setRole(updated.getRole());
                    existing.setActive(updated.isActive());
                    existing.setDeletedAt(updated.getDeletedAt());
                    try {
                        return ResponseEntity.ok((Object) service.save(existing));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body((Object) e.getMessage());
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Atiestata lietotāja paroli ar jaunu (admin darbība).
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable int id, @Valid @RequestBody ResetPasswordRequest req) {
        try {
            service.resetPassword(id, req.newPassword());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Dzēš lietotāju pēc ID.
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
