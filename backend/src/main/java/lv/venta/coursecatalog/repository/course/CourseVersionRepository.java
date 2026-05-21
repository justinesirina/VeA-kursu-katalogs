package lv.venta.coursecatalog.repository.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Datu piekļuves slāņa interfeiss, kas ļauj veikt darbības ar CourseVersion entītiju.
 * Izmantojot JpaRepository, iegūstam gatavas metodes, piemēram: save(), findById(), findAll(), deleteById() u.c.
 */
@Repository
public interface CourseVersionRepository extends JpaRepository<CourseVersion, UUID> {

    /**
     * Atrod visas versijas, kas saistītas ar konkrēto kursu.
     * Noder, ja vēlamies izgūt visas versijas pēc kursa ID.
     */
    @Query("SELECT v FROM CourseVersion v WHERE v.course.id = :courseId")
    List<CourseVersion> findByCourseId(@Param("courseId") UUID courseId);

    /**
     * Atrod tikai tās versijas, kas nav dzēstas (soft delete pieeja).
     */
    List<CourseVersion> findByDeletedAtIsNull();

    /**
     * Atrod visas versijas, kas aktīvas (piemēram, lai lietotājam rādītu tikai aktuālo versiju).
     */
    List<CourseVersion> findByIsActiveTrue();

    /**
     * Atrod aktīvās, ne-arhivētās versijas konkrētam kursam.
     * Tiek izmantots F8 plūsmā, lai apstiprināšanas brīdī deaktivētu iepriekšējo aktīvo versiju.
     */
    List<CourseVersion> findByCourseIdAndIsActiveTrueAndDeletedAtIsNull(UUID courseId);

    Optional<CourseVersion> findTopByCourseAndIsActiveTrueOrderByVersionNumberDesc(Course course);

    /**
     * Atrod pēdējo aktīvo versiju konkrētā statusā (piem., "Apstiprināts").
     * Izmanto publiskajā kursa detaļu skatā (F3), lai studentiem un viesiem rādītu
     * tikai apstiprinātās versijas, nevis nejauši aktīvu Melnrakstu.
     */
    Optional<CourseVersion> findTopByCourseAndIsActiveTrueAndStatus_NameOrderByVersionNumberDesc(
            Course course, String statusName);

    /**
     * Atgriež augstāko versionNumber konkrētam kursam (jaunas versijas izveidei).
     * Atgriež null, ja kursam vēl nav versiju.
     */
    @Query("SELECT MAX(v.versionNumber) FROM CourseVersion v WHERE v.course.id = :courseId")
    Integer findMaxVersionNumberByCourseId(@Param("courseId") UUID courseId);

    /**
     * Atgriež soft-delete'tās (arhivētās) versijas.
     * Native query, lai apietu Hibernate {@code @SQLRestriction("deleted_at IS NULL")}.
     */
    @Query(value = "SELECT * FROM course_versions WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC", nativeQuery = true)
    List<CourseVersion> findAllArchived();

    /**
     * Atrod versiju pēc ID, neignorējot soft-delete'tās.
     * Vajadzīgs atjaunošanas plūsmā, kur jāatrod arhivēta versija.
     */
    @Query(value = "SELECT * FROM course_versions WHERE id = :id", nativeQuery = true)
    Optional<CourseVersion> findByIdIncludingArchived(@Param("id") UUID id);

    /**
     * Soft-delete versija: uzstāda deleted_at kārtējo laiku, izmantojot native UPDATE,
     * lai apietu @SQLRestriction.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE course_versions SET deleted_at = CURRENT_TIMESTAMP, is_active = false WHERE id = :id", nativeQuery = true)
    int softDeleteById(@Param("id") UUID id);

    /**
     * Atjauno arhivētu versiju: noņem deleted_at.
     */
    @org.springframework.data.jpa.repository.Modifying
    @Query(value = "UPDATE course_versions SET deleted_at = NULL WHERE id = :id", nativeQuery = true)
    int restoreById(@Param("id") UUID id);

    /**
     * Batch palīgs F5 katalogam: vienā vaicājumā ielādē aktīvās apstiprinātās
     * versijas dotajiem kursu ID. Izmanto, lai izvairītos no N+1 pie kataloga
     * lapas renderēšanas (publiskais režīms).
     */
    @Query("SELECT v FROM CourseVersion v "
            + "WHERE v.course.id IN :courseIds "
            + "AND v.isActive = true "
            + "AND v.status.name = :statusName")
    List<CourseVersion> findByCourseIdsAndStatusName(
            @Param("courseIds") Collection<UUID> courseIds,
            @Param("statusName") String statusName);

    /**
     * Batch palīgs F5 katalogam staff režīmā: visas non-deleted versijas
     * dotajiem kursu ID. Servis tālāk filtrē pēc statusId un izvēlas augstāko
     * versionNumber katram kursam.
     */
    @Query("SELECT v FROM CourseVersion v WHERE v.course.id IN :courseIds")
    List<CourseVersion> findByCourseIdsNotDeleted(@Param("courseIds") Collection<UUID> courseIds);

}
