package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.literature.LiteratureType;
import lv.venta.coursecatalog.service.courseinfo.LiteratureTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/literature-types")
@CrossOrigin(origins = "*")
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

    @PostMapping
    public ResponseEntity<LiteratureType> create(@RequestBody LiteratureType type) {
        return ResponseEntity.ok(typeService.createType(type));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LiteratureType> update(@PathVariable int id,
                                                 @RequestBody LiteratureType updated) {
        return ResponseEntity.ok(typeService.updateType(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        typeService.deleteTypeById(id);
        return ResponseEntity.noContent().build();
    }
}
