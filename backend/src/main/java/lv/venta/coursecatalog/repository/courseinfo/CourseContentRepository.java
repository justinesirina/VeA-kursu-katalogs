package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseContent;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseContentRepository extends JpaRepository<CourseContent, Integer> {
    List<CourseContent> findByCourseInfoOrderBySequenceNumberAsc(CourseInfo courseInfo);

}
