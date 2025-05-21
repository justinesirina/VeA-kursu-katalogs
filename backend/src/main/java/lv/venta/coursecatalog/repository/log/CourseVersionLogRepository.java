package lv.venta.coursecatalog.repository.log;

import lv.venta.coursecatalog.model.log.CourseVersionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs kursa versiju žurnāla ierakstu datu piekļuvei.
 */
@Repository
public interface CourseVersionLogRepository extends JpaRepository<CourseVersionLog, Integer> {
}
