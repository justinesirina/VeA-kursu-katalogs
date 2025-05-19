package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.assessment.CourseAssessmentDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseAssessmentDistributionRepository extends JpaRepository<CourseAssessmentDistribution, Integer> {
    // Šī metode vēlāk noderēs, lai iegūtu visus sadalījumus konkrētam kursam
    List<CourseAssessmentDistribution> findByCourseInfoIdOrderById(UUID courseInfoId);
}
