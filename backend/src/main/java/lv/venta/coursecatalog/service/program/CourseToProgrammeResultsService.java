package lv.venta.coursecatalog.service.program;

import lv.venta.coursecatalog.model.program.CourseToProgrammeResults;
import lv.venta.coursecatalog.repository.program.CourseToProgrammeResultsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CourseToProgrammeResultsService {

    @Autowired
    private CourseToProgrammeResultsRepository courseToProgrammeResultsRepository;

    /**
     * Iegūst visas kursa un programmas rezultātu sasaistes.
     */
    public List<CourseToProgrammeResults> getAllRelations() {
        return courseToProgrammeResultsRepository.findAll();
    }

    /**
     * Iegūst sasaisti pēc tās ID.
     */
    public CourseToProgrammeResults getRelationById(int id) throws Exception {
        return courseToProgrammeResultsRepository.findById(id)
                .orElseThrow(() -> new Exception("Sasaistes ieraksts ar ID " + id + " nav atrasts"));
    }

    /**
     * Izveido jaunu kursa un programmas rezultātu sasaisti.
     */
    public CourseToProgrammeResults createRelation(CourseToProgrammeResults input) {
        return courseToProgrammeResultsRepository.save(input);
    }

    /**
     * Atjaunina esošu sasaistes ierakstu.
     */
    public CourseToProgrammeResults updateRelation(int id, CourseToProgrammeResults input) throws Exception {
        CourseToProgrammeResults existing = getRelationById(id);

        existing.setCourseInfo(input.getCourseInfo());
        existing.setCourseResult(input.getCourseResult());
        existing.setProgrammeResult(input.getProgrammeResult());

        return courseToProgrammeResultsRepository.save(existing);
    }

    /**
     * Dzēš sasaistes ierakstu pēc ID.
     */
    public void deleteRelation(int id) {
        courseToProgrammeResultsRepository.deleteById(id);
    }
}
