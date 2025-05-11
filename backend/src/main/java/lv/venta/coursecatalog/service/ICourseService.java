package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.Course;
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
}
