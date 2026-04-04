package lv.venta.coursecatalog.controller.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Kursi", description = "CRUD darbības ar studiju kursiem")
public class CourseController {

    private final ICourseService courseService;

    @Autowired
    public CourseController(ICourseService courseService) {
        this.courseService = courseService;
    }

    @Operation(summary = "Iegūt visus kursus", description = "Atgriež visus kursus; dzēstie automātiski filtrēti")
    @ApiResponse(responseCode = "200", description = "Kursu saraksts")
    @GetMapping
    public List<Course> getAllCourses() {
        return courseService.getAllCourses();
    }

    @Operation(summary = "Iegūt aktīvos kursus", description = "Atgriež tikai aktīvos, nedzēstos kursus")
    @ApiResponse(responseCode = "200", description = "Aktīvo kursu saraksts")
    @GetMapping("/filter/active")
    public List<Course> getAllActiveCourses() {
        return courseService.getAllActiveCourses();
    }

    @Operation(summary = "Izveidot kursu", description = "Izveido jaunu studiju kursu")
    @ApiResponse(responseCode = "200", description = "Izveidotais kurss")
    @ApiResponse(responseCode = "400", description = "Validācijas kļūda")
    @PostMapping
    public Course createCourse(@Valid @RequestBody Course course) {
        return courseService.createNewCourse(course);
    }

    @Operation(summary = "Atjaunināt kursu", description = "Atjaunina esošu kursu pēc UUID")
    @ApiResponse(responseCode = "200", description = "Atjauninātais kurss")
    @ApiResponse(responseCode = "400", description = "Kurss nav atrasts vai validācijas kļūda")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable String id, @Valid @RequestBody Course course) {
        try {
            return ResponseEntity.ok(courseService.updateCourseById(UUID.fromString(id), course));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Operation(summary = "Dzēst kursu", description = "Veic mīksto dzēšanu — iestata deletedAt un active=false")
    @ApiResponse(responseCode = "200", description = "Kurss dzēsts")
    @ApiResponse(responseCode = "404", description = "Kurss nav atrasts")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourseById(id);
            return ResponseEntity.ok("Kurss veiksmīgi dzēsts");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Iegūt kursu pēc ID", description = "Atgriež vienu kursu pēc tā UUID")
    @ApiResponse(responseCode = "200", description = "Kurss atrasts")
    @ApiResponse(responseCode = "400", description = "Kurss nav atrasts")
    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(courseService.getCourseById(UUID.fromString(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }




}
