import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import api from '../services/axiosConfig';
import { useToast } from '../components/ui/ToastProvider';

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('lv-LV', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function statusBadgeClass(name) {
    if (!name) return 'vea-badge vea-badge-neutral';
    const lower = name.toLowerCase();
    if (lower.includes('apstip')) return 'vea-badge bg-green-100 text-green-700';
    if (lower.includes('iesniegts')) return 'vea-badge bg-blue-100 text-blue-700';
    if (lower.includes('noraid')) return 'vea-badge bg-red-100 text-red-700';
    if (lower.includes('arhiv')) return 'vea-badge bg-gray-200 text-gray-600';
    return 'vea-badge bg-vea-orange-light text-vea-orange';
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

    const [course, setCourse] = useState(null);
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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
            .catch(() => {
                if (!cancelled) showToast('Neizdevās ielādēt versiju vēsturi.', 'error');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [id, showToast]);

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
                {versions.length > 0 && (
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
                                                {v.active && (
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
                                        {v.active && (
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
                                <button
                                    type="button"
                                    onClick={() => navigate(v.active
                                        ? `/courses/${id}`
                                        : `/courses/${id}/versions/${v.id}/view`)}
                                    className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-vea-green border border-vea-green px-3 py-2 rounded text-sm hover:bg-vea-green-light transition-colors"
                                >
                                    <Eye className="w-4 h-4" aria-hidden="true" />
                                    Skatīt versiju
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default CourseVersionHistory;
