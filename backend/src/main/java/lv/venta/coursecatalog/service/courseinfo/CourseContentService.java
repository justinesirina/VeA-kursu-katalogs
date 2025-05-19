package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import lv.venta.coursecatalog.repository.courseinfo.CourseContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseContentService {

    @Autowired
    private CourseContentRepository contentRepo;

    public List<CourseContent> getAll() {
        return contentRepo.findAll();
    }

    public CourseContent getById(int id) {
        return contentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta tēma ar id = " + id));
    }

    @Transactional
    public CourseContent create(CourseContent content) {
        return contentRepo.save(content);
    }

    @Transactional
    public CourseContent update(int id, CourseContent updated) {
        CourseContent existing = getById(id);
        existing.setSequenceNumber(updated.getSequenceNumber());
        existing.setTopicTitle(updated.getTopicTitle());
        existing.setTopicDescription(updated.getTopicDescription());
        existing.setLanguage(updated.getLanguage());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return contentRepo.save(existing);
    }

    @Transactional
    public void deleteById(int id) {
        if (!contentRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā tēma ar id = " + id);
        }
        contentRepo.deleteById(id);
    }
}
