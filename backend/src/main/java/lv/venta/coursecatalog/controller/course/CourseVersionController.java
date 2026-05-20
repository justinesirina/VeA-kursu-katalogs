package lv.venta.coursecatalog.controller.course;

import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.dto.ApproveVersionRequest;
import lv.venta.coursecatalog.model.dto.ArchivedVersionDTO;
import lv.venta.coursecatalog.model.dto.RejectVersionRequest;
import lv.venta.coursecatalog.model.dto.ReopenVersionRequest;
import lv.venta.coursecatalog.model.dto.SubmitVersionRequest;
import lv.venta.coursecatalog.service.course.CourseVersionApprovalService;
import lv.venta.coursecatalog.service.course.CourseVersionDuplicationService;
import lv.venta.coursecatalog.service.course.CourseVersionService;
import lv.venta.coursecatalog.service.security.AuthContextHelper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    private final CourseVersionDuplicationService duplicationService;
    private final CourseVersionApprovalService approvalService;
    private final AuthContextHelper authContext;

    public CourseVersionController(CourseVersionService courseVersionService,
                                   CourseVersionDuplicationService duplicationService,
                                   CourseVersionApprovalService approvalService,
                                   AuthContextHelper authContext) {
        this.courseVersionService = courseVersionService;
        this.duplicationService = duplicationService;
        this.approvalService = approvalService;
        this.authContext = authContext;
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
        return courseVersionService.saveCourseVersion(version, authContext.getCurrentUserId());
    }

    /**
     * Atjaunina esošu kursa versiju pēc tās ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CourseVersion> updateVersion(@PathVariable UUID id, @Valid @RequestBody CourseVersion version) {
        version.setId(id);
        return ResponseEntity.ok(courseVersionService.saveCourseVersion(version, authContext.getCurrentUserId()));
    }

    /**
     * Mīkstā dzēšana — versija saglabājas DB ar deletedAt zīmogu un isActive=false.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVersion(@PathVariable UUID id) {
        try {
            courseVersionService.deleteCourseVersionById(id, authContext.getCurrentUserId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Arhivēto (soft-delete'to) versiju saraksts ar saistītā kursa pamatinformāciju.
     */
    @GetMapping("/archived")
    public List<ArchivedVersionDTO> getAllArchivedVersions() {
        return courseVersionService.getAllArchivedVersionsAsDTO();
    }

    /**
     * Atjauno arhivētu versiju.
     */
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreVersion(@PathVariable UUID id) {
        try {
            courseVersionService.restoreCourseVersionById(id, authContext.getCurrentUserId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    /**
     * Dzili duplicē esošu versiju — izveido jaunu Melnraksts versiju ar nokopētu CourseInfo saturu.
     */
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<?> duplicateVersion(@PathVariable UUID id) {
        try {
            CourseVersion created = duplicationService.duplicateVersion(id, authContext.getCurrentUserId());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    /**
     * Neatgriezeniski dzēš arhivētu versiju (tikai arhivētām).
     */
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> hardDeleteVersion(@PathVariable UUID id) {
        try {
            courseVersionService.hardDeleteArchivedVersionById(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // ----- F8: apstiprināšanas plūsmas pārejas -----

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable UUID id, @RequestBody SubmitVersionRequest req) {
        return runTransition(() -> approvalService.submit(id, authContext.getCurrentUserId(), req.getComment()));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable UUID id, @RequestBody ApproveVersionRequest req) {
        return runTransition(() -> approvalService.approve(
                id,
                authContext.getCurrentUserId(),
                req.getDecisionNumber(),
                req.getApprovalDate(),
                req.getDecisionReference(),
                req.getComment()));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable UUID id, @RequestBody RejectVersionRequest req) {
        return runTransition(() -> approvalService.reject(id, authContext.getCurrentUserId(), req.getComment()));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<?> reopen(@PathVariable UUID id, @RequestBody ReopenVersionRequest req) {
        return runTransition(() -> approvalService.reopenToDraft(id, authContext.getCurrentUserId(), req.getComment()));
    }

    private ResponseEntity<?> runTransition(java.util.function.Supplier<CourseVersion> action) {
        try {
            return ResponseEntity.ok(action.get());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

}
