import { useState } from 'react';
import api from '../../services/axiosConfig';

/**
 * Rediģēšanas forma kalendārajam plānam.
 *
 * @param {string} courseInfoId - CourseInfo UUID
 * @param {object} data         - CourseDetailsDTO (satur calendarPlan[] un topics[])
 * @param {object} lookups      - { sessionTypes: [{id, name}] }
 * @param {Function} onSaved    - izsaucam pēc veiksmīgas saglabāšanas
 */
function CourseCalendarSection({ courseInfoId, data, lookups, onSaved }) {
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    const existingContentIds = new Set((data.calendarPlan || []).map(p => p.courseContentId));
    const availableTopics = (data.topics || []).filter(t => !existingContentIds.has(t.id));

    const [newTopicContentId, setNewTopicContentId] = useState('');
    const [newSession, setNewSession] = useState({ calendarTopicId: '', sessionTypeId: '', academicHours: 1 });

    const selectClass = "border border-gray-300 rounded p-2 text-sm focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none";

    const handleAddTopic = async () => {
        if (!newTopicContentId) return;
        setSaving(true);
        setError(null);
        try {
            const topic = (data.topics || []).find(t => t.id === Number(newTopicContentId));
            await api.post('/calendar-topics', {
                courseInfo: { id: courseInfoId },
                courseContent: { id: Number(newTopicContentId) },
                sequenceNumber: topic ? topic.sequenceNumber : 0,
                language: 'lv',
            });
            setNewTopicContentId('');
            onSaved();
        } catch {
            setError('Neizdevās pievienot tēmu.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTopic = async (calendarTopicId) => {
        setSaving(true);
        setError(null);
        try {
            await api.delete(`/calendar-topics/${calendarTopicId}`);
            onSaved();
        } catch {
            setError('Neizdevās dzēst tēmu.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSession = async () => {
        if (!newSession.calendarTopicId || !newSession.sessionTypeId || !newSession.academicHours) return;
        setSaving(true);
        setError(null);
        try {
            await api.post('/calendar-sessions', {
                topic: { id: Number(newSession.calendarTopicId) },
                sessionType: { id: Number(newSession.sessionTypeId) },
                academicHours: Number(newSession.academicHours),
            });
            setNewSession({ calendarTopicId: '', sessionTypeId: '', academicHours: 1 });
            onSaved();
        } catch {
            setError('Neizdevās pievienot nodarbību.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        setSaving(true);
        setError(null);
        try {
            await api.delete(`/calendar-sessions/${sessionId}`);
            onSaved();
        } catch {
            setError('Neizdevās dzēst nodarbību.');
        } finally {
            setSaving(false);
        }
    };

    const calendarPlan = data.calendarPlan || [];
    const sessionTypes = lookups.sessionTypes || [];

    const thClass = "p-2 text-left border-b border-gray-200 text-xs font-semibold text-vea-neutral uppercase tracking-wide";

    return (
        <div className="space-y-5">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            {/* Esošais kalendārais plāns */}
            {calendarPlan.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-vea-green-light">
                        <tr>
                            <th scope="col" className={thClass}>Tēma</th>
                            <th scope="col" className={thClass}>Nodarbības veids</th>
                            <th scope="col" className={`${thClass} text-center w-20`}>Ak. st.</th>
                            <th scope="col" aria-label="Darbības" className="p-2 border-b border-gray-200 w-16"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {calendarPlan.map(plan => (
                            plan.sessions && plan.sessions.length > 0
                                ? plan.sessions.map((session, si) => (
                                    <tr key={session.sessionId} className="border-t border-gray-100 even:bg-gray-50">
                                        {si === 0 && (
                                            <td className="p-2 align-top font-medium"
                                                rowSpan={plan.sessions.length}>
                                                <div className="flex items-start justify-between gap-2">
                                                    <span>{plan.topicTitle}</span>
                                                    <button
                                                        onClick={() => handleDeleteTopic(plan.calendarTopicId)}
                                                        disabled={saving}
                                                        className="text-red-500 hover:text-red-700 text-xs shrink-0 mt-0.5"
                                                        aria-label="Dzēst tēmu ar visām nodarbībām"
                                                    >✕</button>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-2">{session.sessionType}</td>
                                        <td className="p-2 text-center">{session.academicHours}</td>
                                        <td className="p-2 text-center">
                                            <button
                                                onClick={() => handleDeleteSession(session.sessionId)}
                                                disabled={saving}
                                                className="text-red-500 hover:text-red-700 text-xs"
                                                aria-label="Dzēst nodarbību"
                                            >✕</button>
                                        </td>
                                    </tr>
                                ))
                                : (
                                    <tr key={plan.calendarTopicId} className="border-t border-gray-100">
                                        <td className="p-2 font-medium">
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{plan.topicTitle}</span>
                                                <button
                                                    onClick={() => handleDeleteTopic(plan.calendarTopicId)}
                                                    disabled={saving}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                    aria-label="Dzēst tēmu"
                                                >✕</button>
                                            </div>
                                        </td>
                                        <td colSpan={3} className="p-2 text-gray-400 text-xs">
                                            Nav nodarbību
                                        </td>
                                    </tr>
                                )
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400 text-sm">Kalendārais plāns vēl nav izveidots.</p>
            )}

            {/* Pievienot nodarbību esošai tēmai */}
            {calendarPlan.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-vea-neutral">Pievienot nodarbību</p>
                    <div className="flex gap-2 flex-wrap">
                        <select
                            className={`${selectClass} flex-1 min-w-40`}
                            value={newSession.calendarTopicId}
                            onChange={e => setNewSession({ ...newSession, calendarTopicId: e.target.value })}
                        >
                            <option value="">— izvēlies tēmu —</option>
                            {calendarPlan.map(p => (
                                <option key={p.calendarTopicId} value={p.calendarTopicId}>
                                    {p.topicTitle}
                                </option>
                            ))}
                        </select>
                        <select
                            className={`${selectClass} flex-1 min-w-36`}
                            value={newSession.sessionTypeId}
                            onChange={e => setNewSession({ ...newSession, sessionTypeId: e.target.value })}
                        >
                            <option value="">— nodarbības veids —</option>
                            {sessionTypes.map(st => (
                                <option key={st.id} value={st.id}>{st.name}</option>
                            ))}
                        </select>
                        <input
                            type="number" min="1"
                            className={`${selectClass} w-24`}
                            value={newSession.academicHours}
                            onChange={e => setNewSession({ ...newSession, academicHours: e.target.value })}
                            placeholder="Ak. st."
                        />
                        <button
                            onClick={handleAddSession}
                            disabled={saving || !newSession.calendarTopicId || !newSession.sessionTypeId}
                            className="bg-vea-green text-white px-3 py-2 rounded text-sm hover:bg-vea-green-dark disabled:opacity-50"
                        >
                            Pievienot
                        </button>
                    </div>
                </div>
            )}

            {/* Pievienot jaunu tēmu */}
            {availableTopics.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium text-vea-neutral">Pievienot tēmu kalendāram</p>
                    <div className="flex gap-2">
                        <select
                            className={`${selectClass} flex-1`}
                            value={newTopicContentId}
                            onChange={e => setNewTopicContentId(e.target.value)}
                        >
                            <option value="">— izvēlies tēmu —</option>
                            {availableTopics.map(t => (
                                <option key={t.id} value={t.id}>{t.title}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddTopic}
                            disabled={saving || !newTopicContentId}
                            className="bg-vea-green text-white px-3 py-2 rounded text-sm hover:bg-vea-green-dark disabled:opacity-50"
                        >
                            Pievienot
                        </button>
                    </div>
                </div>
            )}

            {availableTopics.length === 0 && calendarPlan.length === 0 && (
                <p className="text-vea-orange bg-vea-orange-light border border-vea-orange rounded-lg px-3 py-2 text-sm">
                    Vispirms pievienojiet tēmas cilnē "Tēmas", tad varēsiet veidot kalendāro plānu.
                </p>
            )}

            {availableTopics.length === 0 && calendarPlan.length > 0 && (
                <p className="text-gray-500 text-xs">Visas tēmas jau ir pievienotas kalendāram.</p>
            )}
        </div>
    );
}

export default CourseCalendarSection;
