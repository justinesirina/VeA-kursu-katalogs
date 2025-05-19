package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResultAssessment;
import lv.venta.coursecatalog.repository.courseinfo.CourseResultAssessmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseResultAssessmentService {

    @Autowired
    private CourseResultAssessmentRepository resultAssessmentRepo;

    /**
     * Iegūst visus vērtēšanas sasaistes ierakstus.
     */
    public List<CourseResultAssessment> getAllLinks() {
        return resultAssessmentRepo.findAll();
    }

    /**
     * Iegūst vienu sasaistes ierakstu pēc ID.
     */
    public CourseResultAssessment getLinkById(int id) {
        return resultAssessmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts sasaistes ieraksts ar id = " + id));
    }

    /**
     * Izveido jaunu sasaisti starp kursa rezultātu un vērtēšanas komponenti.
     */
    @Transactional
    public CourseResultAssessment createLink(CourseResultAssessment link) {
        return resultAssessmentRepo.save(link);
    }

    /**
     * Atjauno esošu sasaistes ierakstu.
     */
    @Transactional
    public CourseResultAssessment updateLink(int id, CourseResultAssessment updated) {
        CourseResultAssessment existing = getLinkById(id);
        existing.setComponent(updated.getComponent());
        existing.setCourseResult(updated.getCourseResult());
        existing.setUsed(updated.isUsed());
        return resultAssessmentRepo.save(existing);
    }

    /**
     * Dzēš sasaisti pēc ID.
     */
    @Transactional
    public void deleteLinkById(int id) {
        if (!resultAssessmentRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā sasaiste ar id = " + id);
        }
        resultAssessmentRepo.deleteById(id);
    }
}
