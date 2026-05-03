package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.dto.ArchivedCourseDTO;
import java.util.List;
import java.util.UUID;

public interface ICourseService {

    /**
     * Atgriež sarakstu ar visiem pieejamajiem kursiem sistēmā.
     * @return kursu saraksts
     */
    List<Course> getAllCourses();

    /**
     * Atgriež konkrētu kursu pēc tā unikālā ID.
     * @param id kursa ID
     * @return atrastais kurss vai izņēmums, ja nav atrasts
     * @throws Exception ja kurss ar norādīto ID neeksistē
     */
    Course getCourseById(UUID id) throws Exception;

    /**
     * Saglabā jaunu kursu sistēmā.
     * @param course kurss, kas jāizveido
     * @return izveidotais kurss
     */
    Course createNewCourse(Course course);

    /**
     * F9 — saglabā jaunu kursu un ieraksta žurnāla ierakstu (course_create).
     */
    Course createNewCourse(Course course, Integer actorUserId);

    /**
     * Atjaunina esošu kursu, balstoties uz ID un iesniegto informāciju.
     * @param id atjaunināmā kursa ID
     * @param course jaunie dati
     * @return atjauninātais kurss
     * @throws Exception ja kurss nav atrasts
     */
    Course updateCourseById(UUID id, Course course) throws Exception;

    /**
     * Dzēš kursu no sistēmas pēc ID.
     * @param id kursa ID, kas jādzēš
     * @throws Exception ja kurss nav atrasts
     */
    void deleteCourseById(UUID id) throws Exception;

    /**
     * F9 — soft-delete kursam ar žurnāla ierakstu (course_archive).
     */
    void deleteCourseById(UUID id, Integer actorUserId) throws Exception;

    List<Course> getAllActiveCourses();

    /**
     * Atgriež arhivētos (soft-delete'tos) kursus.
     */
    List<Course> getAllArchivedCourses();

    /**
     * Atgriež arhivētos kursus DTO formā ar versiju agregātiem.
     */
    List<ArchivedCourseDTO> getAllArchivedCoursesAsDTO();

    /**
     * Atjauno arhivētu kursu (noņem deletedAt, uzstāda active=true).
     * @param id atjaunojama kursa ID
     * @throws Exception ja kurss nav atrasts
     */
    void restoreCourseById(UUID id) throws Exception;

    /**
     * F9 — atjauno kursu ar žurnāla ierakstu (course_restore).
     */
    void restoreCourseById(UUID id, Integer actorUserId) throws Exception;

    /**
     * Veic neatgriezenisku kursa fizisko dzēšanu — pieejams tikai arhivētiem.
     * @param id arhivēta kursa ID
     * @throws Exception ja kurss nav atrasts vai nav arhivēts
     */
    void hardDeleteArchivedCourseById(UUID id) throws Exception;

}
