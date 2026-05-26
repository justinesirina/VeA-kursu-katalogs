package lv.venta.coursecatalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

/**
 * Spring Security konfigurācija (F14, NF2 prasība).
 * Visi /api/** galapunkti pieprasa autentifikāciju, izņemot /api/auth/**.
 * Sīkākas lomu pārbaudes katras metodes līmenī ar @PreAuthorize.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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
            // CSRF marķieru mehānisms nav aktivizēts. CSRF aizsardzību nodrošina trīs slāņu kombinācija:
            // 1) CORS allowedOrigins ar konkrētu izstrādes hostu (skat. CorsConfig.java),
            // 2) JSON content-type izraisītais CORS preflight uz POST/PUT/DELETE,
            // 3) SameSite=Lax cookie atribūts (skat. application.properties).
            .csrf(csrf -> csrf.disable())
            // CORS pārvalda esošā CorsConfig caur WebMvcConfigurer.
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // Login, logout un /me ir publiski pieejami.
                .requestMatchers("/api/auth/**").permitAll()
                // Swagger / OpenAPI dokumentācija pieejama dev laikā.
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // Visiem citiem pieprasījumiem vajadzīga autentifikācija.
                .anyRequest().authenticated()
            )
            // Neautorizētam pieprasījumam atbild 401, nevis novirza uz login lapu.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
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
