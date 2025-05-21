package lv.venta.coursecatalog.repository.log;

import lv.venta.coursecatalog.model.log.CourseVersionAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs darbību tipu datu piekļuvei.
 */
@Repository
public interface CourseVersionActionRepository extends JpaRepository<CourseVersionAction, Integer> {
}
