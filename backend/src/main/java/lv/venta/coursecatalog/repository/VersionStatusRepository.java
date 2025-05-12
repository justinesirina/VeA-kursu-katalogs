package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.VersionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Datu piekļuves slāņa interfeiss versijas statusiem (piemēram: Apstiprināta, Sagatavošanā).
 */
@Repository
public interface VersionStatusRepository extends JpaRepository<VersionStatus, Integer> {
}
