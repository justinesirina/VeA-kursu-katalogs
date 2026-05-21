package lv.venta.coursecatalog.controller.log;

import lv.venta.coursecatalog.model.dto.CourseVersionLogDTO;
import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kursu darbību žurnāls (F9 prasība). Žurnāls redzams tikai Programmas
 * direktoram un augstākām lomām. Ierakstus žurnālā raksta servisi
 * automātiski — manuāla POST/PUT/DELETE pieejama tikai sistēmas
 * administratoram administratīviem labojumiem.
 */
@RestController
@RequestMapping("/api/course-version-logs")
public class CourseVersionLogController {

    @Autowired
    private CourseVersionLogService service;

    @PreAuthorize("hasRole('PROGRAM_DIRECTOR')")
    @GetMapping
    public List<CourseVersionLogDTO> getAll() {
        return service.getAllAsDTO();
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PostMapping
    public CourseVersionLog create(@Valid @RequestBody CourseVersionLog input) {
        return service.create(input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @PutMapping("/{id}")
    public CourseVersionLog update(@PathVariable int id, @Valid @RequestBody CourseVersionLog input) throws Exception {
        return service.update(id, input);
    }

    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
