package lv.venta.coursecatalog.service.support;

import lv.venta.coursecatalog.model.support.StudyLevel;
import lv.venta.coursecatalog.repository.support.StudyLevelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serviss studiju līmeņu datu apstrādei.
 */
@Service
public class StudyLevelService {

    @Autowired
    private StudyLevelRepository studyLevelRepository;

    /**
     * Atgriež visus studiju līmeņus.
     */
    public List<StudyLevel> getAll() {
        return studyLevelRepository.findAll();
    }

    /**
     * Izveido jaunu studiju līmeni.
     */
    public StudyLevel create(StudyLevel input) {
        return studyLevelRepository.save(input);
    }

    /**
     * Atjaunina studiju līmeni pēc ID.
     */
    public StudyLevel update(int id, StudyLevel input) throws Exception {
        StudyLevel existing = studyLevelRepository.findById(id)
                .orElseThrow(() -> new Exception("Studiju līmenis nav atrasts pēc ID = " + id));
        existing.setName(input.getName());
        existing.setDescription(input.getDescription());
        return studyLevelRepository.save(existing);
    }

    /**
     * Izdzēš studiju līmeni pēc ID.
     */
    public void delete(int id) {
        studyLevelRepository.deleteById(id);
    }
}
