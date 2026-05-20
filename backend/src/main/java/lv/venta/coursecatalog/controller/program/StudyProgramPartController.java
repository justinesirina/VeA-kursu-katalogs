package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.StudyProgramPart;
import lv.venta.coursecatalog.service.program.StudyProgramPartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/study-program-parts")
public class StudyProgramPartController {

    @Autowired
    private StudyProgramPartService partService;

    @GetMapping
    public List<StudyProgramPart> getAllParts() {
        return partService.getAllParts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyProgramPart> getPartById(@PathVariable int id) {
        return ResponseEntity.ok(partService.getPartById(id));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PostMapping
    public ResponseEntity<StudyProgramPart> createPart(@Valid @RequestBody StudyProgramPart part) {
        return ResponseEntity.ok(partService.createPart(part));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @PutMapping("/{id}")
    public ResponseEntity<StudyProgramPart> updatePart(@PathVariable int id,
                                                      @Valid @RequestBody StudyProgramPart updated) {
        return ResponseEntity.ok(partService.updatePart(id, updated));
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePart(@PathVariable int id) {
        partService.deletePartById(id);
        return ResponseEntity.noContent().build();
    }
}
