package lv.venta.coursecatalog.repository.program;

import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Repozitorijs kursa versiju un studiju programmu sasaistes datu piekļuvei.
 * Sasaiste ir versionēta — katra CourseVersion var saturēt savu programmu sarakstu.
 */
@Repository
public interface CourseToStudyProgramsRepository extends JpaRepository<CourseToStudyPrograms, Integer> {

    List<CourseToStudyPrograms> findByCourseVersionId(UUID courseVersionId);

    /**
     * Batch ielāde F5 katalogam: visi programmu sasaistes ieraksti vairākām versijām vienā vaicājumā.
     */
    List<CourseToStudyPrograms> findByCourseVersionIdIn(Collection<UUID> courseVersionIds);
}
