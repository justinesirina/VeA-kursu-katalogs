package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Repozitorijs kursa autoru datu piekļuvei. Sasaiste ir versionēta — finder metodes
 * pieņem CourseVersion ID.
 */
@Repository
public interface CourseAuthorRepository extends JpaRepository<CourseAuthor, Integer> {

    List<CourseAuthor> findByCourseVersionId(UUID courseVersionId);

    /**
     * Batch ielāde kursu katalogam: visi autoru ieraksti vairākām versijām vienā vaicājumā.
     */
    List<CourseAuthor> findByCourseVersionIdIn(Collection<UUID> courseVersionIds);
}
