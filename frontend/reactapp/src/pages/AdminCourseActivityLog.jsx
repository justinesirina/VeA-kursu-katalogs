import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import api from '../services/axiosConfig';
import { useToast } from '../components/ui/ToastProvider';

const ACTION_BADGE_CLASSES = {
    // F8 versiju statusu pārejas
    submit:              'bg-blue-100 text-blue-700',
    approve:             'bg-green-100 text-green-700',
    reject:              'bg-red-100 text-red-700',
    reopen_to_draft:     'bg-vea-orange-light text-vea-orange',
    // F9 paplašinātais kursu darbību žurnāls
    course_create:       'bg-vea-green-light text-vea-green',
    course_archive:      'bg-gray-200 text-gray-600',
    course_restore:      'bg-blue-100 text-blue-700',
    course_hard_delete:  'bg-red-100 text-red-700',
    version_create:      'bg-vea-green-light text-vea-green',
    version_archive:     'bg-gray-200 text-gray-600',
    version_restore:     'bg-blue-100 text-blue-700',
    version_hard_delete: 'bg-red-100 text-red-700',
};

function actionBadgeClass(code) {
    return `vea-badge ${ACTION_BADGE_CLASSES[code] || 'vea-badge-neutral'}`;
}

function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('lv-LV', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

function AdminCourseActivityLog() {
    const showToast = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtri
    const [filterCourse, setFilterCourse] = useState('');
    const [filterUser, setFilterUser] = useState('');
    const [filterAction, setFilterAction] = useState('');
    const [filterFrom, setFilterFrom] = useState('');
    const [filterTo, setFilterTo] = useState('');

    useEffect(() => {
        let cancelled = false;
        api.get('/course-version-logs')
            .then(res => { if (!cancelled) setLogs(res.data || []); })
            .catch(() => { if (!cancelled) showToast('Neizdevās ielādēt kursu darbību žurnālu.', 'error'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [showToast]);

    // Unikālas vērtības filtru izvēlnēm
    const courses = useMemo(() => {
        const map = new Map();
        for (const l of logs) {
            if (l.courseId) map.set(l.courseId, l.courseCode || l.courseTitleLv || l.courseId);
        }
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [logs]);

    const users = useMemo(() => {
        const map = new Map();
        for (const l of logs) {
            if (l.userId) {
                const name = [l.userName, l.userSurname].filter(Boolean).join(' ').trim();
                map.set(l.userId, name || `Lietotājs #${l.userId}`);
            }
        }
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [logs]);

    const actions = useMemo(() => {
        const map = new Map();
        for (const l of logs) {
            if (l.actionCode) map.set(l.actionCode, l.actionLabel || l.actionCode);
        }
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
    }, [logs]);

    const filtered = useMemo(() => {
        return logs.filter(l => {
            if (filterCourse && l.courseId !== filterCourse) return false;
            if (filterUser && String(l.userId) !== String(filterUser)) return false;
            if (filterAction && l.actionCode !== filterAction) return false;
            if (filterFrom && (!l.createdAt || l.createdAt < filterFrom)) return false;
            if (filterTo) {
                const cutoff = `${filterTo}T23:59:59`;
                if (!l.createdAt || l.createdAt > cutoff) return false;
            }
            return true;
        });
    }, [logs, filterCourse, filterUser, filterAction, filterFrom, filterTo]);

    const hasFilters = filterCourse || filterUser || filterAction || filterFrom || filterTo;
    const clearFilters = () => {
        setFilterCourse(''); setFilterUser(''); setFilterAction('');
        setFilterFrom(''); setFilterTo('');
    };

    const selectClass = 'p-2 border border-gray-300 rounded text-sm focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none';

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē kursu darbību žurnālu…</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-4">
            <p className="text-sm text-gray-500">
                Visi kursu un to versiju darbību ieraksti: izveide, statusu pārejas, arhivēšana
                un atjaunošana. 
            </p>

            {/* Filtri */}
            <section className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-vea-green" aria-hidden="true" />
                    <h2 className="text-sm font-semibold text-vea-neutral">Filtri</h2>
                    {hasFilters && (
                        <button type="button" onClick={clearFilters}
                            className="ml-auto text-xs text-gray-500 hover:text-vea-neutral inline-flex items-center gap-1">
                            <X className="w-3 h-3" aria-hidden="true" />
                            Notīrīt filtrus
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    <select className={selectClass} value={filterCourse} onChange={e => setFilterCourse(e.target.value)}>
                        <option value="">Visi kursi</option>
                        {courses.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                    </select>
                    <select className={selectClass} value={filterUser} onChange={e => setFilterUser(e.target.value)}>
                        <option value="">Visi lietotāji</option>
                        {users.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                    </select>
                    <select className={selectClass} value={filterAction} onChange={e => setFilterAction(e.target.value)}>
                        <option value="">Visas darbības</option>
                        {actions.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                    </select>
                    <input type="date" className={selectClass} value={filterFrom}
                        onChange={e => setFilterFrom(e.target.value)} aria-label="No datuma" />
                    <input type="date" className={selectClass} value={filterTo}
                        onChange={e => setFilterTo(e.target.value)} aria-label="Līdz datumam" />
                </div>
            </section>

            <p className="text-xs text-gray-500">
                Rāda {filtered.length} no {logs.length} ierakstiem
            </p>

            {filtered.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
                    Nav žurnāla ierakstu, kas atbilst filtriem.
                </div>
            ) : (
                <>
                    {/* Desktop tabula */}
                    <div className="hidden md:block vea-table-wrap">
                        <table className="vea-table">
                            <thead>
                                <tr>
                                    <th className="w-44">Laiks</th>
                                    <th className="w-40">Darbība</th>
                                    <th>Kurss</th>
                                    <th className="w-16 text-center">v#</th>
                                    <th>Lietotājs</th>
                                    <th>Komentārs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(l => (
                                    <tr key={l.id}>
                                        <td className="vea-td text-sm text-gray-600 whitespace-nowrap">{formatDateTime(l.createdAt)}</td>
                                        <td className="vea-td">
                                            <span className={actionBadgeClass(l.actionCode)}>
                                                {l.actionLabel || l.actionCode || '—'}
                                            </span>
                                        </td>
                                        <td className="vea-td text-sm">
                                            {l.courseId ? (
                                                <Link to={`/courses/${l.courseId}/versions`} className="text-vea-green hover:underline">
                                                    {l.courseCode && <span className="font-mono mr-1">{l.courseCode}</span>}
                                                    {l.courseTitleLv}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="vea-td text-center text-sm font-semibold">{l.versionNumber || '—'}</td>
                                        <td className="vea-td text-sm">
                                            <div className="leading-tight">
                                                {[l.userName, l.userSurname].filter(Boolean).join(' ') || '—'}
                                            </div>
                                            {l.userRole && <div className="text-xs text-gray-500">{l.userRole}</div>}
                                        </td>
                                        <td className="vea-td text-sm text-gray-700">
                                            {l.comment || <span className="text-gray-400 italic">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobilā kartīšu sasietība */}
                    <ul className="md:hidden space-y-3">
                        {filtered.map(l => (
                            <li key={l.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <span className={actionBadgeClass(l.actionCode)}>
                                        {l.actionLabel || l.actionCode || '—'}
                                    </span>
                                    <span className="text-xs text-gray-500">{formatDateTime(l.createdAt)}</span>
                                </div>
                                <div className="text-sm">
                                    {l.courseId ? (
                                        <Link to={`/courses/${l.courseId}/versions`} className="text-vea-green hover:underline">
                                            {l.courseCode && <span className="font-mono mr-1">{l.courseCode}</span>}
                                            {l.courseTitleLv}
                                        </Link>
                                    ) : '—'}
                                    {' '}<span className="text-gray-500">v#{l.versionNumber}</span>
                                </div>
                                <div className="text-xs text-gray-600">
                                    {[l.userName, l.userSurname].filter(Boolean).join(' ') || '—'}
                                    {l.userRole && <span className="text-gray-400"> · {l.userRole}</span>}
                                </div>
                                {l.comment && <div className="text-sm text-gray-700">{l.comment}</div>}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default AdminCourseActivityLog;
