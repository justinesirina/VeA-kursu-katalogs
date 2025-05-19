package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CoursePrerequisites;
import lv.venta.coursecatalog.service.courseinfo.CoursePrerequisitesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-prerequisites")
@CrossOrigin(origins = "*")
public class CoursePrerequisitesController {

    @Autowired
    private CoursePrerequisitesService prereqService;

    @GetMapping
    public List<CoursePrerequisites> getAll() {
        return prereqService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoursePrerequisites> getById(@PathVariable int id) {
        return ResponseEntity.ok(prereqService.getById(id));
    }

    @PostMapping
    public ResponseEntity<CoursePrerequisites> create(@RequestBody CoursePrerequisites prereq) {
        return ResponseEntity.ok(prereqService.create(prereq));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoursePrerequisites> update(@PathVariable int id,
                                                      @RequestBody CoursePrerequisites updated) {
        return ResponseEntity.ok(prereqService.update(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        prereqService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
