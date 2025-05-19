package lv.venta.coursecatalog.service.support;

import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.repository.support.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FacultyService {

    @Autowired
    private FacultyRepository facultyRepository;

    /**
     * Iegūst visas fakultātes.
     */
    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    /**
     * Iegūst fakultāti pēc ID.
     */
    public Faculty getFacultyById(int id) throws Exception {
        return facultyRepository.findById(id)
                .orElseThrow(() -> new Exception("Fakultāte ar ID " + id + " nav atrasta"));
    }

    /**
     * Izveido jaunu fakultāti.
     */
    public Faculty createFaculty(Faculty input) {
        return facultyRepository.save(input);
    }

    /**
     * Atjaunina esošu fakultāti.
     */
    public Faculty updateFaculty(int id, Faculty input) throws Exception {
        Faculty existing = getFacultyById(id);

        existing.setName(input.getName());
        existing.setSlug(input.getSlug());

        return facultyRepository.save(existing);
    }

    /**
     * Dzēš fakultāti pēc ID.
     */
    public void deleteFaculty(int id) {
        facultyRepository.deleteById(id);
    }
}
