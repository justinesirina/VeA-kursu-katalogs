package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.AssessmentComponent;
import lv.venta.coursecatalog.service.courseinfo.AssessmentComponentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-components")
@CrossOrigin(origins = "*")
public class AssessmentComponentController {

    @Autowired
    private AssessmentComponentService componentService;

    /**
     * Iegūst visas vērtēšanas komponentes.
     */
    @GetMapping
    public List<AssessmentComponent> getAllComponents() {
        return componentService.getAllComponents();
    }

    /**
     * Iegūst vienu komponenti pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssessmentComponent> getComponentById(@PathVariable int id) {
        return ResponseEntity.ok(componentService.getComponentById(id));
    }

    /**
     * Izveido jaunu komponenti.
     */
    @PostMapping
    public ResponseEntity<AssessmentComponent> createComponent(@RequestBody AssessmentComponent component) {
        return ResponseEntity.ok(componentService.createComponent(component));
    }

    /**
     * Atjauno komponenti pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AssessmentComponent> updateComponent(@PathVariable int id,
                                                               @RequestBody AssessmentComponent updated) {
        return ResponseEntity.ok(componentService.updateComponent(id, updated));
    }

    /**
     * Dzēš komponenti pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComponent(@PathVariable int id) {
        componentService.deleteComponentById(id);
        return ResponseEntity.noContent().build();
    }
}
