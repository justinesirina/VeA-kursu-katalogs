-- F9 paplašinājums: papildu darbību kodi kursa darbību žurnālam.
-- Esošie F8 kodi (submit, approve, reject, reopen_to_draft) paliek nemainīti.

INSERT INTO course_version_actions (code, label, description) VALUES
    ('course_create',       'Kursa izveide',         'Izveidots jauns kurss.'),
    ('course_archive',      'Kursa arhivēšana',      'Kurss arhivēts (mīkstā dzēšana).'),
    ('course_restore',      'Kursa atjaunošana',     'Arhivēts kurss atjaunots.'),
    ('course_hard_delete',  'Kursa neatgriezeniska dzēšana', 'Arhivēts kurss neatgriezeniski izdzēsts.'),
    ('version_create',      'Versijas izveide',      'Izveidota jauna kursa versija.'),
    ('version_archive',     'Versijas arhivēšana',   'Versija arhivēta (mīkstā dzēšana).'),
    ('version_restore',     'Versijas atjaunošana',  'Arhivēta versija atjaunota.'),
    ('version_hard_delete', 'Versijas neatgriezeniska dzēšana', 'Arhivēta versija neatgriezeniski izdzēsta.')
ON CONFLICT (code) DO NOTHING;
