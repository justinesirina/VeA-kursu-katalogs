import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/axiosConfig';

/**
 * Kursa detaļu skats — tikai lasīšana.
 * Sadaļu secība atbilst oficiālajam VeA kursa apraksta paraugam.
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

    // --- SKR grupēšana pēc kategorijas ---
    const SKR_CATEGORY_ORDER = ['Zināšanas', 'Prasmes', 'Kompetences'];
    const skrByCategory = {};
    (d.resultAssessments || []).forEach(r => {
        const cat = r.categoryName || 'Citi';
        if (!skrByCategory[cat]) skrByCategory[cat] = [];
        skrByCategory[cat].push(r);
    });
    const skrCategories = [
        ...SKR_CATEGORY_ORDER.filter(c => skrByCategory[c]),
        ...Object.keys(skrByCategory).filter(c => !SKR_CATEGORY_ORDER.includes(c))
    ];

    // --- Vērtēšanas matrica — unikālās komponentes ---
    const allComponents = [...new Set(
        (d.assessmentDistribution || []).map(a => a.componentName)
    )];

    // --- Kalendārā plāna kopsumma ---
    const calendarTotalHours = (d.calendarPlan || [])
        .flatMap(p => p.sessions || [])
        .reduce((sum, s) => sum + s.academicHours, 0);

    // --- Palīgkomponents: sekcijas virsraksts ---
    const SectionTitle = ({ title, isEmpty }) => (
        <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold font-heading text-vea-neutral">{title}</h2>
            {isEmpty && (
                <span title="Sadaļa nav aizpildīta" className="text-vea-orange text-base" aria-label="Sadaļa nav aizpildīta">⚠</span>
            )}
        </div>
    );

    // --- Palīgkomponents: info rinda (label: value) ---
    const InfoRow = ({ label, value }) => (
        <li className="flex gap-1 text-sm">
            <span className="text-gray-500 shrink-0">{label}:</span>
            <span className="font-medium text-vea-text">
                {value || <span className="text-gray-400 font-normal">Nav norādīts</span>}
            </span>
        </li>
    );

    // --- Palīgkomponents: stundu stat bloks ---
    const HourStat = ({ label, value }) => (
        <div className="flex flex-col items-center text-center px-2 py-3 bg-vea-green-light rounded border border-gray-200">
            <span className="text-xs text-gray-500 mb-1 leading-tight">{label}</span>
            <span className="text-2xl font-bold text-vea-neutral">{value ?? 0}</span>
            <span className="text-xs text-gray-400">ak. st.</span>
        </div>
    );

    // --- Palīgkomponents: sadaļas apakšvirsraksts ---
    const SubLabel = ({ children }) => (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-l-2 border-vea-green pl-2 mb-2">
            {children}
        </p>
    );

    return (
        <div className="p-6 space-y-5 max-w-5xl mx-auto text-vea-text print:text-black">

            <button onClick={() => navigate('/')} className="text-vea-green hover:underline text-sm mb-1">
                ← Atpakaļ uz kursiem
            </button>

            {/* ── 1. DARBĪBAS POGAS ── */}
            <div className="flex gap-2 flex-wrap">
                <button className="bg-vea-green text-white px-4 py-1.5 rounded text-sm hover:bg-vea-green-dark">
                    PDF
                </button>
                <button
                    onClick={() => navigate(`/courses/${id}/edit`)}
                    className="bg-vea-orange text-white px-4 py-1.5 rounded text-sm hover:opacity-90"
                >
                    Rediģēt
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-1.5 rounded text-sm hover:bg-red-700 ml-auto"
                >
                    Dzēst
                </button>
            </div>

            {/* ── 2. VIRSRAKSTS + VERSIJAS STATUSS ── */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* Apstiprināšanas bloks — virs nosaukuma mobilā, labajā pusē desktop */}
                {(d.versionStatus || d.approvalDate || d.decisionNumber || d.decisionReference) && (
                    <div className="text-left md:text-right text-sm md:shrink-0 md:order-2">
                        {d.versionStatus && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1
                                ${d.versionStatus.toLowerCase().includes('apstip')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-vea-orange-light text-vea-orange'}`}>
                                {d.versionStatus}
                            </span>
                        )}
                        <div className="text-gray-500 space-y-0.5 text-xs">
                            {d.approvalDate && <p>Apstiprināts: {d.approvalDate}</p>}
                            {d.decisionNumber && <p>Lēmums Nr.: {d.decisionNumber}</p>}
                            {d.decisionReference && <p>{d.decisionReference}</p>}
                        </div>
                    </div>
                )}
                {/* Nosaukums */}
                <div className="flex-1 min-w-0 md:order-1">
                    <h1 className="text-3xl font-bold font-heading text-vea-neutral leading-tight">{d.titleLv}</h1>
                    {d.titleEn && (
                        <p className="text-base text-gray-500 italic mt-0.5">{d.titleEn}</p>
                    )}
                </div>
            </div>

            {/* Dzēšanas apstiprinājums */}
            {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex flex-wrap items-center gap-4">
                    <p className="text-red-700 font-medium flex-1">
                        Vai tiešām vēlies dzēst šo kursu? Šo darbību nevar atsaukt.
                    </p>
                    <button
                        onClick={handleDelete} disabled={deleting}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                    >
                        {deleting ? 'Dzēš...' : 'Jā, dzēst'}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 text-sm"
                    >
                        Atcelt
                    </button>
                    {deleteError && <p className="w-full text-red-600 text-sm">{deleteError}</p>}
                </div>
            )}

            {/* ── 3. PAMATA INFORMĀCIJA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <h2 className="text-lg font-semibold font-heading text-vea-neutral mb-4">Pamata informācija</h2>

                {/* Divas kolonnas: Kurss | Pasniegšanas konteksts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 mb-4">
                    <div>
                        <SubLabel>Kurss</SubLabel>
                        <ul className="space-y-1.5">
                            <InfoRow label="Autors" value={d.authorFullTitle} />
                            <InfoRow label="Atbildīgais mācībspēks" value={d.teacherFullTitle} />
                            <InfoRow label="LAIS kods" value={d.courseCode} />
                            <InfoRow label="Pārbaudes forma" value={d.assessmentForm} />
                            <InfoRow label="Kredītpunkti / ECTS" value={d.credits} />
                            <InfoRow
                                label="Studiju programma"
                                value={d.studyPrograms && d.studyPrograms.length > 0
                                    ? d.studyPrograms.join(', ')
                                    : null}
                            />
                            <InfoRow label="Studiju programmas daļa" value={null} />
                        </ul>
                    </div>
                    <div>
                        <SubLabel>Pasniegšanas konteksts</SubLabel>
                        <ul className="space-y-1.5">
                            <InfoRow label="Akadēmiskais gads" value={d.academicYear} />
                            <InfoRow label="Semestris" value={d.semester} />
                            <InfoRow label="Mācību valoda" value={d.language} />
                            <InfoRow label="Fakultāte" value={d.facultyName} />
                        </ul>
                    </div>
                </div>

                {/* Stundu sadalījums — stat bloks */}
                <div className="border-t border-gray-100 pt-4 mb-4">
                    <SubLabel>Stundu sadalījums</SubLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <HourStat label="Kontaktstundas kopā" value={d.academicHoursTotal} />
                        <HourStat label="Lekcijas" value={d.lectureHours} />
                        <HourStat label="Praktiskās nodarbības" value={d.practClassesHours} />
                        <HourStat label="Patstāvīgais darbs" value={d.independentWorkHours} />
                    </div>
                </div>

                {/* Priekšnosacījumi */}
                <div className="border-t border-gray-100 pt-4 text-sm">
                    <SubLabel>Nepieciešamās zināšanas kursa uzsākšanai</SubLabel>
                    {d.prerequisitesDescription || (d.prerequisites && d.prerequisites.length > 0) ? (
                        <>
                            {d.prerequisitesDescription && (
                                <p className="text-vea-text mb-1">{d.prerequisitesDescription}</p>
                            )}
                            {d.prerequisites && d.prerequisites.length > 0 && (
                                <ul className="list-disc list-inside space-y-0.5 text-gray-700">
                                    {d.prerequisites.map((p, i) => (
                                        <li key={i}>
                                            <span className="font-medium">{p.title}</span>
                                            {p.type && <span className="ml-1 text-gray-500">({p.type})</span>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400">Nav norādīti priekšnosacījumi</p>
                    )}
                </div>
            </section>

            {/* ── 4. ANOTĀCIJA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle title="Studiju kursa anotācija" isEmpty={!d.annotation} />
                {d.annotation
                    ? <p className="text-sm text-vea-text leading-relaxed">{d.annotation}</p>
                    : <p className="text-gray-400 text-sm">Nav aizpildīta</p>
                }
            </section>

            {/* ── 5. MĒRĶIS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle title="Studiju kursa mērķis" isEmpty={!d.goal} />
                {d.goal
                    ? <p className="text-sm text-vea-text leading-relaxed">{d.goal}</p>
                    : <p className="text-gray-400 text-sm">Nav aizpildīts</p>
                }
            </section>

            {/* ── 6. SKR ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studiju kursa rezultāti (SKR)"
                    isEmpty={skrCategories.length === 0}
                />
                {skrCategories.length > 0 ? (
                    <div className="space-y-4">
                        {skrCategories.map((cat, catIndex) => (
                            <div key={cat}>
                                <p className="text-sm font-semibold text-vea-green mb-1">{cat}</p>
                                <ul className="space-y-1 text-sm text-vea-text">
                                    {skrByCategory[cat].map((r, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-gray-400 shrink-0 w-14 text-right">
                                                SKR {catIndex + 1}.{i + 1}
                                            </span>
                                            <span>{r.learningOutcome}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu studiju kursa rezultātu</p>
                )}
            </section>

            {/* ── 7. TĒMAS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studiju kursa saturs"
                    isEmpty={!d.topics || d.topics.length === 0}
                />
                {d.topics && d.topics.length > 0 ? (
                    <ol className="space-y-4 text-sm">
                        {d.topics.map((t, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-vea-green font-bold shrink-0 w-5">{i + 1}.</span>
                                <div className="min-w-0">
                                    <span className="font-semibold text-vea-neutral">{t.title}</span>
                                    {t.description && (
                                        <div
                                            className="mt-1.5 pl-3 border-l-2 border-vea-green-light text-gray-500 text-sm [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_p]:my-0"
                                            dangerouslySetInnerHTML={{ __html: t.description }}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu tēmu</p>
                )}
            </section>

            {/* ── 8. PATSTĀVĪGĀ DARBA ORGANIZĀCIJA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studējošo individuālā patstāvīgā darba organizācija"
                    isEmpty={!d.selfStudyActivities || d.selfStudyActivities.length === 0}
                />
                {d.selfStudyActivities && d.selfStudyActivities.length > 0 ? (
                    <table className="w-full border border-gray-200 text-sm rounded overflow-hidden">
                        <thead className="bg-vea-green-light">
                        <tr>
                            <th scope="col" className="p-2 text-left border-b border-gray-200 text-xs font-semibold text-vea-neutral uppercase tracking-wide">Darbības veids</th>
                            <th scope="col" className="p-2 text-center border-b border-gray-200 w-20 text-xs font-semibold text-vea-neutral uppercase tracking-wide">%</th>
                        </tr>
                        </thead>
                        <tbody>
                        {d.selfStudyActivities.map((s, i) => (
                            <tr key={i} className="even:bg-gray-50">
                                <td className="p-2 border-b border-gray-100">{s.activityName}</td>
                                <td className="p-2 border-b border-gray-100 text-center">{s.percentage}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-400 text-sm">Nav norādīts patstāvīgā darba sadalījums</p>
                )}
            </section>

            {/* ── 9. VĒRTĒŠANAS KRITĒRIJI ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studiju kursa rezultātu vērtēšanas kritēriji"
                    isEmpty={(!d.assessmentDistribution || d.assessmentDistribution.length === 0)
                        && skrCategories.length === 0}
                />

                {d.assessmentDistribution && d.assessmentDistribution.length > 0 ? (
                    <div className="mb-5">
                        <p className="text-sm font-medium text-vea-neutral mb-2">
                            Vērtēšanas sadalījums (kopā 100%)
                        </p>
                        <table className="w-full border border-gray-200 text-sm">
                            <thead className="bg-vea-green-light">
                            <tr>
                                <th scope="col" className="p-2 text-left border-b border-gray-200 text-xs font-semibold text-vea-neutral uppercase tracking-wide">Komponente</th>
                                <th scope="col" className="p-2 text-center border-b border-gray-200 w-20 text-xs font-semibold text-vea-neutral uppercase tracking-wide">%</th>
                            </tr>
                            </thead>
                            <tbody>
                            {d.assessmentDistribution.map((a, i) => (
                                <tr key={i} className="even:bg-gray-50">
                                    <td className="p-2 border-b border-gray-100">{a.componentName}</td>
                                    <td className="p-2 border-b border-gray-100 text-center">{a.percentage}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-4">Nav norādīts vērtēšanas sadalījums</p>
                )}

                {skrCategories.length > 0 && allComponents.length > 0 && (
                    <div>
                        <p className="text-sm font-medium text-vea-neutral mb-2">SKR × Vērtēšanas kritēriji</p>
                        <div className="overflow-x-auto">
                            <table className="border-collapse text-sm w-full">
                                <thead>
                                <tr className="bg-vea-green-light">
                                    <th scope="col" className="border border-gray-200 px-3 py-2 text-left text-xs font-semibold text-vea-neutral">SKR</th>
                                    {allComponents.map(c => (
                                        <th key={c} scope="col"
                                            className="border border-gray-200 px-2 py-2 text-center font-normal text-xs whitespace-nowrap text-vea-neutral">
                                            {c}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {skrCategories.map(cat =>
                                    skrByCategory[cat].map((r, i) => (
                                        <tr key={r.courseResultId} className="even:bg-gray-50">
                                            <td className="border border-gray-200 px-3 py-2 text-xs">
                                                {i === 0 && (
                                                    <span className="font-semibold text-vea-green block mb-0.5">{cat}</span>
                                                )}
                                                {r.learningOutcome}
                                            </td>
                                            {allComponents.map(c => (
                                                <td key={c}
                                                    className="border border-gray-200 px-2 py-2 text-center text-vea-green">
                                                    {r.components && r.components.includes(c) ? '✓' : ''}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* ── 10. KALENDĀRAIS PLĀNS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <h2 className="text-lg font-semibold font-heading text-vea-neutral mb-3">Studiju kursa kalendārais plāns</h2>
                {d.calendarPlan && d.calendarPlan.length > 0 ? (
                    <table className="w-full border border-gray-200 text-sm">
                        <thead className="bg-vea-green-light">
                        <tr>
                            <th className="p-2 text-left border-b border-gray-200 text-xs font-semibold text-vea-neutral uppercase tracking-wide">Tēma</th>
                            <th className="p-2 border-b border-gray-200 text-xs font-semibold text-vea-neutral uppercase tracking-wide">Nodarbības veids</th>
                            <th className="p-2 text-center border-b border-gray-200 w-24 text-xs font-semibold text-vea-neutral uppercase tracking-wide">Ak. st.</th>
                        </tr>
                        </thead>
                        <tbody>
                        {d.calendarPlan.map((plan, pi) =>
                            (plan.sessions || []).map((session, si) => (
                                <tr key={`${pi}-${si}`} className="even:bg-gray-50">
                                    {si === 0 && (
                                        <td className="p-2 border-b border-gray-100 font-medium align-top"
                                            rowSpan={(plan.sessions || []).length}>
                                            {plan.topicTitle}
                                        </td>
                                    )}
                                    <td className="p-2 border-b border-gray-100">{session.sessionType}</td>
                                    <td className="p-2 border-b border-gray-100 text-center">{session.academicHours}</td>
                                </tr>
                            ))
                        )}
                        <tr className="font-semibold bg-vea-green-light">
                            <td colSpan={2} className="p-2 border-t border-gray-200">Kopā:</td>
                            <td className="p-2 border-t border-gray-200 text-center">{calendarTotalHours}</td>
                        </tr>
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-400 text-sm italic">
                        Kalendārais plāns vēl nav izveidots. Pievienot to var rediģēšanas skatā.
                    </p>
                )}
            </section>

            {/* ── 11. LITERATŪRA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Literatūra un materiāli"
                    isEmpty={!d.literature || d.literature.length === 0}
                />
                {d.literature && d.literature.length > 0 ? (
                    <div className="space-y-4">
                        {d.literature.map((group, i) => (
                            <div key={i}>
                                <p className="text-sm font-semibold text-vea-green mb-1">{group.type}</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-vea-text">
                                    {(group.sources || []).map((src, j) => (
                                        <li key={j}>
                                            {src.url
                                                ? <a href={src.url} target="_blank" rel="noreferrer"
                                                     className="text-vea-green hover:underline">{src.citation}</a>
                                                : src.citation
                                            }
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">Nav pievienotu literatūras avotu</p>
                )}
            </section>

            {d.authorFullTitle && (
                <footer className="text-xs text-gray-400 text-right pb-4">
                    Autors: {d.authorFullTitle}
                </footer>
            )}
        </div>
    );
}

export default CourseDetails;
