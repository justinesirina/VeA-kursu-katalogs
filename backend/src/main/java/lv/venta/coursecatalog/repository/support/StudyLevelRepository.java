package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.StudyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs studiju līmeņu datu piekļuvei.
 */
@Repository
public interface StudyLevelRepository extends JpaRepository<StudyLevel, Integer> {
}
