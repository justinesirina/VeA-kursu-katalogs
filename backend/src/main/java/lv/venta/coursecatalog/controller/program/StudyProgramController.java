package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.StudyProgram;
import lv.venta.coursecatalog.service.program.StudyProgramService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/study-programs")
public class StudyProgramController {

    @Autowired
    private StudyProgramService studyProgramService;

    /**
     * Iegūst visas studiju programmas.
     */
    @GetMapping
    public List<StudyProgram> getAllStudyPrograms() {
        return studyProgramService.getAllStudyPrograms();
    }

    /**
     * Iegūst studiju programmu pēc ID.
     */
    @GetMapping("/{id}")
    public StudyProgram getStudyProgramById(@PathVariable int id) throws Exception {
        return studyProgramService.getStudyProgramById(id);
    }

    /**
     * Izveido jaunu studiju programmu.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public StudyProgram createStudyProgram(@Valid @RequestBody StudyProgram input) {
        return studyProgramService.createStudyProgram(input);
    }

    /**
     * Atjaunina esošu studiju programmu.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public StudyProgram updateStudyProgram(@PathVariable int id, @Valid @RequestBody StudyProgram input) throws Exception {
        return studyProgramService.updateStudyProgram(id, input);
    }

    /**
     * Dzēš studiju programmu pēc ID.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteStudyProgram(@PathVariable int id) {
        studyProgramService.deleteStudyProgram(id);
    }
}
