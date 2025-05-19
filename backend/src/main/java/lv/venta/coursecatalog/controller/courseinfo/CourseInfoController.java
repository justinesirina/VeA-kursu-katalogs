package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.service.courseinfo.CourseInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/course-info")
@CrossOrigin(origins = "*")
public class CourseInfoController {

    @Autowired
    private CourseInfoService infoService;

    /**
     * Iegūst visus CourseInfo ierakstus.
     */
    @GetMapping
    public List<CourseInfo> getAll() {
        return infoService.getAll();
    }

    /**
     * Iegūst konkrētu ierakstu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseInfo> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(infoService.getById(id));
    }

    /**
     * Izveido jaunu CourseInfo ierakstu.
     */
    @PostMapping
    public ResponseEntity<CourseInfo> create(@RequestBody CourseInfo courseInfo) {
        return ResponseEntity.ok(infoService.create(courseInfo));
    }

    /**
     * Atjauno CourseInfo pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseInfo> update(@PathVariable UUID id,
                                             @RequestBody CourseInfo updated) {
        return ResponseEntity.ok(infoService.update(id, updated));
    }

    /**
     * Dzēš CourseInfo pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        infoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
