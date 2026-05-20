package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.service.support.VersionStatusService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * REST API galapunkti versijas statusu pārvaldībai.
 */
@RestController
@RequestMapping("/api/version-statuses")
public class VersionStatusController {

    private final VersionStatusService service;

    public VersionStatusController(VersionStatusService service) {
        this.service = service;
    }

    /**
     * Iegūst visus pieejamos statusus.
     */
    @GetMapping
    public List<VersionStatus> getAll() {
        return service.getAllStatuses();
    }

    /**
     * Izveido jaunu statusu (piemēram, "Sagatavē").
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public VersionStatus create(@Valid @RequestBody VersionStatus status) {
        return service.saveStatus(status);
    }

    /**
     * Atjauno esošu statusu pēc ID.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<VersionStatus> update(@PathVariable int id, @Valid @RequestBody VersionStatus updatedStatus) {
        return service.getStatusById(id)
                .map(existing -> {
                    existing.setName(updatedStatus.getName());
                    existing.setDescription(updatedStatus.getDescription());
                    return ResponseEntity.ok(service.saveStatus(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Dzēš statusu pēc ID.
     */
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        if (service.getStatusById(id).isPresent()) {
            service.deleteStatus(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
