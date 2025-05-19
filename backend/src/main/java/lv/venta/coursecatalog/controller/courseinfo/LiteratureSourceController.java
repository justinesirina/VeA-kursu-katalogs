package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.LiteratureSource;
import lv.venta.coursecatalog.service.courseinfo.LiteratureSourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/literature-sources")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<LiteratureSource> create(@RequestBody LiteratureSource source) {
        return ResponseEntity.ok(sourceService.createSource(source));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LiteratureSource> update(@PathVariable int id,
                                                   @RequestBody LiteratureSource updated) {
        return ResponseEntity.ok(sourceService.updateSource(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        sourceService.deleteSourceById(id);
        return ResponseEntity.noContent().build();
    }
}
