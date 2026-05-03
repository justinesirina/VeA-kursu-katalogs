package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.CourseTeacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repozitorijs kursa docētāju datu piekļuvei. Sasaiste ir versionēta — finder metodes
 * pieņem CourseVersion ID.
 */
@Repository
public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Integer> {

    List<CourseTeacher> findByCourseVersionId(UUID courseVersionId);
}
