package lv.venta.coursecatalog.service;

import lv.venta.coursecatalog.model.User;
import lv.venta.coursecatalog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servisa klase, kas pārvalda lietotāju datus – vārdu, epastu, lomu u.c.
 */
@Service
public class UserService {

    private final UserRepository repository;

    @Autowired
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

