package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CourseInfoRepository extends JpaRepository<CourseInfo, UUID> {

    Optional<CourseInfo> findByCourseAndCourseVersion(Course course, CourseVersion version);

}
