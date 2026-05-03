import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/axiosConfig';
import { useToast } from './ui/ToastProvider';
import StickyBar from './ui/StickyBar';
import WarningDialog from './ui/WarningDialog';
import ApprovalActionDialog from './ui/ApprovalActionDialog';
import CourseInfoBasicSection from './courseinfo/CourseInfoBasicSection';
import CourseTopicsSection from './courseinfo/CourseTopicsSection';
import CourseAssessmentSection from './courseinfo/CourseAssessmentSection';
import CourseLiteratureSection from './courseinfo/CourseLiteratureSection';
import CourseSKRSection from './courseinfo/CourseSKRSection';
import CourseCalendarSection from './courseinfo/CourseCalendarSection';
import { statusBadgeClass, STATUS_NAMES } from '../utils/statusBadge';
import { submitVersion, approveVersion, rejectVersion, reopenVersion } from '../services/approvalService';
import { useCurrentUserId } from './ui/CurrentUserSwitcher';

/**
 * Izvēlas rediģējamo versiju no kursa versiju saraksta.
 * Prioritāte: ?version=<uuid> URL parametrs → jaunākā pēc versionNumber → isActive=true.
 */
function pickVersion(versions, requestedId) {
    if (!versions || versions.length === 0) return null;
    if (requestedId) {
        const match = versions.find(v => v.id === requestedId);
        if (match) return match;
    }
    return [...versions].sort((a, b) => {
        const cmp = (b.versionNumber || 0) - (a.versionNumber || 0);
        if (cmp !== 0) return cmp;
        return (b.active === true ? 1 : 0) - (a.active === true ? 1 : 0);
    })[0];
}

const AUTHOR_ROLES = ['Autors', 'Līdzautors'];
const TEACHER_ROLES = ['Atbildīgais mācībspēks', 'Mācībspēks'];
const STAFF_ROLE_FILTER = ['Pasniedzējs', 'Programmas direktors'];

const TABS = [
    { key: 'pamatdati',  label: 'Pamatdati' },
    { key: 'apraksts',   label: 'Apraksts' },
    { key: 'skr',        label: 'Kursa rezultāti' },
    { key: 'temas',      label: 'Tēmas' },
    { key: 'kalendars',  label: 'Kalendārs' },
    { key: 'vertesana',  label: 'Vērtēšana' },
    { key: 'literatura', label: 'Literatūra' },
];

function CourseEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedVersionId = searchParams.get('version');
    const showToast = useToast();

    // Tab 0 — Course + Version state
    const [courseData, setCourseData] = useState(null);
    const [versionData, setVersionData] = useState(null);
    const [versionId, setVersionId] = useState(null);

    // Brīdinājuma dialogs apstiprinātas versijas rediģēšanai
    const [showApprovedWarning, setShowApprovedWarning] = useState(false);
    const [duplicating, setDuplicating] = useState(false);

    // F8 — apstiprināšanas plūsmas dialogs (submit/approve/reject/reopen)
    const [approvalDialog, setApprovalDialog] = useState(null); // { kind, ... }
    const [approvalSubmitting, setApprovalSubmitting] = useState(false);
    const [versionStatusName, setVersionStatusName] = useState(null);
    const [versionApprovalMeta, setVersionApprovalMeta] = useState({
        approvalDate: '', decisionNumber: '', decisionReference: ''
    });
    const currentUserId = useCurrentUserId();

    // Pamatdati cilnes (Tab 0) izmaiņu izsekošana — brīdina pirms iziešanas, ja ir nesaglabātas izmaiņas
    const initialSnapshotRef = useRef(null);
    const isDirty = useMemo(() => {
        if (!initialSnapshotRef.current || !courseData || !versionData) return false;
        return JSON.stringify({ c: courseData, v: versionData }) !== initialSnapshotRef.current;
    }, [courseData, versionData]);

    // Tab 0 — Autors un mācībspēks
    const [authors, setAuthors] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [users, setUsers] = useState([]);
    const [authorSearch, setAuthorSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [selectedAuthorRole, setSelectedAuthorRole] = useState('Autors');
    const [selectedTeacherRole, setSelectedTeacherRole] = useState('Mācībspēks');
    const [staffSaving, setStaffSaving] = useState(false);

    // Tabs 1–5 — CourseInfo state
    const [courseInfoId, setCourseInfoId] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);

    // Studiju programmas
    const [studyPrograms, setStudyPrograms] = useState([]);        // visas pieejamās
    const [selectedProgramId, setSelectedProgramId] = useState('');
    const [selectedPartId, setSelectedPartId] = useState('');
    const [programSaving, setProgramSaving] = useState(false);

    // Shared
    const [lookups, setLookups] = useState({
        academicYears: [], semesters: [], faculties: [], versionStatuses: [],
        assessmentForms: [], assessmentComponents: [], selfStudyActivities: [],
        literatureTypes: [], resultsCategories: [], sessionTypes: [],
        studyProgramParts: []
    });
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [
                    courseRes, versionsRes,
                    ayRes, semRes, facRes, stRes,
                    afRes, acRes, ssaRes, ltRes, rcRes, sessionTypesRes,
                    usersRes,
                    spRes, sppRes
                ] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/course-versions/by-course/${id}`),
                    api.get('/academic-years'),
                    api.get('/semesters'),
                    api.get('/faculties'),
                    api.get('/version-statuses'),
                    api.get('/assessment-forms'),
                    api.get('/assessment-components'),
                    api.get('/self-study-activities'),
                    api.get('/literature-types'),
                    api.get('/results-categories'),
                    api.get('/session-types'),
                    api.get('/users'),
                    api.get('/study-programs'),
                    api.get('/study-program-parts'),
                ]);

                const course = courseRes.data;
                const versions = versionsRes.data;
                const version = pickVersion(versions, requestedVersionId);

                // Versijas-specifiskie dati: autori, pasniedzēji un CourseInfo detaļas
                // (catch — jaunajām versijām CourseInfo var vēl neeksistēt)
                const [authorsRes, teachersRes, detailsRes] = version
                    ? await Promise.all([
                        api.get(`/course-authors/by-version/${version.id}`),
                        api.get(`/course-teachers/by-version/${version.id}`),
                        api.get(`/course-info/details-by-version/${version.id}`)
                            .catch(() => ({ data: null })),
                    ])
                    : [{ data: [] }, { data: [] }, { data: null }];

                setCourseData({
                    titleLv: course.titleLv || '',
                    titleEn: course.titleEn || '',
                    courseCode: course.courseCode || '',
                    slug: course.slug || '',
                    credits: course.credits || 2,
                    active: course.active !== undefined ? course.active : true,
                    archived: course.archived !== undefined ? course.archived : false,
                    deletedAt: course.deletedAt || null
                });

                if (version) {
                    setVersionId(version.id);
                    setVersionData({
                        academicYearId: version.academicYear ? String(version.academicYear.id) : '',
                        semesterId: version.semester ? String(version.semester.id) : '',
                        facultyId: version.faculty ? String(version.faculty.id) : '',
                        statusId: version.status ? String(version.status.id) : '',
                        versionNumber: version.versionNumber || 1,
                        isActive: version.active !== undefined ? version.active : true
                    });
                    setVersionStatusName(version.status?.name || null);
                    setVersionApprovalMeta({
                        approvalDate: version.approvalDate || '',
                        decisionNumber: version.decisionNumber || '',
                        decisionReference: version.decisionReference || '',
                    });

                    if (version.status?.name === STATUS_NAMES.APPROVED) {
                        setShowApprovedWarning(true);
                    }
                } else {
                    setVersionData({
                        academicYearId: '', semesterId: '', facultyId: '',
                        statusId: '', versionNumber: 1, isActive: true
                    });
                    setVersionStatusName(null);
                    setVersionApprovalMeta({ approvalDate: '', decisionNumber: '', decisionReference: '' });
                }

                const details = detailsRes.data || null;
                setCourseDetails(details);
                setCourseInfoId(details ? details.courseInfoId || null : null);

                setLookups({
                    academicYears: ayRes.data,
                    semesters: semRes.data,
                    faculties: facRes.data,
                    versionStatuses: stRes.data,
                    assessmentForms: afRes.data,
                    assessmentComponents: acRes.data,
                    selfStudyActivities: ssaRes.data,
                    literatureTypes: ltRes.data,
                    resultsCategories: rcRes.data,
                    sessionTypes: sessionTypesRes.data,
                    studyProgramParts: sppRes.data || [],
                });
                setAuthors(authorsRes.data || []);
                setTeachers(teachersRes.data || []);
                setUsers(usersRes.data || []);
                setStudyPrograms(spRes.data || []);
            } catch (err) {
                console.error('Kļūda ielādējot rediģēšanas datus:', err);
                showToast(`Neizdevās ielādēt kursa datus.`, 'error');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, requestedVersionId]);

    // Pēc tam, kad sākotnējie dati ielādēti, fiksējam snapshot izmaiņu izsekošanai
    useEffect(() => {
        if (!loading && courseData && versionData && initialSnapshotRef.current === null) {
            initialSnapshotRef.current = JSON.stringify({ c: courseData, v: versionData });
        }
    }, [loading, courseData, versionData]);

    // Browser close/refresh — brīdina, ja ir nesaglabātas izmaiņas.
    // Iekšējās React Router navigācijas šobrīd nav bloķētas (varētu ieviest pāreju uz data router arhitektūru).
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const handleDuplicateVersion = async () => {
        if (!versionId || duplicating) return;
        setDuplicating(true);
        try {
            const res = await api.post(`/course-versions/${versionId}/duplicate`);
            const newVersion = res.data;
            setShowApprovedWarning(false);
            showToast(`Izveidota jauna versija (Nr. ${newVersion.versionNumber}). Status: Melnraksts.`);
            navigate(`/courses/${id}/edit?version=${newVersion.id}`);
        } catch (err) {
            console.error('Kļūda dublējot versiju:', err);
            showToast('Neizdevās izveidot jaunu versiju. Mēģini vēlreiz.', 'error');
        } finally {
            setDuplicating(false);
        }
    };

    const handleCancelApprovedEdit = () => {
        setShowApprovedWarning(false);
        navigate(`/courses/${id}`);
    };

    // F8 — pārlādē versijas datus pēc statusa pārejas (lai attēlotu jaunu statusu un metadatus).
    // Atjauno arī isDirty snapshot, jo serveris ir veiksmīgi mainījis stāvokli.
    const refreshVersion = async (updated) => {
        if (!updated) return;
        setVersionStatusName(updated.status?.name || null);
        setVersionApprovalMeta({
            approvalDate: updated.approvalDate || '',
            decisionNumber: updated.decisionNumber || '',
            decisionReference: updated.decisionReference || '',
        });
        setVersionData(prev => {
            if (!prev) return prev;
            const next = {
                ...prev,
                statusId: updated.status ? String(updated.status.id) : prev.statusId,
                isActive: updated.active !== undefined ? updated.active : prev.isActive,
            };
            if (courseData) {
                initialSnapshotRef.current = JSON.stringify({ c: courseData, v: next });
            }
            return next;
        });
    };

    const handleApprovalAction = async (kind, payload) => {
        if (!versionId) {
            showToast('Versija nav atrasta.', 'error');
            return;
        }
        if (currentUserId == null) {
            showToast('Vispirms izvēlies aktīvo lietotāju (augšējā joslā).', 'error');
            return;
        }
        setApprovalSubmitting(true);
        try {
            let updated;
            if (kind === 'submit')      updated = await submitVersion(versionId, payload?.comment);
            else if (kind === 'approve') updated = await approveVersion(versionId, payload);
            else if (kind === 'reject')  updated = await rejectVersion(versionId, payload?.comment);
            else if (kind === 'reopen')  updated = await reopenVersion(versionId, payload?.comment);
            await refreshVersion(updated);

            const messageByKind = {
                submit:  'Versija iesniegta apstiprināšanai.',
                approve: 'Versija apstiprināta.',
                reject:  'Versija noraidīta.',
                reopen:  'Versija atvērta labošanai (Melnraksts).',
            };
            showToast(messageByKind[kind] || 'Darbība veiksmīga.');
            setApprovalDialog(null);
        } catch (err) {
            console.error('F8 darbības kļūda:', err);
            const msg = err?.response?.data || err?.message || 'Neizdevās izpildīt darbību.';
            showToast(typeof msg === 'string' ? msg : 'Neizdevās izpildīt darbību.', 'error');
        } finally {
            setApprovalSubmitting(false);
        }
    };

    const blockNonNumeric = e => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };

    // Atļauj tikai kursam atbilstošas rakstzīmes nosaukuma laukos
    const sanitizeTitle = (val) =>
        val.replace(/[<>"';`\\={}[\]]/g, '').replace(/https?:\/\/\S*/gi, '');

    const isUrl = (val) => /https?:\/\//i.test(val);

    const handleSave = async () => {
        const errors = {};
        if (!courseData.titleLv.trim())
            errors.titleLv = 'Nosaukums latviski ir obligāts';
        else if (isUrl(courseData.titleLv))
            errors.titleLv = 'Nosaukums nevar būt URL adrese';
        if (courseData.titleEn && isUrl(courseData.titleEn))
            errors.titleEn = 'Nosaukums nevar būt URL adrese';
        if (!courseData.courseCode.trim())
            errors.courseCode = 'Kursa kods ir obligāts';
        else if (!/^[A-Za-z0-9]{1,10}$/.test(courseData.courseCode.trim()))
            errors.courseCode = 'Kods var saturēt tikai burtus un ciparus (maks. 10 zīmes)';
        if (!courseData.credits || Number(courseData.credits) < 1)
            errors.credits = 'Kredītpunkti ir obligāti (min. 1)';
        if (!versionData.academicYearId) errors.academicYearId = 'Akadēmiskais gads ir obligāts';
        if (!versionData.semesterId) errors.semesterId = 'Semestris ir obligāts';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            showToast('Pārbaudi iezīmētos obligātos laukus.', 'error');
            return;
        }
        setFieldErrors({});
        setSaving(true);
        try {
            await api.put(`/courses/${id}`, {
                titleLv: sanitizeTitle(courseData.titleLv.trim()),
                titleEn: courseData.titleEn ? sanitizeTitle(courseData.titleEn.trim()) || null : null,
                courseCode: courseData.courseCode.trim().toUpperCase(),
                slug: courseData.slug || null,
                credits: Number(courseData.credits),
                active: courseData.active,
                archived: courseData.archived,
                deletedAt: courseData.deletedAt
            });

            // F8: status, isActive un apstiprināšanas metadati netiek sūtīti — backend tos
            // pārmanto no DB un drīkst mainīt tikai caur /submit, /approve, /reject, /reopen.
            const versionPayload = {
                course: { id },
                academicYear: { id: Number(versionData.academicYearId) },
                semester: { id: Number(versionData.semesterId) },
                faculty: versionData.facultyId ? { id: Number(versionData.facultyId) } : null,
                versionNumber: versionData.versionNumber,
            };
            if (versionId) {
                await api.put(`/course-versions/${versionId}`, versionPayload);
            } else {
                const res = await api.post('/course-versions', versionPayload);
                setVersionId(res.data.id);
            }
            // Atjauno snapshot — pēc save state vairs nav "dirty"
            initialSnapshotRef.current = JSON.stringify({ c: courseData, v: versionData });
            showToast('Pamatdati saglabāti veiksmīgi!');
        } catch (err) {
            console.error('Kļūda saglabājot izmaiņas:', err);
            showToast('Neizdevās saglabāt izmaiņas. Pārbaudi ievades datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const reloadStaff = async () => {
        if (!versionId) return;
        const [aRes, tRes] = await Promise.all([
            api.get(`/course-authors/by-version/${versionId}`),
            api.get(`/course-teachers/by-version/${versionId}`),
        ]);
        setAuthors(aRes.data || []);
        setTeachers(tRes.data || []);
    };

    const filterUsers = (query, excluded) => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        const excludedIds = new Set(excluded.map(a => a.user?.id));
        return users
            .filter(u => STAFF_ROLE_FILTER.includes(u.role?.roleName))
            .filter(u => !excludedIds.has(u.id))
            .filter(u => u.name.toLowerCase().includes(q) || u.surname.toLowerCase().includes(q))
            .slice(0, 8);
    };

    const personLabel = (u) => {
        const name = [u.name, u.surname].filter(Boolean).join(' ');
        const extra = [u.position, u.academicDegree].filter(Boolean).join(', ');
        return extra ? `${name}, ${extra}` : name;
    };

    const handleAddAuthor = async (userId) => {
        if (!versionId) { showToast('Vispirms saglabā versiju.', 'error'); return; }
        setStaffSaving(true);
        try {
            await api.post('/course-authors', { courseVersion: { id: versionId }, user: { id: Number(userId) }, role: selectedAuthorRole });
            setAuthorSearch('');
            await reloadStaff();
        } catch { showToast('Neizdevās pievienot autoru.', 'error'); }
        finally { setStaffSaving(false); }
    };

    const handleDeleteAuthor = async (authorId) => {
        setStaffSaving(true);
        try {
            await api.delete(`/course-authors/${authorId}`);
            await reloadStaff();
        } catch { showToast('Neizdevās dzēst autoru.', 'error'); }
        finally { setStaffSaving(false); }
    };

    const handleAddTeacher = async (userId) => {
        if (!versionId) { showToast('Vispirms saglabā versiju.', 'error'); return; }
        const hasAtbildigais = teachers.some(t => t.role === 'Atbildīgais mācībspēks');
        setStaffSaving(true);
        try {
            await api.post('/course-teachers', { courseVersion: { id: versionId }, user: { id: Number(userId) }, role: selectedTeacherRole });
            setTeacherSearch('');
            setSelectedTeacherRole('Mācībspēks');
            await reloadStaff();
        } catch { showToast('Neizdevās pievienot mācībspēku.', 'error'); }
        finally { setStaffSaving(false); }
    };

    const handleDeleteTeacher = async (teacherId) => {
        setStaffSaving(true);
        try {
            await api.delete(`/course-teachers/${teacherId}`);
            await reloadStaff();
        } catch { showToast('Neizdevās dzēst mācībspēku.', 'error'); }
        finally { setStaffSaving(false); }
    };

    const handleAddStudyProgram = async () => {
        if (!selectedProgramId) return;
        if (!versionId) { showToast('Vispirms saglabā versiju.', 'error'); return; }
        setProgramSaving(true);
        try {
            await api.post('/course-to-study-programs', {
                courseVersion: { id: versionId },
                program: { id: Number(selectedProgramId) },
                programPart: selectedPartId ? { id: Number(selectedPartId) } : null,
            });
            setSelectedProgramId('');
            setSelectedPartId('');
            handleSectionSaved();
        } catch { showToast('Neizdevās pievienot programmu.', 'error'); }
        finally { setProgramSaving(false); }
    };

    const handleDeleteStudyProgram = async (linkId) => {
        setProgramSaving(true);
        try {
            await api.delete(`/course-to-study-programs/${linkId}`);
            handleSectionSaved();
        } catch { showToast('Neizdevās noņemt programmu.', 'error'); }
        finally { setProgramSaving(false); }
    };

    const handleSectionSaved = () => {
        if (!versionId) return;
        api.get(`/course-info/details-by-version/${versionId}`)
            .then(res => {
                setCourseDetails(res.data);
                setCourseInfoId(res.data?.courseInfoId || null);
            });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē datus...</div>;

    const inputBase = "w-full p-2 border rounded focus:ring-1 outline-none";
    const inputOk  = `${inputBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const inputErr = `${inputBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const inputClass = (field) => fieldErrors[field] ? inputErr : inputOk;
    const inputClassPlain = inputOk;
    const labelClass = "block text-sm font-medium text-vea-neutral mb-1";
    // fieldErrors satur kļūdas ziņojumu kā tekstu
    const FieldError = ({ field }) =>
        fieldErrors[field] ? <p className="text-red-500 text-sm mt-0.5">{fieldErrors[field]}</p> : null;

    const isApproved  = versionStatusName === STATUS_NAMES.APPROVED;
    const isDraft     = versionStatusName === STATUS_NAMES.DRAFT;
    const isSubmitted = versionStatusName === STATUS_NAMES.SUBMITTED;
    const isRejected  = versionStatusName === STATUS_NAMES.REJECTED;

    const dialogConfig = {
        submit: {
            title: 'Iesniegt apstiprināšanai',
            description: <p>Versija Nr. {versionData?.versionNumber} tiks nodota Programmas direktoram apstiprināšanai. Pēc iesniegšanas to vairs nevarēsi rediģēt, ja vien tā netiks noraidīta.</p>,
            fields: [{ name: 'comment', label: 'Komentārs (neobligāts)', type: 'textarea' }],
            primaryLabel: 'Iesniegt',
            primaryTone: 'success',
        },
        approve: {
            title: 'Apstiprināt versiju',
            description: <p>Apstiprinot versiju, tā kļūs aktīvā, un iepriekšējā aktīvā versija (ja tāda ir) automātiski tiks deaktivizēta.</p>,
            fields: [
                { name: 'decisionNumber',    label: 'Lēmuma numurs',     type: 'text', required: true, placeholder: 'Piem.: Nr. ITF-2026/05' },
                { name: 'approvalDate',      label: 'Apstiprināšanas datums', type: 'date', defaultValue: new Date().toISOString().slice(0, 10) },
                { name: 'decisionReference', label: 'Atsauce (neobligāti)', type: 'text', placeholder: 'Piem.: ITF domes sēde' },
                { name: 'comment',           label: 'Komentārs (neobligāts)', type: 'textarea' },
            ],
            primaryLabel: 'Apstiprināt',
            primaryTone: 'success',
        },
        reject: {
            title: 'Noraidīt versiju',
            description: <p>Lūdzu, norādi noraidījuma iemeslu! Pamatojums tiks ierakstīts versijas žurnālā un būs redzams autoram.</p>,
            fields: [{ name: 'comment', label: 'Noraidījuma iemesls', type: 'textarea', required: true }],
            primaryLabel: 'Noraidīt',
            primaryTone: 'danger',
        },
        reopen: {
            title: 'Atvērt labošanai',
            description: <p>Versija atgriezīsies <span className="font-semibold">Melnraksts</span> statusā. Pēc labojumiem to varēs iesniegt no jauna.</p>,
            fields: [{ name: 'comment', label: 'Komentārs (neobligāts)', type: 'textarea' }],
            primaryLabel: 'Atvērt labošanai',
            primaryTone: 'warning',
        },
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <WarningDialog
                open={showApprovedWarning}
                title="Apstiprinātas versijas rediģēšana"
                description={
                    <p>
                        Versijas Nr. {versionData?.versionNumber} statuss ir <span className="font-semibold">Apstiprināts</span>.
                        Apstiprinātu versiju nevar mainīt — lai veiktu labojumus, jāizveido jauna versija.
                    </p>
                }
                primaryLabel={duplicating ? 'Veido…' : 'Veidot jaunu versiju'}
                onPrimary={handleDuplicateVersion}
                onClose={handleCancelApprovedEdit}
            />

            {approvalDialog && dialogConfig[approvalDialog] && (
                <ApprovalActionDialog
                    open={true}
                    title={dialogConfig[approvalDialog].title}
                    description={dialogConfig[approvalDialog].description}
                    fields={dialogConfig[approvalDialog].fields}
                    primaryLabel={dialogConfig[approvalDialog].primaryLabel}
                    primaryTone={dialogConfig[approvalDialog].primaryTone}
                    submitting={approvalSubmitting}
                    onConfirm={(payload) => handleApprovalAction(approvalDialog, payload)}
                    onClose={() => approvalSubmitting ? null : setApprovalDialog(null)}
                />
            )}

            {/* F8 — versijas darbību panelis */}
            {versionId && versionStatusName && (
                <section className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm text-vea-text">
                        <span className="text-gray-500">Versija Nr. {versionData?.versionNumber}. Statuss: </span>
                        <span className={statusBadgeClass(versionStatusName)}>{versionStatusName}</span>
                        {versionData?.isActive && (
                            <span className="vea-badge bg-vea-green-light text-vea-green">Aktīvā</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {isDraft && (
                            <button type="button" onClick={() => setApprovalDialog('submit')}
                                className="bg-vea-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-vea-green-dark transition-colors">
                                Iesniegt apstiprināšanai
                            </button>
                        )}
                        {isSubmitted && (
                            <>
                                <button type="button" onClick={() => setApprovalDialog('approve')}
                                    className="bg-vea-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-vea-green-dark transition-colors">
                                    Apstiprināt
                                </button>
                                <button type="button" onClick={() => setApprovalDialog('reject')}
                                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors">
                                    Noraidīt
                                </button>
                            </>
                        )}
                        {isRejected && (
                            <button type="button" onClick={() => setApprovalDialog('reopen')}
                                className="bg-vea-orange text-white px-4 py-2 rounded text-sm font-medium hover:bg-vea-orange/90 transition-colors">
                                Atvērt labošanai
                            </button>
                        )}
                        {isApproved && (
                            <span className="text-xs text-gray-500 italic">
                                Apstiprinātu versiju nevar mainīt! Izveido jaunu, lai veiktu labojumus.
                            </span>
                        )}
                    </div>
                </section>
            )}

            {/* Tab navigation */}
            <nav className="flex border-b border-gray-200 overflow-x-auto" aria-label="Rediģēšanas sadaļas">
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(idx)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                            activeTab === idx
                                ? 'border-vea-green text-vea-green'
                                : 'border-transparent text-gray-600 hover:text-vea-neutral hover:border-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {/* Tab 0 — Course + Version */}
            {activeTab === 0 && courseData && (
                <div className="space-y-6 pb-20">
                    <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                        <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Pamata informācija</h2>

                        <div>
                            <label className={labelClass}>Nosaukums latviski <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClass('titleLv')}
                                value={courseData.titleLv} maxLength={200}
                                onChange={e => {
                                    const v = sanitizeTitle(e.target.value);
                                    setCourseData({ ...courseData, titleLv: v });
                                    if (fieldErrors.titleLv) setFieldErrors(p => { const n={...p}; delete n.titleLv; return n; });
                                }} />
                            <FieldError field="titleLv" />
                        </div>
                        <div>
                            <label className={labelClass}>Nosaukums angliski</label>
                            <input type="text" className={inputClass('titleEn')}
                                value={courseData.titleEn} maxLength={200}
                                onChange={e => {
                                    setCourseData({ ...courseData, titleEn: sanitizeTitle(e.target.value) });
                                    if (fieldErrors.titleEn) setFieldErrors(p => { const n={...p}; delete n.titleEn; return n; });
                                }} />
                            <FieldError field="titleEn" />
                        </div>
                        <div>
                            <label className={labelClass}>Kursa kods <span className="text-red-500">*</span></label>
                            <input type="text" className={inputClass('courseCode')}
                                value={courseData.courseCode} maxLength={10}
                                placeholder="Piem.: ITB101"
                                onChange={e => {
                                    const v = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 10);
                                    setCourseData({ ...courseData, courseCode: v });
                                    if (fieldErrors.courseCode) setFieldErrors(p => { const n={...p}; delete n.courseCode; return n; });
                                }} />
                            <FieldError field="courseCode" />
                        </div>
                        <div>
                            <label className={labelClass}>Īsais nosaukums</label>
                            <input type="text" className={inputClassPlain}
                                value={courseData.slug}
                                onChange={e => setCourseData({ ...courseData, slug: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>Kredītpunkti <span className="text-red-500">*</span></label>
                            <input type="number" className={inputClass('credits')}
                                value={courseData.credits}
                                onKeyDown={blockNonNumeric}
                                onChange={e => {
                                    const v = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                                    setCourseData({ ...courseData, credits: v });
                                    if (fieldErrors.credits) setFieldErrors(p => { const n={...p}; delete n.credits; return n; });
                                }}
                                min={1} max={9999} />
                            <FieldError field="credits" />
                        </div>
                    </section>

                    {/* Autors un kursa mācībspēks */}
                    <section className="bg-white rounded-lg p-5 border border-gray-200">
                        <h2 className="text-2xl font-semibold font-heading text-vea-neutral mb-4">Autors un kursa mācībspēks</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                            {/* Autors */}
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-vea-neutral">Autors</p>
                                {authors.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {authors.map(a => (
                                            <li key={a.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm">
                                                <span className="text-vea-text min-w-0">
                                                    {a.user ? personLabel(a.user) : `ID: ${a.id}`}
                                                    {a.role && (
                                                        <span className="ml-2 text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full">{a.role}</span>
                                                    )}
                                                </span>
                                                <button onClick={() => handleDeleteAuthor(a.id)} disabled={staffSaving}
                                                    className="text-red-400 hover:text-red-600 ml-3 shrink-0 disabled:opacity-50"
                                                    aria-label="Noņemt autoru">✕</button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm italic">Nav pievienotu autoru</p>
                                )}
                                <div className="flex gap-2 pt-1">
                                    {AUTHOR_ROLES.map(r => (
                                        <button key={r} onClick={() => setSelectedAuthorRole(r)}
                                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                                selectedAuthorRole === r
                                                    ? 'bg-vea-green text-white border-vea-green'
                                                    : 'border-gray-300 text-gray-500 hover:border-vea-green hover:text-vea-green'
                                            }`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={authorSearch}
                                        onChange={e => setAuthorSearch(e.target.value)}
                                        onBlur={() => setTimeout(() => setAuthorSearch(''), 150)}
                                        placeholder="Meklēt autoru..."
                                        className={inputClassPlain}
                                        disabled={staffSaving}
                                    />
                                    {filterUsers(authorSearch, authors).length > 0 && (
                                        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                            {filterUsers(authorSearch, authors).map(u => (
                                                <li key={u.id}
                                                    onMouseDown={() => handleAddAuthor(u.id)}
                                                    className="px-3 py-2 hover:bg-vea-green-light cursor-pointer text-sm text-vea-text">
                                                    {personLabel(u)}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* Kursa mācībspēks */}
                            {(() => {
                                const hasAtbildigais = teachers.some(t => t.role === 'Atbildīgais mācībspēks');
                                return (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-vea-neutral">Kursa mācībspēks</p>
                                        {teachers.length > 0 ? (
                                            <ul className="space-y-1.5">
                                                {teachers.map(t => (
                                                    <li key={t.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm">
                                                        <span className="text-vea-text min-w-0">
                                                            {t.user ? personLabel(t.user) : `ID: ${t.id}`}
                                                            {t.role && (
                                                                <span className="ml-2 text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full">{t.role}</span>
                                                            )}
                                                        </span>
                                                        <button onClick={() => handleDeleteTeacher(t.id)} disabled={staffSaving}
                                                            className="text-red-400 hover:text-red-600 ml-3 shrink-0 disabled:opacity-50"
                                                            aria-label="Noņemt mācībspēku">✕</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 text-sm italic">Nav pievienotu mācībspēku</p>
                                        )}
                                        <div className="flex gap-2 pt-1">
                                            {TEACHER_ROLES.map(r => {
                                                const disabled = r === 'Atbildīgais mācībspēks' && hasAtbildigais;
                                                return (
                                                    <button key={r}
                                                        onClick={() => !disabled && setSelectedTeacherRole(r)}
                                                        disabled={disabled}
                                                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                                            disabled
                                                                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                                                : selectedTeacherRole === r
                                                                    ? 'bg-vea-green text-white border-vea-green'
                                                                    : 'border-gray-300 text-gray-500 hover:border-vea-green hover:text-vea-green'
                                                        }`}>
                                                        {r}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={teacherSearch}
                                                onChange={e => setTeacherSearch(e.target.value)}
                                                onBlur={() => setTimeout(() => setTeacherSearch(''), 150)}
                                                placeholder="Meklēt mācībspēku..."
                                                className={inputClassPlain}
                                                disabled={staffSaving}
                                            />
                                            {filterUsers(teacherSearch, teachers).length > 0 && (
                                                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                                                    {filterUsers(teacherSearch, teachers).map(u => (
                                                        <li key={u.id}
                                                            onMouseDown={() => handleAddTeacher(u.id)}
                                                            className="px-3 py-2 hover:bg-vea-green-light cursor-pointer text-sm text-vea-text">
                                                            {personLabel(u)}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}

                        </div>
                    </section>

                    {/* Studiju programmas un programmas daļa */}
                    <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                        <h2 className="text-2xl font-semibold font-heading text-vea-neutral">
                            Studiju programmas un programmas daļa
                        </h2>
                        {(courseDetails?.studyPrograms?.length ?? 0) > 0 ? (
                            <ul className="space-y-1.5">
                                {courseDetails.studyPrograms.map(link => (
                                    <li key={link.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 text-sm">
                                        <span className="text-vea-text min-w-0">
                                            <span className="font-medium">{link.programName}</span>
                                            {link.partName && (
                                                <span className="ml-2 text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full">
                                                    {link.partName}
                                                </span>
                                            )}
                                        </span>
                                        <button onClick={() => handleDeleteStudyProgram(link.id)} disabled={programSaving}
                                                className="text-red-400 hover:text-red-600 ml-3 shrink-0 disabled:opacity-50"
                                                aria-label="Noņemt programmu">✕</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm italic">Nav piesaistītu studiju programmu</p>
                        )}

                        {(() => {
                            const linkedProgramIds = new Set((courseDetails?.studyPrograms ?? []).map(l => l.programId));
                            const available = studyPrograms.filter(p => !linkedProgramIds.has(p.id));
                            return (
                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <select className={inputClassPlain + ' flex-1'} value={selectedProgramId}
                                            onChange={e => setSelectedProgramId(e.target.value)}>
                                        <option value="">— izvēlies programmu —</option>
                                        {available.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <select className={inputClassPlain + ' sm:w-60'} value={selectedPartId}
                                            onChange={e => setSelectedPartId(e.target.value)}>
                                        <option value="">— daļa (nav obligāti) —</option>
                                        {(lookups.studyProgramParts || []).map(pp => (
                                            <option key={pp.id} value={pp.id}>{pp.name}</option>
                                        ))}
                                    </select>
                                    <button onClick={handleAddStudyProgram}
                                            disabled={!selectedProgramId || programSaving}
                                            className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 text-sm whitespace-nowrap">
                                        Pievienot
                                    </button>
                                </div>
                            );
                        })()}
                    </section>

                    {versionData && (
                        <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Versijas informācija</h2>
                                {versionStatusName && (
                                    <span className={statusBadgeClass(versionStatusName)}>
                                        {versionStatusName}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className={labelClass}>Akadēmiskais gads <span className="text-red-500">*</span></label>
                                <select className={inputClass('academicYearId')} value={versionData.academicYearId}
                                    onChange={e => { setVersionData({ ...versionData, academicYearId: e.target.value }); if (fieldErrors.academicYearId) setFieldErrors(p => { const n={...p}; delete n.academicYearId; return n; }); }}>
                                    <option value="">— izvēlies —</option>
                                    {lookups.academicYears.map(ay => (
                                        <option key={ay.id} value={ay.id}>{ay.name}</option>
                                    ))}
                                </select>
                                <FieldError field="academicYearId" />
                            </div>
                            <div>
                                <label className={labelClass}>Semestris <span className="text-red-500">*</span></label>
                                <select className={inputClass('semesterId')} value={versionData.semesterId}
                                    onChange={e => { setVersionData({ ...versionData, semesterId: e.target.value }); if (fieldErrors.semesterId) setFieldErrors(p => { const n={...p}; delete n.semesterId; return n; }); }}>
                                    <option value="">— izvēlies —</option>
                                    {lookups.semesters.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <FieldError field="semesterId" />
                            </div>
                            <div>
                                <label className={labelClass}>Fakultāte</label>
                                <select className={inputClassPlain} value={versionData.facultyId}
                                    onChange={e => setVersionData({ ...versionData, facultyId: e.target.value })}>
                                    <option value="">— nav norādīts —</option>
                                    {lookups.faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            {versionStatusName === STATUS_NAMES.APPROVED && (
                                <div className="bg-green-50 border border-green-200 rounded p-3 text-sm space-y-1">
                                    <p className="text-green-800 font-medium">Apstiprināšanas dati</p>
                                    <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 text-vea-text">
                                        <dt className="text-gray-500">Datums</dt>
                                        <dd>{versionApprovalMeta.approvalDate || '—'}</dd>
                                        <dt className="text-gray-500">Lēmuma numurs</dt>
                                        <dd>{versionApprovalMeta.decisionNumber || '—'}</dd>
                                        {versionApprovalMeta.decisionReference && (
                                            <>
                                                <dt className="text-gray-500">Atsauce</dt>
                                                <dd>{versionApprovalMeta.decisionReference}</dd>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Fiksētā saglabāšanas josla */}
                    <StickyBar>
                        <button onClick={() => navigate(`/courses/${id}`)}
                            className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral text-sm">
                            Atcelt
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 text-sm">
                            {saving ? 'Saglabā...' : 'Saglabāt'}
                        </button>
                    </StickyBar>
                </div>
            )}

            {/* Tabs 1–5 — CourseInfo sections */}
            {activeTab > 0 && !courseInfoId && (
                <div className="p-4 bg-vea-orange-light border border-vea-orange rounded text-vea-orange text-sm">
                    Kursa satura informācija vēl nav izveidota. Vispirms saglabājiet pamatdatus.
                </div>
            )}

            {activeTab === 1 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseInfoBasicSection courseInfoId={courseInfoId} data={courseDetails}
                        lookups={lookups} onSaved={handleSectionSaved} onCancel={() => {}} />
                </div>
            )}

            {activeTab === 2 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseSKRSection courseId={id} data={courseDetails}
                        lookups={lookups} onSaved={handleSectionSaved} onCancel={() => {}} />
                </div>
            )}

            {activeTab === 3 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseTopicsSection courseInfoId={courseInfoId} data={courseDetails}
                        onSaved={handleSectionSaved} onCancel={() => {}} />
                </div>
            )}

            {activeTab === 4 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseCalendarSection courseInfoId={courseInfoId} data={courseDetails}
                        lookups={lookups} onSaved={handleSectionSaved}
                        onSessionTypeAdded={(st) => setLookups(prev => ({ ...prev, sessionTypes: [...prev.sessionTypes, st] }))} />
                </div>
            )}

            {activeTab === 5 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseAssessmentSection courseId={id} courseInfoId={courseInfoId} data={courseDetails}
                        lookups={lookups} onSaved={handleSectionSaved} onCancel={() => {}} />
                </div>
            )}

            {activeTab === 6 && courseInfoId && (
                <div className="bg-white rounded-lg p-5 border border-gray-200">
                    <CourseLiteratureSection courseInfoId={courseInfoId} data={courseDetails}
                        lookups={lookups} onSaved={handleSectionSaved} onCancel={() => {}} />
                </div>
            )}
        </div>
    );
}

export default CourseEditForm;
