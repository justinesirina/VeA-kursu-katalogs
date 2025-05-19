package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.LiteratureSource;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LiteratureSourceRepository extends JpaRepository<LiteratureSource, Integer> {
    // Nākotnē varēs izmantot meklēšanai pēc courseInfoId
}
