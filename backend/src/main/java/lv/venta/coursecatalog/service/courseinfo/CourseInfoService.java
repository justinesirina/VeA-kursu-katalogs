package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.repository.courseinfo.CourseInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CourseInfoService {

    @Autowired
    private CourseInfoRepository infoRepo;

    /**
     * Iegūst visus CourseInfo ierakstus.
     */
    public List<CourseInfo> getAll() {
        return infoRepo.findAll();
    }

    /**
     * Iegūst vienu ierakstu pēc tā UUID.
     * @param id CourseInfo UUID
     * @return atrastais ieraksts
     * @throws RuntimeException ja nav atrasts
     */
    public CourseInfo getById(UUID id) {
        return infoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts CourseInfo ar id = " + id));
    }

    /**
     * Izveido jaunu CourseInfo ierakstu.
     */
    @Transactional
    public CourseInfo create(CourseInfo courseInfo) {
        return infoRepo.save(courseInfo);
    }

    /**
     * Atjauno esošu CourseInfo ierakstu pēc ID.
     */
    @Transactional
    public CourseInfo update(UUID id, CourseInfo updated) {
        CourseInfo existing = getById(id);
        existing.setAcademicHoursTotal(updated.getAcademicHoursTotal());
        existing.setLectureHours(updated.getLectureHours());
        existing.setPractClassesHours(updated.getPractClassesHours());
        existing.setIndependentWorkHours(updated.getIndependentWorkHours());
        existing.setPrerequisitesDescription(updated.getPrerequisitesDescription());
        existing.setGoal(updated.getGoal());
        existing.setAnnotation(updated.getAnnotation());
        existing.setAssessmentForm(updated.getAssessmentForm());
        existing.setLanguage(updated.getLanguage());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return infoRepo.save(existing);
    }

    /**
     * Dzēš CourseInfo ierakstu pēc ID.
     */
    @Transactional
    public void delete(UUID id) {
        if (!infoRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais CourseInfo ar id = " + id);
        }
        infoRepo.deleteById(id);
    }
}
