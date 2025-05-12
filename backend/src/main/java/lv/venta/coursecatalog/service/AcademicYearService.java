package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.AcademicYear;
import lv.venta.coursecatalog.repository.AcademicYearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servisa klase, kas apstrādā loģiku saistībā ar akadēmiskajiem gadiem.
 * Šeit iekļauta datu izgūšana, saglabāšana, atjaunināšana un dzēšana.
 */
@Service
public class AcademicYearService {

    private final AcademicYearRepository repository;

    @Autowired
    public AcademicYearService(AcademicYearRepository repository) {
        this.repository = repository;
    }

    /**
     * Atgriež visus akadēmiskos gadus.
     */
    public List<AcademicYear> getAll() {
        return repository.findAll();
    }

    /**
     * Atrod konkrētu akadēmisko gadu pēc ID.
     */
    public Optional<AcademicYear> getById(int id) {
        return repository.findById(id);
    }

    /**
     * Saglabā vai atjaunina akadēmiskā gada ierakstu.
     */
    public AcademicYear save(AcademicYear year) {
        return repository.save(year);
    }

    /**
     * Dzēš akadēmiskā gada ierakstu pēc ID.
     */
    public void deleteById(int id) {
        repository.deleteById(id);
    }
}
