package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.SelfStudyActivity;
import lv.venta.coursecatalog.service.courseinfo.SelfStudyActivityService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/self-study-activities")
@CrossOrigin(origins = "*")
public class SelfStudyActivityController {

    @Autowired
    private SelfStudyActivityService activityService;

    /**
     * Iegūst visas patstāvīgā darba aktivitātes.
     */
    @GetMapping
    public List<SelfStudyActivity> getAll() {
        return activityService.getAll();
    }

    /**
     * Iegūst vienu aktivitāti pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SelfStudyActivity> getById(@PathVariable int id) {
        return ResponseEntity.ok(activityService.getById(id));
    }

    /**
     * Izveido jaunu aktivitāti.
     */
    @PostMapping
    public ResponseEntity<SelfStudyActivity> create(@Valid @RequestBody SelfStudyActivity obj) {
        return ResponseEntity.ok(activityService.create(obj));
    }

    /**
     * Atjauno aktivitāti.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SelfStudyActivity> update(@PathVariable int id, @Valid @RequestBody SelfStudyActivity obj) {
        return ResponseEntity.ok(activityService.update(id, obj));
    }

    /**
     * Dzēš aktivitāti pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        activityService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
