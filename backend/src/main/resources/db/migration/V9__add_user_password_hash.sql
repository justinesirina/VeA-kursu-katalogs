-- F14 prasība: pievieno paroles hash lauku autentifikācijai (BCrypt).
-- Nullable, jo esošajiem lietotājiem parole vēl nav iestatīta — to dara
-- atsevišķā dev seed migrācijā vai admin caur lietotāju pārvaldību.

ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
