package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarTopicRepository extends JpaRepository<CalendarTopic, Integer> {
}
