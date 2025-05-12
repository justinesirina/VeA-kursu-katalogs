package lv.venta.coursecatalog.controller;

import lv.venta.coursecatalog.model.CourseVersion;
import lv.venta.coursecatalog.service.CourseVersionService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
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
    public CourseVersion createOrUpdateVersion(@RequestBody CourseVersion version) {
        return courseVersionService.saveCourseVersion(version);
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
