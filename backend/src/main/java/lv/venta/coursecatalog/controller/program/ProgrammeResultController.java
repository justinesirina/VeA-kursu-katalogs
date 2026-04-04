package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.ProgrammeResult;
import lv.venta.coursecatalog.service.program.ProgrammeResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/programme-results")
public class ProgrammeResultController {

    @Autowired
    private ProgrammeResultService programmeResultService;

    /**
     * Iegūst visus programmas rezultātus no datubāzes.
     * @return saraksts ar visiem programmas rezultātiem
     */
    @GetMapping
    public List<ProgrammeResult> getAllProgrammeResults() {
        return programmeResultService.getAllProgrammeResults();
    }

    /**
     * Iegūst konkrētu programmas rezultātu pēc tā ID.
     * @param id Programmas rezultāta identifikators
     * @return atrastais programmas rezultāts
     * @throws Exception ja rezultāts nav atrasts
     */
    @GetMapping("/{id}")
    public ProgrammeResult getProgrammeResultById(@PathVariable UUID id) throws Exception {
        return programmeResultService.getProgrammeResultById(id);
    }

    /**
     * Izveido jaunu programmas rezultātu.
     * @param input Jaunā programmas rezultāta dati
     * @return izveidotais objekts
     */
    @PostMapping
    public ProgrammeResult createProgrammeResult(@Valid @RequestBody ProgrammeResult input) {
        return programmeResultService.createProgrammeResult(input);
    }

    /**
     * Atjaunina esošu programmas rezultātu pēc tā ID.
     * @param id Atjaunināmā rezultāta ID
     * @param input Jaunās vērtības
     * @return atjauninātais rezultāts
     * @throws Exception ja rezultāts nav atrasts
     */
    @PutMapping("/{id}")
    public ProgrammeResult updateProgrammeResult(@PathVariable UUID id, @Valid @RequestBody ProgrammeResult input) throws Exception {
        return programmeResultService.updateProgrammeResult(id, input);
    }

    /**
     * Dzēš programmas rezultātu pēc ID.
     * @param id Dzēšamā rezultāta ID
     */
    @DeleteMapping("/{id}")
    public void deleteProgrammeResult(@PathVariable UUID id) {
        programmeResultService.deleteProgrammeResult(id);
    }
}
