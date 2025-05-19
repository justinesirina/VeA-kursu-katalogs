package lv.venta.coursecatalog.repository.support;

import lv.venta.coursecatalog.model.support.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Integer> {
    // Var pievienot meklēšanu pēc nosaukuma nākotnē, ja nepieciešams
}
