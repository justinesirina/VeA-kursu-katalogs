package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.ProgrammeResult;
import lv.venta.coursecatalog.repository.program.ProgrammeResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProgrammeResultService {

    @Autowired
    private ProgrammeResultRepository programmeResultRepository;

    // Metode, lai iegūtu visus programmas rezultātus
    public List<ProgrammeResult> getAllProgrammeResults() {
        return programmeResultRepository.findAll();
    }

    // Metode, lai iegūtu vienu programmas rezultātu pēc ID
    public ProgrammeResult getProgrammeResultById(UUID id) throws Exception {
        return programmeResultRepository.findById(id)
                .orElseThrow(() -> new Exception("Programmas rezultāts ar ID " + id + " nav atrasts"));
    }

    // Metode, lai izveidotu jaunu programmas rezultātu
    public ProgrammeResult createProgrammeResult(ProgrammeResult input) {
        return programmeResultRepository.save(input);
    }

    // Metode, lai atjauninātu esošu programmas rezultātu
    public ProgrammeResult updateProgrammeResult(UUID id, ProgrammeResult input) throws Exception {
        ProgrammeResult existing = getProgrammeResultById(id);

        // Atjauninām tikai svarīgos laukus – citi paliek nemainīti
        existing.setStudyProgram(input.getStudyProgram());
        existing.setCategory(input.getCategory());
        existing.setLanguage(input.getLanguage());
        existing.setLearningOutcome(input.getLearningOutcome());
        existing.setUpdatedAt(input.getUpdatedAt());
        existing.setUpdatedBy(input.getUpdatedBy());

        return programmeResultRepository.save(existing);
    }

    // Metode, lai dzēstu programmas rezultātu pēc ID
    public void deleteProgrammeResult(UUID id) {
        programmeResultRepository.deleteById(id);
    }
}
