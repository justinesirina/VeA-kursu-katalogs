package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findAllByActiveTrueAndDeletedAtIsNull();

    /**
     * Atgriež soft-delete'tos (arhivētos) kursus.
     * Native query, lai apietu Hibernate {@code @SQLRestriction("deleted_at IS NULL")}.
     */
    @Query(value = "SELECT * FROM courses WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC", nativeQuery = true)
    List<Course> findAllArchived();

    /**
     * Atrod kursu pēc ID, neignorējot soft-delete'tos.
     * Vajadzīgs atjaunošanas plūsmā, kur jāatrod arhivēts ieraksts.
     */
    @Query(value = "SELECT * FROM courses WHERE id = :id", nativeQuery = true)
    Optional<Course> findByIdIncludingArchived(@org.springframework.data.repository.query.Param("id") UUID id);

    /**
     * Atjauno arhivētu kursu: noņem deleted_at un atjauno active=true.
     * Native query, lai apietu @SQLRestriction.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE courses SET deleted_at = NULL, is_active = true WHERE id = :id", nativeQuery = true)
    int restoreById(@org.springframework.data.repository.query.Param("id") UUID id);
}
