package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.Semester;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Datu piekļuves slāņa interfeiss semestriem (piemēram, "Rudens", "Pavasaris").
 */
@Repository
public interface SemesterRepository extends JpaRepository<Semester, Integer> {
}
