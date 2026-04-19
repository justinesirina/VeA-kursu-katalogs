package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.StudyProgramPart;
import lv.venta.coursecatalog.repository.program.StudyProgramPartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudyProgramPartService {

    @Autowired
    private StudyProgramPartRepository partRepo;

    public List<StudyProgramPart> getAllParts() {
        return partRepo.findAll();
    }

    public StudyProgramPart getPartById(int id) {
        return partRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Studiju programmas daļa nav atrasta ar id = " + id));
    }

    @Transactional
    public StudyProgramPart createPart(StudyProgramPart part) {
        return partRepo.save(part);
    }

    @Transactional
    public StudyProgramPart updatePart(int id, StudyProgramPart updated) {
        StudyProgramPart existing = getPartById(id);
        existing.setName(updated.getName());
        existing.setNameEn(updated.getNameEn());
        existing.setDescription(updated.getDescription());
        return partRepo.save(existing);
    }

    @Transactional
    public void deletePartById(int id) {
        if (!partRepo.existsById(id)) {
            throw new RuntimeException("Dzēšamā studiju programmas daļa nav atrasta ar id = " + id);
        }
        partRepo.deleteById(id);
    }
}
