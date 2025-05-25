package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarTopicRepository extends JpaRepository<CalendarTopic, Integer> {
    List<CalendarTopic> findByCourseInfo(CourseInfo courseInfo);

}
