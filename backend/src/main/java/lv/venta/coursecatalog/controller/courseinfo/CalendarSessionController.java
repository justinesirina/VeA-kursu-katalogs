package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarSession;
import lv.venta.coursecatalog.service.courseinfo.CalendarSessionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar-sessions")
@CrossOrigin(origins = "*")
public class CalendarSessionController {

    @Autowired
    private CalendarSessionService service;

    @GetMapping
    public List<CalendarSession> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarSession> getById(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CalendarSession> create(@Valid @RequestBody CalendarSession obj) {
        return ResponseEntity.ok(service.create(obj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CalendarSession> update(@PathVariable int id, @Valid @RequestBody CalendarSession obj) {
        return ResponseEntity.ok(service.update(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
