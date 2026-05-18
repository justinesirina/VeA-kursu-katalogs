package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseAssessmentDistribution;
import lv.venta.coursecatalog.repository.courseinfo.CourseAssessmentDistributionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CourseAssessmentDistributionService {

    @Autowired
    private CourseAssessmentDistributionRepository distributionRepo;

    /**
     * Iegūst visus vērtēšanas sadalījumus.
     */
    public List<CourseAssessmentDistribution> getAllDistributions() {
        return distributionRepo.findAll();
    }

    /**
     * Iegūst vienu sadalījumu pēc ID.
     */
    public CourseAssessmentDistribution getDistributionById(int id) {
        return distributionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts vērtēšanas sadalījums ar id = " + id));
    }

    /**
     * Izveido jaunu sadalījuma ierakstu.
     * Pārbauda, vai kopējais sadalījums konkrētam kursam nepārsniedz 100%.
     */
    @Transactional
    public CourseAssessmentDistribution createDistribution(CourseAssessmentDistribution dist) {
        validatePercentageLimit(dist.getCourseInfo().getId(), dist.getPercentage());
        return distributionRepo.save(dist);
    }

    /**
     * Atjauno esošu sadalījumu.
     */
    @Transactional
    public CourseAssessmentDistribution updateDistribution(int id, CourseAssessmentDistribution updated) {
        CourseAssessmentDistribution existing = getDistributionById(id);
        existing.setComponent(updated.getComponent());
        existing.setPercentage(updated.getPercentage());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return distributionRepo.save(existing);
    }

    /**
     * Dzēš sadalījuma ierakstu pēc ID.
     */
    @Transactional
    public void deleteDistributionById(int id) {
        if (!distributionRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais sadalījums ar id = " + id);
        }
        distributionRepo.deleteById(id);
    }

    /**
     * Validācija: pārliecinās, ka sadalījuma komponentes procentuālā summa nepārsniedz 100%.
     */
    private void validatePercentageLimit(UUID courseInfoId, int newPercentage) {
        List<CourseAssessmentDistribution> existing = distributionRepo.findByCourseInfoIdOrderById(courseInfoId);
        int total = existing.stream().mapToInt(CourseAssessmentDistribution::getPercentage).sum();
        if (total + newPercentage > 100) {
            throw new RuntimeException("Kopējais procentuālais sadalījums pārsniedz 100% (esošs: " + total + "%, pievieno: " + newPercentage + "%)");
        }
    }
}