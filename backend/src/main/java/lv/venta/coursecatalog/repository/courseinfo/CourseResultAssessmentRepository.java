package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.assessment.CourseResultAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseResultAssessmentRepository extends JpaRepository<CourseResultAssessment, Integer> {
    // Šobrīd nav nepieciešami papildu metožu definējumi – bet būs noderīgi vēlāk, piemēram, filtrēšanai
}
