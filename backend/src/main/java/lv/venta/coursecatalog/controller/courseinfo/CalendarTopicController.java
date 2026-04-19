package lv.venta.coursecatalog.controller.courseinfo;

import lv.venta.coursecatalog.model.courseinfo.CalendarTopic;
import lv.venta.coursecatalog.service.courseinfo.CalendarTopicService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar-topics")
@CrossOrigin(origins = "*")
public class CalendarTopicController {

    @Autowired
    private CalendarTopicService service;

    @GetMapping
    public List<CalendarTopic> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CalendarTopic> getById(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CalendarTopic> create(@Valid @RequestBody CalendarTopic obj) {
        return ResponseEntity.ok(service.create(obj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id, @Valid @RequestBody CalendarTopic obj) {
        service.update(id, obj);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
