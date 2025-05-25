package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.courseinfo.CoursePrerequisites;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoursePrerequisitesRepository extends JpaRepository<CoursePrerequisites, Integer> {
    List<CoursePrerequisites> findByCourseInfo(CourseInfo courseInfo);

}
