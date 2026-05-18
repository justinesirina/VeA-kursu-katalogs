package lv.venta.coursecatalog.service.user;

import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.repository.user.UserRoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servisa klase, kas pārvalda lietotāju lomas (piemēram, Admin, Student).
 */
@Service
public class UserRoleService {

    private final UserRoleRepository repository;

    public UserRoleService(UserRoleRepository repository) {
        this.repository = repository;
    }

    /**
     * Iegūst visas definētās lomas.
     */
    public List<UserRole> getAll() {
        return repository.findAll();
    }

    /**
     * Iegūst lomu pēc ID.
     */
    public Optional<UserRole> getById(int id) {
        return repository.findById(id);
    }

    /**
     * Saglabā vai atjaunina lietotāja lomu.
     */
    public UserRole save(UserRole role) {
        return repository.save(role);
    }

    /**
     * Dzēš lomu pēc ID.
     */
    public void deleteById(int id) {
        repository.deleteById(id);
    }
}
