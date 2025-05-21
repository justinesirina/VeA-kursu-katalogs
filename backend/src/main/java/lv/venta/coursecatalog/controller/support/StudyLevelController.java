package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.StudyLevel;
import lv.venta.coursecatalog.service.support.StudyLevelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina studiju līmeņu API piekļuvi.
 */
@RestController
@RequestMapping("/api/study-levels")
public class StudyLevelController {

    @Autowired
    private StudyLevelService service;

    @GetMapping
    public List<StudyLevel> getAll() {
        return service.getAll();
    }

    @PostMapping
    public StudyLevel create(@RequestBody StudyLevel input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public StudyLevel update(@PathVariable int id, @RequestBody StudyLevel input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
