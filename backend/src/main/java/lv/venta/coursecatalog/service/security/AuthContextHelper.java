package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Iegūst pašlaik autorizētā lietotāja ID no Spring Security konteksta.
 * Aizvieto iepriekšējo X-Actor-User-Id header risinājumu.
 */
@Component
public class AuthContextHelper {

    private final UserRepository userRepository;

    public AuthContextHelper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Atgriež pašlaik autorizētā lietotāja ID vai null, ja neviens nav autorizēts.
     * SecurityContext glabā email (no UserDetails username) — meklējam User pēc tā.
     */
    public Integer getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .map(u -> u.getId())
                .orElse(null);
    }
}
