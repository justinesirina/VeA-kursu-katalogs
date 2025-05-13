package lv.venta.coursecatalog.repository;

import lv.venta.coursecatalog.model.CourseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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
}
