package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.ResultsCategory;
import lv.venta.coursecatalog.service.courseinfo.ResultsCategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/results-categories")
public class ResultsCategoryController {

    @Autowired
    private ResultsCategoryService categoryService;

    @GetMapping
    public List<ResultsCategory> getAll() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResultsCategory> getById(@PathVariable int id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public ResponseEntity<ResultsCategory> create(@Valid @RequestBody ResultsCategory category) {
        return ResponseEntity.ok(categoryService.createCategory(category));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public ResponseEntity<ResultsCategory> update(@PathVariable int id,
                                                  @Valid @RequestBody ResultsCategory updated) {
        return ResponseEntity.ok(categoryService.updateCategory(id, updated));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        categoryService.deleteCategoryById(id);
        return ResponseEntity.noContent().build();
    }
}
