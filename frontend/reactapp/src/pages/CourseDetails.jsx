import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/axiosConfig';

/**
 * Kursa detaļu skats — tikai lasīšana.
 * Rediģēšana notiek /courses/:id/edit lapā.
 */
function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`/course-info/details/${id}`)
            .then(res => setCourse(res.data))
            .catch(() => setError('Neizdevās ielādēt kursa datus. Lūdzu, mēģini vēlreiz.'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await api.delete(`/courses/${id}`);
            navigate('/');
        } catch {
            setDeleteError('Neizdevās dzēst kursu. Lūdzu, mēģini vēlreiz.');
            setDeleting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē kursa datus...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!course) return <div className="p-8 text-gray-500">Kursa dati nav pieejami.</div>;

    const d = course;

    const calendarTotalHours = (d.calendarPlan || [])
        .flatMap(p => p.sessions || [])
        .reduce((sum, s) => sum + s.academicHours, 0);

    const SectionTitle = ({ title, isEmpty }) => (
        <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xl font-semibold">{title}</h2>
            {isEmpty && (
                <span title="Sadaļa nav aizpildīta" className="text-orange-500 text-lg">⚠</span>
            )}
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto text-gray-900 print:text-black">
            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline mb-2">
                ← Atpakaļ uz kursiem
            </button>

            {/* Galvene */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{d.titleLv}</h1>
                    {d.titleEn && <p className="text-lg text-gray-500 italic mb-1">{d.titleEn}</p>}
                    <p className="text-sm text-gray-700">Kods: {d.courseCode} · KP: {d.credits}</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">PDF</button>
                    <button
                        onClick={() => navigate(`/courses/${id}/edit`)}
                        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                        Rediģēt
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Dzēst
                    </button>
                </div>
            </div>

            {/* Dzēšanas apstiprinājums */}
            {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-300 rounded p-4 flex flex-wrap items-center gap-4">
                    <p className="text-red-700 font-medium flex-1">
                        Vai tiešām vēlies dzēst šo kursu? Šo darbību nevar atsaukt.
                    </p>
                    <button
                        onClick={handleDelete} disabled={deleting}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {deleting ? 'Dzēš...' : 'Jā, dzēst'}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border border-gray-400 px-3 py-1 rounded hover:bg-gray-100"
                    >
                        Atcelt
                    </button>
                    {deleteError && <p className="w-full text-red-600 text-sm">{deleteError}</p>}
                </div>
            )}

            {/* Versijas statuss */}
            {(d.versionStatus || d.approvalDate) && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm flex flex-wrap gap-4">
                    {d.versionStatus && <span><strong>Statuss:</strong> {d.versionStatus}</span>}
                    {d.approvalDate && <span><strong>Apstiprināts:</strong> {d.approvalDate}</span>}
                    {d.decisionNumber && <span><strong>Lēmuma nr.:</strong> {d.decisionNumber}</span>}
                    {d.decisionReference && <span><strong>Atsauce:</strong> {d.decisionReference}</span>}
                </div>
            )}

            {/* Pamata informācija (no CourseVersion) */}
            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Pamata informācija</h2>
                <ul className="space-y-1">
                    {d.studyPrograms && d.studyPrograms.length > 0 && (
                        <li><strong>Studiju programma:</strong> {d.studyPrograms.join(', ')}</li>
                    )}
                    {d.facultyName && <li><strong>Fakultāte:</strong> {d.facultyName}</li>}
                    {d.academicYear && <li><strong>Akadēmiskais gads:</strong> {d.academicYear}</li>}
                    {d.semester && <li><strong>Semestris:</strong> {d.semester}</li>}
                    {d.language && <li><strong>Mācību valoda:</strong> {d.language}</li>}
                    {d.assessmentForm && <li><strong>Pārbaudes forma:</strong> {d.assessmentForm}</li>}
                </ul>
            </section>

            {/* Stundu sadalījums, mērķis, anotācija, priekšnosacījumi */}
            <section className="bg-white p-4 shadow rounded">
                <SectionTitle
                    title="Stundu sadalījums un saturs"
                    isEmpty={!d.academicHoursTotal && !d.goal && !d.annotation}
                />
                <div className="space-y-3">
                    <div>
                        <h3 className="font-medium text-gray-700 mb-1">Stundas</h3>
                        <ul className="space-y-1">
                            <li><strong>Kopā:</strong> {d.academicHoursTotal || '—'} ak. st.</li>
                            <li><strong>Lekcijas:</strong> {d.lectureHours || '—'} ak. st.</li>
                            <li><strong>Praktiskās nodarbības:</strong> {d.practClassesHours || '—'} ak. st.</li>
                            <li><strong>Patstāvīgais darbs:</strong> {d.independentWorkHours || '—'} ak. st.</li>
                        </ul>
                    </div>
                    {d.goal && <p><strong>Mērķis:</strong> {d.goal}</p>}
                    {d.annotation && <p><strong>Anotācija:</strong> {d.annotation}</p>}
                    {d.prerequisitesDescription && (
                        <p><strong>Priekšnosacījumi:</strong> {d.prerequisitesDescription}</p>
                    )}
                </div>
            </section>

            {/* Priekšnosacījumu kursi */}
            {d.prerequisites && d.prerequisites.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Priekšnosacījumu kursi</h2>
                    <ul className="space-y-1">
                        {d.prerequisites.map((p, i) => (
                            <li key={i}>
                                <span className="font-medium">{p.title}</span>
                                <span className="ml-2 text-sm text-gray-500">({p.type})</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Tēmas */}
            <section className="bg-white p-4 shadow rounded">
                <SectionTitle
                    title="Tēmas"
                    isEmpty={!d.topics || d.topics.length === 0}
                />
                {d.topics && d.topics.length > 0 ? (
                    <ol className="list-decimal list-inside space-y-1">
                        {d.topics.map((t, i) => (
                            <li key={i}>
                                <span className="font-medium">{t.title}</span>
                                {t.description && (
                                    <span className="text-gray-600 ml-1">— {t.description}</span>
                                )}
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu tēmu.</p>
                )}
            </section>

            {/* Vērtēšana un patstāvīgais darbs */}
            <section className="bg-white p-4 shadow rounded">
                <SectionTitle
                    title="Vērtēšana un patstāvīgais darbs"
                    isEmpty={(!d.assessmentDistribution || d.assessmentDistribution.length === 0)
                        && (!d.selfStudyActivities || d.selfStudyActivities.length === 0)}
                />
                <div className="space-y-4">
                    {d.assessmentDistribution && d.assessmentDistribution.length > 0 ? (
                        <div>
                            <h3 className="font-medium text-gray-700 mb-1">Vērtēšanas sadalījums</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Komponente</th>
                                    <th className="p-2 text-center">%</th>
                                </tr>
                                </thead>
                                <tbody>
                                {d.assessmentDistribution.map((a, i) => (
                                    <tr key={i} className="even:bg-gray-50">
                                        <td className="p-2 border-b">{a.componentName}</td>
                                        <td className="p-2 border-b text-center">{a.percentage}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm">Nav vērtēšanas sadalījuma.</p>
                    )}
                    {d.selfStudyActivities && d.selfStudyActivities.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-700 mb-1">Patstāvīgā darba sadalījums</h3>
                            <table className="w-full border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Darbības veids</th>
                                    <th className="p-2 text-center">%</th>
                                </tr>
                                </thead>
                                <tbody>
                                {d.selfStudyActivities.map((s, i) => (
                                    <tr key={i} className="even:bg-gray-50">
                                        <td className="p-2 border-b">{s.activityName}</td>
                                        <td className="p-2 border-b text-center">{s.percentage}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* SKR */}
            <section className="bg-white p-4 shadow rounded">
                <SectionTitle
                    title="Studiju kursa rezultāti (SKR)"
                    isEmpty={!d.resultAssessments || d.resultAssessments.length === 0}
                />
                {d.resultAssessments && d.resultAssessments.length > 0 ? (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="border border-gray-300 px-3 py-2 w-8">Nr.</th>
                            <th className="border border-gray-300 px-3 py-2">SKR — studiju kursa rezultāts</th>
                            <th className="border border-gray-300 px-3 py-2">SPSR</th>
                            <th className="border border-gray-300 px-3 py-2">Vērtēšanas veids</th>
                        </tr>
                        </thead>
                        <tbody>
                        {d.resultAssessments.map((r, i) => (
                            <tr key={i} className="align-top">
                                <td className="border border-gray-300 px-3 py-2 text-center">{i + 1}</td>
                                <td className="border border-gray-300 px-3 py-2">{r.learningOutcome}</td>
                                <td className="border border-gray-300 px-3 py-2 text-gray-600">{r.spsr || '—'}</td>
                                <td className="border border-gray-300 px-3 py-2">
                                    {r.components && r.components.length > 0
                                        ? r.components.join(', ')
                                        : '—'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu studiju kursa rezultātu.</p>
                )}
            </section>

            {/* Literatūra */}
            <section className="bg-white p-4 shadow rounded">
                <SectionTitle
                    title="Literatūra"
                    isEmpty={!d.literature || d.literature.length === 0}
                />
                {d.literature && d.literature.length > 0 ? (
                    d.literature.map((group, i) => (
                        <div key={i} className="mb-4">
                            <h3 className="text-md font-semibold text-blue-800 mb-1">{group.type}</h3>
                            <ul className="list-disc list-inside space-y-1">
                                {(group.sources || []).map((src, j) => (
                                    <li key={j}>
                                        {src.url
                                            ? <a href={src.url} target="_blank" rel="noreferrer"
                                                 className="text-blue-600 hover:underline">{src.citation}</a>
                                            : src.citation
                                        }
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu literatūras avotu.</p>
                )}
            </section>

            {/* Kalendārais plānojums */}
            {d.calendarPlan && d.calendarPlan.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Kalendārais plānojums</h2>
                    <table className="w-full border border-gray-300">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Tēma</th>
                            <th className="p-2">Nodarbības veids</th>
                            <th className="p-2 text-center">Ak. st.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {d.calendarPlan.map((plan, pi) =>
                            (plan.sessions || []).map((session, si) => (
                                <tr key={`${pi}-${si}`} className="even:bg-gray-50">
                                    {si === 0 && (
                                        <td className="p-2 border-b font-medium align-top"
                                            rowSpan={(plan.sessions || []).length}>
                                            {plan.topicTitle}
                                        </td>
                                    )}
                                    <td className="p-2 border-b">{session.sessionType}</td>
                                    <td className="p-2 border-b text-center">{session.academicHours}</td>
                                </tr>
                            ))
                        )}
                        <tr className="font-semibold bg-gray-100">
                            <td colSpan={2} className="p-2 border-t">Kopā:</td>
                            <td className="p-2 border-t text-center">{calendarTotalHours}</td>
                        </tr>
                        </tbody>
                    </table>
                    {d.academicHoursTotal > 0 && calendarTotalHours !== d.academicHoursTotal && (
                        <p className="text-orange-600 mt-2 text-sm">
                            ⚠ Kontaktstundu summa ({calendarTotalHours}) nesakrīt ar norādīto ({d.academicHoursTotal} ak. st.)
                        </p>
                    )}
                </section>
            )}

            {d.authorFullTitle && (
                <footer className="text-sm text-gray-500 text-right">
                    Autors: {d.authorFullTitle}
                </footer>
            )}
        </div>
    );
}

export default CourseDetails;
