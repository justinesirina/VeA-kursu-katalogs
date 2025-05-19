package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.ResultsCategory;
import lv.venta.coursecatalog.service.courseinfo.ResultsCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/results-categories")
@CrossOrigin(origins = "*")
public class ResultsCategoryController {

    @Autowired
    private ResultsCategoryService categoryService;

    @GetMapping
    public List<ResultsCategory> getAll() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultsCategory> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<ResultsCategory> create(@RequestBody ResultsCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResultsCategory> update(@PathVariable UUID id,
                                                  @RequestBody ResultsCategory updated) {
        return ResponseEntity.ok(categoryService.updateCategory(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        categoryService.deleteCategoryById(id);
        return ResponseEntity.noContent().build();
    }
}
