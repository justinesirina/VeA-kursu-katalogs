package lv.venta.coursecatalog.service.user;

import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servisa klase, kas pārvalda lietotāju datus – vārdu, epastu, lomu u.c.
 */
@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public Optional<User> getById(int id) {
        return repository.findById(id);
    }

    public User save(User user) {
        return repository.save(user);
    }

    public void deleteById(int id) {
        repository.deleteById(id);
    }
}

