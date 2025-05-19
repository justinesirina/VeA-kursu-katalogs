package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.StudyProgram;
import lv.venta.coursecatalog.repository.program.StudyProgramRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyProgramService {

    @Autowired
    private StudyProgramRepository studyProgramRepository;

    /**
     * Iegūst visas studiju programmas.
     */
    public List<StudyProgram> getAllStudyPrograms() {
        return studyProgramRepository.findAll();
    }

    /**
     * Iegūst studiju programmu pēc tās ID.
     */
    public StudyProgram getStudyProgramById(int id) throws Exception {
        return studyProgramRepository.findById(id)
                .orElseThrow(() -> new Exception("Studiju programma ar ID " + id + " nav atrasta"));
    }

    /**
     * Izveido jaunu studiju programmu.
     */
    public StudyProgram createStudyProgram(StudyProgram input) {
        return studyProgramRepository.save(input);
    }

    /**
     * Atjaunina esošu studiju programmu.
     */
    public StudyProgram updateStudyProgram(int id, StudyProgram input) throws Exception {
        StudyProgram existing = getStudyProgramById(id);

        existing.setName(input.getName());
        existing.setSlug(input.getSlug());
        existing.setFaculty(input.getFaculty());
        existing.setDirector(input.getDirector());
        existing.setGoal(input.getGoal());
        existing.setObjectives(input.getObjectives());
        existing.setActive(input.isActive());
        existing.setArchived(input.isArchived());
        existing.setUpdatedAt(input.getUpdatedAt());

        return studyProgramRepository.save(existing);
    }

    /**
     * Dzēš studiju programmu pēc ID.
     */
    public void deleteStudyProgram(int id) {
        studyProgramRepository.deleteById(id);
    }
}
