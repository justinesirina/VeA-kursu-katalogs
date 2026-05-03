-- F9 paplašinājums: pārvēršam CourseVersionLog par vispārīgu kursu darbību žurnālu.
-- Atļaujam course_version_id un user_id būt null (kursa līmeņa darbībām versija nav
-- nepieciešama; sistēmas darbības var notikt bez konkrēta lietotāja).
-- Pievienojam course_id, lai katrs ieraksts vienmēr būtu saistīts ar konkrētu kursu.

ALTER TABLE course_version_log ALTER COLUMN course_version_id DROP NOT NULL;
ALTER TABLE course_version_log ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE course_version_log ADD COLUMN IF NOT EXISTS course_id UUID;

-- Aizpildām course_id no saistītās versijas esošajiem ierakstiem.
UPDATE course_version_log l
SET course_id = (
    SELECT cv.course_id
    FROM course_versions cv
    WHERE cv.id = l.course_version_id
)
WHERE l.course_id IS NULL AND l.course_version_id IS NOT NULL;

-- FK uz courses (nullable, jo drošības labad kāds vēsturisks ieraksts bez piesaistes
-- varētu palikt; jaunajiem ierakstiem to vienmēr aizpildām servisa līmenī).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_course_version_log_course'
    ) THEN
        ALTER TABLE course_version_log
            ADD CONSTRAINT fk_course_version_log_course
            FOREIGN KEY (course_id) REFERENCES courses(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_course_version_log_course_id ON course_version_log(course_id);
