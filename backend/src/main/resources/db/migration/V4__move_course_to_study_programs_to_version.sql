-- Pārvieto CourseToStudyPrograms no Course uz CourseVersion.
-- F2/F19: programmu sasaistes ir versionētas; jauna versija var pievienot/noņemt programmas
-- nemainot iepriekšējās apstiprinātās versijas saturu.

ALTER TABLE course_to_study_programs ADD COLUMN course_version_id UUID;

UPDATE course_to_study_programs ctsp
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ctsp.course_id
      AND cv.deleted_at IS NULL
    ORDER BY cv.is_active DESC, cv.version_number DESC
    LIMIT 1
);

UPDATE course_to_study_programs ctsp
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ctsp.course_id
    ORDER BY cv.version_number DESC
    LIMIT 1
)
WHERE course_version_id IS NULL;

DELETE FROM course_to_study_programs WHERE course_version_id IS NULL;

ALTER TABLE course_to_study_programs ALTER COLUMN course_version_id SET NOT NULL;

ALTER TABLE course_to_study_programs
    ADD CONSTRAINT fk_course_to_study_programs_version
    FOREIGN KEY (course_version_id) REFERENCES course_versions(id);

ALTER TABLE course_to_study_programs DROP COLUMN course_id;
