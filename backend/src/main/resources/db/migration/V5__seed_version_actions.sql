-- F8: Seed CourseVersionAction codes used by the approval workflow.
-- Idempotent: ON CONFLICT (code) DO NOTHING relies on the unique constraint
-- already declared on the column.

INSERT INTO course_version_actions (code, label, description) VALUES
    ('submit',          'Iesniegšana',         'Versija iesniegta apstiprināšanai.'),
    ('approve',         'Apstiprināšana',      'Versija apstiprināta.'),
    ('reject',          'Noraidīšana',         'Versija noraidīta atpakaļ autoram.'),
    ('reopen_to_draft', 'Atvēršana labošanai', 'Noraidīta versija atvērta labošanai (atgriezta Melnraksta statusā).')
ON CONFLICT (code) DO NOTHING;
