package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import lv.venta.coursecatalog.service.courseinfo.CourseContentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-content")
@CrossOrigin(origins = "*")
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
    public ResponseEntity<CourseContent> create(@RequestBody CourseContent content) {
        return ResponseEntity.ok(contentService.create(content));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseContent> update(@PathVariable int id,
                                                @RequestBody CourseContent updated) {
        return ResponseEntity.ok(contentService.update(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        contentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
