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

    const inputClass = "w-full p-2 border border-gray-300 rounded focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none";
    const labelClass = "block text-sm font-medium text-vea-neutral mb-1";
    const step2Valid = versionData.academicYearId && versionData.semesterId && versionData.statusId;

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-[2.5rem] font-bold font-heading text-vea-neutral">Jauna kursa izveide</h1>

            <StepIndicator currentStep={step} steps={['Kursa dati', 'Versijas dati', 'Gatavs']} />

            {/* SOLIS 1 — Kursa pamata informācija */}
            {step === 1 && (
                <section className="space-y-3 bg-white rounded-lg p-5 border border-gray-200">
                    <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Kursa pamata informācija</h2>

                    <div>
                        <label className={labelClass} htmlFor="titleLv">Nosaukums latviski <span className="text-red-500">*</span></label>
                        <input
                            id="titleLv"
                            type="text"
                            placeholder="Piemēram: Datoru tīkli"
                            className={inputClass}
                            value={course.titleLv}
                            onChange={e => setCourse({ ...course, titleLv: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="titleEn">Nosaukums angliski</label>
                        <input
                            id="titleEn"
                            type="text"
                            placeholder="Piemēram: Computer Networks"
                            className={inputClass}
                            value={course.titleEn}
                            onChange={e => setCourse({ ...course, titleEn: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="courseCode">Kursa kods <span className="text-red-500">*</span></label>
                        <input
                            id="courseCode"
                            type="text"
                            placeholder="Piemēram: DT101"
                            className={inputClass}
                            value={course.courseCode}
                            onChange={e => setCourse({ ...course, courseCode: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="slug">Slug</label>
                        <input
                            id="slug"
                            type="text"
                            placeholder="Piemēram: datu-strukturas"
                            className={inputClass}
                            value={course.slug}
                            onChange={e => setCourse({ ...course, slug: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="credits">Kredītpunkti</label>
                        <input
                            id="credits"
                            type="number"
                            className={inputClass}
                            value={course.credits}
                            onChange={e => setCourse({ ...course, credits: e.target.value })}
                            min={1}
                        />
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex gap-2">
                        <button
                            className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateCourse}
                            disabled={submitting || lookupsLoading || !course.titleLv.trim() || !course.courseCode.trim()}
                        >
                            {submitting || lookupsLoading ? 'Saglabā...' : 'Tālāk →'}
                        </button>
                        <button
                            type="button"
                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral"
                            onClick={() => navigate('/')}
                        >
                            Atcelt
                        </button>
                    </div>
                </section>
            )}

            {/* SOLIS 2 — Versijas informācija */}
            {step === 2 && (
                <section className="space-y-3 bg-white rounded-lg p-5 border border-gray-200">
                    <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Versijas informācija</h2>
                    <p className="text-sm text-gray-500">Kurss: <strong>{createdCourseTitle}</strong></p>

                    <div>
                        <label className={labelClass} htmlFor="academicYear">Akadēmiskais gads <span className="text-red-500">*</span></label>
                        <select
                            id="academicYear"
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="semester">Semestris <span className="text-red-500">*</span></label>
                        <select
                            id="semester"
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="status">Statuss <span className="text-red-500">*</span></label>
                        <select
                            id="status"
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="faculty">Fakultāte</label>
                        <select
                            id="faculty"
                            className={inputClass}
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
                        <label className={labelClass} htmlFor="approvalDate">Apstiprināšanas datums</label>
                        <input
                            id="approvalDate"
                            type="date"
                            className={inputClass}
                            value={versionData.approvalDate}
                            onChange={e => setVersionData({ ...versionData, approvalDate: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="decisionNumber">Lēmuma numurs</label>
                        <input
                            id="decisionNumber"
                            type="text"
                            placeholder="Piemēram: Nr. 22-04-12"
                            className={inputClass}
                            value={versionData.decisionNumber}
                            onChange={e => setVersionData({ ...versionData, decisionNumber: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="decisionReference">Atsauce</label>
                        <input
                            id="decisionReference"
                            type="text"
                            placeholder="Piemēram: Senāta lēmums"
                            className={inputClass}
                            value={versionData.decisionReference}
                            onChange={e => setVersionData({ ...versionData, decisionReference: e.target.value })}
                        />
                    </div>

                    {versionError && <p className="text-red-600 text-sm">{versionError}</p>}

                    <div className="flex gap-2">
                        <button
                            className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateVersion}
                            disabled={versionSubmitting || !step2Valid}
                        >
                            {versionSubmitting ? 'Saglabā...' : 'Izveidot versiju →'}
                        </button>
                        <button
                            type="button"
                            className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-vea-neutral"
                            onClick={() => {
                                if (window.confirm('Kurss ir saglabāts, bet versija nav izveidota. Vai tiešām vēlies atcelt?')) {
                                    navigate('/');
                                }
                            }}
                        >
                            Atcelt
                        </button>
                    </div>
                </section>
            )}

            {/* SOLIS 3 — Apstiprinājums */}
            {step === 3 && (
                <section className="bg-vea-green-light border border-vea-green rounded-lg p-6 space-y-3">
                    <p className="text-3xl text-vea-green">✓</p>
                    <p className="text-2xl font-semibold font-heading text-vea-green">Kurss veiksmīgi izveidots!</p>
                    <div className="text-base text-vea-text space-y-1">
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
                            className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark"
                            onClick={() => navigate(`/courses/${createdCourseId}`)}
                        >
                            Skatīt kursu →
                        </button>
                        <button
                            className="border border-gray-300 px-4 py-2 rounded hover:bg-white text-vea-neutral"
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
