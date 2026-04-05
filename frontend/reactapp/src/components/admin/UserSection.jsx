import { useEffect, useState } from 'react';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';
import api from '../../services/axiosConfig';

const EMPTY = { name: '', surname: '', email: '', academicDegree: '', position: '', roleId: '', active: true };

function UserSection() {
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const loadAll = () => {
        setLoading(true);
        Promise.all([api.get('/users'), api.get('/user-roles')])
            .then(([usersRes, rolesRes]) => {
                const sorted = [...usersRes.data].sort((a, b) =>
                    (a.surname ?? '').localeCompare(b.surname ?? '', 'lv') ||
                    (a.name ?? '').localeCompare(b.name ?? '', 'lv')
                );
                setItems(sorted);
                setRoles(rolesRes.data);
            })
            .catch(() => setError('Neizdevās ielādēt datus.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAll(); }, []);

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 2500);
    };

    const draftFromItem = (item) => ({
        name: item.name ?? '',
        surname: item.surname ?? '',
        email: item.email ?? '',
        academicDegree: item.academicDegree ?? '',
        position: item.position ?? '',
        roleId: item.role?.id?.toString() ?? '',
        active: item.active ?? true,
    });

    const startEdit = (item) => {
        setEditingId(item.id);
        setDraft(draftFromItem(item));
        setConfirmDeleteId(null);
    };

    const startAdd = () => {
        setEditingId('new');
        setDraft({ ...EMPTY, roleId: roles[0]?.id?.toString() ?? '' });
        setConfirmDeleteId(null);
    };

    const cancelEdit = () => { setEditingId(null); setDraft(EMPTY); };

    const validate = () => {
        if (!draft.name.trim() || !draft.surname.trim()) {
            setError('Vārds un uzvārds ir obligāti.');
            return false;
        }
        if (!draft.roleId) {
            setError('Loma ir obligāta.');
            return false;
        }
        setError(null);
        return true;
    };

    const buildPayload = () => ({
        name: draft.name.trim(),
        surname: draft.surname.trim(),
        email: draft.email.trim() || null,
        academicDegree: draft.academicDegree.trim() || null,
        position: draft.position.trim() || null,
        role: { id: parseInt(draft.roleId) },
        active: draft.active,
    });

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            if (editingId === 'new') {
                await api.post('/users', buildPayload());
                showSuccess('Lietotājs pievienots.');
            } else {
                await api.put(`/users/${editingId}`, buildPayload());
                showSuccess('Lietotājs saglabāts.');
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
            await api.delete(`/users/${id}`);
            setConfirmDeleteId(null);
            showSuccess('Lietotājs dzēsts.');
            loadAll();
        } catch {
            setError('Dzēšana neizdevās. Iespējams, lietotājs tiek izmantots citur.');
        }
    };

    // Plain function (not a React component) — avoids re-mount on every setDraft call
    const inputCell = (field, placeholder) => (
        <td key={field} className="p-1.5">
            <input
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                value={draft[field]}
                onChange={e => setDraft(p => ({ ...p, [field]: e.target.value }))}
                placeholder={placeholder}
            />
        </td>
    );

    const actionButtons = (item) => (
        confirmDeleteId === item.id ? (
            <div className="flex items-center gap-1 text-xs">
                <span className="text-red-600">Dzēst?</span>
                <button onClick={() => handleDelete(item.id)} className="px-1.5 py-0.5 bg-red-600 text-white rounded hover:bg-red-700">Jā</button>
                <button onClick={() => setConfirmDeleteId(null)} className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Nē</button>
            </div>
        ) : (
            <div className="flex gap-1">
                <button onClick={() => startEdit(item)} disabled={editingId !== null} className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-40">
                    <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={editingId !== null} className="p-1 text-red-500 hover:bg-red-50 rounded disabled:opacity-40">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        )
    );

    if (loading) return <div className="text-gray-500 py-4">Ielādē...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Lietotāji</h2>
                <button
                    onClick={startAdd}
                    disabled={editingId !== null}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                    <Plus className="w-4 h-4" /> Pievienot
                </button>
            </div>

            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">{error}</p>}
            {successMsg && <p className="text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3 text-sm">{successMsg}</p>}

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left border-b border-gray-300">Vārds</th>
                            <th className="p-2 text-left border-b border-gray-300">Uzvārds</th>
                            <th className="p-2 text-left border-b border-gray-300">E-pasts</th>
                            <th className="p-2 text-left border-b border-gray-300">Zin. grāds</th>
                            <th className="p-2 text-left border-b border-gray-300">Amats</th>
                            <th className="p-2 text-left border-b border-gray-300">Loma</th>
                            <th className="p-2 text-center border-b border-gray-300">Aktīvs</th>
                            <th className="p-2 text-left border-b border-gray-300 w-24">Darbības</th>
                        </tr>
                    </thead>
                    <tbody>
                        {editingId === 'new' && (
                            <tr className="bg-blue-50 border-t border-gray-200">
                                {inputCell('name', 'Vārds')}
                                {inputCell('surname', 'Uzvārds')}
                                {inputCell('email', 'E-pasts')}
                                {inputCell('academicDegree', 'Zin. grāds')}
                                {inputCell('position', 'Amats')}
                                <td className="p-1.5">
                                    <select
                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                        value={draft.roleId}
                                        onChange={e => setDraft(p => ({ ...p, roleId: e.target.value }))}
                                    >
                                        <option value="">— izvēlies —</option>
                                        {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                                    </select>
                                </td>
                                <td className="p-1.5 text-center">
                                    <input type="checkbox" checked={draft.active}
                                        onChange={e => setDraft(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
                                </td>
                                <td className="p-1.5">
                                    <div className="flex gap-1">
                                        <button onClick={handleSave} disabled={saving} className="p-1 text-green-700 hover:bg-green-100 rounded">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {items.length === 0 && editingId !== 'new' && (
                            <tr><td colSpan={8} className="p-4 text-center text-gray-400">Nav ierakstu</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id} className={`border-t border-gray-200 even:bg-gray-50 ${editingId === item.id ? 'bg-blue-50' : ''}`}>
                                {editingId === item.id ? (
                                    <>
                                        {inputCell('name', 'Vārds')}
                                        {inputCell('surname', 'Uzvārds')}
                                        {inputCell('email', 'E-pasts')}
                                        {inputCell('academicDegree', 'Zin. grāds')}
                                        {inputCell('position', 'Amats')}
                                        <td className="p-1.5">
                                            <select
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                value={draft.roleId}
                                                onChange={e => setDraft(p => ({ ...p, roleId: e.target.value }))}
                                            >
                                                <option value="">— izvēlies —</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-1.5 text-center">
                                            <input type="checkbox" checked={draft.active}
                                                onChange={e => setDraft(p => ({ ...p, active: e.target.checked }))} className="w-4 h-4" />
                                        </td>
                                        <td className="p-1.5">
                                            <div className="flex gap-1">
                                                <button onClick={handleSave} disabled={saving} className="p-1 text-green-700 hover:bg-green-100 rounded">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-2">{item.name}</td>
                                        <td className="p-2">{item.surname}</td>
                                        <td className="p-2">{item.email ?? '—'}</td>
                                        <td className="p-2">{item.academicDegree ?? '—'}</td>
                                        <td className="p-2">{item.position ?? '—'}</td>
                                        <td className="p-2">{item.role?.roleName ?? '—'}</td>
                                        <td className="p-2 text-center">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.active ? 'Jā' : 'Nē'}
                                            </span>
                                        </td>
                                        <td className="p-2">{actionButtons(item)}</td>
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

export default UserSection;
