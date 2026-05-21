package lv.venta.coursecatalog.service.user;

import lv.venta.coursecatalog.model.dto.CreateUserRequest;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.user.UserRole;
import lv.venta.coursecatalog.repository.user.UserRepository;
import lv.venta.coursecatalog.repository.user.UserRoleRepository;
import lv.venta.coursecatalog.service.security.PasswordPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servisa klase, kas pārvalda lietotāju datus - vārdu, e-pastu, lomu, paroli.
 */
@Service
public class UserService {

    private final UserRepository repository;
    private final UserRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository,
                       UserRoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public Optional<User> getById(int id) {
        return repository.findById(id);
    }

    public User save(User user) {
        // Pārbauda e-pasta unikalitāti pirms saglabāšanas, lai izvairītos no DB constraint kļūdas,
        // kas atgrieztos kā HTTP 500 ar SQL detaļām UI lietotājam.
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            repository.findByEmail(user.getEmail()).ifPresent(existing -> {
                if (existing.getId() != user.getId()) {
                    throw new IllegalArgumentException("Lietotājs ar šo e-pastu jau eksistē.");
                }
            });
        }
        return repository.save(user);
    }

    public void deleteById(int id) {
        repository.deleteById(id);
    }

    /**
     * Izveido jaunu lietotāju ar paroli. Pirms saglabāšanas pārbauda
     * paroles politiku un hashē paroli ar BCrypt.
     */
    public User createWithPassword(CreateUserRequest req) {
        boolean active = req.active() == null || req.active();
        boolean hasPassword = req.password() != null && !req.password().isBlank();

        // Aktīviem kontiem parole obligāta (citādi nevar pieslēgties).
        // Neaktīviem kontiem parole pēc izvēles, tie paredzēti autoru/pasniedzēju saraksta vajadzībām.
        if (active && !hasPassword) {
            throw new IllegalArgumentException("Aktīvam lietotājam parole ir obligāta. Atstāj kontu neaktīvu, ja parole netiek piešķirta.");
        }
        if (hasPassword) {
            String policyError = PasswordPolicy.validate(req.password());
            if (policyError != null) {
                throw new IllegalArgumentException(policyError);
            }
        }

        // E-pasta unikalitāte pārbaudāma proaktīvi — DB constraint kļūda lietotājam neko nepasaka.
        repository.findByEmail(req.email()).ifPresent(existing -> {
            throw new IllegalArgumentException("Lietotājs ar šo e-pastu jau eksistē.");
        });

        UserRole role = roleRepository.findById(req.roleId())
                .orElseThrow(() -> new IllegalArgumentException("Loma nav atrasta."));

        User user = new User();
        user.setName(req.name());
        user.setSurname(req.surname());
        user.setEmail(req.email());
        user.setAcademicDegree(req.academicDegree());
        user.setPosition(req.position());
        user.setRole(role);
        user.setActive(active);
        user.setPasswordHash(hasPassword ? passwordEncoder.encode(req.password()) : null);
        return repository.save(user);
    }

    /**
     * Atiestata lietotāja paroli ar jaunu (admin darbība).
     * Pārbauda paroles politiku un hashē jauno paroli.
     */
    public void resetPassword(int userId, String newPassword) {
        String policyError = PasswordPolicy.validate(newPassword);
        if (policyError != null) {
            throw new IllegalArgumentException(policyError);
        }
        User user = repository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Lietotājs nav atrasts."));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        repository.save(user);
    }
}
