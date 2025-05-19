package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.AssessmentComponent;
import lv.venta.coursecatalog.repository.courseinfo.AssessmentComponentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssessmentComponentService {

    @Autowired
    private AssessmentComponentRepository componentRepo;

    /**
     * Atgriež visus vērtēšanas komponentus.
     */
    public List<AssessmentComponent> getAllComponents() {
        return componentRepo.findAll();
    }

    /**
     * Atgriež konkrētu komponenti pēc ID vai izmet izņēmumu.
     */
    public AssessmentComponent getComponentById(int id) {
        return componentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Vērtēšana komponente nav atrasta ar id = " + id));
    }

    /**
     * Izveido jaunu vērtēšanas komponenti.
     */
    @Transactional
    public AssessmentComponent createComponent(AssessmentComponent component) {
        return componentRepo.save(component);
    }

    /**
     * Atjauno esošu komponenti pēc ID.
     */
    @Transactional
    public AssessmentComponent updateComponent(int id, AssessmentComponent updated) {
        AssessmentComponent existing = getComponentById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        return componentRepo.save(existing);
    }

    /**
     * Dzēš komponenti pēc ID, ja tā eksistē.
     */
    @Transactional
    public void deleteComponentById(int id) {
        if (!componentRepo.existsById(id)) {
            throw new RuntimeException("Dzēšamā komponente nav atrasta ar id = " + id);
        }
        componentRepo.deleteById(id);
    }
}
