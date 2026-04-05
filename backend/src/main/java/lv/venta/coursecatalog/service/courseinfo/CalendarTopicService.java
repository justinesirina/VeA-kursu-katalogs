package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.repository.courseinfo.CalendarTopicRepository;
import lv.venta.coursecatalog.repository.courseinfo.CourseContentRepository;
import lv.venta.coursecatalog.repository.courseinfo.CourseInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CalendarTopicService {

    @Autowired
    private CalendarTopicRepository topicRepo;

    @Autowired
    private CourseInfoRepository courseInfoRepo;

    @Autowired
    private CourseContentRepository courseContentRepo;

    public List<CalendarTopic> getAll() {
        return topicRepo.findAll();
    }

    public CalendarTopic getById(int id) {
        return topicRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta kalendāra tēma ar id = " + id));
    }

    @Transactional
    public CalendarTopic create(CalendarTopic topic) {
        UUID courseInfoId = topic.getCourseInfo().getId();
        topic.setCourseInfo(courseInfoRepo.getReferenceById(courseInfoId));
        int courseContentId = topic.getCourseContent().getId();
        topic.setCourseContent(courseContentRepo.findById(courseContentId)
                .orElseThrow(() -> new RuntimeException("CourseContent nav atrasts: " + courseContentId)));
        return topicRepo.save(topic);
    }

    @Transactional
    public CalendarTopic update(int id, CalendarTopic updated) {
        CalendarTopic existing = getById(id);
        existing.setCourseInfo(updated.getCourseInfo());
        existing.setCourseContent(updated.getCourseContent());
        existing.setNote(updated.getNote());
        existing.setLanguage(updated.getLanguage());
        existing.setSequenceNumber(updated.getSequenceNumber());
        return topicRepo.save(existing);
    }

    @Transactional
    public void delete(int id) {
        if (!topicRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasta dzēšamā tēma ar id = " + id);
        }
        topicRepo.deleteById(id);
    }
}
