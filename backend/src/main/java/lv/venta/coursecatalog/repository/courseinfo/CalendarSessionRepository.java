package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarSession;
import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CalendarSessionRepository extends JpaRepository<CalendarSession, Integer> {

    List<CalendarSession> findByTopic(CalendarTopic topic);

}
