package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.LiteratureType;
import lv.venta.coursecatalog.service.courseinfo.LiteratureTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/literature-types")
public class LiteratureTypeController {

    @Autowired
    private LiteratureTypeService typeService;

    @GetMapping
    public List<LiteratureType> getAll() {
        return typeService.getAllTypes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiteratureType> getById(@PathVariable int id) {
        return ResponseEntity.ok(typeService.getTypeById(id));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public ResponseEntity<LiteratureType> create(@Valid @RequestBody LiteratureType type) {
        return ResponseEntity.ok(typeService.createType(type));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public ResponseEntity<LiteratureType> update(@PathVariable int id,
                                                 @Valid @RequestBody LiteratureType updated) {
        return ResponseEntity.ok(typeService.updateType(id, updated));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        typeService.deleteTypeById(id);
        return ResponseEntity.noContent().build();
    }
}
