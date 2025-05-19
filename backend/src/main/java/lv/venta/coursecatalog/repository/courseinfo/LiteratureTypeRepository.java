package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.literature.LiteratureType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiteratureTypeRepository extends JpaRepository<LiteratureType, Integer> {
}
