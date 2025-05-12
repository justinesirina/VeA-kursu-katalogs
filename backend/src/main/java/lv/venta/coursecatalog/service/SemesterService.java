package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.Semester;
import lv.venta.coursecatalog.repository.SemesterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Serviss, kas pārvalda semestru datus — piemēram, “Rudens” vai “Pavasaris”.
 */
@Service
public class SemesterService {

    private final SemesterRepository repository;

    @Autowired
    public SemesterService(SemesterRepository repository) {
        this.repository = repository;
    }

    /**
     * Atgriež visus semestrus.
     */
    public List<Semester> getAll() {
        return repository.findAll();
    }

    /**
     * Atgriež konkrētu semestri pēc ID.
     */
    public Optional<Semester> getById(int id) {
        return repository.findById(id);
    }

    /**
     * Saglabā vai atjaunina semestra ierakstu.
     */
    public Semester save(Semester semester) {
        return repository.save(semester);
    }

    /**
     * Dzēš semestri pēc ID.
     */
    public void deleteById(int id) {
        repository.deleteById(id);
    }
}
