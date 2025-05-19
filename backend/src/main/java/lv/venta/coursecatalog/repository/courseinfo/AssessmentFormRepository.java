package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.AssessmentForm;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssessmentFormRepository extends JpaRepository<AssessmentForm, Integer> {
}