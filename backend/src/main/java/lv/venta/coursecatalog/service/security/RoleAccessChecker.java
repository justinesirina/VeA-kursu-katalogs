package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.RoleKey;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.stereotype.Component;

/**
 * Pagaidu lomu pārbaudes palīgklase līdz F14 prasība ievieš Spring Security.
 * Saņem lietotāja ID no {@code X-Actor-User-Id} header un pārbauda,
 * vai lietotājam pietiek tiesību veikt staff-līmeņa darbībām.
 *
 * Pēc F14 ieviešanas šī klase tiks aizvietota ar Spring Security {@code @PreAuthorize}.
 */
@Component
public class RoleAccessChecker {

    private final UserRepository userRepository;

    public RoleAccessChecker(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Atgriež true, ja lietotājs ir vismaz Pasniedzējs (TEACHER vai augstāks).
     * Ja actorUserId ir null vai lietotājs nav atrasts/neaktīvs — atgriež false.
     */
    public boolean isStaff(Integer actorUserId) {
        if (actorUserId == null) return false;
        return userRepository.findById(actorUserId)
                .filter(User::isActive)
                .map(u -> u.getRole() != null
                        && RoleHierarchy.hasRoleAtLeast(u.getRole().getRoleKey(), RoleKey.TEACHER))
                .orElse(false);
    }
}
