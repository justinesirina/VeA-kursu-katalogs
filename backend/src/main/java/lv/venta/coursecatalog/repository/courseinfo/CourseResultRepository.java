package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseResultRepository extends JpaRepository<CourseResult, UUID> {
    // Noder, lai iegūtu visus rezultātus konkrētam kursam
    List<CourseResult> findByCourseId(UUID courseId);
}
