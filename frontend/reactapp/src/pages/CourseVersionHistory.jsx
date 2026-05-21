import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Plus, Archive } from 'lucide-react';
import api from '../services/axiosConfig';
import { useToast } from '../components/ui/ToastProvider';
import { statusBadgeClass } from '../utils/statusBadge';
import { extractErrorMessage } from '../utils/errorMessage';
import WarningDialog from '../components/ui/WarningDialog';
import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('lv-LV', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function personLabel(user) {
    if (!user) return '—';
    const name = [user.name, user.surname].filter(Boolean).join(' ').trim();
    return name || user.email || '—';
}

function CourseVersionHistory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const showToast = useToast();
    const { hasRole } = useAuth();
    const canCreateVersion = hasRole('TEACHER');
    const canArchive = hasRole('ADMIN');

    const [course, setCourse] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [creating, setCreating] = useState(false);
    const [archiveTarget, setArchiveTarget] = useState(null);
    const [archiving, setArchiving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            api.get(`/courses/${id}`),
            api.get(`/course-versions/by-course/${id}`),
        ])
            .then(([cRes, vRes]) => {
                if (cancelled) return;
                setCourse(cRes.data);
                const sorted = [...(vRes.data || [])].sort(
                    (a, b) => (b.versionNumber || 0) - (a.versionNumber || 0)
                );
                setVersions(sorted);
            })
            .catch(err => {
                if (cancelled) return;
                // 400 — nederīgs UUID URL parametrā; 404 — kurss DB neeksistē.
                const status = err?.response?.status;
                if (status === 400 || status === 404) {
                    setNotFound(true);
                } else {
                    showToast('Neizdevās ielādēt versiju vēsturi.', 'error');
                }
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, showToast]);

    const reload = () => {
        setLoading(true);
        api.get(`/course-versions/by-course/${id}`)
            .then(res => {
                const sorted = [...(res.data || [])].sort(
                    (a, b) => (b.versionNumber || 0) - (a.versionNumber || 0)
                );
                setVersions(sorted);
            })
            .catch(() => showToast('Neizdevās ielādēt versijas.', 'error'))
            .finally(() => setLoading(false));
    };

    const handleArchive = async () => {
        if (!archiveTarget) return;
        setArchiving(true);
        try {
            await api.delete(`/course-versions/${archiveTarget.id}`);
            showToast(`Versija Nr. ${archiveTarget.versionNumber} arhivēta.`);
            setArchiveTarget(null);
            reload();
        } catch (err) {
            console.error('Kļūda arhivējot versiju:', err);
            showToast(extractErrorMessage(err, 'Neizdevās arhivēt versiju.'), 'error');
        } finally {
            setArchiving(false);
        }
    };

    const handleCreateNewVersion = async () => {
        if (creating || versions.length === 0) return;
        // Bāzes versija jaunajai = jaunākā ne-arhivētā (pirmā sarakstā, jo sortēts desc)
        const baseVersion = versions[0];
        setCreating(true);
        try {
            const res = await api.post(`/course-versions/${baseVersion.id}/duplicate`);
            const newVersion = res.data;
            showToast(`Izveidota jauna versija (Nr. ${newVersion.versionNumber}). Status: Melnraksts.`);
            navigate(`/courses/${id}/edit?version=${newVersion.id}`);
        } catch (err) {
            console.error('Kļūda veidojot jaunu versiju:', err);
            showToast('Neizdevās izveidot jaunu versiju. Mēģiniet vēlreiz.', 'error');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē versiju vēsturi…</div>;
    if (notFound) return <NotFound />;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-4">
            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-heading text-vea-neutral">Versiju vēsture</h1>
                    {course && (
                        <p className="text-base text-gray-600">
                            {course.courseCode && <span className="font-mono mr-2">{course.courseCode}</span>}
                            {course.titleLv}
                        </p>
                    )}
                </div>
                {versions.length > 0 && canCreateVersion && (
                    <button
                        type="button"
                        onClick={handleCreateNewVersion}
                        disabled={creating}
                        className="inline-flex items-center gap-1.5 bg-vea-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-vea-green-dark disabled:opacity-60 transition-colors shrink-0"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        {creating ? 'Veido…' : 'Veidot jaunu versiju'}
                    </button>
                )}
            </header>

            {versions.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
                    Šim kursam vēl nav versiju.
                </div>
            ) : (
                <>
                    {/* Desktop / planšete: tabula */}
                    <div className="hidden md:block vea-table-wrap">
                        <table className="vea-table">
                            <thead>
                                <tr>
                                    <th scope="col" className="w-16 text-center">Nr.</th>
                                    <th scope="col" className="w-44">Statuss</th>
                                    <th scope="col">Akad. gads</th>
                                    <th scope="col">Semestris</th>
                                    <th scope="col">Autors</th>
                                    <th scope="col" className="w-32">Izveidots</th>
                                    <th scope="col" className="w-32">Atjaunots</th>
                                    <th scope="col" className="w-32 text-right" aria-label="Darbības" />
                                </tr>
                            </thead>
                            <tbody>
                                {versions.map(v => (
                                    <tr key={v.id}>
                                        <td className="vea-td text-center font-semibold">{v.versionNumber}</td>
                                        <td className="vea-td">
                                            <div className="flex flex-wrap gap-1">
                                                {v.status?.name && (
                                                    <span className={statusBadgeClass(v.status.name)}>{v.status.name}</span>
                                                )}
                                                {v.active && v.status?.name?.toLowerCase().includes('apstip') && (
                                                    <span className="vea-badge bg-vea-green-light text-vea-green">Aktīvā</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="vea-td text-sm">{v.academicYear?.year ?? v.academicYear?.name ?? '—'}</td>
                                        <td className="vea-td text-sm">{v.semester?.name ?? '—'}</td>
                                        <td className="vea-td text-sm">{personLabel(v.createdBy)}</td>
                                        <td className="vea-td text-sm text-gray-500">{formatDate(v.createdAt)}</td>
                                        <td className="vea-td text-sm text-gray-500">{formatDate(v.updatedAt)}</td>
                                        <td className="vea-td text-right">
                                            <div className="inline-flex gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(v.active
                                                        ? `/courses/${id}`
                                                        : `/courses/${id}/versions/${v.id}/view`)}
                                                    className="inline-flex items-center gap-1.5 bg-white text-vea-green border border-vea-green px-3 py-1.5 rounded text-sm hover:bg-vea-green-light transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" aria-hidden="true" />
                                                    Skatīt
                                                </button>
                                                {canArchive && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setArchiveTarget(v)}
                                                        disabled={v.active}
                                                        title={v.active ? 'Aktīvo versiju nevar arhivēt' : 'Arhivēt šo versiju'}
                                                        className="inline-flex items-center gap-1.5 bg-white text-vea-orange border border-vea-orange px-2.5 py-1.5 rounded text-sm hover:bg-vea-orange-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                                        aria-label={`Arhivēt versiju ${v.versionNumber}`}
                                                    >
                                                        <Archive className="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile: kartīšu saraksts */}
                    <ul className="md:hidden space-y-3">
                        {versions.map(v => (
                            <li key={v.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-semibold text-vea-neutral">Nr. {v.versionNumber}</span>
                                        {v.status?.name && (
                                            <span className={statusBadgeClass(v.status.name)}>{v.status.name}</span>
                                        )}
                                        {v.active && v.status?.name?.toLowerCase().includes('apstip') && (
                                            <span className="vea-badge bg-vea-green-light text-vea-green">Aktīvā</span>
                                        )}
                                    </div>
                                </div>
                                <dl className="text-sm text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1">
                                    <dt className="text-gray-400">Akad. gads</dt>
                                    <dd>{v.academicYear?.year ?? v.academicYear?.name ?? '—'}</dd>
                                    <dt className="text-gray-400">Semestris</dt>
                                    <dd>{v.semester?.name ?? '—'}</dd>
                                    <dt className="text-gray-400">Autors</dt>
                                    <dd>{personLabel(v.createdBy)}</dd>
                                    <dt className="text-gray-400">Izveidots</dt>
                                    <dd>{formatDate(v.createdAt)}</dd>
                                    <dt className="text-gray-400">Atjaunots</dt>
                                    <dd>{formatDate(v.updatedAt)}</dd>
                                </dl>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(v.active
                                            ? `/courses/${id}`
                                            : `/courses/${id}/versions/${v.id}/view`)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-vea-green border border-vea-green px-3 py-2 rounded text-sm hover:bg-vea-green-light transition-colors"
                                    >
                                        <Eye className="w-4 h-4" aria-hidden="true" />
                                        Skatīt versiju
                                    </button>
                                    {canArchive && (
                                        <button
                                            type="button"
                                            onClick={() => setArchiveTarget(v)}
                                            disabled={v.active}
                                            className="inline-flex items-center justify-center gap-1.5 bg-white text-vea-orange border border-vea-orange px-3 py-2 rounded text-sm hover:bg-vea-orange-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                                            aria-label="Arhivēt versiju"
                                        >
                                            <Archive className="w-4 h-4" aria-hidden="true" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <WarningDialog
                open={!!archiveTarget}
                title="Arhivēt versiju"
                description={
                    <p>
                        Vai tiešām vēlies arhivēt <span className="font-semibold">versiju Nr. {archiveTarget?.versionNumber}</span>
                        {archiveTarget?.status?.name && <> (statuss: <span className="font-semibold">{archiveTarget.status.name}</span>)</>}?
                        {' '}Versiju varēs atjaunot administrācijas arhīva sadaļā.
                    </p>
                }
                primaryLabel={archiving ? 'Arhivē…' : 'Arhivēt'}
                primaryTone="danger"
                onPrimary={handleArchive}
                onClose={() => !archiving && setArchiveTarget(null)}
            />
        </div>
    );
}

export default CourseVersionHistory;
