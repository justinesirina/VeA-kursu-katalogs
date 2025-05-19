package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.assessment.AssessmentComponent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentComponentRepository extends JpaRepository<AssessmentComponent, Integer> {
}
