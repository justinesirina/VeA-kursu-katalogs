package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Integer> {
}
