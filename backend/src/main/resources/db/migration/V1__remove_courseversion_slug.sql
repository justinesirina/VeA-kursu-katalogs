-- Noņem 'slug' kolonnu no course_versions tabulas.
-- Lauks bija paredzēts URL-draudzīgam identifikatoram versijām, bet praktiski netika izmantots
-- (frontend rāda versiju Nr., backend identifikē pēc UUID).

ALTER TABLE course_versions DROP COLUMN IF EXISTS slug;
