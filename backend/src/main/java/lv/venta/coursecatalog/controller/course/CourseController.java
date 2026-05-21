package lv.venta.coursecatalog.controller.course;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.dto.ArchivedCourseDTO;
import lv.venta.coursecatalog.model.dto.CourseCatalogItemDTO;
import lv.venta.coursecatalog.service.course.CourseCatalogFilter;
import lv.venta.coursecatalog.service.course.ICourseService;
import lv.venta.coursecatalog.service.security.AuthContextHelper;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final AuthContextHelper authContext;

    public CourseController(ICourseService courseService, AuthContextHelper authContext) {
        this.courseService = courseService;
        this.authContext = authContext;
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

    /**
     * F5 — publiskais katalogs ar meklēšanu, filtrēšanu un lapu izkārtojumu.
     * Visi filtri ir neobligāti. {@code statusId} darbojas tikai staff
     * lietotājiem (skat. {@link lv.venta.coursecatalog.service.security.RoleAccessChecker});
     * publiskie pieprasījumi vienmēr saņem tikai aktīvas apstiprinātas versijas.
     */
    @Operation(summary = "Kursu katalogs ar meklēšanu un filtrēšanu (F5)",
            description = "Paginēts saraksts ar atspoguļoto versijas info; "
                    + "filtri pēc fakultātes, programmas, gada, semestra, autora u.c.")
    @ApiResponse(responseCode = "200", description = "Page<CourseCatalogItemDTO>")
    @GetMapping("/catalog")
    public Page<CourseCatalogItemDTO> getCatalog(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) java.util.List<Integer> facultyIds,
            @RequestParam(required = false) java.util.List<Integer> academicYearIds,
            @RequestParam(required = false) java.util.List<Integer> semesterIds,
            @RequestParam(required = false) java.util.List<Integer> statusIds,
            @RequestParam(required = false) java.util.List<Integer> programIds,
            @RequestParam(required = false) java.util.List<Integer> programPartIds,
            @RequestParam(required = false) java.util.List<Integer> authorUserIds,
            @RequestParam(required = false) java.util.List<Integer> teacherUserIds,
            @Parameter(description = "0-bāzēts lapas numurs") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Lapas izmērs (atļauts: 25/50/100/500)") @RequestParam(defaultValue = "25") int size,
            @Parameter(description = "Kārtošana, piem. titleLv,asc") @RequestParam(defaultValue = "titleLv,asc") String sort
    ) {
        Integer actorUserId = authContext.getCurrentUserId();
        CourseCatalogFilter filter = CourseCatalogFilter.builder()
                .q(q)
                .facultyIds(facultyIds)
                .academicYearIds(academicYearIds)
                .semesterIds(semesterIds)
                .statusIds(statusIds)
                .programIds(programIds)
                .programPartIds(programPartIds)
                .authorUserIds(authorUserIds)
                .teacherUserIds(teacherUserIds)
                .build();

        Pageable pageable = PageRequest.of(
                Math.max(0, page),
                normalizePageSize(size),
                parseSort(sort)
        );

        return courseService.getCatalog(filter, pageable, actorUserId);
    }

    private static int normalizePageSize(int requested) {
        if (requested <= 25) return 25;
        if (requested <= 50) return 50;
        if (requested <= 100) return 100;
        return 500;
    }

    private static Sort parseSort(String value) {
        if (value == null || value.isBlank()) return Sort.by(Sort.Direction.ASC, "titleLv");
        String[] parts = value.split(",");
        String property = parts[0].trim();
        Sort.Direction direction = parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        if (property.isEmpty() || !isAllowedSortProperty(property)) {
            property = "titleLv";
        }
        return Sort.by(direction, property);
    }

    private static boolean isAllowedSortProperty(String property) {
        return property.equals("titleLv")
                || property.equals("titleEn")
                || property.equals("courseCode")
                || property.equals("credits")
                || property.equals("createdAt")
                || property.equals("updatedAt");
    }

    @Operation(summary = "Iegūt arhivētos kursus",
            description = "Atgriež soft-delete'tos kursus (deletedAt nav null) ar versiju agregātiem")
    @ApiResponse(responseCode = "200", description = "Arhivēto kursu saraksts")
    @GetMapping("/archived")
    public List<ArchivedCourseDTO> getAllArchivedCourses() {
        return courseService.getAllArchivedCoursesAsDTO();
    }

    @Operation(summary = "Atjaunot arhivētu kursu", description = "Noņem deletedAt un uzstāda active=true")
    @ApiResponse(responseCode = "204", description = "Kurss atjaunots")
    @ApiResponse(responseCode = "404", description = "Kurss nav atrasts vai nav arhivēts")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreCourse(@PathVariable UUID id) {
        try {
            courseService.restoreCourseById(id, authContext.getCurrentUserId());
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Neatgriezeniski dzēst arhivētu kursu",
            description = "Pilnīgi izdzēš kursu un visus tā pakārtotos ierakstus no datubāzes. Pieejams tikai arhivētiem (soft-delete'tiem) kursiem."
    )
    @ApiResponse(responseCode = "204", description = "Kurss neatgriezeniski dzēsts")
    @ApiResponse(responseCode = "404", description = "Kurss nav atrasts vai nav arhivēts")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> hardDeleteCourse(@PathVariable UUID id) {
        try {
            courseService.hardDeleteArchivedCourseById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Izveidot kursu", description = "Izveido jaunu studiju kursu")
    @ApiResponse(responseCode = "200", description = "Izveidotais kurss")
    @ApiResponse(responseCode = "400", description = "Validācijas kļūda")
    @PreAuthorize("hasRole('PROGRAM_DIRECTOR')")
    @PostMapping
    public Course createCourse(@Valid @RequestBody Course course) {
        return courseService.createNewCourse(course, authContext.getCurrentUserId());
    }

    @Operation(summary = "Atjaunināt kursu", description = "Atjaunina esošu kursu pēc UUID")
    @ApiResponse(responseCode = "200", description = "Atjauninātais kurss")
    @ApiResponse(responseCode = "400", description = "Kurss nav atrasts vai validācijas kļūda")
    @PreAuthorize("hasRole('TEACHER')")
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
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable UUID id) {
        try {
            courseService.deleteCourseById(id, authContext.getCurrentUserId());
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
