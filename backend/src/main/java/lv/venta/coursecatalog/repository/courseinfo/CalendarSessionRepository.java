package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalendarSessionRepository extends JpaRepository<CalendarSession, Integer> {
}
