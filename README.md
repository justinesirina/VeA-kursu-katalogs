# VeA studiju kursu kataloga sistēma

Bakalaura darba "Ventspils Augstskolas studiju kursu kataloga sistēmas
prototipa projektēšana un izstrāde" ietvaros izstrādāts sistēmas prototips
Ventspils Augstskolai: centralizēta platforma studiju kursu aprakstu
veidošanai, versiju pārvaldībai, apstiprināšanai un eksportēšanai PDF/DOCX formātā.

## Tehnoloģijas

React 19 + React Router v7 (frontend); Spring Boot 3.2 + Java 17 (backend);
PostgreSQL 15 (datubāze); Docker Compose (palaišana)

## Palaišana

Nepieciešams: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v25 vai jaunāks), ~8 GB brīvas vietas diskā, ~1 GB RAM.

```bash
git clone https://github.com/justinesirina/VeA-kursu-katalogs.git
cd VeA-kursu-katalogs
docker compose up --build
```

Pirmais build aizņem aptuveni 10–15 minūtes. Docker lejupielādē Maven, JDK un Node bāzes attēlus un pārbūvē backend Maven projektu konteinerī. Nākamajās palaišanas reizēs sistēma startē ~30 sekundēs.

Kad visi konteineri ir startēti, sistēma pieejama:

- **Frontend (lietotāja saskarne):** http://localhost:3000
- **Backend API:** http://localhost:8080
- **Swagger UI (API dokumentācija):** http://localhost:8080/swagger-ui.html

Backend gaida, līdz PostgreSQL ir gatava pieņemt savienojumus (`healthcheck`), tad Flyway izpilda visas V1–V11 migrācijas un sagatavo demo datu kopu.

## Demo lietotāji

Visiem dev lietotājiem parole: `parole123`

| E-pasts | Loma |
|---------|------|
| `sysadmin@venta.lv` | Sistēmas administrators |
| `administrators@venta.lv` | Administrators |
| `estere@venta.lv` | Programmas direktors |
| `galina@venta.lv` | Programmas direktors |
| `karina@venta.lv` | Pasniedzējs |
| `karlis@venta.lv` | Pasniedzējs |
| `vairis@venta.lv` | Pasniedzējs |
| `janis@mail.lv` | Students |

Demo datu kopa satur 11 kursus, 23 versijas dažādos apstiprināšanas statusos (Melnraksts, Iesniegts, Apstiprināts, Noraidīts, Arhivēts) un pilnu referenču datu kopu (akadēmiskie gadi, semestri, fakultātes, valodas, vērtēšanas komponentes, literatūras tipi).

## Apturēšana

```bash
docker compose down       # aptur konteinerus; datubāzes saturs paliek ./postgres_data/ mapē
docker compose down -v    # aptur + dzēš anonīmos Docker volume (postgres_data paliek, jo izmanto bind mount)
```

Pilnīga datu nodzēšana fresh demo nolūkos:

```bash
docker compose down
rm -rf postgres_data
docker compose up --build
```

## Repository struktūra

```
backend/              Spring Boot REST API (Java 17, Maven)
  src/main/resources/db/migration/   Flyway DB migrācijas (V1–V11)
frontend/reactapp/    React SPA (Node 20, npm)
docker-compose.yml    Orķestrē postgres-db + backend-app + frontend-app
LICENSE               MIT
```

## Konteksts

Bakalaura darba "Ventspils Augstskolas studiju kursu kataloga sistēmas prototipa projektēšana un izstrāde" praktiskais prototips. 2026. gads.
Autors: Justīne Širina
