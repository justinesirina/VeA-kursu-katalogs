package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.service.program.CourseToStudyProgramsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Kontrolieris, kas nodrošina kursu un studiju programmu sasaistes API.
 */
@RestController
@RequestMapping("/api/course-to-study-programs")
public class CourseToStudyProgramsController {

    @Autowired
    private CourseToStudyProgramsService service;

    @GetMapping
    public List<CourseToStudyPrograms> getAll() {
        return service.getAll();
    }

    @PostMapping
    public CourseToStudyPrograms create(@Valid @RequestBody CourseToStudyPrograms input) {
        return service.create(input);
    }

    @PutMapping("/{id}")
    public CourseToStudyPrograms update(@PathVariable int id, @Valid @RequestBody CourseToStudyPrograms input) throws Exception {
        return service.update(id, input);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        service.delete(id);
    }
}
