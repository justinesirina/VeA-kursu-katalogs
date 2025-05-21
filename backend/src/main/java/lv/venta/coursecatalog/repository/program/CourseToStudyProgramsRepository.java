package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs kursu un studiju programmu sasaistes datu piekļuvei.
 */
@Repository
public interface CourseToStudyProgramsRepository extends JpaRepository<CourseToStudyPrograms, Integer> {
}
