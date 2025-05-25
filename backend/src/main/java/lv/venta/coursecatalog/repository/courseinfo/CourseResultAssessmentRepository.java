package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import lv.venta.coursecatalog.model.courseinfo.CourseResultAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseResultAssessmentRepository extends JpaRepository<CourseResultAssessment, Integer> {

    List<CourseResultAssessment> findByCourseResult(CourseResult courseResult);

}
