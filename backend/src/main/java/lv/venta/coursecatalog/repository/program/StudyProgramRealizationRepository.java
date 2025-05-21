package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.StudyProgramRealization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs studiju programmu realizāciju datu piekļuvei.
 */
@Repository
public interface StudyProgramRealizationRepository extends JpaRepository<StudyProgramRealization, Integer> {
}
