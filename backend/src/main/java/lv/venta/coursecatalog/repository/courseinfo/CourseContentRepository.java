package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseContentRepository extends JpaRepository<CourseContent, Integer> {
}
