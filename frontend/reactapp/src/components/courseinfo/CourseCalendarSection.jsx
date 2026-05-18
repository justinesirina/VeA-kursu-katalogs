import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../services/axiosConfig';
import { useToast } from '../ui/ToastProvider';
import CalendarHoursPanel from '../ui/CalendarHoursPanel';
import { classifyType } from '../../utils/calendarHours';

const NEW_TYPE_VALUE = '__new__';

function CourseCalendarSection({ courseInfoId, data, lookups, onSaved, onSessionTypeAdded }) {
    const showToast = useToast();
    const [saving, setSaving] = useState(false);
    const syncingRef = useRef(false);

    const blockNonNumeric = e => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
    };

    const topics = useMemo(() => data.topics || [], [data.topics]);
    const sessionTypes = lookups.sessionTypes || [];

    // Kalendārs izmanto tieši to pašu secību, kas "Tēmas" sadaļā (courseContent.sequenceNumber).
    // Tas novērš situāciju, kad abi skati laika gaitā atšķiras.
    const calendarPlan = useMemo(() => {
        const seqByContent = new Map(topics.map(t => [t.id, t.sequenceNumber || 0]));
        return [...(data.calendarPlan || [])].sort((a, b) => {
            const sa = seqByContent.get(a.courseContentId) ?? 0;
            const sb = seqByContent.get(b.courseContentId) ?? 0;
            return sa - sb;
        });
    }, [data.calendarPlan, topics]);

    // Auto-sync: pievieno trūkstošās tēmas kalendāram ar sākotnējo secību no "Tēmas"
    useEffect(() => {
        if (syncingRef.current) return;
        if (!courseInfoId) return;
        const missing = topics.filter(
            t => !(data.calendarPlan || []).some(p => p.courseContentId === t.id)
        );
        if (missing.length === 0) return;

        syncingRef.current = true;
        (async () => {
            try {
                // Lai izvairītos no sequenceNumber sadursmēm, sākuma vērtību ņemam no lielākā eksistējošā + 1
                const maxSeq = (data.calendarPlan || []).reduce(
                    (m, p) => Math.max(m, p.sequenceNumber || 0), 0
                );
                let seq = maxSeq;
                for (const topic of missing) {
                    seq += 1;
                    await api.post('/calendar-topics', {
                        courseInfo: { id: courseInfoId },
                        courseContent: { id: topic.id },
                        sequenceNumber: topic.sequenceNumber || seq,
                        language: 'lv',
                    });
                }
                syncingRef.current = false;
                onSaved();
            } catch {
                syncingRef.current = false;
                showToast('Neizdevās automātiski pievienot tēmu kalendāram.', 'error');
            }
        })();
    }, [topics, data.calendarPlan, courseInfoId, onSaved, showToast]);

    // Pievienošanas rindas stāvoklis
    const [rowInputs, setRowInputs] = useState({});
    const setRow = (topicId, patch) => setRowInputs(prev => ({
        ...prev, [topicId]: { ...(prev[topicId] || {}), ...patch }
    }));
    const clearRow = (topicId) => setRowInputs(prev => {
        const next = { ...prev }; delete next[topicId]; return next;
    });
    const getRow = (topicId) => rowInputs[topicId] || {
        sessionTypeId: '', academicHours: 1, newTypeName: '', errors: {}
    };

    // Sessiju rediģēšanas stāvoklis: { [sessionId]: { sessionTypeId, academicHours, errors } }
    const [editSessions, setEditSessions] = useState({});
    const startEditSession = (session) => {
        setEditSessions(prev => ({
            ...prev,
            [session.sessionId]: {
                sessionTypeId: session.sessionTypeId,
                academicHours: session.academicHours,
                errors: {},
            }
        }));
    };
    const cancelEditSession = (sessionId) => setEditSessions(prev => {
        const next = { ...prev }; delete next[sessionId]; return next;
    });
    const setEditField = (sessionId, patch) => setEditSessions(prev => ({
        ...prev, [sessionId]: { ...prev[sessionId], ...patch }
    }));

    // --- Validācijas loģika ---
    // Aprēķina pieejamās stundas konkrētam veidam, ignorējot atsevišķu sesiju (rediģēšanai)
    const computeRemaining = (kind, ignoreSessionId = null) => {
        let used = 0;
        calendarPlan.forEach(p => (p.sessions || []).forEach(s => {
            if (s.sessionId === ignoreSessionId) return;
            if (classifyType(s.sessionType) === kind) used += s.academicHours;
        }));
        const total = kind === 'lecture' ? data.lectureHours : data.practClassesHours;
        return total != null ? Number(total) - used : null;
    };

    const computeRemainingTotal = (ignoreSessionId = null) => {
        let used = 0;
        calendarPlan.forEach(p => (p.sessions || []).forEach(s => {
            if (s.sessionId === ignoreSessionId) return;
            used += s.academicHours;
        }));
        return data.academicHoursTotal != null ? Number(data.academicHoursTotal) - used : null;
    };

    const validateHours = ({ hours, kind, ignoreSessionId }) => {
        if (!hours || hours < 1) return 'Vismaz 1';
        const remKind = computeRemaining(kind, ignoreSessionId);
        if (remKind != null && hours > remKind) {
            const label = kind === 'lecture' ? 'lekciju' : 'praktiskās';
            return `Pārsniedz pieejamās ${label} stundas (atlikušas: ${Math.max(0, remKind)})`;
        }
        const remTotal = computeRemainingTotal(ignoreSessionId);
        if (remTotal != null && hours > remTotal) {
            return `Pārsniedz kopējās kontaktstundas (atlikušas: ${Math.max(0, remTotal)})`;
        }
        return null;
    };

    const kindForTypeId = (typeId) => {
        const st = sessionTypes.find(s => String(s.id) === String(typeId));
        return classifyType(st && st.name);
    };

    // --- Darbības ---
    const handleDeleteTopic = async (calendarTopicId) => {
        setSaving(true);
        try {
            await api.delete(`/calendar-topics/${calendarTopicId}`);
            showToast('Tēma noņemta no kalendāra.');
            onSaved();
        } catch {
            showToast('Neizdevās dzēst tēmu.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleMoveTopic = async (plan, direction) => {
        const idx = calendarPlan.findIndex(p => p.calendarTopicId === plan.calendarTopicId);
        const neighborIdx = idx + direction;
        if (neighborIdx < 0 || neighborIdx >= calendarPlan.length) return;

        // Izveido jauno secību ar apmainītām vietām
        const newOrder = [...calendarPlan];
        [newOrder[idx], newOrder[neighborIdx]] = [newOrder[neighborIdx], newOrder[idx]];

        setSaving(true);
        try {
            // Atjaunina courseContent.sequenceNumber — vienotais secības avots abiem skatiem
            // (tā arī "Tēmas" sadaļā redzamā secība automātiski atbilst kalendāram)
            const topicsById = new Map(topics.map(t => [t.id, t]));
            await Promise.all(newOrder.map((p, i) => {
                const topic = topicsById.get(p.courseContentId);
                if (!topic) return Promise.resolve();
                return api.put(`/course-content/${p.courseContentId}`, {
                    courseInfo: { id: courseInfoId },
                    sequenceNumber: i + 1,
                    topicTitle: topic.title,
                    topicDescription: topic.description || null,
                    language: 'lv',
                });
            }));
            onSaved();
        } catch {
            showToast('Neizdevās mainīt tēmas secību.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        setSaving(true);
        try {
            await api.delete(`/calendar-sessions/${sessionId}`);
            showToast('Nodarbība dzēsta.');
            onSaved();
        } catch {
            showToast('Neizdevās dzēst nodarbību.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleMoveSession = async (plan, sessionIndex, direction) => {
        const sessions = plan.sessions || [];
        const neighborIdx = sessionIndex + direction;
        if (neighborIdx < 0 || neighborIdx >= sessions.length) return;

        // Izveido jauno nodarbību secību tēmas ietvaros ar apmainītām vietām
        const newOrder = [...sessions];
        [newOrder[sessionIndex], newOrder[neighborIdx]] = [newOrder[neighborIdx], newOrder[sessionIndex]];

        setSaving(true);
        try {
            // Normalizē visu šīs tēmas nodarbību sequenceNumber (1, 2, 3...)
            await Promise.all(newOrder.map((s, i) =>
                api.put(`/calendar-sessions/${s.sessionId}`, {
                    topic: { id: Number(plan.calendarTopicId) },
                    sessionType: { id: Number(s.sessionTypeId) },
                    academicHours: s.academicHours,
                    sequenceNumber: i + 1,
                })
            ));
            onSaved();
        } catch {
            showToast('Neizdevās mainīt nodarbības secību.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEditSession = async (plan, session) => {
        const edit = editSessions[session.sessionId];
        const errors = {};

        if (!edit.sessionTypeId) errors.type = 'Izvēlies veidu';
        const hours = Number(edit.academicHours);
        if (!errors.type) {
            const msg = validateHours({
                hours,
                kind: kindForTypeId(edit.sessionTypeId),
                ignoreSessionId: session.sessionId,
            });
            if (msg) errors.hours = msg;
        }

        if (Object.keys(errors).length > 0) {
            setEditField(session.sessionId, { errors });
            showToast('Pārbaudi ievadītos datus.', 'error');
            return;
        }

        setSaving(true);
        try {
            await api.put(`/calendar-sessions/${session.sessionId}`, {
                topic: { id: Number(plan.calendarTopicId) },
                sessionType: { id: Number(edit.sessionTypeId) },
                academicHours: hours,
            });
            cancelEditSession(session.sessionId);
            showToast('Nodarbība atjaunināta.');
            onSaved();
        } catch {
            showToast('Neizdevās saglabāt izmaiņas.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSession = async (plan) => {
        const row = getRow(plan.calendarTopicId);
        const errors = {};

        if (!row.sessionTypeId) {
            errors.type = 'Izvēlies nodarbības veidu';
        } else if (row.sessionTypeId === NEW_TYPE_VALUE && !(row.newTypeName || '').trim()) {
            errors.newType = 'Ievadi veida nosaukumu';
        }

        const hours = Number(row.academicHours);
        if (!errors.type && !errors.newType) {
            // Jaunam veidam pēc noklusējuma klasificējam kā praktisko (ne-lekciju)
            const kind = row.sessionTypeId === NEW_TYPE_VALUE
                ? classifyType(row.newTypeName)
                : kindForTypeId(row.sessionTypeId);
            const msg = validateHours({ hours, kind });
            if (msg) errors.hours = msg;
        } else if (!hours || hours < 1) {
            errors.hours = 'Vismaz 1';
        }

        if (Object.keys(errors).length > 0) {
            setRow(plan.calendarTopicId, { errors });
            showToast('Pārbaudi ievadītos datus.', 'error');
            return;
        }

        setSaving(true);
        try {
            let sessionTypeId = row.sessionTypeId;
            if (sessionTypeId === NEW_TYPE_VALUE) {
                const res = await api.post('/session-types', {
                    name: row.newTypeName.trim(),
                    description: null,
                });
                sessionTypeId = res.data.id;
                if (typeof onSessionTypeAdded === 'function') onSessionTypeAdded(res.data);
                showToast(`Jauns nodarbības veids "${res.data.name}" saglabāts.`);
            }

            await api.post('/calendar-sessions', {
                topic: { id: Number(plan.calendarTopicId) },
                sessionType: { id: Number(sessionTypeId) },
                academicHours: hours,
            });
            clearRow(plan.calendarTopicId);
            showToast('Nodarbība pievienota.');
            onSaved();
        } catch {
            showToast('Neizdevās pievienot nodarbību.', 'error');
        } finally {
            setSaving(false);
        }
    };

    // --- UI ---
    const inputBase = "border rounded p-2 text-sm outline-none focus:ring-1";
    const inputOk = "border-gray-300 focus:border-vea-green focus:ring-vea-green";
    const inputErr = "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300";

    const hasAnyTotal = data.academicHoursTotal != null
        || data.lectureHours != null
        || data.practClassesHours != null;

    return (
        <div className="space-y-5">

            {/* Info panelis */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-vea-neutral">Stundu sadalījums</p>
                {hasAnyTotal ? (
                    <CalendarHoursPanel
                        calendarPlan={calendarPlan}
                        targetTotal={data.academicHoursTotal}
                        targetLecture={data.lectureHours}
                        targetPractical={data.practClassesHours}
                    />
                ) : (
                    <p className="text-vea-orange bg-vea-orange-light border border-vea-orange rounded-lg px-3 py-2 text-sm">
                        Vispirms aizpildi "Apraksts" sadaļu (kopējās, lekciju un praktisko stundas), lai būtu pret ko validēt sadalījumu.
                    </p>
                )}
                <p className="text-sm text-gray-500">
                    Praktiskās nodarbības ietver arī seminārus, laboratorijas darbus un citus ne lekciju veidus.
                </p>
            </div>

            {/* Tēmu saraksts */}
            {topics.length === 0 ? (
                <p className="text-vea-orange bg-vea-orange-light border border-vea-orange rounded-lg px-3 py-2 text-sm">
                    Vispirms pievienojiet tēmas cilnē "Tēmas", tad varēsiet veidot kalendāro plānu.
                </p>
            ) : calendarPlan.length === 0 ? (
                <p className="text-gray-400 text-sm">Ielādē tēmas kalendāram…</p>
            ) : (
                <div className="space-y-4">
                    {calendarPlan.map((plan, idx) => {
                        const row = getRow(plan.calendarTopicId);
                        const topicTotal = (plan.sessions || []).reduce((sum, s) => sum + s.academicHours, 0);
                        const isFirst = idx === 0;
                        const isLast = idx === calendarPlan.length - 1;
                        return (
                            <div key={plan.calendarTopicId} className="bg-white rounded-lg border border-gray-200 border-t-4 border-t-vea-green overflow-hidden shadow-sm">
                                {/* Tēmas galvene — numurēts aplis; mobilā 2. rinda stackota */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-3 gap-2 border-b border-gray-200">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-vea-green-light text-vea-green font-bold text-sm shrink-0">
                                            {idx + 1}
                                        </span>
                                        <div className="flex flex-col text-vea-neutral/60 text-xs leading-none">
                                            <button
                                                onClick={() => handleMoveTopic(plan, -1)}
                                                disabled={saving || isFirst}
                                                className="hover:text-vea-green disabled:opacity-30"
                                                aria-label="Pārvietot tēmu augšup"
                                                title="Pārvietot augšup"
                                            >▲</button>
                                            <button
                                                onClick={() => handleMoveTopic(plan, 1)}
                                                disabled={saving || isLast}
                                                className="hover:text-vea-green disabled:opacity-30"
                                                aria-label="Pārvietot tēmu lejup"
                                                title="Pārvietot lejup"
                                            >▼</button>
                                        </div>
                                        <span className="font-semibold text-vea-neutral text-base sm:text-lg truncate min-w-0">{plan.topicTitle}</span>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-start gap-3 shrink-0 self-stretch sm:self-auto">
                                        <span className="text-sm text-gray-600">Kopā: <span className="font-semibold text-vea-neutral">{topicTotal}</span> ak. st.</span>
                                        <button
                                            onClick={() => handleDeleteTopic(plan.calendarTopicId)}
                                            disabled={saving}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                            aria-label="Noņemt tēmu no kalendāra"
                                        >✕ Noņemt</button>
                                    </div>
                                </div>

                                {/* Sesiju chip saraksts + add-rinda */}
                                <div className="p-3 space-y-2">
                                    {(plan.sessions || []).map((session, sIdx) => {
                                        const edit = editSessions[session.sessionId];
                                        const isFirstSession = sIdx === 0;
                                        const isLastSession = sIdx === plan.sessions.length - 1;
                                        if (edit) {
                                            return (
                                                <div key={session.sessionId} className="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 rounded-lg border border-vea-green-light bg-vea-green-light/30">
                                                    <div className="flex-1 min-w-0 sm:min-w-40 w-full sm:w-auto">
                                                        <select
                                                            className={`${inputBase} ${edit.errors?.type ? inputErr : inputOk} w-full`}
                                                            value={edit.sessionTypeId || ''}
                                                            onChange={e => setEditField(session.sessionId, {
                                                                sessionTypeId: e.target.value,
                                                                errors: { ...(edit.errors || {}), type: undefined }
                                                            })}
                                                        >
                                                            <option value="">— izvēlies —</option>
                                                            {sessionTypes.map(st => (
                                                                <option key={st.id} value={st.id}>{st.name}</option>
                                                            ))}
                                                        </select>
                                                        {edit.errors?.type && (
                                                            <p className="text-red-500 text-sm mt-1">{edit.errors.type}</p>
                                                        )}
                                                    </div>
                                                    <div className="w-full sm:w-24">
                                                        <input
                                                            type="number" min="1"
                                                            className={`${inputBase} ${edit.errors?.hours ? inputErr : inputOk} w-full text-center`}
                                                            value={edit.academicHours}
                                                            onChange={e => setEditField(session.sessionId, {
                                                                academicHours: e.target.value,
                                                                errors: { ...(edit.errors || {}), hours: undefined }
                                                            })}
                                                            onKeyDown={blockNonNumeric}
                                                        />
                                                        {edit.errors?.hours && (
                                                            <p className="text-red-500 text-sm mt-1">{edit.errors.hours}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handleSaveEditSession(plan, session)}
                                                            disabled={saving}
                                                            className="flex-1 sm:flex-none bg-vea-green text-white px-3 py-1.5 rounded text-sm hover:bg-vea-green-dark disabled:opacity-50"
                                                        >Saglabāt</button>
                                                        <button
                                                            onClick={() => cancelEditSession(session.sessionId)}
                                                            disabled={saving}
                                                            className="text-sm text-vea-neutral hover:text-red-500 px-2"
                                                        >Atcelt</button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={session.sessionId} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-vea-green-light hover:shadow-sm transition-all">
                                                <div className="flex flex-col text-vea-neutral/40 text-xs leading-none shrink-0 group-hover:text-vea-green">
                                                    <button
                                                        onClick={() => handleMoveSession(plan, sIdx, -1)}
                                                        disabled={saving || isFirstSession}
                                                        className="hover:text-vea-green disabled:opacity-30"
                                                        aria-label="Pārvietot nodarbību augšup"
                                                        title="Pārvietot augšup"
                                                    >▲</button>
                                                    <button
                                                        onClick={() => handleMoveSession(plan, sIdx, 1)}
                                                        disabled={saving || isLastSession}
                                                        className="hover:text-vea-green disabled:opacity-30"
                                                        aria-label="Pārvietot nodarbību lejup"
                                                        title="Pārvietot lejup"
                                                    >▼</button>
                                                </div>
                                                <span className="w-1 h-8 bg-vea-green rounded-full shrink-0" aria-hidden="true"></span>
                                                <span className="flex-1 font-medium text-vea-text text-base truncate">{session.sessionType}</span>
                                                <span className="inline-flex items-center gap-1 bg-vea-green-light text-vea-green font-semibold px-3 py-1 rounded-full text-sm shrink-0">
                                                    {session.academicHours} ak. st.
                                                </span>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <button
                                                        onClick={() => startEditSession(session)}
                                                        disabled={saving}
                                                        className="p-1.5 text-vea-orange hover:bg-vea-orange-light rounded"
                                                        aria-label="Rediģēt nodarbību"
                                                        title="Rediģēt"
                                                    >✎</button>
                                                    <button
                                                        onClick={() => handleDeleteSession(session.sessionId)}
                                                        disabled={saving}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                                        aria-label="Dzēst nodarbību"
                                                        title="Dzēst"
                                                    >✕</button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Pievienošanas rinda — mobilā stackota vertikāli */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2 px-3 py-2.5 rounded-lg border-2 border-dashed border-vea-green/40 bg-vea-green-light/10">
                                        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-vea-green text-white text-lg font-bold shrink-0" aria-hidden="true">+</div>
                                        <div className="flex-1 min-w-0 sm:min-w-40">
                                            <select
                                                className={`${inputBase} ${row.errors?.type ? inputErr : inputOk} w-full bg-white`}
                                                value={row.sessionTypeId || ''}
                                                onChange={e => setRow(plan.calendarTopicId, {
                                                    sessionTypeId: e.target.value,
                                                    errors: { ...(row.errors || {}), type: undefined, newType: undefined }
                                                })}
                                                aria-label="Nodarbības veids"
                                            >
                                                <option value="">— nodarbības veids —</option>
                                                {sessionTypes.map(st => (
                                                    <option key={st.id} value={st.id}>{st.name}</option>
                                                ))}
                                                <option value={NEW_TYPE_VALUE}>+ Jauns veids…</option>
                                            </select>
                                            {row.errors?.type && (
                                                <p className="text-red-500 text-sm mt-1">{row.errors.type}</p>
                                            )}
                                            {row.sessionTypeId === NEW_TYPE_VALUE && (
                                                <div className="mt-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Piem.: Seminārs"
                                                        className={`${inputBase} ${row.errors?.newType ? inputErr : inputOk} w-full bg-white`}
                                                        value={row.newTypeName || ''}
                                                        onChange={e => setRow(plan.calendarTopicId, {
                                                            newTypeName: e.target.value,
                                                            errors: { ...(row.errors || {}), newType: undefined }
                                                        })}
                                                    />
                                                    {row.errors?.newType && (
                                                        <p className="text-red-500 text-sm mt-1">{row.errors.newType}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full sm:w-20">
                                            <input
                                                type="number" min="1"
                                                className={`${inputBase} ${row.errors?.hours ? inputErr : inputOk} w-full text-center bg-white`}
                                                placeholder="Ak. st."
                                                value={row.academicHours ?? ''}
                                                onChange={e => setRow(plan.calendarTopicId, {
                                                    academicHours: e.target.value,
                                                    errors: { ...(row.errors || {}), hours: undefined }
                                                })}
                                                onKeyDown={blockNonNumeric}
                                                aria-label="Akadēmiskās stundas"
                                            />
                                            {row.errors?.hours && (
                                                <p className="text-red-500 text-sm mt-1">{row.errors.hours}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddSession(plan)}
                                            disabled={saving}
                                            className="w-full sm:w-auto bg-vea-green text-white px-3 py-1.5 rounded text-sm hover:bg-vea-green-dark disabled:opacity-50 shrink-0"
                                        >
                                            Pievienot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default CourseCalendarSection;
