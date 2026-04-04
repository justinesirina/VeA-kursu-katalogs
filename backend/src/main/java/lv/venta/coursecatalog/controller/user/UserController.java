package lv.venta.coursecatalog.controller.user;

import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.service.user.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API kontrolieris, kas ļauj veikt pilnu CRUD operāciju kopumu ar sistēmas lietotājiem.
 * Lietotājiem var piešķirt lomas, piemēram: docētājs, administrators, studējošais.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    @Autowired
    public UserController(UserService service) {
        this.service = service;
    }

    /**
     * Atgriež visus sistēmas lietotājus.
     */
    @GetMapping
    public List<User> getAll() {
        return service.getAll();
    }

    /**
     * Izveido jaunu lietotāju.
     */
    @PostMapping
    public User create(@Valid @RequestBody User user) {
        return service.save(user);
    }

    /**
     * Atjauno lietotāju pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable int id, @Valid @RequestBody User updated) {
        return service.getById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setSurname(updated.getSurname());
                    existing.setEmail(updated.getEmail());
                    existing.setRole(updated.getRole());
                    existing.setActive(updated.isActive());
                    existing.setDeletedAt(updated.getDeletedAt());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Dzēš lietotāju pēc ID.
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
