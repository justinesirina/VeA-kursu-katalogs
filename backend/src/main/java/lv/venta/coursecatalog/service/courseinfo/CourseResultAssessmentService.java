package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.AssessmentComponent;
import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import lv.venta.coursecatalog.model.courseinfo.CourseResultAssessment;
import lv.venta.coursecatalog.model.dto.ResultAssessmentFullDTO;
import lv.venta.coursecatalog.repository.courseinfo.AssessmentComponentRepository;
import lv.venta.coursecatalog.repository.courseinfo.CourseResultAssessmentRepository;
import lv.venta.coursecatalog.repository.courseinfo.CourseResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CourseResultAssessmentService {

    @Autowired
    private CourseResultAssessmentRepository resultAssessmentRepo;

    @Autowired
    private CourseResultRepository courseResultRepo;

    @Autowired
    private AssessmentComponentRepository componentRepo;

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

    /**
     * Masveida upsert: katrai (courseResultId, componentId) parei iestata isUsed.
     * Ja ieraksts eksistē — atjauno, ja ne — izveido. Nepieminētie ieraksti netiek skarti.
     */
    @Transactional
    public void bulkUpsert(UUID courseId, List<ResultAssessmentFullDTO> entries) {
        if (entries == null || entries.isEmpty()) return;

        List<CourseResult> courseResults = courseResultRepo.findByCourseId(courseId);
        Map<UUID, CourseResult> resultById = new HashMap<>();
        for (CourseResult cr : courseResults) resultById.put(cr.getId(), cr);

        Map<Integer, AssessmentComponent> componentCache = new HashMap<>();

        for (ResultAssessmentFullDTO entry : entries) {
            CourseResult cr = resultById.get(entry.getCourseResultId());
            if (cr == null) continue; // SKR nepieder šim kursam — izlaižam

            AssessmentComponent component = componentCache.computeIfAbsent(
                    entry.getComponentId(),
                    cid -> componentRepo.findById(cid).orElse(null)
            );
            if (component == null) continue;

            List<CourseResultAssessment> existing = resultAssessmentRepo.findByCourseResult(cr);
            CourseResultAssessment match = null;
            for (CourseResultAssessment ra : existing) {
                if (ra.getComponent().getId() == entry.getComponentId()) {
                    match = ra;
                    break;
                }
            }

            if (match != null) {
                if (match.isUsed() != entry.isUsed()) {
                    match.setUsed(entry.isUsed());
                    resultAssessmentRepo.save(match);
                }
            } else {
                CourseResultAssessment fresh = new CourseResultAssessment();
                fresh.setCourseResult(cr);
                fresh.setComponent(component);
                fresh.setUsed(entry.isUsed());
                resultAssessmentRepo.save(fresh);
            }
        }
    }
}
