package lv.venta.coursecatalog.controller.program;

import lv.venta.coursecatalog.model.program.CourseToProgrammeResults;
import lv.venta.coursecatalog.service.program.CourseToProgrammeResultsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/course-to-programme-results")
public class CourseToProgrammeResultsController {

    @Autowired
    private CourseToProgrammeResultsService courseToProgrammeResultsService;

    /**
     * Iegūst visas kursa un programmas rezultātu sasaistes.
     */
    @GetMapping
    public List<CourseToProgrammeResults> getAllRelations() {
        return courseToProgrammeResultsService.getAllRelations();
    }

    /**
     * Iegūst konkrētu sasaisti pēc ID.
     */
    @GetMapping("/{id}")
    public CourseToProgrammeResults getRelationById(@PathVariable int id) throws Exception {
        return courseToProgrammeResultsService.getRelationById(id);
    }

    /**
     * Izveido jaunu kursa un programmas rezultātu sasaisti.
     */
    @PostMapping
    public CourseToProgrammeResults createRelation(@RequestBody CourseToProgrammeResults input) {
        return courseToProgrammeResultsService.createRelation(input);
    }

    /**
     * Atjaunina esošu sasaistes ierakstu.
     */
    @PutMapping("/{id}")
    public CourseToProgrammeResults updateRelation(@PathVariable int id, @RequestBody CourseToProgrammeResults input) throws Exception {
        return courseToProgrammeResultsService.updateRelation(id, input);
    }

    /**
     * Dzēš sasaisti pēc ID.
     */
    @DeleteMapping("/{id}")
    public void deleteRelation(@PathVariable int id) {
        courseToProgrammeResultsService.deleteRelation(id);
    }
}
