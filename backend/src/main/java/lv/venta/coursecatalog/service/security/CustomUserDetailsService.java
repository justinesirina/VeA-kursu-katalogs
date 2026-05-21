package lv.venta.coursecatalog.service.security;

import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Atrod lietotāju pēc e-pasta un padod Spring Security login plūsmai.
 * Login laikā Spring Security pārbauda paroles hash ar BCrypt un piešķir
 * lietotājam visas kumulatīvās lomas (skat. RoleHierarchy).
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Lietotājs nav atrasts: " + email));

        if (user.getPasswordHash() == null) {
            throw new UsernameNotFoundException("Lietotājam parole nav iestatīta: " + email);
        }

        // Kumulatīvās lomas — TEACHER iegūst arī STUDENT un GUEST tiesības (skat. prasibas.md 1.1).
        List<GrantedAuthority> authorities = RoleHierarchy
                .allEffectiveRoles(user.getRole().getRoleKey())
                .stream()
                .map(rk -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + rk.name()))
                .toList();

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.isActive(),       // enabled
                true,                  // accountNonExpired
                true,                  // credentialsNonExpired
                true,                  // accountNonLocked
                authorities
        );
    }
}
