-- F14 prasība: pievieno fiksētu lomas atslēgu (role_key) autorizācijai.
-- roleName paliek brīvi rediģējams UI; role_key ir nemainīgs identifikators kodā.

-- 1. Pievienojam kolonnu kā nullable, lai nesalauztu esošās rindas.
ALTER TABLE user_roles ADD COLUMN role_key VARCHAR(32);

-- 2. Saskaņo esošās latviešu lomas ar enum vērtībām.
UPDATE user_roles SET role_key = 'GUEST'             WHERE LOWER(role_name) = 'viesis';
UPDATE user_roles SET role_key = 'STUDENT'           WHERE LOWER(role_name) IN ('students', 'studējošais', 'studejosais');
UPDATE user_roles SET role_key = 'TEACHER'           WHERE LOWER(role_name) = 'pasniedzējs' OR LOWER(role_name) = 'pasniedzejs';
UPDATE user_roles SET role_key = 'PROGRAM_DIRECTOR'  WHERE LOWER(role_name) IN ('programmas direktors', 'studiju programmas direktors');
UPDATE user_roles SET role_key = 'ADMIN'             WHERE LOWER(role_name) = 'administrators';
UPDATE user_roles SET role_key = 'SYSTEM_ADMIN'      WHERE LOWER(role_name) IN ('sistēmas administrators', 'sistemas administrators');

-- 3. Ja kāda no 6 prasību lomām DB vēl nav, pievienojam to.
INSERT INTO user_roles (role_name, role_key)
SELECT 'Viesis', 'GUEST'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'GUEST');

INSERT INTO user_roles (role_name, role_key)
SELECT 'Students', 'STUDENT'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'STUDENT');

INSERT INTO user_roles (role_name, role_key)
SELECT 'Pasniedzējs', 'TEACHER'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'TEACHER');

INSERT INTO user_roles (role_name, role_key)
SELECT 'Programmas direktors', 'PROGRAM_DIRECTOR'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'PROGRAM_DIRECTOR');

INSERT INTO user_roles (role_name, role_key)
SELECT 'Administrators', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'ADMIN');

INSERT INTO user_roles (role_name, role_key)
SELECT 'Sistēmas administrators', 'SYSTEM_ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE role_key = 'SYSTEM_ADMIN');

-- 4. Tagad visām rindām ir role_key — uzliekam ierobežojumus.
ALTER TABLE user_roles ALTER COLUMN role_key SET NOT NULL;
ALTER TABLE user_roles ADD CONSTRAINT uk_user_roles_role_key UNIQUE (role_key);
ALTER TABLE user_roles ADD CONSTRAINT chk_user_roles_role_key
    CHECK (role_key IN ('GUEST', 'STUDENT', 'TEACHER', 'PROGRAM_DIRECTOR', 'ADMIN', 'SYSTEM_ADMIN'));
