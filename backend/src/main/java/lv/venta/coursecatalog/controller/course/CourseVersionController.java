package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.service.course.CourseVersionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST API kontrolieris, kas nodrošina galapunktus darbam ar studiju kursu versijām.
 * Ļauj iegūt, izveidot, atjaunināt un dzēst kursu versijas.
 */
@RestController
@RequestMapping("/api/course-versions")
public class CourseVersionController {

    private final CourseVersionService courseVersionService;

    public CourseVersionController(CourseVersionService courseVersionService) {
        this.courseVersionService = courseVersionService;
    }

    /**
     * Iegūst visas kursu versijas no datubāzes.
     */
    @GetMapping
    public List<CourseVersion> getAllVersions() {
        return courseVersionService.getAllCourseVersions();
    }

    /**
     * Iegūst vienu kursa versiju pēc tās ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseVersion> getVersionById(@PathVariable UUID id) {
        Optional<CourseVersion> version = courseVersionService.getCourseVersionById(id);
        return version.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Iegūst visas versijas, kas pieder konkrētam kursam.
     */
    @GetMapping("/by-course/{courseId}")
    public List<CourseVersion> getVersionsByCourse(@PathVariable UUID courseId) {
        return courseVersionService.getVersionsByCourseId(courseId);
    }

    /**
     * Izveido vai atjaunina kursa versiju.
     */
    @PostMapping
    public CourseVersion createOrUpdateVersion(@Valid @RequestBody CourseVersion version) {
        return courseVersionService.saveCourseVersion(version);
    }

    /**
     * Atjaunina esošu kursa versiju pēc tās ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseVersion> updateVersion(@PathVariable UUID id, @Valid @RequestBody CourseVersion version) {
        version.setId(id);
        return ResponseEntity.ok(courseVersionService.saveCourseVersion(version));
    }

    /**
     * Dzēš kursa versiju pēc ID (pilnīga dzēšana no DB).
     * Nākotnē aizstājama ar "soft delete".
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVersion(@PathVariable UUID id) {
        courseVersionService.deleteCourseVersionById(id);
        return ResponseEntity.noContent().build();
    }

}
