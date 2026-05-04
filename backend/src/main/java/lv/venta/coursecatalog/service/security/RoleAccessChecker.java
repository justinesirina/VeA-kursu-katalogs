package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Pagaidu lomu pārbaudes palīgklase līdz Phase 5 ievieš Spring Security.
 * Saņem lietotāja ID no {@code X-Actor-User-Id} header un atļauj
 * pārbaudīt, vai lietotājam pietiek tiesību veikt staff-līmeņa darbībām
 * (piem., redzēt kursus, kuru versijas, kas nav apstiprinātas).
 *
 * Phase 5 šī klase tiks aizvietota ar Spring Security {@code @PreAuthorize}.
 */
@Component
public class RoleAccessChecker {

    /**
     * Lomas, kurām ir Pasniedzēja vai augstākas tiesības (skat. prasibas.md 1.1).
     * Salīdzinot pēc {@code roleName}, lai izvairītos no fiksētiem ID.
     */
    private static final Set<String> STAFF_ROLES = Set.of(
            "Pasniedzējs",
            "Programmas direktors",
            "Administrators",
            "Sistēmas administrators"
    );

    private final UserRepository userRepository;

    public RoleAccessChecker(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Atgriež {@code true}, ja lietotājs ir vismaz Pasniedzējs.
     * Ja {@code actorUserId} ir {@code null} vai lietotājs nav atrasts /
     * neaktīvs, atgriež {@code false} (publiskā pieeja).
     */
    public boolean isStaff(Integer actorUserId) {
        if (actorUserId == null) return false;
        return userRepository.findById(actorUserId)
                .filter(User::isActive)
                .map(u -> u.getRole() != null && STAFF_ROLES.contains(u.getRole().getRoleName()))
                .orElse(false);
    }
}
