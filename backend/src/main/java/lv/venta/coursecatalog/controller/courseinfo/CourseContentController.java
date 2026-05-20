package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import lv.venta.coursecatalog.service.courseinfo.CourseContentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-content")
public class CourseContentController {

    @Autowired
    private CourseContentService contentService;

    @GetMapping
    public List<CourseContent> getAll() {
        return contentService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseContent> getById(@PathVariable int id) {
        return ResponseEntity.ok(contentService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CourseContent> create(@Valid @RequestBody CourseContent content) {
        return ResponseEntity.ok(contentService.create(content));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id,
                                       @Valid @RequestBody CourseContent updated) {
        contentService.update(id, updated);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        contentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
