package lv.venta.coursecatalog.controller.user;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lv.venta.coursecatalog.model.dto.AuthSessionDTO;
import lv.venta.coursecatalog.model.dto.LoginRequest;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.user.UserRepository;
import lv.venta.coursecatalog.service.security.RoleHierarchy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

/**
 * Autentifikācijas galapunkti (F14 prasība).
 * Login izveido sesiju (JSESSIONID cookie), logout to invalidē,
 * /me atgriež pašlaik ielogotā lietotāja info.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    /**
     * Login: pārbauda paroli, izveido sesiju, atgriež lietotāja info.
     * 401, ja parole nepareiza vai lietotājs nav atrasts.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthSessionDTO> login(@Valid @RequestBody LoginRequest req,
                                                HttpServletRequest request,
                                                HttpServletResponse response) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password())
            );

            // Saglabājam Authentication sesijā, lai nākamie pieprasījumi to redz.
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            return ResponseEntity.ok(buildSessionDto(req.email()));
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).build();
        }
    }

    /**
     * Logout: invalidē sesiju un notīra SecurityContext.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    /**
     * Atgriež pašlaik ielogoto lietotāju. 401, ja nav sesijas.
     */
    @GetMapping("/me")
    public ResponseEntity<AuthSessionDTO> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(buildSessionDto(auth.getName()));
    }

    /** Sastāda AuthSessionDTO no User entītes pēc e-pasta. */
    private AuthSessionDTO buildSessionDto(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Lietotājs pazudis pēc autentifikācijas: " + email));
        return new AuthSessionDTO(
                user.getId(),
                user.getName(),
                user.getSurname(),
                user.getEmail(),
                user.getRole().getRoleKey(),
                user.getRole().getRoleName(),
                RoleHierarchy.allEffectiveRoles(user.getRole().getRoleKey())
        );
    }
}
