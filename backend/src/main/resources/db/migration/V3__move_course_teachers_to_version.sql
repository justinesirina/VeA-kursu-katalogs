-- Pārvieto CourseTeacher no Course uz CourseVersion (skat. V2 analogu komentāru).

ALTER TABLE course_teachers ADD COLUMN course_version_id UUID;

UPDATE course_teachers ct
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ct.course_id
      AND cv.deleted_at IS NULL
    ORDER BY cv.is_active DESC, cv.version_number DESC
    LIMIT 1
);

UPDATE course_teachers ct
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ct.course_id
    ORDER BY cv.version_number DESC
    LIMIT 1
)
WHERE course_version_id IS NULL;

DELETE FROM course_teachers WHERE course_version_id IS NULL;

ALTER TABLE course_teachers ALTER COLUMN course_version_id SET NOT NULL;

ALTER TABLE course_teachers
    ADD CONSTRAINT fk_course_teachers_version
    FOREIGN KEY (course_version_id) REFERENCES course_versions(id);

ALTER TABLE course_teachers DROP COLUMN course_id;
