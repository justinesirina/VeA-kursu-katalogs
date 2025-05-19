package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.assessment.AssessmentForm;
import lv.venta.coursecatalog.repository.courseinfo.AssessmentFormRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AssessmentFormService {

    @Autowired
    private AssessmentFormRepository formRepo;

    /**
     * Iegūst visus vērtēšanas formu ierakstus no datubāzes.
     */
    public List<AssessmentForm> getAllForms() {
        return formRepo.findAll();
    }

    /**
     * Atrod vienu vērtēšanas formu pēc tās ID.
     * @throws RuntimeException ja forma nav atrasta
     */
    public AssessmentForm getFormById(int id) {
        return formRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta vērtēšanas forma ar id = " + id));
    }

    /**
     * Izveido jaunu vērtēšanas formu.
     */
    @Transactional
    public AssessmentForm createForm(AssessmentForm form) {
        return formRepo.save(form);
    }

    /**
     * Atjauno esošu vērtēšanas formu pēc ID.
     * Ja forma neeksistē, izmet kļūdu.
     */
    @Transactional
    public AssessmentForm updateForm(int id, AssessmentForm updatedForm) {
        AssessmentForm existing = getFormById(id);
        existing.setName(updatedForm.getName());
        existing.setDescription(updatedForm.getDescription());
        return formRepo.save(existing);
    }

    /**
     * Dzēš vērtēšanas formu pēc ID.
     */
    @Transactional
    public void deleteFormById(int id) {
        if (!formRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā forma ar id = " + id);
        }
        formRepo.deleteById(id);
    }
}