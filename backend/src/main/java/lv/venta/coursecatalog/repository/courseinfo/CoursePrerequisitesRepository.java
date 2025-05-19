package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CoursePrerequisites;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoursePrerequisitesRepository extends JpaRepository<CoursePrerequisites, Integer> {
}
