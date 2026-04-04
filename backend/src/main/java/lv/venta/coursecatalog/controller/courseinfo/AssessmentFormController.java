package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.AssessmentForm;
import lv.venta.coursecatalog.service.courseinfo.AssessmentFormService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessment-forms")
@CrossOrigin(origins = "*") // vajadzības gadījumā konfigurē konkrētas izcelsmes vietnes
public class AssessmentFormController {

    @Autowired
    private AssessmentFormService formService;

    /**
     * Iegūst visas vērtēšanas formas.
     */
    @GetMapping
    public List<AssessmentForm> getAllForms() {
        return formService.getAllForms();
    }

    /**
     * Iegūst konkrētu vērtēšanas formu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AssessmentForm> getFormById(@PathVariable int id) {
        return ResponseEntity.ok(formService.getFormById(id));
    }

    /**
     * Izveido jaunu vērtēšanas formu.
     */
    @PostMapping
    public ResponseEntity<AssessmentForm> createForm(@Valid @RequestBody AssessmentForm form) {
        return ResponseEntity.ok(formService.createForm(form));
    }

    /**
     * Atjauno esošu vērtēšanas formu pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AssessmentForm> updateForm(@PathVariable int id, @Valid @RequestBody AssessmentForm updated) {
        return ResponseEntity.ok(formService.updateForm(id, updated));
    }

    /**
     * Dzēš vērtēšanas formu pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable int id) {
        formService.deleteFormById(id);
        return ResponseEntity.noContent().build();
    }
}
