package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.StudyForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs studiju formu datu piekļuvei.
 */
@Repository
public interface StudyFormRepository extends JpaRepository<StudyForm, Integer> {
}
