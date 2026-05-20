package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseSelfStudyDistribution;
import lv.venta.coursecatalog.service.courseinfo.CourseSelfStudyDistributionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/self-study-distribution")
public class CourseSelfStudyDistributionController {

    @Autowired
    private CourseSelfStudyDistributionService distService;

    /**
     * Iegūst visus sadalījuma ierakstus.
     */
    @GetMapping
    public List<CourseSelfStudyDistribution> getAll() {
        return distService.getAll();
    }

    /**
     * Iegūst konkrētu ierakstu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseSelfStudyDistribution> getById(@PathVariable int id) {
        return ResponseEntity.ok(distService.getById(id));
    }

    /**
     * Izveido jaunu sadalījumu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PostMapping
    public ResponseEntity<CourseSelfStudyDistribution> create(@Valid @RequestBody CourseSelfStudyDistribution obj) {
        return ResponseEntity.ok(distService.create(obj));
    }

    /**
     * Atjauno esošu sadalījumu.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id,
                                       @Valid @RequestBody CourseSelfStudyDistribution obj) {
        distService.update(id, obj);
        return ResponseEntity.noContent().build();
    }

    /**
     * Dzēš ierakstu pēc ID.
     */
    @PreAuthorize("hasRole('TEACHER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        distService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
