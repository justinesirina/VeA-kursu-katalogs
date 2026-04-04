# ADR-001: Tehnoloģiju steka izvēle

## Statuss: Pieņemts

## Konteksts

VeA vajadzīga tīmekļa sistēma studiju kursu katalogu pārvaldībai. Sistēmai jānodrošina kursu aprakstu
veidošana, versiju uzturēšana un apstiprināšanas darbplūsma. Projekts ir bakalaura darbs, tāpēc svarīga
ir labi dokumentēta, izplatīta tehnoloģiju kombinācija ar plašu kopienas atbalstu.

## Lēmums

| Slānis | Tehnoloģija | Versija |
|--------|-------------|---------|
| Frontend | React + React Router v7 + Tailwind CSS + Axios | 19 |
| Backend | Spring Boot + Java | 3.2.3 / Java 17 |
| Datubāze | PostgreSQL | 15 |
| ORM | Hibernate (caur Spring Data JPA) | 6.4 |
| Konteiners | Docker + Docker Compose | — |

## Pamatojums

**Spring Boot** — labi pazīstams Java ekosistēmā, ar automātisku konfigurāciju, plašu JPA atbalstu
un iebūvētu validācijas mehānismu (`jakarta.validation`). Piemērots REST API izveidei.

**React** — komponentu balstīta UI bibliotēka ar aktīvu ekosistēmu. React Router v7 nodrošina
klienta puses navigāciju, Tailwind CSS — ātru stila iestrādi bez pielāgotu CSS failu rakstīšanas.

**PostgreSQL** — relāciju datubāze ar labu JPA/Hibernate atbalstu. Izvēlēta pār MySQL dēļ labāka
UUID atbalsta un skemu validācijas mehānismiem.

**Docker Compose** — vienota vide visam stekam. Izstrādē tiek palaists tikai `postgres-db`
konteineris; backend un frontend darbojas lokāli (VS Code + npm start).

## Sekas

**Pozitīvas:**
- Labi dokumentēts steks ar plašu kopienas atbalstu
- Spring Boot devtools nodrošina ātru restartēšanu izstrādē
- React ekosistēma ļauj viegli pievienot komponentus nākotnē

**Negatīvas:**
- Autorizācija (JWT vai sesijas) jāimplementē atsevišķi — nav iebūvēta SSO
- Hibernate LAZY/EAGER ielādes konfigurācija prasa uzmanību, lai izvairītos no N+1 vaicājumiem
- CORS konfigurācija jāuztur manuāli pie jaunu frontend izcelsmes pievienošanas
