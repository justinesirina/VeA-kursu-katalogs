package lv.venta.coursecatalog.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

/**
 * Aizkavē Flyway migrāciju izpildi līdz JPA inicializācijas beigām.
 *
 * Konteksts: V1-V10 migrācijas paredz, ka shēma jau eksistē (tās ALTER esošas tabulas).
 * Vēsturiski Hibernate (ddl-auto=update) shēmu izveidoja pie pirmā starta, tikai pēc
 * tam Flyway pielāgoja. Spring Boot noklusētā kārtība — Flyway pirms JPA — tāpēc
 * fresh DB Flyway sabrūk ar "relation does not exist" kļūdām.
 *
 * Šis konfigurācijas pievienojums:
 *   1. Aizvieto noklusēto Flyway autorun ar no-op stratēģiju (Flyway netiek palaists
 *      automātiski startup laikā).
 *   2. Pievieno ApplicationRunner, kas palaiž Flyway PĒC tam, kad visi Spring Bean
 *      ir inicializēti, ieskaitot JPA EntityManagerFactory (kas ar ddl-auto=update
 *      izveido shēmu fresh DB).
 *
 * Rezultāts:
 *   - Fresh DB: Hibernate izveido shēmu no entītijām -> Flyway baseline V10 -> V11 seed
 *   - Esošās DB: Hibernate validē/papildina -> Flyway turpina ar pending migrācijām
 */
@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy noopFlywayStrategy() {
        return flyway -> {
            // Apzināti tukšs — migrācija notiek caur FlywayPostInitRunner pēc JPA init.
        };
    }

    @Component
    public static class FlywayPostInitRunner implements ApplicationRunner {

        private final Flyway flyway;

        public FlywayPostInitRunner(Flyway flyway) {
            this.flyway = flyway;
        }

        @Override
        public void run(ApplicationArguments args) {
            flyway.migrate();
        }
    }
}
