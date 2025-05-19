package lv.venta.coursecatalog.repository.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.ResultsCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ResultsCategoryRepository extends JpaRepository<ResultsCategory, UUID> {
}
