package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs kursa autoru datu piekļuvei.
 */
@Repository
public interface CourseAuthorRepository extends JpaRepository<CourseAuthor, Integer> {
}
