import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/axiosConfig';
import PercentageStackBar from '../components/ui/PercentageStackBar';

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

    // --- Kalendārais plāns, sakārtots pēc tēmu un nodarbību secības numuriem ---
    const sortedCalendarPlan = (() => {
        const seqByContent = new Map(
            (d.topics || []).map(t => [t.id, t.sequenceNumber || 0])
        );
        return [...(d.calendarPlan || [])]
            .sort((a, b) => {
                const sa = seqByContent.get(a.courseContentId) ?? 0;
                const sb = seqByContent.get(b.courseContentId) ?? 0;
                return sa - sb;
            })
            .map(plan => ({
                ...plan,
                sessions: [...(plan.sessions || [])].sort(
                    (a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0)
                ),
            }));
    })();

    // --- Palīgkomponents: sekcijas virsraksts ---
    const SectionTitle = ({ title, isEmpty }) => (
        <div className="flex items-center gap-2 mb-3">
            <h2 className="text-2xl font-semibold font-heading text-vea-neutral">{title}</h2>
            {isEmpty && (
                <span title="Sadaļa nav aizpildīta" className="text-vea-orange text-lg" aria-label="Sadaļa nav aizpildīta">⚠</span>
            )}
        </div>
    );

    // --- Palīgkomponents: info rinda (label: value) ---
    const InfoRow = ({ label, value }) => (
        <li className="flex gap-1 text-base">
            <span className="text-gray-500 shrink-0">{label}:</span>
            <span className="font-medium text-vea-text">
                {value || <span className="text-gray-400 font-normal">Nav norādīts</span>}
            </span>
        </li>
    );

    // --- Palīgkomponents: stundu stat bloks ---
    const HourStat = ({ label, value }) => (
        <div className="flex flex-col items-center text-center px-2 py-3 bg-vea-green-light rounded border border-gray-200">
            <span className="text-sm text-gray-500 mb-1 leading-tight">{label}</span>
            <span className="text-3xl font-bold text-vea-neutral">{value ?? 0}</span>
            <span className="text-sm text-gray-400">ak. st.</span>
        </div>
    );

    // --- Palīgkomponents: sadaļas apakšvirsraksts ---
    const SubLabel = ({ children }) => (
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 border-l-2 border-vea-green pl-2 mb-2">
            {children}
        </p>
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto text-vea-text print:text-black">

            <button onClick={() => navigate('/')} className="text-vea-green hover:underline text-base mb-1">
                ← Atpakaļ uz kursiem
            </button>

            {/* ── 1. DARBĪBAS POGAS ── */}
            <div className="flex gap-2 flex-wrap">
                <button className="bg-vea-green text-white px-4 py-2 rounded text-base hover:bg-vea-green-dark">
                    PDF
                </button>
                <button
                    onClick={() => navigate(`/courses/${id}/edit`)}
                    className="bg-vea-orange text-white px-4 py-2 rounded text-base hover:opacity-90"
                >
                    Rediģēt
                </button>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-base hover:bg-red-700 ml-auto"
                >
                    Dzēst
                </button>
            </div>

            {/* ── 2. VIRSRAKSTS + VERSIJAS STATUSS ── */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                {/* Apstiprināšanas bloks — virs nosaukuma mobilā, labajā pusē desktop */}
                {(d.versionStatus || d.approvalDate || d.decisionNumber || d.decisionReference) && (
                    <div className="text-left md:text-right text-base md:shrink-0 md:order-2">
                        {d.versionStatus && (
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1
                                ${d.versionStatus.toLowerCase().includes('apstip')
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-vea-orange-light text-vea-orange'}`}>
                                {d.versionStatus}
                            </span>
                        )}
                        <div className="text-gray-500 space-y-0.5 text-sm">
                            {d.approvalDate && <p>Apstiprināts: {d.approvalDate}</p>}
                            {d.decisionNumber && <p>Lēmums Nr.: {d.decisionNumber}</p>}
                            {d.decisionReference && <p>{d.decisionReference}</p>}
                        </div>
                    </div>
                )}
                {/* Nosaukums */}
                <div className="flex-1 min-w-0 md:order-1">
                    <h1 className="text-4xl md:text-[2.5rem] font-bold font-heading text-vea-neutral leading-tight">{d.titleLv}</h1>
                    {d.titleEn && (
                        <p className="text-xl text-gray-500 italic mt-1">{d.titleEn}</p>
                    )}
                </div>
            </div>

            {/* Dzēšanas apstiprinājums */}
            {showDeleteConfirm && (
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex flex-wrap items-center gap-4">
                    <p className="text-red-700 font-medium flex-1 text-base">
                        Vai tiešām vēlies dzēst šo kursu? Šo darbību nevar atsaukt.
                    </p>
                    <button
                        onClick={handleDelete} disabled={deleting}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 text-base"
                    >
                        {deleting ? 'Dzēš...' : 'Jā, dzēst'}
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 text-base"
                    >
                        Atcelt
                    </button>
                    {deleteError && <p className="w-full text-red-600 text-base">{deleteError}</p>}
                </div>
            )}

            {/* ── 3. PAMATA INFORMĀCIJA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral mb-4">Pamata informācija</h2>

                {/* Divas kolonnas: Kurss | Pasniegšanas konteksts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1 mb-4">
                    <div>
                        <SubLabel>Kurss</SubLabel>
                        <ul className="space-y-1.5">
                            <InfoRow label="LAIS kods" value={d.courseCode} />
                            <InfoRow label="Pārbaudes forma" value={d.assessmentForm} />
                            <InfoRow label="Kredītpunkti / ECTS" value={d.credits} />
                            {d.studyPrograms && d.studyPrograms.length > 0 ? (
                                <li className="flex flex-col gap-0.5 text-base">
                                    <span className="text-gray-500">Studiju programma un daļa:</span>
                                    <ul className="space-y-0.5 pl-1">
                                        {d.studyPrograms.map(p => (
                                            <li key={p.id} className="flex items-baseline gap-2 flex-wrap">
                                                <span className="font-medium text-vea-text">{p.programName}</span>
                                                {p.partName && (
                                                    <span className="text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full">
                                                        {p.partName}
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ) : (
                                <InfoRow label="Studiju programma un daļa" value={null} />
                            )}
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

                {/* Autors un kursa mācībspēks — pilna platuma sub-sadaļa */}
                {((d.authors && d.authors.length > 0) || (d.teachers && d.teachers.length > 0) || d.authorFullTitle || d.teacherFullTitle) && (
                    <div className="border-t border-gray-100 pt-4 mb-4">
                        <SubLabel>Autors un kursa mācībspēks</SubLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                            {/* Kreisā kolonna: Autori */}
                            <div className="space-y-2">
                                {(d.authors && d.authors.length > 0)
                                    ? d.authors.map((a, i) => (
                                        <div key={`a${i}`} className="flex items-baseline gap-2 text-base">
                                            <span className="text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                                                {a.role || 'Autors'}
                                            </span>
                                            <span className="text-vea-text">{a.fullTitle}</span>
                                        </div>
                                    ))
                                    : d.authorFullTitle && (
                                        <div className="flex items-baseline gap-2 text-base">
                                            <span className="text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full shrink-0">Autors</span>
                                            <span className="text-vea-text">{d.authorFullTitle}</span>
                                        </div>
                                    )
                                }
                            </div>
                            {/* Labā kolonna: Mācībspēki */}
                            <div className="space-y-2">
                                {(d.teachers && d.teachers.length > 0)
                                    ? d.teachers.map((t, i) => (
                                        <div key={`t${i}`} className="flex items-baseline gap-2 text-base">
                                            <span className="text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                                                {t.role || 'Mācībspēks'}
                                            </span>
                                            <span className="text-vea-text">{t.fullTitle}</span>
                                        </div>
                                    ))
                                    : d.teacherFullTitle && (
                                        <div className="flex items-baseline gap-2 text-base">
                                            <span className="text-xs bg-vea-green-light text-vea-green px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">Atbildīgais mācībspēks</span>
                                            <span className="text-vea-text">{d.teacherFullTitle}</span>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )}

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
                <div className="border-t border-gray-100 pt-4 text-base">
                    <SubLabel>Nepieciešamās zināšanas kursa uzsākšanai</SubLabel>
                    {d.prerequisitesDescription || (d.prerequisites && d.prerequisites.length > 0) ? (
                        <>
                            {d.prerequisitesDescription && (
                                <p className="text-vea-text mb-1">{d.prerequisitesDescription}</p>
                            )}
                            {d.prerequisites && d.prerequisites.length > 0 && (
                                <ul className="list-disc list-inside space-y-0.5 text-vea-text">
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
                    ? <p className="text-base text-vea-text leading-relaxed">{d.annotation}</p>
                    : <p className="text-gray-400 text-base">Nav aizpildīta</p>
                }
            </section>

            {/* ── 5. MĒRĶIS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle title="Studiju kursa mērķis" isEmpty={!d.goal} />
                {d.goal
                    ? <p className="text-base text-vea-text leading-relaxed">{d.goal}</p>
                    : <p className="text-gray-400 text-base">Nav aizpildīts</p>
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
                                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-1">{cat}</h3>
                                <ul className="space-y-1 text-base text-vea-text">
                                    {skrByCategory[cat].map((r, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-gray-500 shrink-0 w-14 text-right text-sm">
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
                    <p className="text-gray-400 text-base">Nav pievienotu studiju kursa rezultātu</p>
                )}
            </section>

            {/* ── 7. TĒMAS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studiju kursa saturs"
                    isEmpty={!d.topics || d.topics.length === 0}
                />
                {d.topics && d.topics.length > 0 ? (
                    <ol className="space-y-4 text-base">
                        {d.topics.map((t, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="text-vea-green font-bold shrink-0 w-5">{i + 1}.</span>
                                <div className="min-w-0">
                                    <span className="font-semibold text-vea-neutral">{t.title}</span>
                                    {t.description && (
                                        <div
                                            className="mt-1.5 pl-3 border-l-2 border-vea-green-light text-gray-600 text-base [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1 [&_strong]:font-semibold [&_em]:italic [&_u]:underline [&_p]:my-0"
                                            dangerouslySetInnerHTML={{ __html: t.description }}
                                        />
                                    )}
                                </div>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-gray-400 text-base">Nav pievienotu tēmu</p>
                )}
            </section>

            {/* ── 8. KALENDĀRAIS PLĀNS ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral mb-3">Studiju kursa kalendārais plāns</h2>
                {sortedCalendarPlan.length > 0 ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 border-t-4 border-t-vea-green bg-white shadow-sm">
                        {/* Virsraksta josla — redzama tikai no md augšā, imitē .vea-table galveni */}
                        <div className="hidden md:grid grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] bg-vea-green-light text-sm font-semibold text-vea-neutral uppercase tracking-wider">
                            <div className="px-4 py-3 text-center">Nr.</div>
                            <div className="px-4 py-3">Tēma</div>
                            <div className="px-4 py-3">Nodarbības</div>
                            <div className="px-4 py-3 text-center">Ak. st.</div>
                        </div>

                        <ul className="divide-y divide-gray-100">
                            {sortedCalendarPlan.map((plan, pi) => {
                                const topicHours = (plan.sessions || []).reduce((sum, s) => sum + s.academicHours, 0);
                                return (
                                    <li
                                        key={plan.calendarTopicId ?? pi}
                                        className="md:grid md:grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] hover:bg-vea-green-light/40 transition-colors"
                                    >
                                        {/* Mobilajā skatā: galvenes rinda ar Nr., tēmu un stundām */}
                                        <div className="flex items-baseline justify-between gap-2 p-3 md:hidden">
                                            <div className="flex items-baseline gap-2 min-w-0">
                                                <span className="text-gray-500 text-base shrink-0">{pi + 1}.</span>
                                                <span className="font-medium text-vea-neutral text-base">{plan.topicTitle}</span>
                                            </div>
                                            <span className="text-base font-semibold shrink-0 whitespace-nowrap">
                                                {topicHours} ak.st.
                                            </span>
                                        </div>

                                        {/* Desktop šūnas */}
                                        <div className="hidden md:block px-4 py-2.5 text-center text-gray-500 text-base align-top">{pi + 1}.</div>
                                        <div className="hidden md:block px-4 py-2.5 font-medium text-base text-vea-text align-top">{plan.topicTitle}</div>

                                        {/* Nodarbību pill-tagi — vienāds saturs abiem skatiem */}
                                        <div className="px-3 pb-3 md:px-4 md:py-2.5">
                                            {(plan.sessions || []).length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {plan.sessions.map((session, si) => (
                                                        <span
                                                            key={session.sessionId ?? si}
                                                            className="inline-flex items-center gap-1.5 bg-vea-green-light/60 text-vea-neutral rounded-full px-3 py-0.5 text-sm whitespace-nowrap"
                                                        >
                                                            <span className="text-vea-neutral/60 font-medium">{si + 1}.</span>
                                                            <span>{session.sessionType}</span>
                                                            <span className="font-semibold">{session.academicHours} ak.st.</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm italic">Nav nodarbību</span>
                                            )}
                                        </div>

                                        {/* Desktop stundu šūna */}
                                        <div className="hidden md:block px-4 py-2.5 text-center font-semibold text-base text-vea-neutral align-top">{topicHours}</div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Kopsumma */}
                        <div className="flex items-center justify-between bg-vea-green-light font-semibold text-vea-neutral border-t border-gray-200 px-4 py-2.5 md:grid md:grid-cols-[3rem_minmax(12rem,1fr)_minmax(0,2fr)_5rem] md:px-0 md:py-0">
                            <span className="md:hidden text-base">Kopā:</span>
                            <span className="md:hidden text-base">{calendarTotalHours} ak.st.</span>
                            <div className="hidden md:block md:col-span-3 px-4 py-2.5 text-right text-base">Kopā:</div>
                            <div className="hidden md:block px-4 py-2.5 text-center text-base">{calendarTotalHours}</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-base italic">
                        Kalendārais plāns vēl nav izveidots. Pievienot to var rediģēšanas skatā.
                    </p>
                )}
            </section>

            {/* ── 9. PATSTĀVĪGĀ DARBA ORGANIZĀCIJA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studējošo individuālā patstāvīgā darba organizācija"
                    isEmpty={!d.selfStudyActivities || d.selfStudyActivities.length === 0}
                />
                <p className="text-base text-vea-text mb-3">
                    Studentu patstāvīgais darbs: <strong>{d.independentWorkHours ?? 0}</strong> akadēmiskās stundas
                </p>
                {d.selfStudyActivities && d.selfStudyActivities.length > 0 ? (
                    <>
                        <PercentageStackBar rows={d.selfStudyActivities} labelKey="activityName" />
                        <div className="vea-table-wrap">
                            <table className="vea-table">
                                <thead>
                                <tr>
                                    <th scope="col">Aktivitāte</th>
                                    <th scope="col" className="text-center w-20">%</th>
                                </tr>
                                </thead>
                                <tbody>
                                {d.selfStudyActivities.map((s, i) => (
                                    <tr key={i}>
                                        <td className="vea-td">{s.activityName}</td>
                                        <td className="vea-td text-center font-semibold text-vea-neutral">{s.percentage}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-400 text-base">Nav norādīts patstāvīgā darba sadalījums</p>
                )}
            </section>

            {/* ── 10. VĒRTĒŠANAS KRITĒRIJI ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Studiju kursa rezultātu vērtēšana"
                    isEmpty={(!d.assessmentDistribution || d.assessmentDistribution.length === 0)
                        && skrCategories.length === 0}
                />

                {d.assessmentDistribution && d.assessmentDistribution.length > 0 ? (
                    <div className="mb-5">
                        <PercentageStackBar rows={d.assessmentDistribution} labelKey="componentName" />
                        <div className="vea-table-wrap">
                            <table className="vea-table">
                                <thead>
                                <tr>
                                    <th scope="col">Vērtēšanas komponente</th>
                                    <th scope="col" className="text-center w-20">%</th>
                                </tr>
                                </thead>
                                <tbody>
                                {d.assessmentDistribution.map((a, i) => (
                                    <tr key={i}>
                                        <td className="vea-td">{a.componentName}</td>
                                        <td className="vea-td text-center font-semibold text-vea-neutral">{a.percentage}%</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-base mb-4">Nav norādīts vērtēšanas sadalījums</p>
                )}

                {skrCategories.length > 0 && allComponents.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-2">
                            Studiju kursa rezultātu vērtēšanas komponentes
                        </h3>
                        <div className="vea-table-wrap overflow-x-auto">
                            <table className="vea-table border-collapse">
                                <thead>
                                <tr>
                                    <th scope="col">SKR</th>
                                    {allComponents.map(c => (
                                        <th key={c} scope="col" className="text-center align-bottom leading-tight min-w-[6.5rem] max-w-[10rem]">
                                            <span className="break-words whitespace-normal block">{c}</span>
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {skrCategories.map((cat, catIndex) =>
                                    skrByCategory[cat].map((r, i) => (
                                        <tr key={r.courseResultId}>
                                            <td className="vea-td border-r border-gray-100 align-top">
                                                {i === 0 && (
                                                    <span className="font-semibold text-vea-green block mb-1 text-xs uppercase tracking-wide">{cat}</span>
                                                )}
                                                <div className="flex gap-2">
                                                    <span className="font-semibold text-vea-neutral shrink-0 whitespace-nowrap">SKR {catIndex + 1}.{i + 1}.</span>
                                                    <span>{r.learningOutcome}</span>
                                                </div>
                                            </td>
                                            {allComponents.map(c => (
                                                <td key={c} className="vea-td text-center text-vea-green border-r border-gray-100 last:border-r-0">
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

            {/* ── 11. LITERATŪRA ── */}
            <section className="bg-white rounded-lg p-5 border border-gray-200">
                <SectionTitle
                    title="Literatūra un materiāli"
                    isEmpty={!d.literature || d.literature.length === 0}
                />
                {d.literature && d.literature.length > 0 ? (
                    <div className="space-y-4">
                        {[...d.literature]
                            .sort((a, b) => {
                                const order = ['Pamatliteratūra', 'Papildliteratūra', 'Citi avoti'];
                                return order.indexOf(a.type) - order.indexOf(b.type);
                            })
                            .map((group, i) => (
                            <div key={i}>
                                <h3 className="text-xl font-semibold font-heading text-vea-neutral mb-1">{group.type}</h3>
                                <ul className="list-disc list-inside space-y-1 text-base text-vea-text">
                                    {(group.sources || []).map((src, j) => (
                                        <li key={j}>
                                            {src.citation}
                                            {src.language && (
                                                <span className="text-sm text-gray-400 ml-1">({src.language.toUpperCase()})</span>
                                            )}
                                            {src.url && (
                                                <span className="block sm:inline">. Pieejams:{' '}
                                                    <a href={src.url} target="_blank" rel="noreferrer"
                                                       className="text-vea-green hover:underline break-all">
                                                        {src.url}
                                                    </a>
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-base">Nav pievienotu literatūras avotu</p>
                )}
            </section>

            {d.authorFullTitle && (
                <footer className="text-sm text-gray-400 text-right pb-4">
                    Autors: {d.authorFullTitle}
                </footer>
            )}
        </div>
    );
}

export default CourseDetails;
