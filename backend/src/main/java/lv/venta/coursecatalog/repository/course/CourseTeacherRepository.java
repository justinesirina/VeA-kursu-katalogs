package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.CourseTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs kursa docētāju datu piekļuvei.
 */
@Repository
public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Integer> {
}
