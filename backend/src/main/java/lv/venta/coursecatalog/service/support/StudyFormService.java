package lv.venta.coursecatalog.service.support;

import lv.venta.coursecatalog.model.support.StudyForm;
import lv.venta.coursecatalog.repository.support.StudyFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudyFormService {

    @Autowired
    private StudyFormRepository studyFormRepository;

    public List<StudyForm> getAll() {
        return studyFormRepository.findAll();
    }

    public StudyForm create(StudyForm input) {
        return studyFormRepository.save(input);
    }

    public StudyForm update(int id, StudyForm input) throws Exception {
        StudyForm existing = studyFormRepository.findById(id)
                .orElseThrow(() -> new Exception("Studiju forma nav atrasta pēc ID = " + id));
        existing.setName(input.getName());
        existing.setDescription(input.getDescription());
        return studyFormRepository.save(existing);
    }

    public void delete(int id) {
        studyFormRepository.deleteById(id);
    }
}
