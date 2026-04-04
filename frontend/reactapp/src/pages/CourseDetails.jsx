import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/axiosConfig';

function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get(`/course-info/details/${id}`)
            .then(res => setCourse(res.data))
            .catch(err => {
                console.error('Kļūda ielādējot kursa datus:', err);
                setError('Neizdevās ielādēt kursa datus. Lūdzu, mēģini vēlreiz.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē kursa datus...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!course) return <div className="p-8 text-gray-500">Kursa dati nav pieejami.</div>;

    const d = course;

    const calendarTotalHours = (d.calendarPlan || [])
        .flatMap(p => p.sessions || [])
        .reduce((sum, s) => sum + s.academicHours, 0);

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
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded">Rediģēt</button>
                </div>
            </div>

            {/* Versijas statuss */}
            {(d.versionStatus || d.approvalDate) && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm flex flex-wrap gap-4">
                    {d.versionStatus && <span><strong>Statuss:</strong> {d.versionStatus}</span>}
                    {d.approvalDate && <span><strong>Apstiprināts:</strong> {d.approvalDate}</span>}
                    {d.decisionNumber && <span><strong>Lēmuma nr.:</strong> {d.decisionNumber}</span>}
                    {d.decisionReference && <span><strong>Atsauce:</strong> {d.decisionReference}</span>}
                </div>
            )}

            {/* Pamata informācija */}
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

            {/* Stundu sadalījums */}
            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Stundu sadalījums</h2>
                <ul className="space-y-1">
                    <li><strong>Kopā:</strong> {d.academicHoursTotal} ak. st.</li>
                    <li><strong>Lekcijas:</strong> {d.lectureHours} ak. st.</li>
                    <li><strong>Praktiskās nodarbības:</strong> {d.practClassesHours} ak. st.</li>
                    <li><strong>Patstāvīgais darbs:</strong> {d.independentWorkHours} ak. st.</li>
                </ul>
            </section>

            {/* Anotācija un mērķis */}
            {(d.goal || d.annotation || d.prerequisitesDescription) && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Anotācija un mērķis</h2>
                    {d.goal && <p><strong>Mērķis:</strong> {d.goal}</p>}
                    {d.annotation && <p className="mt-2"><strong>Anotācija:</strong> {d.annotation}</p>}
                    {d.prerequisitesDescription && (
                        <p className="mt-2"><strong>Priekšnoteikumi:</strong> {d.prerequisitesDescription}</p>
                    )}
                </section>
            )}

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

            {/* Studiju kursa rezultāti */}
            {d.resultAssessments && d.resultAssessments.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Studiju kursa rezultāti</h2>
                    <ul className="list-disc list-inside space-y-2">
                        {d.resultAssessments.map((r, i) => (
                            <li key={i}>
                                {r.courseResult}
                                {r.components && r.components.length > 0 && (
                                    <span className="text-sm text-gray-500 ml-1">
                                        ({r.components.join(', ')})
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Vērtēšana */}
            {d.assessmentDistribution && d.assessmentDistribution.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-4">Vērtēšana</h2>
                    <table className="w-full border border-gray-300">
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
                </section>
            )}

            {/* Tēmas */}
            {d.topics && d.topics.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Tēmas</h2>
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
                </section>
            )}

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
                            ⚠️ Kontaktstundu summa ({calendarTotalHours}) nesakrīt ar norādīto ({d.academicHoursTotal} ak. st.)
                        </p>
                    )}
                </section>
            )}

            {/* Patstāvīgā darba organizācija */}
            {d.selfStudyActivities && d.selfStudyActivities.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Patstāvīgā darba organizācija</h2>
                    <table className="w-full border border-gray-300">
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
                </section>
            )}

            {/* Literatūra */}
            {d.literature && d.literature.length > 0 && (
                <section className="bg-white p-4 shadow rounded">
                    <h2 className="text-xl font-semibold mb-2">Literatūra</h2>
                    {d.literature.map((group, i) => (
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
                    ))}
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
