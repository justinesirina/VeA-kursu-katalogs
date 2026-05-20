package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import lv.venta.coursecatalog.service.courseinfo.CourseResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/course-results")
public class CourseResultController {

    @Autowired
    private CourseResultService resultService;

    /**
     * Iegūst visus kursa rezultātus.
     */
    @GetMapping
    public List<CourseResult> getAllResults() {
        return resultService.getAllResults();
    }

    /**
     * Iegūst rezultātu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseResult> getResultById(@PathVariable UUID id) {
        return ResponseEntity.ok(resultService.getResultById(id));
    }

    /**
     * Iegūst visus rezultātus pēc kursa ID.
     */
    @GetMapping("/by-course/{courseId}")
    public List<CourseResult> getResultsByCourseId(@PathVariable UUID courseId) {
        return resultService.getResultsByCourseId(courseId);
    }

    /**
     * Izveido jaunu kursa rezultātu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<CourseResult> createResult(@Valid @RequestBody CourseResult result) {
        return ResponseEntity.ok(resultService.createResult(result));
    }

    /**
     * Atjauno kursa rezultātu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<CourseResult> updateResult(@PathVariable UUID id, @Valid @RequestBody CourseResult updated) {
        return ResponseEntity.ok(resultService.updateResult(id, updated));
    }

    /**
     * Dzēš kursa rezultātu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResult(@PathVariable UUID id) {
        resultService.deleteResultById(id);
        return ResponseEntity.noContent().build();
    }
}
