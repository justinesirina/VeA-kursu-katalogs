import { useEffect, useState } from 'react';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import api from '../../services/axiosConfig';

function LookupSection({ title, subtitle, endpoint, fields }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const emptyDraft = fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {});

    const loadItems = () => {
        setLoading(true);
        api.get(endpoint)
            .then(res => {
                const key = fields[0]?.key ?? 'name';
                const sorted = [...res.data].sort((a, b) =>
                    (a[key] ?? '').localeCompare(b[key] ?? '', 'lv')
                );
                setItems(sorted);
            })
            .catch(() => setError('Neizdevās ielādēt datus.'))
            .finally(() => setLoading(false));
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { loadItems(); }, [endpoint]);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 2500);
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setDraft(fields.reduce((acc, f) => ({ ...acc, [f.key]: item[f.key] ?? '' }), {}));
        setConfirmDeleteId(null);
    };

    const startAdd = () => {
        setEditingId('new');
        setDraft(emptyDraft);
        setConfirmDeleteId(null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setDraft({});
    };

    const handleChange = (key, value) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const validate = () => {
        const missing = fields.filter(f => f.required && !draft[f.key]?.toString().trim());
        if (missing.length > 0) {
            setError(`Obligātais lauks: ${missing.map(f => f.label).join(', ')}`);
            return false;
        }
        setError(null);
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const payload = fields.reduce((acc, f) => ({
            ...acc,
            [f.key]: draft[f.key]?.toString().trim() || null,
        }), {});
        try {
            if (editingId === 'new') {
                await api.post(endpoint, payload);
                showSuccess('Ieraksts pievienots.');
            } else {
                await api.put(`${endpoint}/${editingId}`, payload);
                showSuccess('Ieraksts saglabāts.');
            }
            setEditingId(null);
            setDraft({});
            loadItems();
        } catch {
            setError('Saglabāšana neizdevās. Pārbaudi, vai laukiem ir pareizas vērtības.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`${endpoint}/${id}`);
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
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-xl font-semibold">{title}</h2>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1 max-w-2xl">{subtitle}</p>
                    )}
                </div>
                <button
                    onClick={startAdd}
                    disabled={editingId !== null}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 text-sm shrink-0 ml-4"
                >
                    <Plus className="w-4 h-4" /> Pievienot
                </button>
            </div>

            {error && (
                <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">{error}</p>
            )}
            {successMsg && (
                <p className="text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3 text-sm">{successMsg}</p>
            )}

            <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {fields.map(f => (
                            <th key={f.key} className="p-2 text-left border-b border-gray-300">{f.label}</th>
                        ))}
                        <th className="p-2 text-left border-b border-gray-300 w-24">Darbības</th>
                    </tr>
                </thead>
                <tbody>
                    {editingId === 'new' && (
                        <tr className="bg-blue-50 border-t border-gray-200">
                            {fields.map(f => (
                                <td key={f.key} className="p-1.5">
                                    {f.multiline ? (
                                        <textarea
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
                                            rows={3}
                                            value={draft[f.key] ?? ''}
                                            onChange={e => handleChange(f.key, e.target.value)}
                                            placeholder={f.label}
                                        />
                                    ) : (
                                        <input
                                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                            value={draft[f.key] ?? ''}
                                            onChange={e => handleChange(f.key, e.target.value)}
                                            placeholder={f.label}
                                            autoFocus={fields[0].key === f.key}
                                        />
                                    )}
                                </td>
                            ))}
                            <td className="p-1.5">
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="p-1 text-green-700 hover:bg-green-100 rounded"
                                        title="Saglabāt"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                        title="Atcelt"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                    {items.length === 0 && editingId !== 'new' && (
                        <tr>
                            <td colSpan={fields.length + 1} className="p-4 text-center text-gray-400">
                                Nav ierakstu
                            </td>
                        </tr>
                    )}
                    {items.map(item => (
                        <tr key={item.id} className={`border-t border-gray-200 even:bg-gray-50 ${editingId === item.id ? 'bg-blue-50' : ''}`}>
                            {editingId === item.id ? (
                                <>
                                    {fields.map(f => (
                                        <td key={f.key} className="p-1.5">
                                            {f.multiline ? (
                                                <textarea
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-y"
                                                    rows={3}
                                                    value={draft[f.key] ?? ''}
                                                    onChange={e => handleChange(f.key, e.target.value)}
                                                    placeholder={f.label}
                                                />
                                            ) : (
                                                <input
                                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                    value={draft[f.key] ?? ''}
                                                    onChange={e => handleChange(f.key, e.target.value)}
                                                    placeholder={f.label}
                                                />
                                            )}
                                        </td>
                                    ))}
                                    <td className="p-1.5">
                                        <div className="flex gap-1">
                                            <button
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="p-1 text-green-700 hover:bg-green-100 rounded"
                                                title="Saglabāt"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                                title="Atcelt"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </>
                            ) : (
                                <>
                                    {fields.map(f => (
                                        <td key={f.key} className="p-2">{item[f.key] ?? '—'}</td>
                                    ))}
                                    <td className="p-2">
                                        {confirmDeleteId === item.id ? (
                                            <div className="flex items-center gap-1 text-xs">
                                                <span className="text-red-600">Dzēst?</span>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                                                >
                                                    Jā
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(null)}
                                                    className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                >
                                                    Nē
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => startEdit(item)}
                                                    disabled={editingId !== null}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-40"
                                                    title="Rediģēt"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(item.id)}
                                                    disabled={editingId !== null}
                                                    className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-40"
                                                    title="Dzēst"
                                                >
                                                    <Trash2 className="w-4 h-4" />
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
    );
}

export default LookupSection;
