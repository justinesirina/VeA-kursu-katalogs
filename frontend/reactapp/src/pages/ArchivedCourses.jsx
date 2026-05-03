import { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import api from '../services/axiosConfig';
import { useToast } from '../components/ui/ToastProvider';
import { statusBadgeClass } from '../utils/statusBadge';

const TABS = [
    { key: 'courses', label: 'Kursi' },
    { key: 'versions', label: 'Versijas' },
];

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('lv-LV', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function ArchivedCourses() {
    const showToast = useToast();
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [permanentTarget, setPermanentTarget] = useState(null);
    const [confirmText, setConfirmText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const loadCourses = useCallback(async () => {
        try {
            const res = await api.get('/courses/archived');
            setCourses(res.data ?? []);
        } catch (e) {
            showToast('Neizdevās ielādēt arhivētos kursus', 'error');
        }
    }, [showToast]);

    const loadVersions = useCallback(async () => {
        try {
            const res = await api.get('/course-versions/archived');
            setVersions(res.data ?? []);
        } catch (e) {
            showToast('Neizdevās ielādēt arhivētās versijas', 'error');
        }
    }, [showToast]);

    useEffect(() => {
        setLoading(true);
        Promise.all([loadCourses(), loadVersions()]).finally(() => setLoading(false));
    }, [loadCourses, loadVersions]);

    const handleRestoreCourse = async (id, title) => {
        if (!window.confirm(`Atjaunot kursu "${title}"? Tas atgriezīsies aktīvajā katalogā.`)) return;
        try {
            await api.put(`/courses/${id}/restore`);
            showToast('Kurss atjaunots');
            loadCourses();
        } catch (e) {
            showToast(e.response?.data || 'Neizdevās atjaunot kursu', 'error');
        }
    };

    const handleRestoreVersion = async (id, label) => {
        if (!window.confirm(`Atjaunot versiju "${label}"?`)) return;
        try {
            await api.put(`/course-versions/${id}/restore`);
            showToast('Versija atjaunota');
            loadVersions();
        } catch (e) {
            showToast(e.response?.data || 'Neizdevās atjaunot versiju', 'error');
        }
    };

    const openPermanentDelete = (type, id, label, confirmPhrase) => {
        setPermanentTarget({ type, id, label, confirmPhrase });
        setConfirmText('');
    };

    const closePermanentDelete = () => {
        setPermanentTarget(null);
        setConfirmText('');
    };

    const handlePermanentDelete = async () => {
        if (!permanentTarget) return;
        setDeleting(true);
        try {
            const url = permanentTarget.type === 'course'
                ? `/courses/${permanentTarget.id}/permanent`
                : `/course-versions/${permanentTarget.id}/permanent`;
            await api.delete(url);
            showToast(permanentTarget.type === 'course' ? 'Kurss neatgriezeniski dzēsts' : 'Versija neatgriezeniski dzēsta');
            closePermanentDelete();
            if (permanentTarget.type === 'course') loadCourses();
            else loadVersions();
        } catch (e) {
            showToast(e.response?.data || 'Neizdevās dzēst neatgriezeniski', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const courseRows = courses;
    const versionRows = versions;
    const canConfirm = permanentTarget && confirmText.trim() === permanentTarget.confirmPhrase;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="border-b border-gray-200 mb-4" role="tablist" aria-label="Arhīva sadaļas">
                <div className="flex gap-1">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.key;
                        const count = tab.key === 'courses' ? courseRows.length : versionRows.length;
                        return (
                            <button
                                key={tab.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                    isActive
                                        ? 'border-vea-green text-vea-green'
                                        : 'border-transparent text-vea-neutral hover:text-vea-green hover:bg-vea-green-light/40'
                                }`}
                            >
                                {tab.label}
                                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                                    isActive ? 'bg-vea-green-light text-vea-green' : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading && (
                <p className="text-sm text-gray-500">Ielādē...</p>
            )}

            {!loading && activeTab === 'courses' && (
                <ArchivedCoursesTable
                    rows={courseRows}
                    onRestore={handleRestoreCourse}
                    onPermanentDelete={(c) => openPermanentDelete('course', c.id, c.titleLv, c.titleLv)}
                />
            )}

            {!loading && activeTab === 'versions' && (
                <ArchivedVersionsTable
                    rows={versionRows}
                    onRestore={handleRestoreVersion}
                    onPermanentDelete={(v) => {
                        const phrase = `${v.course?.titleLv ?? ''} v${v.versionNumber}`.trim();
                        openPermanentDelete('version', v.id, phrase, phrase);
                    }}
                />
            )}

            {permanentTarget && (
                <PermanentDeleteModal
                    target={permanentTarget}
                    confirmText={confirmText}
                    onChange={setConfirmText}
                    onCancel={closePermanentDelete}
                    onConfirm={handlePermanentDelete}
                    canConfirm={canConfirm}
                    deleting={deleting}
                />
            )}
        </div>
    );
}

function RestoreButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex items-center gap-1.5 bg-white text-vea-green border border-vea-green px-3 py-1.5 rounded text-sm hover:bg-vea-green-light transition-colors"
        >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Atjaunot
        </button>
    );
}

function PermanentDeleteButton({ onClick, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="inline-flex items-center gap-1.5 bg-white text-red-600 border border-red-300 px-2.5 py-1.5 rounded text-sm hover:bg-red-50 transition-colors"
        >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            Dzēst
        </button>
    );
}

function EmptyState({ children }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
            {children}
        </div>
    );
}

function PermanentDeleteModal({ target, confirmText, onChange, onCancel, onConfirm, canConfirm, deleting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="perm-delete-title">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-5">
                <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    </div>
                    <div>
                        <h2 id="perm-delete-title" className="text-lg font-semibold font-heading text-vea-neutral">
                            Neatgriezeniska dzēšana
                        </h2>
                        <p className="text-sm text-gray-600 mt-0.5">
                            Šī darbība pilnīgi izdzēsīs {target.type === 'course' ? 'kursu un visas tā versijas' : 'šo versiju un tās saturu'} no datubāzes. To nevarēs atjaunot.
                        </p>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700 mb-4">
                    Lai apstiprinātu, ievadi precīzi:
                    <div className="font-mono font-semibold mt-1">{target.confirmPhrase}</div>
                </div>

                <input
                    type="text"
                    value={confirmText}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Ievadi apstiprinājuma tekstu"
                    className="w-full p-2 border border-gray-300 rounded focus:border-red-500 focus:ring-1 focus:ring-red-300 outline-none mb-4"
                    autoFocus
                />

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="border border-gray-300 bg-white px-4 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                        Atcelt
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!canConfirm || deleting}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {deleting ? 'Dzēš...' : 'Dzēst pavisam'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ArchivedCoursesTable({ rows, onRestore, onPermanentDelete }) {
    if (rows.length === 0) {
        return <EmptyState>Nav arhivētu kursu.</EmptyState>;
    }
    return (
        <>
        <div className="hidden md:block vea-table-wrap">
            <table className="vea-table table-fixed w-full">
                <colgroup>
                    <col />{/* Kurss — paplašinās */}
                    <col className="w-16" />
                    <col className="w-28" />
                    <col className="w-36" />
                    <col className="w-28" />
                    <col className="w-56" />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">Kurss</th>
                        <th scope="col" className="text-center">KP</th>
                        <th scope="col" className="text-center whitespace-nowrap">Versijas</th>
                        <th scope="col" className="whitespace-nowrap">Statuss</th>
                        <th scope="col">Arhivēts</th>
                        <th scope="col" className="text-right" aria-label="Darbības" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map(c => (
                        <tr key={c.id}>
                            <td className="vea-td text-sm">
                                <div className="flex flex-col leading-tight">
                                    {c.courseCode && (
                                        <span className="text-vea-neutral font-medium">{c.courseCode}</span>
                                    )}
                                    <span className="text-gray-700">{c.titleLv || '(bez nosaukuma)'}</span>
                                    {c.titleEn && (
                                        <span className="text-gray-400 italic">{c.titleEn}</span>
                                    )}
                                </div>
                            </td>
                            <td className="vea-td text-sm text-center">{c.credits}</td>
                            <td className="vea-td text-sm text-center">
                                {c.versionCount > 0
                                    ? c.versionCount
                                    : <span className="text-gray-400">—</span>}
                            </td>
                            <td className="vea-td text-sm">
                                {c.latestVersionStatus ? (
                                    <span className="vea-badge vea-badge-neutral">
                                        {c.latestVersionStatus}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                            <td className="vea-td text-sm text-gray-500">{formatDate(c.deletedAt)}</td>
                            <td className="vea-td text-right">
                                <div className="inline-flex gap-2">
                                    <RestoreButton
                                        onClick={() => onRestore(c.id, c.titleLv)}
                                        label={`Atjaunot kursu ${c.titleLv}`}
                                    />
                                    <PermanentDeleteButton
                                        onClick={() => onPermanentDelete(c)}
                                        label={`Neatgriezeniski dzēst kursu ${c.titleLv}`}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile: kartīšu saraksts */}
        <ul className="md:hidden space-y-3">
            {rows.map(c => (
                <li key={c.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                    <div className="flex flex-col leading-tight text-sm">
                        {c.courseCode && (
                            <span className="text-vea-neutral font-medium">{c.courseCode}</span>
                        )}
                        <span className="text-gray-700">{c.titleLv || '(bez nosaukuma)'}</span>
                        {c.titleEn && <span className="text-gray-400 italic">{c.titleEn}</span>}
                    </div>
                    <dl className="text-sm text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1">
                        <dt className="text-gray-400">KP</dt>
                        <dd>{c.credits}</dd>
                        <dt className="text-gray-400">Versijas</dt>
                        <dd>{c.versionCount > 0 ? c.versionCount : '—'}</dd>
                        <dt className="text-gray-400">Statuss</dt>
                        <dd>
                            {c.latestVersionStatus ? (
                                <span className="vea-badge vea-badge-neutral">{c.latestVersionStatus}</span>
                            ) : '—'}
                        </dd>
                        <dt className="text-gray-400">Arhivēts</dt>
                        <dd>{formatDate(c.deletedAt)}</dd>
                    </dl>
                    <div className="flex gap-2 pt-1">
                        <RestoreButton
                            onClick={() => onRestore(c.id, c.titleLv)}
                            label={`Atjaunot kursu ${c.titleLv}`}
                        />
                        <PermanentDeleteButton
                            onClick={() => onPermanentDelete(c)}
                            label={`Neatgriezeniski dzēst kursu ${c.titleLv}`}
                        />
                    </div>
                </li>
            ))}
        </ul>
        </>
    );
}

function ArchivedVersionsTable({ rows, onRestore, onPermanentDelete }) {
    if (rows.length === 0) {
        return <EmptyState>Nav arhivētu kursu versiju.</EmptyState>;
    }
    return (
        <>
        <div className="hidden md:block vea-table-wrap">
            <table className="vea-table table-fixed w-full">
                <colgroup>
                    <col />{/* Kurss — paplašinās */}
                    <col className="w-20" />
                    <col className="w-32" />
                    <col className="w-28" />
                    <col className="w-24" />
                    <col className="w-28" />
                    <col className="w-56" />
                </colgroup>
                <thead>
                    <tr>
                        <th scope="col">Kurss</th>
                        <th scope="col" className="text-center whitespace-nowrap">Versija</th>
                        <th scope="col">Statuss</th>
                        <th scope="col" className="whitespace-nowrap">Akad. gads</th>
                        <th scope="col">Semestris</th>
                        <th scope="col">Arhivēts</th>
                        <th scope="col" className="text-right" aria-label="Darbības" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map(v => {
                        const label = `Versija ${v.versionNumber} kursam ${v.course?.titleLv ?? ''}`;
                        return (
                            <tr key={v.id}>
                                <td className="vea-td text-sm">
                                    {v.course ? (
                                        <div className="flex flex-col leading-tight">
                                            {v.course.courseCode && (
                                                <span className="text-vea-neutral font-medium">{v.course.courseCode}</span>
                                            )}
                                            <span className="text-gray-700">{v.course.titleLv ?? '(bez nosaukuma)'}</span>
                                            {v.course.titleEn && (
                                                <span className="text-gray-400 italic">{v.course.titleEn}</span>
                                            )}
                                        </div>
                                    ) : '—'}
                                </td>
                                <td className="vea-td text-sm text-center">{v.versionNumber}</td>
                                <td className="vea-td">
                                    {v.status?.name && (
                                        <span className="vea-badge vea-badge-neutral">{v.status.name}</span>
                                    )}
                                </td>
                                <td className="vea-td text-sm">{v.academicYear?.year ?? v.academicYear?.name ?? '—'}</td>
                                <td className="vea-td text-sm">{v.semester?.name ?? '—'}</td>
                                <td className="vea-td text-sm text-gray-500">{formatDate(v.deletedAt)}</td>
                                <td className="vea-td text-right">
                                    <div className="inline-flex gap-2">
                                        <RestoreButton
                                            onClick={() => onRestore(v.id, label)}
                                            label={`Atjaunot ${label}`}
                                        />
                                        <PermanentDeleteButton
                                            onClick={() => onPermanentDelete(v)}
                                            label={`Neatgriezeniski dzēst ${label}`}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Mobile: kartīšu saraksts */}
        <ul className="md:hidden space-y-3">
            {rows.map(v => {
                const label = `Versija ${v.versionNumber} kursam ${v.course?.titleLv ?? ''}`;
                return (
                    <li key={v.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                        {v.course && (
                            <div className="flex flex-col leading-tight text-sm">
                                {v.course.courseCode && (
                                    <span className="text-vea-neutral font-medium">{v.course.courseCode}</span>
                                )}
                                <span className="text-gray-700">{v.course.titleLv ?? '(bez nosaukuma)'}</span>
                                {v.course.titleEn && (
                                    <span className="text-gray-400 italic">{v.course.titleEn}</span>
                                )}
                            </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap text-sm">
                            <span className="text-vea-neutral font-medium">Versija Nr. {v.versionNumber}</span>
                            {v.status?.name && (
                                <span className="vea-badge vea-badge-neutral">{v.status.name}</span>
                            )}
                        </div>
                        <dl className="text-sm text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1">
                            <dt className="text-gray-400">Akad. gads</dt>
                            <dd>{v.academicYear?.year ?? v.academicYear?.name ?? '—'}</dd>
                            <dt className="text-gray-400">Semestris</dt>
                            <dd>{v.semester?.name ?? '—'}</dd>
                            <dt className="text-gray-400">Arhivēts</dt>
                            <dd>{formatDate(v.deletedAt)}</dd>
                        </dl>
                        <div className="flex gap-2 pt-1">
                            <RestoreButton
                                onClick={() => onRestore(v.id, label)}
                                label={`Atjaunot ${label}`}
                            />
                            <PermanentDeleteButton
                                onClick={() => onPermanentDelete(v)}
                                label={`Neatgriezeniski dzēst ${label}`}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
        </>
    );
}

export default ArchivedCourses;
