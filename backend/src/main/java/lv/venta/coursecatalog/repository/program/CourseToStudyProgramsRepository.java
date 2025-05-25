package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repozitorijs kursu un studiju programmu sasaistes datu piekļuvei.
 */
@Repository
public interface CourseToStudyProgramsRepository extends JpaRepository<CourseToStudyPrograms, Integer> {
    List<CourseToStudyPrograms> findByCourse(Course course);

    List<CourseToStudyPrograms> findByCourseId(UUID courseId);
}
