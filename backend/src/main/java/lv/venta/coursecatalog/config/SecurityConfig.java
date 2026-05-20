package lv.venta.coursecatalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security konfigurācija (F14, NF2 prasība).
 * Pagaidām visi pieprasījumi tiek atļauti — autorizācijas pārbaudes
 * tiks pievienotas vēlāk kopā ar AuthController un @PreAuthorize.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /** BCrypt paroļu hash algoritms — drošs un Spring Security ieteiktais. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** AuthenticationManager bean, ko izmanto AuthController login plūsmā. */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF nav vajadzīgs, JSON API ar cookie sesiju (SPA pieeja).
            .csrf(csrf -> csrf.disable())
            // CORS pārvalda esošā CorsConfig caur WebMvcConfigurer.
            .cors(Customizer.withDefaults())
            // Pagaidām visi pieprasījumi atļauti — sasniegsim @PreAuthorize vēlāk.
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            // Sesijas izveidotas pēc vajadzības (pēc login).
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            // Atslēdzam noklusētās Spring Security login formas un HTTP Basic.
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable());
        return http.build();
    }
}
