package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.courseinfo.CourseResult;
import lv.venta.coursecatalog.model.program.CourseToProgrammeResults;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseToProgrammeResultsRepository extends JpaRepository<CourseToProgrammeResults, Integer> {

    /**
     * Atrod visus ierakstus, kas saista doto kursa rezultātu (SKR) ar studiju programmas rezultātiem (SPSR).
     */
    List<CourseToProgrammeResults> findByCourseResult(CourseResult courseResult);
}
