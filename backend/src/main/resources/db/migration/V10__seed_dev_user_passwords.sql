-- F14 prasība: dev seed parole esošajiem lietotājiem ar e-pastu.
-- BCrypt hash atbilst paroli "parole123" (kopīga visiem dev kontiem).
-- Bez e-pasta lietotājiem paroli nepiešķir — viņi nevar pieslēgties.
-- Produkcijā paroles tiek iestatītas individuāli caur admin lietotāju pārvaldību.

UPDATE users
SET password_hash = '$2a$10$uQRU3iWejo0/T7Guf41igOFeKnx1ZmlQG0MDSfxg4aoMr01fzfB0.'
WHERE email IS NOT NULL AND password_hash IS NULL;
