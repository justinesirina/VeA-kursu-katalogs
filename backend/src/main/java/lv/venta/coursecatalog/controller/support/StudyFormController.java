package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.StudyForm;
import lv.venta.coursecatalog.service.support.StudyFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina studiju formu API piekļuvi.
 */
@RestController
@RequestMapping("/api/study-forms")
public class StudyFormController {

    @Autowired
    private StudyFormService service;

    @GetMapping
    public List<StudyForm> getAll() {
        return service.getAll();
    }

    @PostMapping
    public StudyForm create(@RequestBody StudyForm input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public StudyForm update(@PathVariable int id, @RequestBody StudyForm input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
