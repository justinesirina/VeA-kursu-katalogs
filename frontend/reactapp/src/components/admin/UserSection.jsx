import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Edit2, Trash2, Check, X, KeyRound } from 'lucide-react';
import api from '../../services/axiosConfig';
import UserFormDialog from './UserFormDialog';
import ResetPasswordDialog from './ResetPasswordDialog';

const EMPTY = { name: '', surname: '', email: '', academicDegree: '', position: '', roleId: '', active: true };

const UserSection = forwardRef(function UserSection(props, ref) {
    const [items, setItems] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [draft, setDraft] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);

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

    // Lietotāja izveides skats, tostarp ar paroles uzstādīšanu.
    const startAdd = useCallback(() => {
        setCreateOpen(true);
        setConfirmDeleteId(null);
    }, []);

    useImperativeHandle(ref, () => ({ startAdd }), [startAdd]);

    const cancelEdit = () => { setEditingId(null); setDraft(EMPTY); };

    const validate = () => {
        if (!draft.name.trim() || !draft.surname.trim()) {
            setError('Vārds un uzvārds ir obligāti lauki.');
            return false;
        }
        if (!draft.roleId) {
            setError('Loma ir obligāts lauks.');
            return false;
        }
        setError(null);
        return true;
    };

    const buildUpdatePayload = () => ({
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
            await api.put(`/users/${editingId}`, buildUpdatePayload());
            showSuccess('Lietotājs saglabāts.');
            setEditingId(null);
            setDraft(EMPTY);
            loadAll();
        } catch {
            setError('Saglabāšana neizdevās.');
        } finally {
            setSaving(false);
        }
    };

    const handleCreate = async (payload) => {
        await api.post('/users', payload);
        showSuccess('Lietotājs pievienots.');
        setCreateOpen(false);
        loadAll();
    };

    const handleResetPassword = async (userId, newPassword) => {
        await api.post(`/users/${userId}/reset-password`, { newPassword });
        showSuccess('Parole atiestatīta.');
        setResetTarget(null);
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

    const inputCell = (field, placeholder) => (
        <td key={field} className="vea-td-edit">
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
                <button onClick={() => startEdit(item)} disabled={editingId !== null} aria-label="Rediģēt lietotāju" className="p-2.5 text-vea-green hover:bg-vea-green-light rounded disabled:opacity-40">
                    <Edit2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={() => setResetTarget(item)} disabled={editingId !== null} aria-label="Atiestatīt paroli" title="Atiestatīt paroli" className="p-2.5 text-vea-orange hover:bg-vea-orange-light rounded disabled:opacity-40">
                    <KeyRound className="w-4 h-4" aria-hidden="true" />
                </button>
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={editingId !== null} aria-label="Dzēst lietotāju" className="p-2.5 text-red-500 hover:bg-red-50 rounded disabled:opacity-40">
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        )
    );

    if (loading) return <div className="text-gray-500 py-4">Ielādē...</div>;

    return (
        <div>
            {error && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3 mb-3 text-sm">{error}</p>}
            {successMsg && <p className="text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2 mb-3 text-sm">{successMsg}</p>}

            <div className="vea-table-wrap overflow-x-auto">
                <table className="vea-table">
                    <thead>
                        <tr>
                            <th scope="col">Vārds</th>
                            <th scope="col">Uzvārds</th>
                            <th scope="col">E-pasts</th>
                            <th scope="col">Zin. grāds</th>
                            <th scope="col">Amats</th>
                            <th scope="col">Loma</th>
                            <th scope="col" className="text-center">Aktīvs</th>
                            <th scope="col" className="w-32">Darbības</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={8} className="vea-td text-center text-gray-400">Nav ierakstu</td></tr>
                        )}
                        {items.map(item => (
                            <tr key={item.id} className={editingId === item.id ? 'bg-vea-orange-light' : ''}>
                                {editingId === item.id ? (
                                    <>
                                        {inputCell('name', 'Vārds')}
                                        {inputCell('surname', 'Uzvārds')}
                                        {inputCell('email', 'E-pasts')}
                                        {inputCell('academicDegree', 'Zin. grāds')}
                                        {inputCell('position', 'Amats')}
                                        <td className="vea-td-edit">
                                            <select
                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                value={draft.roleId}
                                                onChange={e => setDraft(p => ({ ...p, roleId: e.target.value }))}
                                            >
                                                <option value="">— izvēlies —</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                                            </select>
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
                                        <td className="vea-td">{item.surname}</td>
                                        <td className="vea-td">{item.email ?? '—'}</td>
                                        <td className="vea-td">{item.academicDegree ?? '—'}</td>
                                        <td className="vea-td">{item.position ?? '—'}</td>
                                        <td className="vea-td">{item.role?.roleName ?? '—'}</td>
                                        <td className="vea-td text-center">
                                            <span className={`vea-badge ${item.active ? 'vea-badge-success' : 'vea-badge-neutral'}`}>
                                                {item.active ? 'Jā' : 'Nē'}
                                            </span>
                                        </td>
                                        <td className="vea-td">{actionButtons(item)}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <UserFormDialog
                open={createOpen}
                roles={roles}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
            />

            <ResetPasswordDialog
                open={!!resetTarget}
                user={resetTarget}
                onClose={() => setResetTarget(null)}
                onSubmit={handleResetPassword}
            />
        </div>
    );
});

export default UserSection;
