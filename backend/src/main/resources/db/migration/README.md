# DB migrāciju protokols (Flyway)

Šī mape satur visas DB shēmas izmaiņas hronoloģiskā secībā. Flyway tos automātiski palaiž backend startā.

## Konvencija

- Faila vārds: `V<numurs>__<īss_apraksts>.sql` (divi `_` starp numuru un aprakstu).
- `<numurs>` ir secīgs vesels skaitlis (V1, V2, V3, …). Nelieto datumus — secība ir svarīgāka par tieši laiku, un Flyway prasa unikālus numurus.
- `<īss_apraksts>` izmantot snake_case angliski (saskaņā ar SQL identifikatoru stilu).

## Process pievienojot jaunu migrāciju

1. Izveido jaunu failu `V<nākamais>__<apraksts>.sql`.
2. Raksti SQL DDL/DML, kas vajadzīgs entitātes izmaiņām.
3. Restartē backend → Flyway palaiž migrāciju automātiski un pieraksta `flyway_schema_history` tabulā.
4. Ja migrācija neizdodas, Flyway atzīmē to kā failed un nepalaiž turpmākās. Izlabo SQL, izdzēs neveiksmīgo `flyway_schema_history` rindu un mēģini vēlreiz.

## Baseline

Pirmā integrācija ar esošu DB izmanto `spring.flyway.baseline-on-migrate=true` (skat. `application.properties`). Tas nozīmē — ja `flyway_schema_history` tabula vēl neeksistē, Flyway izveido baseline ierakstu ar versiju 0 un sāk no V1.

## Sasaiste ar entītēm

`spring.jpa.hibernate.ddl-auto=validate` — Hibernate vairs nemaina shēmu, tikai pārbauda, ka tabulas atbilst entītijām. Visu izmaiņu plūsma:

1. Pievieno/maini `@Entity` lauku
2. Izveido jaunu `V<n>__*.sql` migrāciju, kas piemēro to pašu izmaiņu DB
3. Restartē backend → Flyway izpilda migrāciju, Hibernate validē

Aizmirstot 2. soli, backend nestartēs (validate kļūda).

## Esošās migrācijas

Apraksts par katru migrāciju ir komentārā faila augšā. Failu saraksts (saglabāts hronoloģiski):

- `V1__remove_courseversion_slug.sql` — noņem nelietojamo `slug` kolonnu no `course_versions`
- `V2__move_course_authors_to_version.sql` — pārvieto `CourseAuthor` no `Course` uz `CourseVersion`
- `V3__move_course_teachers_to_version.sql` — pārvieto `CourseTeacher` no `Course` uz `CourseVersion`
- `V4__move_course_to_study_programs_to_version.sql` — pārvieto `CourseToStudyPrograms` no `Course` uz `CourseVersion`
