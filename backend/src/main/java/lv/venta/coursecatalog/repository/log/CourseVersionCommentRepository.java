package lv.venta.coursecatalog.repository.log;

import lv.venta.coursecatalog.model.log.CourseVersionComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repozitorijs kursa versiju komentāru datu piekļuvei.
 */
@Repository
public interface CourseVersionCommentRepository extends JpaRepository<CourseVersionComment, Integer> {
}
