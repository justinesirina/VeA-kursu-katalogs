-- Pārvieto CourseAuthor no Course uz CourseVersion, lai pasniedzēju saraksti būtu versionēti.
-- F2/F19 prasība: katra versija var saturēt savu autoru sarakstu.
--
-- Migrācijas plāns:
--   1. Pievieno course_version_id kolonnu (nullable sākumā)
--   2. Aizpilda esošos ierakstus ar aktīvās versijas ID (vai jaunākās, ja nav aktīvās)
--   3. Padara course_version_id NOT NULL un pievieno FK
--   4. Noņem course_id kolonnu

ALTER TABLE course_authors ADD COLUMN course_version_id UUID;

UPDATE course_authors ca
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ca.course_id
      AND cv.deleted_at IS NULL
    ORDER BY cv.is_active DESC, cv.version_number DESC
    LIMIT 1
);

-- Ja kādam autoram nebija nevienas aktīvas versijas (piem., kursam visas versijas arhivētas),
-- tad ņem jebkuru versiju (ieskaitot arhivētas), lai nezaudētu datus.
UPDATE course_authors ca
SET course_version_id = (
    SELECT cv.id
    FROM course_versions cv
    WHERE cv.course_id = ca.course_id
    ORDER BY cv.version_number DESC
    LIMIT 1
)
WHERE course_version_id IS NULL;

-- Ja joprojām null (kursam vispār nav versijas), tad dzēš autoru — tas ir neatkarīgs ieraksts bez nozīmes
DELETE FROM course_authors WHERE course_version_id IS NULL;

ALTER TABLE course_authors ALTER COLUMN course_version_id SET NOT NULL;

ALTER TABLE course_authors
    ADD CONSTRAINT fk_course_authors_version
    FOREIGN KEY (course_version_id) REFERENCES course_versions(id);

ALTER TABLE course_authors DROP COLUMN course_id;
