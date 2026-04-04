import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import CourseInfoBasicSection from './courseinfo/CourseInfoBasicSection';
import CourseTopicsSection from './courseinfo/CourseTopicsSection';
import CourseAssessmentSection from './courseinfo/CourseAssessmentSection';
import CourseLiteratureSection from './courseinfo/CourseLiteratureSection';
import CourseSKRSection from './courseinfo/CourseSKRSection';

const TABS = [
    { key: 'pamatdati',  label: 'Pamatdati' },
    { key: 'apraksts',   label: 'Apraksts' },
    { key: 'temas',      label: 'Tēmas' },
    { key: 'vertesana',  label: 'Vērtēšana' },
    { key: 'skr',        label: 'SKR' },
    { key: 'literatura', label: 'Literatūra' },
];

function CourseEditForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Tab 0 — Course + Version state
    const [courseData, setCourseData] = useState(null);
    const [versionData, setVersionData] = useState(null);
    const [versionId, setVersionId] = useState(null);

    // Tabs 1–5 — CourseInfo state
    const [courseInfoId, setCourseInfoId] = useState(null);
    const [courseDetails, setCourseDetails] = useState(null);

    // Shared
    const [lookups, setLookups] = useState({
        academicYears: [], semesters: [], faculties: [], versionStatuses: [],
        assessmentForms: [], assessmentComponents: [], selfStudyActivities: [],
        literatureTypes: [], resultsCategories: []
    });
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [
                    courseRes, versionsRes, detailsRes,
                    ayRes, semRes, facRes, stRes,
                    afRes, acRes, ssaRes, ltRes, rcRes
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

                setCourseDetails(detailsRes.data);
                setCourseInfoId(detailsRes.data.courseInfoId || null);

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
                });
            } catch (err) {
                console.error('Kļūda ielādējot rediģēšanas datus:', err);
                setError('Neizdevās ielādēt kursa datus. Lūdzu, mēģini vēlreiz.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccessMsg(null);

        try {
            await api.put(`/courses/${id}`, {
                titleLv: courseData.titleLv,
                titleEn: courseData.titleEn,
                courseCode: courseData.courseCode,
                slug: courseData.slug || null,
                credits: Number(courseData.credits),
                active: courseData.active,
                archived: courseData.archived,
                deletedAt: courseData.deletedAt
            });

            const versionPayload = {
                ...(versionId ? { id: versionId } : {}),
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
            await api.post('/course-versions', versionPayload);

            setSuccessMsg('Izmaiņas saglabātas.');
        } catch (err) {
            console.error('Kļūda saglabājot izmaiņas:', err);
            setError('Neizdevās saglabāt izmaiņas. Lūdzu, pārbaudi ievades datus un mēģini vēlreiz.');
        } finally {
            setSaving(false);
        }
    };

    const handleSectionSaved = () => {
        api.get(`/course-info/details/${id}`)
            .then(res => {
                setCourseDetails(res.data);
                setSuccessMsg('Izmaiņas saglabātas.');
                setTimeout(() => setSuccessMsg(null), 3000);
            });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē datus...</div>;
    if (error && !courseData) return <div className="p-8 text-red-600">{error}</div>;

    const saveDisabled = saving
        || !courseData.titleLv.trim()
        || !courseData.courseCode.trim()
        || !versionData.academicYearId
        || !versionData.semesterId
        || !versionData.statusId;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Kursa rediģēšana</h1>
                <button
                    onClick={() => navigate(`/courses/${id}`)}
                    className="text-blue-600 hover:underline text-sm"
                >
                    ← Atpakaļ uz kursu
                </button>
            </div>

            {/* Tab navigation */}
            <nav className="flex border-b border-gray-300 overflow-x-auto">
                {TABS.map((tab, idx) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(idx)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                            activeTab === idx
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-400'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {successMsg && (
                <p className="text-green-600 text-sm font-medium bg-green-50 border border-green-200 rounded px-3 py-2">
                    {successMsg}
                </p>
            )}

            {/* Tab 0 — Course + Version */}
            {activeTab === 0 && courseData && (
                <div className="space-y-6">
                    <section className="bg-white p-4 shadow rounded space-y-3">
                        <h2 className="text-xl font-semibold">Pamata informācija</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nosaukums latviski *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={courseData.titleLv}
                                onChange={e => setCourseData({ ...courseData, titleLv: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nosaukums angliski</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={courseData.titleEn}
                                onChange={e => setCourseData({ ...courseData, titleEn: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kursa kods *</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={courseData.courseCode}
                                onChange={e => setCourseData({ ...courseData, courseCode: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={courseData.slug}
                                onChange={e => setCourseData({ ...courseData, slug: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kredītpunkti</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={courseData.credits}
                                onChange={e => setCourseData({ ...courseData, credits: e.target.value })}
                                min={1}
                            />
                        </div>
                    </section>

                    {versionData && (
                        <section className="bg-white p-4 shadow rounded space-y-3">
                            <h2 className="text-xl font-semibold">Versijas informācija</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Akadēmiskais gads *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={versionData.academicYearId}
                                    onChange={e => setVersionData({ ...versionData, academicYearId: e.target.value })}
                                >
                                    <option value="">— izvēlies —</option>
                                    {lookups.academicYears.map(ay => (
                                        <option key={ay.id} value={ay.id}>{ay.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semestris *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={versionData.semesterId}
                                    onChange={e => setVersionData({ ...versionData, semesterId: e.target.value })}
                                >
                                    <option value="">— izvēlies —</option>
                                    {lookups.semesters.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Statuss *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={versionData.statusId}
                                    onChange={e => setVersionData({ ...versionData, statusId: e.target.value })}
                                >
                                    <option value="">— izvēlies —</option>
                                    {lookups.versionStatuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fakultāte</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={versionData.facultyId}
                                    onChange={e => setVersionData({ ...versionData, facultyId: e.target.value })}
                                >
                                    <option value="">— nav norādīts —</option>
                                    {lookups.faculties.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apstiprināšanas datums</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={versionData.approvalDate}
                                    onChange={e => setVersionData({ ...versionData, approvalDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lēmuma numurs</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={versionData.decisionNumber}
                                    onChange={e => setVersionData({ ...versionData, decisionNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Atsauce</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={versionData.decisionReference}
                                    onChange={e => setVersionData({ ...versionData, decisionReference: e.target.value })}
                                />
                            </div>
                        </section>
                    )}

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        onClick={handleSave}
                        disabled={saveDisabled}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saglabā...' : 'Saglabāt izmaiņas'}
                    </button>
                </div>
            )}

            {/* Tabs 1–5 — CourseInfo sections */}
            {activeTab > 0 && !courseInfoId && (
                <div className="p-4 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm">
                    Kursa satura informācija vēl nav izveidota. Vispirms saglabājiet pamatdatus.
                </div>
            )}

            {activeTab === 1 && courseInfoId && (
                <CourseInfoBasicSection
                    courseInfoId={courseInfoId}
                    data={courseDetails}
                    lookups={lookups}
                    onSaved={handleSectionSaved}
                    onCancel={() => {}}
                />
            )}

            {activeTab === 2 && courseInfoId && (
                <CourseTopicsSection
                    courseInfoId={courseInfoId}
                    data={courseDetails}
                    onSaved={handleSectionSaved}
                    onCancel={() => {}}
                />
            )}

            {activeTab === 3 && courseInfoId && (
                <CourseAssessmentSection
                    courseInfoId={courseInfoId}
                    data={courseDetails}
                    lookups={lookups}
                    onSaved={handleSectionSaved}
                    onCancel={() => {}}
                />
            )}

            {activeTab === 4 && courseInfoId && (
                <CourseSKRSection
                    courseId={id}
                    data={courseDetails}
                    lookups={lookups}
                    onSaved={handleSectionSaved}
                    onCancel={() => {}}
                />
            )}

            {activeTab === 5 && courseInfoId && (
                <CourseLiteratureSection
                    courseInfoId={courseInfoId}
                    data={courseDetails}
                    lookups={lookups}
                    onSaved={handleSectionSaved}
                    onCancel={() => {}}
                />
            )}
        </div>
    );
}

export default CourseEditForm;
