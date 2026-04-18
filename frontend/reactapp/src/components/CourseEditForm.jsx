import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import { useToast } from './ui/ToastProvider';
import StickyBar from './ui/StickyBar';
import CourseInfoBasicSection from './courseinfo/CourseInfoBasicSection';
import CourseTopicsSection from './courseinfo/CourseTopicsSection';
import CourseAssessmentSection from './courseinfo/CourseAssessmentSection';
import CourseLiteratureSection from './courseinfo/CourseLiteratureSection';
import CourseSKRSection from './courseinfo/CourseSKRSection';
import CourseCalendarSection from './courseinfo/CourseCalendarSection';

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
    const showToast = useToast();

    // Tab 0 — Course + Version state
    const [courseData, setCourseData] = useState(null);
    const [versionData, setVersionData] = useState(null);
    const [versionId, setVersionId] = useState(null);

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

    // Shared
    const [lookups, setLookups] = useState({
        academicYears: [], semesters: [], faculties: [], versionStatuses: [],
        assessmentForms: [], assessmentComponents: [], selfStudyActivities: [],
        literatureTypes: [], resultsCategories: [], sessionTypes: []
    });
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const [
                    courseRes, versionsRes, detailsRes,
                    ayRes, semRes, facRes, stRes,
                    afRes, acRes, ssaRes, ltRes, rcRes, sessionTypesRes,
                    authorsRes, teachersRes, usersRes
                ] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/course-versions/by-course/${id}`),
                    api.get(`/course-info/details/${id}`),
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
                    api.get(`/course-authors/by-course/${id}`),
                    api.get(`/course-teachers/by-course/${id}`),
                    api.get('/users'),
                ]);

                const course = courseRes.data;
                const versions = versionsRes.data;
                const version = versions && versions.length > 0 ? versions[0] : null;

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
                        approvalDate: version.approvalDate || '',
                        decisionNumber: version.decisionNumber || '',
                        decisionReference: version.decisionReference || '',
                        versionNumber: version.versionNumber || 1,
                        isActive: version.active !== undefined ? version.active : true
                    });
                } else {
                    setVersionData({
                        academicYearId: '', semesterId: '', facultyId: '', statusId: '',
                        approvalDate: '', decisionNumber: '', decisionReference: '',
                        versionNumber: 1, isActive: true
                    });
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
                });
                setAuthors(authorsRes.data || []);
                setTeachers(teachersRes.data || []);
                setUsers(usersRes.data || []);
            } catch (err) {
                console.error('Kļūda ielādējot rediģēšanas datus:', err);
                showToast(`Neizdevās ielādēt kursa datus.`, 'error');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

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
        if (!versionData.statusId) errors.statusId = 'Statuss ir obligāts';

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

            const versionPayload = {
                course: { id },
                status: { id: Number(versionData.statusId) },
                academicYear: { id: Number(versionData.academicYearId) },
                semester: { id: Number(versionData.semesterId) },
                faculty: versionData.facultyId ? { id: Number(versionData.facultyId) } : null,
                versionNumber: versionData.versionNumber,
                active: versionData.isActive,
                approvalDate: versionData.approvalDate || null,
                decisionNumber: versionData.decisionNumber || null,
                decisionReference: versionData.decisionReference || null
            };
            if (versionId) {
                await api.put(`/course-versions/${versionId}`, versionPayload);
            } else {
                const res = await api.post('/course-versions', versionPayload);
                setVersionId(res.data.id);
            }
            showToast('Pamatdati saglabāti veiksmīgi!');
        } catch (err) {
            console.error('Kļūda saglabājot izmaiņas:', err);
            showToast('Neizdevās saglabāt izmaiņas. Pārbaudi ievades datus un mēģini vēlreiz.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const reloadStaff = async () => {
        const [aRes, tRes] = await Promise.all([
            api.get(`/course-authors/by-course/${id}`),
            api.get(`/course-teachers/by-course/${id}`),
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
        setStaffSaving(true);
        try {
            await api.post('/course-authors', { course: { id }, user: { id: Number(userId) }, role: selectedAuthorRole });
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
        const hasAtbildigais = teachers.some(t => t.role === 'Atbildīgais mācībspēks');
        setStaffSaving(true);
        try {
            await api.post('/course-teachers', { course: { id }, user: { id: Number(userId) }, role: selectedTeacherRole });
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

    const handleSectionSaved = () => {
        api.get(`/course-info/details/${id}`)
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

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl md:text-[2.5rem] font-bold font-heading text-vea-neutral">Kursa rediģēšana</h1>
                <button
                    onClick={() => navigate(`/courses/${id}`)}
                    className="text-vea-green hover:underline text-base"
                >
                    ← Atpakaļ uz kursu
                </button>
            </div>

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
                            <label className={labelClass}>Slug</label>
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

                    {versionData && (
                        <section className="bg-white rounded-lg p-5 border border-gray-200 space-y-3">
                            <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Versijas informācija</h2>

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
                                <label className={labelClass}>Statuss <span className="text-red-500">*</span></label>
                                <select className={inputClass('statusId')} value={versionData.statusId}
                                    onChange={e => { setVersionData({ ...versionData, statusId: e.target.value }); if (fieldErrors.statusId) setFieldErrors(p => { const n={...p}; delete n.statusId; return n; }); }}>
                                    <option value="">— izvēlies —</option>
                                    {lookups.versionStatuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <FieldError field="statusId" />
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
                            <div>
                                <label className={labelClass}>Apstiprināšanas datums</label>
                                <input type="date" className={inputClassPlain} value={versionData.approvalDate}
                                    onChange={e => setVersionData({ ...versionData, approvalDate: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Lēmuma numurs</label>
                                <input type="text" className={inputClassPlain} value={versionData.decisionNumber}
                                    onChange={e => setVersionData({ ...versionData, decisionNumber: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Atsauce</label>
                                <input type="text" className={inputClassPlain} value={versionData.decisionReference}
                                    onChange={e => setVersionData({ ...versionData, decisionReference: e.target.value })} />
                            </div>
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
                    <CourseAssessmentSection courseInfoId={courseInfoId} data={courseDetails}
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
