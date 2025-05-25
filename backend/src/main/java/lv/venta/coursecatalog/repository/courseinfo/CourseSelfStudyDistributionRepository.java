package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.courseinfo.CourseSelfStudyDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseSelfStudyDistributionRepository extends JpaRepository<CourseSelfStudyDistribution, Integer> {
    List<CourseSelfStudyDistribution> findByCourseInfo(CourseInfo courseInfo);


}
