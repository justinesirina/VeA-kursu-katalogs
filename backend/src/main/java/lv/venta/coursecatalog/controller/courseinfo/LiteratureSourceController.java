package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.LiteratureSource;
import lv.venta.coursecatalog.service.courseinfo.LiteratureSourceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/literature-sources")
public class LiteratureSourceController {

    @Autowired
    private LiteratureSourceService sourceService;

    @GetMapping
    public List<LiteratureSource> getAll() {
        return sourceService.getAllSources();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiteratureSource> getById(@PathVariable int id) {
        return ResponseEntity.ok(sourceService.getSourceById(id));
    }

    @PostMapping
    public ResponseEntity<LiteratureSource> create(@Valid @RequestBody LiteratureSource source) {
        return ResponseEntity.ok(sourceService.createSource(source));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id,
                                       @Valid @RequestBody LiteratureSource updated) {
        sourceService.updateSource(id, updated);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        sourceService.deleteSourceById(id);
        return ResponseEntity.noContent().build();
    }
}
