package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repozitorijs kursa autoru datu piekļuvei.
 */
@Repository
public interface CourseAuthorRepository extends JpaRepository<CourseAuthor, Integer> {

    List<CourseAuthor> findByCourse(Course course);
    List<CourseAuthor> findByCourseId(UUID courseId);

}
