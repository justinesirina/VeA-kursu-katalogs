package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Integer> {
}
