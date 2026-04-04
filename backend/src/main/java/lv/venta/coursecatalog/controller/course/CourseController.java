package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.service.course.ICourseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST kontrolieris, kas nodrošina galapunktus darbībām ar kursiem.
 * Piemēram: skatīt visus kursus, pievienot jaunu, rediģēt esošu, dzēst.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final ICourseService courseService;

    @Autowired
    public CourseController(ICourseService courseService) {
        this.courseService = courseService;
    }

    /**
     * Atgriež visus kursus sistēmā.
     * @return saraksts ar kursiem
     */
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    /**
     * Atgriež tikai aktīvos kursus (kas nav dzēsti).
     *
     * @return saraksts ar aktīvajiem kursiem
     */
    @GetMapping("/filter/active")
    public List<Course> getAllActiveCourses() {
        return courseService.getAllActiveCourses();
    }

    /**
     * Izveido jaunu kursu.
     * @param course kursa dati no lietotāja
     * @return izveidotais kurss
     */
    @PostMapping
    public Course createCourse(@Valid @RequestBody Course course) {
        return courseService.createNewCourse(course);
    }

    /**
     * Atjaunina esošu kursu pēc ID.
     * @param id kursa ID
     * @param course kursa atjaunotie dati
     * @return atjauninātais kurss vai kļūda
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @Valid @RequestBody Course course) {
        try {
            return ResponseEntity.ok(courseService.updateCourseById(UUID.fromString(id), course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Veic kursa dzēšanu (mīksto dzēšanu) pēc ID.
     *
     * @param id kursa UUID
     * @return 200 OK vai kļūda
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourseById(id);
            return ResponseEntity.ok("Kurss veiksmīgi dzēsts");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Atgriež vienu kursu pēc tā ID.
     * @param id kursa UUID
     * @return kurss vai kļūda
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(courseService.getCourseById(UUID.fromString(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }




}
