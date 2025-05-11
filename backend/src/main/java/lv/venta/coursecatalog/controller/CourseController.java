package lv.venta.coursecatalog.controller;

import lv.venta.coursecatalog.model.Course;
import lv.venta.coursecatalog.service.ICourseService;
import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * Izveido jaunu kursu.
     * @param course kursa dati no lietotāja
     * @return izveidotais kurss
     */
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseService.createNewCourse(course);
    }

    /**
     * Atjaunina esošu kursu pēc ID.
     * @param id kursa ID
     * @param course kursa atjaunotie dati
     * @return atjauninātais kurss vai kļūda
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @RequestBody Course course) {
        try {
            return ResponseEntity.ok(courseService.updateCourseById(UUID.fromString(id), course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Dzēš kursu pēc ID.
     * @param id kursa ID
     * @return atbildes statuss
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable String id) {
        try {
            courseService.deleteCourseById(UUID.fromString(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
