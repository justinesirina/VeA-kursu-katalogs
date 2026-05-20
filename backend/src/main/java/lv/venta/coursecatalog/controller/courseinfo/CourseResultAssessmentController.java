package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResultAssessment;
import lv.venta.coursecatalog.model.dto.BulkResultAssessmentRequest;
import lv.venta.coursecatalog.service.courseinfo.CourseResultAssessmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/result-assessments")
public class CourseResultAssessmentController {

    @Autowired
    private CourseResultAssessmentService resultAssessmentService;

    /**
     * Iegūst visas sasaistes starp kursa rezultātiem un vērtēšanas komponentēm.
     */
    @GetMapping
    public List<CourseResultAssessment> getAllLinks() {
        return resultAssessmentService.getAllLinks();
    }

    /**
     * Iegūst konkrētu sasaisti pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseResultAssessment> getLinkById(@PathVariable int id) {
        return ResponseEntity.ok(resultAssessmentService.getLinkById(id));
    }

    /**
     * Izveido jaunu sasaistes ierakstu.
     */
    @PostMapping
    public ResponseEntity<CourseResultAssessment> createLink(@Valid @RequestBody CourseResultAssessment link) {
        return ResponseEntity.ok(resultAssessmentService.createLink(link));
    }

    /**
     * Atjauno esošu sasaisti.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseResultAssessment> updateLink(@PathVariable int id,
                                                             @Valid @RequestBody CourseResultAssessment updated) {
        return ResponseEntity.ok(resultAssessmentService.updateLink(id, updated));
    }

    /**
     * Dzēš sasaisti pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLink(@PathVariable int id) {
        resultAssessmentService.deleteLinkById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Masveida upsert visām SKR × komponenšu matricas šūnām.
     */
    @PutMapping("/bulk/{courseId}")
    public ResponseEntity<Void> bulkUpsert(@PathVariable UUID courseId,
                                           @RequestBody BulkResultAssessmentRequest request) {
        resultAssessmentService.bulkUpsert(courseId, request.getEntries());
        return ResponseEntity.ok().build();
    }
}
