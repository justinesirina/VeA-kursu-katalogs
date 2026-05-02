import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Edit2, Trash2, Check, X } from 'lucide-react';
import api from '../../services/axiosConfig';

const EMPTY = { name: '', nameEn: '', description: '' };

const StudyProgramPartSection = forwardRef(function StudyProgramPartSection(props, ref) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const loadAll = () => {
        setLoading(true);
        api.get('/study-program-parts')
            .then(res => {
                const sorted = [...res.data].sort((a, b) =>
                    (a.name ?? '').localeCompare(b.name ?? '', 'lv')
                );
                setItems(sorted);
            })
            .catch(() => setError('Neizdevās ielādēt datus.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAll(); }, []);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 2500);
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setDraft({
            name: item.name ?? '',
            nameEn: item.nameEn ?? '',
            description: item.description ?? '',
        });
        setConfirmDeleteId(null);
    };

    const startAdd = () => {
        setEditingId('new');
        setDraft(EMPTY);
        setConfirmDeleteId(null);
    };

    useImperativeHandle(ref, () => ({ startAdd }), []);

    const cancelEdit = () => { setEditingId(null); setDraft(EMPTY); };

    const validate = () => {
        if (!draft.name.trim()) { setError('Nosaukums ir obligāts.'); return false; }
        setError(null);
        return true;
    };

    const buildPayload = () => ({
        name: draft.name.trim(),
        nameEn: draft.nameEn.trim() || null,
        description: draft.description.trim() || null,
    });

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (editingId === 'new') {
                await api.post('/study-program-parts', buildPayload());
                showSuccess('Programmas daļa pievienota.');
            } else {
                await api.put(`/study-program-parts/${editingId}`, buildPayload());
                showSuccess('Programmas daļa saglabāta.');
            }
            setEditingId(null);
            setDraft(EMPTY);
            loadAll();
        } catch {
            setError('Saglabāšana neizdevās.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/study-program-parts/${id}`);
            setConfirmDeleteId(null);
            showSuccess('Programmas daļa dzēsta.');
            loadAll();
        } catch {
            setError('Dzēšana neizdevās. Iespējams, daļa tiek izmantota citur.');
        }
    };

    const editCells = () => (
        <>
            <td className="vea-td-edit">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={draft.name}
                    onChange={e => setDraft(p => ({ ...p, name: e.target.value }))}
                    placeholder="Piem., A - Obligātā" />
            </td>
            <td className="vea-td-edit">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={draft.nameEn}
                    onChange={e => setDraft(p => ({ ...p, nameEn: e.target.value }))}
                    placeholder="Piem., A - Compulsory" />
            </td>
            <td className="vea-td-edit">
                <input className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                    value={draft.description}
                    onChange={e => setDraft(p => ({ ...p, description: e.target.value }))}
                    placeholder="Apraksts (neobligāts)" />
            </td>
            <td className="vea-td-edit">
                <div className="flex gap-1">
                    <button onClick={handleSave} disabled={saving} aria-label="Saglabāt"
                        className="p-1.5 text-green-700 hover:bg-green-100 rounded">
                        <Check className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button onClick={cancelEdit} aria-label="Atcelt"
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded">
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </td>
        </>
    );

    if (loading) return <div className="text-gray-500 py-4">Ielādē...</div>;

    return (
        <div>

            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">{error}</p>}
            {successMsg && <p className="text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3 text-sm">{successMsg}</p>}

            <div className="vea-table-wrap">
                <table className="vea-table">
                    <thead>
                        <tr>
                            <th scope="col">Nosaukums (LV)</th>
                            <th scope="col">Nosaukums (EN)</th>
                            <th scope="col">Apraksts</th>
                            <th scope="col" className="w-24">Darbības</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editingId === 'new' && (
                            <tr className="bg-vea-orange-light">
                                {editCells()}
                            </tr>
                        )}
                        {items.length === 0 && editingId !== 'new' && (
                            <tr><td colSpan={4} className="vea-td text-center text-gray-400">Nav ierakstu</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id} className={editingId === item.id ? 'bg-vea-orange-light' : ''}>
                                {editingId === item.id ? editCells() : (
                                    <>
                                        <td className="vea-td font-medium">{item.name}</td>
                                        <td className="vea-td text-vea-text">{item.nameEn ?? '—'}</td>
                                        <td className="vea-td text-gray-500 text-sm">{item.description ?? '—'}</td>
                                        <td className="vea-td">
                                            {confirmDeleteId === item.id ? (
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="text-red-600">Dzēst?</span>
                                                    <button onClick={() => handleDelete(item.id)}
                                                        className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Jā</button>
                                                    <button onClick={() => setConfirmDeleteId(null)}
                                                        className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Nē</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-1">
                                                    <button onClick={() => startEdit(item)} disabled={editingId !== null}
                                                        aria-label="Rediģēt programmas daļu"
                                                        className="p-2.5 text-vea-green hover:bg-vea-green-light rounded disabled:opacity-40">
                                                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                    <button onClick={() => setConfirmDeleteId(item.id)} disabled={editingId !== null}
                                                        aria-label="Dzēst programmas daļu"
                                                        className="p-2.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-40">
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
});

export default StudyProgramPartSection;
