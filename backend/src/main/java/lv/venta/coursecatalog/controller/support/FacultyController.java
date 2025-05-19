package lv.venta.coursecatalog.controller.support;

import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.service.support.FacultyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faculties")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    /**
     * Iegūst visas fakultātes.
     */
    @GetMapping
    public List<Faculty> getAllFaculties() {
        return facultyService.getAllFaculties();
    }

    /**
     * Iegūst fakultāti pēc ID.
     */
    @GetMapping("/{id}")
    public Faculty getFacultyById(@PathVariable int id) throws Exception {
        return facultyService.getFacultyById(id);
    }

    /**
     * Izveido jaunu fakultāti.
     */
    @PostMapping
    public Faculty createFaculty(@RequestBody Faculty input) {
        return facultyService.createFaculty(input);
    }

    /**
     * Atjaunina esošu fakultāti.
     */
    @PutMapping("/{id}")
    public Faculty updateFaculty(@PathVariable int id, @RequestBody Faculty input) throws Exception {
        return facultyService.updateFaculty(id, input);
    }

    /**
     * Dzēš fakultāti pēc ID.
     */
    @DeleteMapping("/{id}")
    public void deleteFaculty(@PathVariable int id) {
        facultyService.deleteFaculty(id);
    }
}
