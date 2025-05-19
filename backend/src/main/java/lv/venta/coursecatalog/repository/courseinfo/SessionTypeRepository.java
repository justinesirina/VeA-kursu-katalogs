package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.SessionType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SessionTypeRepository extends JpaRepository<SessionType, Integer> {
}
