package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.Language;
import lv.venta.coursecatalog.service.support.LanguageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina valodu API piekļuvi.
 */
@RestController
@RequestMapping("/api/languages")
public class LanguageController {

    @Autowired
    private LanguageService service;

    @GetMapping
    public List<Language> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Language create(@Valid @RequestBody Language input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public Language update(@PathVariable int id, @Valid @RequestBody Language input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
