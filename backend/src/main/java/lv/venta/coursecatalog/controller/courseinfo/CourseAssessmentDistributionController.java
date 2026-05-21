package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseAssessmentDistribution;
import lv.venta.coursecatalog.service.courseinfo.CourseAssessmentDistributionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-distribution")
public class CourseAssessmentDistributionController {

    @Autowired
    private CourseAssessmentDistributionService distributionService;

    /**
     * Iegūst visus vērtēšanas sadalījuma ierakstus.
     */
    @GetMapping
    public List<CourseAssessmentDistribution> getAllDistributions() {
        return distributionService.getAllDistributions();
    }

    /**
     * Iegūst konkrētu sadalījumu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseAssessmentDistribution> getDistributionById(@PathVariable int id) {
        return ResponseEntity.ok(distributionService.getDistributionById(id));
    }

    /**
     * Izveido jaunu vērtēšanas sadalījumu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<CourseAssessmentDistribution> createDistribution(
            @Valid @RequestBody CourseAssessmentDistribution distribution) {
        return ResponseEntity.ok(distributionService.createDistribution(distribution));
    }

    /**
     * Atjauno sadalījumu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateDistribution(@PathVariable int id,
                                                   @Valid @RequestBody CourseAssessmentDistribution updated) {
        distributionService.updateDistribution(id, updated);
        return ResponseEntity.noContent().build();
    }

    /**
     * Dzēš sadalījumu pēc ID.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDistribution(@PathVariable int id) {
        distributionService.deleteDistributionById(id);
        return ResponseEntity.noContent().build();
    }
}
