package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import lv.venta.coursecatalog.repository.courseinfo.CalendarTopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CalendarTopicService {

    @Autowired
    private CalendarTopicRepository topicRepo;

    public List<CalendarTopic> getAll() {
        return topicRepo.findAll();
    }

    public CalendarTopic getById(int id) {
        return topicRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasta kalendāra tēma ar id = " + id));
    }

    @Transactional
    public CalendarTopic create(CalendarTopic topic) {
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
