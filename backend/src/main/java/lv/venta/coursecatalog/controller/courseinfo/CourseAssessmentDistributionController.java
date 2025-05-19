package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseAssessmentDistribution;
import lv.venta.coursecatalog.service.courseinfo.CourseAssessmentDistributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-distribution")
@CrossOrigin(origins = "*")
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
    @PostMapping
    public ResponseEntity<CourseAssessmentDistribution> createDistribution(
            @RequestBody CourseAssessmentDistribution distribution) {
        return ResponseEntity.ok(distributionService.createDistribution(distribution));
    }

    /**
     * Atjauno sadalījumu.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseAssessmentDistribution> updateDistribution(@PathVariable int id,
                                                                           @RequestBody CourseAssessmentDistribution updated) {
        return ResponseEntity.ok(distributionService.updateDistribution(id, updated));
    }

    /**
     * Dzēš sadalījumu pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDistribution(@PathVariable int id) {
        distributionService.deleteDistributionById(id);
        return ResponseEntity.noContent().build();
    }
}
