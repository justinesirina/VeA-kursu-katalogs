package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.courseinfo.LiteratureSource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LiteratureSourceRepository extends JpaRepository<LiteratureSource, Integer> {

    List<LiteratureSource> findByCourseInfo(CourseInfo courseInfo);

}
