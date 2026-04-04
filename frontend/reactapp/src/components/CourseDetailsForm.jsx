/**
 * Kursa izveides forma — 3 soļos izveido Course un CourseVersion.
 * Solis 1: POST /api/courses → izveido kursu.
 * Solis 2: POST /api/course-versions → izveido versiju ar akadēmisko gadu, semestri u.c.
 * Solis 3: Apstiprinājums ar saiti uz izveidoto kursu.
 *
 * @returns {JSX.Element} Daudzsoļu kursa izveides forma
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import StepIndicator from './StepIndicator';

const EMPTY_COURSE = {
    titleLv: '',
    titleEn: '',
    courseCode: '',
    slug: '',
    credits: 2
};

const EMPTY_VERSION = {
    academicYearId: '',
    semesterId: '',
    facultyId: '',
    statusId: '',
    approvalDate: '',
    decisionNumber: '',
    decisionReference: ''
};

function CourseDetailsForm() {
    const navigate = useNavigate();

    // Soļu pārvaldība
    const [step, setStep] = useState(1);

    // Solis 1 — kursa dati
    const [course, setCourse] = useState(EMPTY_COURSE);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Starp soļiem glabātie dati
    const [createdCourseId, setCreatedCourseId] = useState(null);
    const [createdCourseTitle, setCreatedCourseTitle] = useState('');

    // Solis 2 — versijas dati
    const [versionData, setVersionData] = useState(EMPTY_VERSION);
    const [lookups, setLookups] = useState({ academicYears: [], semesters: [], faculties: [], versionStatuses: [] });
    const [lookupsLoading, setLookupsLoading] = useState(false);
    const [versionSubmitting, setVersionSubmitting] = useState(false);
    const [versionError, setVersionError] = useState(null);

    // Solis 3 — apstiprinājuma dati
    const [createdVersionInfo, setCreatedVersionInfo] = useState(null);

    /**
     * Solis 1: Izveido jaunu Course ierakstu un pāriet uz 2. soli.
     */
    const handleCreateCourse = async () => {
        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                titleLv: course.titleLv,
                titleEn: course.titleEn,
                courseCode: course.courseCode,
                slug: course.slug || null,
                credits: Number(course.credits)
            };

            const res = await api.post('/courses', payload);
            setCreatedCourseId(res.data.id);
            setCreatedCourseTitle(res.data.titleLv);

            // Ielādē lookup datus 2. solim
            setLookupsLoading(true);
            const [ay, sem, fac, st] = await Promise.all([
                api.get('/academic-years'),
                api.get('/semesters'),
                api.get('/faculties'),
                api.get('/version-statuses')
            ]);
            setLookups({
                academicYears: ay.data,
                semesters: sem.data,
                faculties: fac.data,
                versionStatuses: st.data
            });

            setStep(2);
        } catch (err) {
            console.error('Kļūda saglabājot kursu:', err);
            setError('Neizdevās saglabāt kursu. Lūdzu, pārbaudi ievades datus un mēģini vēlreiz.');
        } finally {
            setSubmitting(false);
            setLookupsLoading(false);
        }
    };

    /**
     * Solis 2: Izveido CourseVersion un pāriet uz 3. soli.
     */
    const handleCreateVersion = async () => {
        setVersionSubmitting(true);
        setVersionError(null);

        try {
            const payload = {
                course: { id: createdCourseId },
                status: { id: Number(versionData.statusId) },
                academicYear: { id: Number(versionData.academicYearId) },
                semester: { id: Number(versionData.semesterId) },
                faculty: versionData.facultyId ? { id: Number(versionData.facultyId) } : null,
                versionNumber: 1,
                active: true,
                approvalDate: versionData.approvalDate || null,
                decisionNumber: versionData.decisionNumber || null,
                decisionReference: versionData.decisionReference || null
            };

            const versionRes = await api.post('/course-versions', payload);
            const createdVersionId = versionRes.data.id;

            // Izveido tukšu CourseInfo, lai detaļu skats darbotos uzreiz pēc izveides
            await api.post('/course-info', {
                course: { id: createdCourseId },
                courseVersion: { id: createdVersionId },
                academicHoursTotal: 0,
                independentWorkHours: 0,
                language: 'lv'
            });

            // Atrod nosaukumus apstiprinājuma solim
            const ay = lookups.academicYears.find(a => a.id === Number(versionData.academicYearId));
            const sem = lookups.semesters.find(s => s.id === Number(versionData.semesterId));
            setCreatedVersionInfo({
                academicYear: ay ? ay.name : versionData.academicYearId,
                semester: sem ? sem.name : versionData.semesterId
            });

            setStep(3);
        } catch (err) {
            console.error('Kļūda saglabājot versiju:', err);
            setVersionError('Neizdevās saglabāt versiju. Lūdzu, pārbaudi ievades datus un mēģini vēlreiz.');
        } finally {
            setVersionSubmitting(false);
        }
    };

    /**
     * Atiestata visu formu uz sākuma stāvokli.
     */
    const handleReset = () => {
        setStep(1);
        setCourse(EMPTY_COURSE);
        setVersionData(EMPTY_VERSION);
        setCreatedCourseId(null);
        setCreatedCourseTitle('');
        setCreatedVersionInfo(null);
        setError(null);
        setVersionError(null);
    };

    const step2Valid = versionData.academicYearId && versionData.semesterId && versionData.statusId;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Jauna kursa izveide</h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:underline text-sm"
                >
                    ← Atpakaļ uz kursiem
                </button>
            </div>

            <StepIndicator currentStep={step} steps={['Kursa dati', 'Versijas dati', 'Gatavs']} />

            {/* SOLIS 1 — Kursa pamata informācija */}
            {step === 1 && (
                <section className="space-y-3 bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold">Kursa pamata informācija</h2>

                    <input
                        type="text"
                        placeholder="Nosaukums latviski *"
                        className="w-full p-2 border rounded"
                        value={course.titleLv}
                        onChange={e => setCourse({ ...course, titleLv: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Nosaukums angliski"
                        className="w-full p-2 border rounded"
                        value={course.titleEn}
                        onChange={e => setCourse({ ...course, titleEn: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Kursa kods *"
                        className="w-full p-2 border rounded"
                        value={course.courseCode}
                        onChange={e => setCourse({ ...course, courseCode: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Slug (piemēram: datu-strukturas)"
                        className="w-full p-2 border rounded"
                        value={course.slug}
                        onChange={e => setCourse({ ...course, slug: e.target.value })}
                    />

                    <input
                        type="number"
                        placeholder="Kredītpunkti"
                        className="w-full p-2 border rounded"
                        value={course.credits}
                        onChange={e => setCourse({ ...course, credits: e.target.value })}
                        min={1}
                    />

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleCreateCourse}
                        disabled={submitting || lookupsLoading || !course.titleLv.trim() || !course.courseCode.trim()}
                    >
                        {submitting || lookupsLoading ? 'Saglabā...' : 'Tālāk →'}
                    </button>
                </section>
            )}

            {/* SOLIS 2 — Versijas informācija */}
            {step === 2 && (
                <section className="space-y-3 bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold">Versijas informācija</h2>
                    <p className="text-sm text-gray-500">Kurss: <strong>{createdCourseTitle}</strong></p>

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

                    <input
                        type="text"
                        placeholder="Lēmuma numurs (piemēram: Nr. 22-04-12)"
                        className="w-full p-2 border rounded"
                        value={versionData.decisionNumber}
                        onChange={e => setVersionData({ ...versionData, decisionNumber: e.target.value })}
                    />

                    <input
                        type="text"
                        placeholder="Atsauce (piemēram: Senāta lēmums)"
                        className="w-full p-2 border rounded"
                        value={versionData.decisionReference}
                        onChange={e => setVersionData({ ...versionData, decisionReference: e.target.value })}
                    />

                    {versionError && <p className="text-red-600 text-sm">{versionError}</p>}

                    <div className="flex gap-3">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateVersion}
                            disabled={versionSubmitting || !step2Valid}
                        >
                            {versionSubmitting ? 'Saglabā...' : 'Izveidot versiju →'}
                        </button>
                    </div>
                </section>
            )}

            {/* SOLIS 3 — Apstiprinājums */}
            {step === 3 && (
                <section className="bg-green-50 border border-green-200 p-6 rounded space-y-3">
                    <p className="text-2xl">✓</p>
                    <p className="text-xl font-semibold text-green-800">Kurss veiksmīgi izveidots!</p>
                    <div className="text-sm text-gray-700 space-y-1">
                        <p><strong>Nosaukums:</strong> {createdCourseTitle}</p>
                        {createdVersionInfo && (
                            <>
                                <p><strong>Akadēmiskais gads:</strong> {createdVersionInfo.academicYear}</p>
                                <p><strong>Semestris:</strong> {createdVersionInfo.semester}</p>
                            </>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => navigate(`/courses/${createdCourseId}`)}
                        >
                            Skatīt kursu →
                        </button>
                        <button
                            className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-50"
                            onClick={handleReset}
                        >
                            Izveidot jaunu kursu
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
}

export default CourseDetailsForm;
