package lv.venta.coursecatalog.controller.courseinfo;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.dto.CourseDetailsDTO;
import lv.venta.coursecatalog.service.courseinfo.CourseInfoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/course-info")
@CrossOrigin(origins = "*")
@Tag(name = "Kursa saturs", description = "Kursa detaļu un versiju satura pārvaldība")
public class CourseInfoController {

    @Autowired
    private CourseInfoService infoService;

    /**
     * Iegūst visus CourseInfo ierakstus.
     */
    @GetMapping
    public List<CourseInfo> getAll() {
        return infoService.getAll();
    }

    /**
     * Iegūst konkrētu ierakstu pēc ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CourseInfo> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(infoService.getById(id));
    }

    /**
     * Izveido jaunu CourseInfo ierakstu.
     */
    @PostMapping
    public ResponseEntity<CourseInfo> create(@Valid @RequestBody CourseInfo courseInfo) {
        return ResponseEntity.ok(infoService.create(courseInfo));
    }

    /**
     * Atjauno CourseInfo pēc ID.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable UUID id,
                                       @Valid @RequestBody CourseInfo updated) {
        infoService.update(id, updated);
        return ResponseEntity.noContent().build();
    }

    /**
     * Dzēš CourseInfo pēc ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        infoService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(
        summary = "Iegūt kursa detaļu skatu",
        description = "Atgriež CourseDetailsDTO — agregēts skats kursa detaļu lapai (CourseDetails.jsx). " +
                      "Ietver versijas statusu, stundu sadalījumu, tēmas, kalendāru, vērtēšanu un literatūru."
    )
    @ApiResponse(responseCode = "200", description = "Kursa detaļu DTO")
    @ApiResponse(responseCode = "404", description = "Kurss vai aktīva versija nav atrasta")
    @GetMapping("/details/{courseId}")
    public ResponseEntity<CourseDetailsDTO> getCourseDetails(@PathVariable UUID courseId) {
        // Izsauc servisa metodi, kas atgriež detalizētu informāciju par kursu DTO formā
        CourseDetailsDTO dto = infoService.getCourseDetailsById(courseId);

        // Ja DTO tika veiksmīgi izveidots, atgriežam ar statusu 200 OK
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        // Ja kurss nav atrasts, atgriežam statusu 404 Not Found
        else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
        summary = "Iegūt konkrētas kursa versijas detaļu skatu",
        description = "Atgriež CourseDetailsDTO konkrētai vēsturiskai versijai (neatkarīgi no isActive). " +
                      "Izmanto versiju vēstures lapā, lai parādītu read-only skatu vēsturiskām versijām."
    )
    @ApiResponse(responseCode = "200", description = "Versijas detaļu DTO")
    @ApiResponse(responseCode = "404", description = "Versija vai tās CourseInfo nav atrasta")
    @GetMapping("/details-by-version/{versionId}")
    public ResponseEntity<CourseDetailsDTO> getCourseDetailsByVersion(@PathVariable UUID versionId) {
        CourseDetailsDTO dto = infoService.getCourseDetailsByVersionId(versionId);
        if (dto != null) {
            return ResponseEntity.ok(dto);
        }
        return ResponseEntity.notFound().build();
    }
}
