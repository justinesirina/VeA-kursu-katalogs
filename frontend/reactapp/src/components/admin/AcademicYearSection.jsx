import { useEffect, useState } from 'react';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import api from '../../services/axiosConfig';

const EMPTY = { name: '', startDate: '', endDate: '', active: true };

function AcademicYearSection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const loadItems = () => {
        setLoading(true);
        api.get('/academic-years')
            .then(res => {
                const sorted = [...res.data].sort((a, b) => {
                    const dateA = a.startDate ?? a.name ?? '';
                    const dateB = b.startDate ?? b.name ?? '';
                    return dateB.localeCompare(dateA);
                });
                setItems(sorted);
            })
            .catch(() => setError('Neizdevās ielādēt akadēmiskos gadus.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadItems(); }, []);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 2500);
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setDraft({
            name: item.name ?? '',
            startDate: item.startDate ?? '',
            endDate: item.endDate ?? '',
            active: item.active ?? true,
        });
        setConfirmDeleteId(null);
    };

    const startAdd = () => {
        setEditingId('new');
        setDraft(EMPTY);
        setConfirmDeleteId(null);
    };

    const cancelEdit = () => { setEditingId(null); setDraft(EMPTY); };

    const validate = () => {
        if (!draft.name.trim()) { setError('Nosaukums ir obligāts.'); return false; }
        setError(null);
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const payload = {
            name: draft.name.trim(),
            startDate: draft.startDate || null,
            endDate: draft.endDate || null,
            active: draft.active,
        };
        try {
            if (editingId === 'new') {
                await api.post('/academic-years', payload);
                showSuccess('Ieraksts pievienots.');
            } else {
                await api.put(`/academic-years/${editingId}`, payload);
                showSuccess('Ieraksts saglabāts.');
            }
            setEditingId(null);
            setDraft(EMPTY);
            loadItems();
        } catch {
            setError('Saglabāšana neizdevās.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/academic-years/${id}`);
            setConfirmDeleteId(null);
            showSuccess('Ieraksts dzēsts.');
            loadItems();
        } catch {
            setError('Dzēšana neizdevās. Iespējams, ieraksts tiek izmantots citur.');
        }
    };

    if (loading) return <div className="text-gray-500 py-4">Ielādē...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold font-heading text-vea-neutral">Akadēmiskie gadi</h2>
                <button
                    onClick={startAdd}
                    disabled={editingId !== null}
                    className="flex items-center gap-1 bg-vea-green text-white px-3 py-1.5 rounded hover:bg-vea-green-dark disabled:opacity-50 text-sm"
                >
                    <Plus className="w-4 h-4" /> Pievienot
                </button>
            </div>

            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">{error}</p>}
            {successMsg && <p className="text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3 text-sm">{successMsg}</p>}

            <div className="vea-table-wrap">
            <table className="vea-table">
                <thead>
                    <tr>
                        <th scope="col">Nosaukums</th>
                        <th scope="col">Sākuma datums</th>
                        <th scope="col">Beigu datums</th>
                        <th scope="col" className="text-center">Aktīvs</th>
                        <th scope="col" className="w-24">Darbības</th>
                    </tr>
                </thead>
                <tbody>
                    {editingId === 'new' && (
                        <tr className="bg-vea-orange-light">
                            <td className="vea-td-edit">
                                <input
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={draft.name}
                                    onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                                    placeholder="piemēram, 2025/2026"
                                    autoFocus
                                />
                            </td>
                            <td className="vea-td-edit">
                                <input type="date" className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={draft.startDate} onChange={e => setDraft(p => ({ ...p, startDate: e.target.value }))} />
                            </td>
                            <td className="vea-td-edit">
                                <input type="date" className="border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={draft.endDate} onChange={e => setDraft(p => ({ ...p, endDate: e.target.value }))} />
                            </td>
                            <td className="vea-td-edit text-center">
                                <input type="checkbox" checked={draft.active} className="w-4 h-4"
                                    onChange={e => setDraft(p => ({ ...p, active: e.target.checked }))} />
                            </td>
                            <td className="vea-td-edit">
                                <div className="flex gap-1">
                                    <button onClick={handleSave} disabled={saving} aria-label="Saglabāt" className="p-1.5 text-green-700 hover:bg-green-100 rounded">
                                        <Check className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                    <button onClick={cancelEdit} aria-label="Atcelt" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                                        <X className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    {items.length === 0 && editingId !== 'new' && (
                        <tr><td colSpan={5} className="vea-td text-center text-gray-400">Nav ierakstu</td></tr>
                    )}
                    {items.map(item => (
                        <tr key={item.id} className={editingId === item.id ? 'bg-vea-orange-light' : ''}>
                            {editingId === item.id ? (
                                <>
                                    <td className="vea-td-edit">
                                        <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm" value={draft.name}
                                            onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
                                    </td>
                                    <td className="vea-td-edit">
                                        <input type="date" className="border border-gray-300 rounded px-2 py-1 text-sm" value={draft.startDate}
                                            onChange={e => setDraft(p => ({ ...p, startDate: e.target.value }))} />
                                    </td>
                                    <td className="vea-td-edit">
                                        <input type="date" className="border border-gray-300 rounded px-2 py-1 text-sm" value={draft.endDate}
                                            onChange={e => setDraft(p => ({ ...p, endDate: e.target.value }))} />
                                    </td>
                                    <td className="vea-td-edit text-center">
                                        <input type="checkbox" checked={draft.active}
                                            onChange={e => setDraft(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
                                    </td>
                                    <td className="vea-td-edit">
                                        <div className="flex gap-1">
                                            <button onClick={handleSave} disabled={saving} aria-label="Saglabāt" className="p-1.5 text-green-700 hover:bg-green-100 rounded">
                                                <Check className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                            <button onClick={cancelEdit} aria-label="Atcelt" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                                                <X className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td className="vea-td">{item.name}</td>
                                    <td className="vea-td">{item.startDate ?? '—'}</td>
                                    <td className="vea-td">{item.endDate ?? '—'}</td>
                                    <td className="vea-td text-center">
                                        <span className={`vea-badge ${item.active ? 'vea-badge-success' : 'vea-badge-neutral'}`}>
                                            {item.active ? 'Jā' : 'Nē'}
                                        </span>
                                    </td>
                                    <td className="vea-td">
                                        {confirmDeleteId === item.id ? (
                                            <div className="flex items-center gap-1 text-xs">
                                                <span className="text-red-600">Dzēst?</span>
                                                <button onClick={() => handleDelete(item.id)} className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Jā</button>
                                                <button onClick={() => setConfirmDeleteId(null)} className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Nē</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button onClick={() => startEdit(item)} disabled={editingId !== null} aria-label="Rediģēt akadēmisko gadu" className="p-2.5 text-vea-green hover:bg-vea-green-light rounded disabled:opacity-40">
                                                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                                <button onClick={() => setConfirmDeleteId(item.id)} disabled={editingId !== null} aria-label="Dzēst akadēmisko gadu" className="p-2.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-40">
                                                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default AcademicYearSection;
