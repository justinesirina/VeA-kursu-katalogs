package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import lv.venta.coursecatalog.repository.courseinfo.CourseResultAssessmentRepository;
import lv.venta.coursecatalog.repository.courseinfo.CourseResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CourseResultService {

    @Autowired
    private CourseResultRepository resultRepo;

    @Autowired
    private CourseResultAssessmentRepository resultAssessmentRepo;

    /**
     * Iegūst visus kursa rezultātus.
     */
    public List<CourseResult> getAllResults() {
        return resultRepo.findAll();
    }

    /**
     * Iegūst vienu kursa rezultātu pēc tā ID.
     */
    public CourseResult getResultById(UUID id) {
        return resultRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts kursa rezultāts ar id = " + id));
    }

    /**
     * Iegūst visus rezultātus pēc kursa ID.
     */
    public List<CourseResult> getResultsByCourseId(UUID courseId) {
        return resultRepo.findByCourseId(courseId);
    }

    /**
     * Izveido jaunu kursa rezultātu.
     */
    @Transactional
    public CourseResult createResult(CourseResult result) {
        return resultRepo.save(result);
    }

    /**
     * Atjauno esošu rezultātu pēc ID.
     */
    @Transactional
    public CourseResult updateResult(UUID id, CourseResult updated) {
        CourseResult existing = getResultById(id);
        existing.setCategory(updated.getCategory());
        existing.setLanguage(updated.getLanguage());
        existing.setLearningOutcome(updated.getLearningOutcome());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return resultRepo.save(existing);
    }

    /**
     * Dzēš kursa rezultātu pēc ID.
     */
    @Transactional
    public void deleteResultById(UUID id) {
        CourseResult result = getResultById(id);
        resultAssessmentRepo.deleteAll(resultAssessmentRepo.findByCourseResult(result));
        resultRepo.delete(result);
    }
}
