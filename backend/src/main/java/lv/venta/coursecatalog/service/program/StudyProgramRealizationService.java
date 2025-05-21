package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.StudyProgramRealization;
import lv.venta.coursecatalog.repository.program.StudyProgramRealizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviss studiju programmu realizāciju apstrādei.
 */
@Service
public class StudyProgramRealizationService {

    @Autowired
    private StudyProgramRealizationRepository repository;

    public List<StudyProgramRealization> getAll() {
        return repository.findAll();
    }

    public StudyProgramRealization create(StudyProgramRealization input) {
        return repository.save(input);
    }

    public StudyProgramRealization update(int id, StudyProgramRealization input) throws Exception {
        StudyProgramRealization existing = repository.findById(id)
                .orElseThrow(() -> new Exception("Realizācija nav atrasta pēc ID = " + id));
        existing.setProgram(input.getProgram());
        existing.setLanguage(input.getLanguage());
        existing.setStudyForm(input.getStudyForm());
        existing.setLevel(input.getLevel());
        existing.setCredits(input.getCredits());
        existing.setDurationYears(input.getDurationYears());
        existing.setDegree(input.getDegree());
        existing.setQualification(input.getQualification());
        existing.setActive(input.isActive());
        return repository.save(existing);
    }

    public void delete(int id) {
        repository.deleteById(id);
    }
}
