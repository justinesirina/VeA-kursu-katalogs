package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CoursePrerequisites;
import lv.venta.coursecatalog.repository.courseinfo.CoursePrerequisitesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CoursePrerequisitesService {

    @Autowired
    private CoursePrerequisitesRepository prereqRepo;

    public List<CoursePrerequisites> getAll() {
        return prereqRepo.findAll();
    }

    public CoursePrerequisites getById(int id) {
        return prereqRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts priekšnosacījums ar id = " + id));
    }

    @Transactional
    public CoursePrerequisites create(CoursePrerequisites prereq) {
        return prereqRepo.save(prereq);
    }

    @Transactional
    public CoursePrerequisites update(int id, CoursePrerequisites updated) {
        CoursePrerequisites existing = getById(id);
        existing.setCourseInfo(updated.getCourseInfo());
        existing.setRequiredCourse(updated.getRequiredCourse());
        existing.setType(updated.getType());
        return prereqRepo.save(existing);
    }

    @Transactional
    public void deleteById(int id) {
        if (!prereqRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais priekšnosacījums ar id = " + id);
        }
        prereqRepo.deleteById(id);
    }
}
