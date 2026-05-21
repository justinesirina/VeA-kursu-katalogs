import { useEffect, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import PasswordInput from '../ui/PasswordInput';
import PasswordHints from '../ui/PasswordHints';
import { extractErrorMessage } from '../../utils/errorMessage';

const EMPTY = {
    name: '', surname: '', email: '', academicDegree: '',
    position: '', roleId: '', password: '', active: true,
};

// Lietotāja izveides skats ar paroles politikas instrukciju.
function UserFormDialog({ open, roles, onClose, onSubmit }) {
    const [form, setForm] = useState(EMPTY);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setForm({ ...EMPTY, roleId: roles[0]?.id?.toString() ?? '' });
            setError(null);
        }
    }, [open, roles]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose, submitting]);

    if (!open) return null;

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.name.trim() || !form.surname.trim() || !form.email.trim() || !form.roleId) {
            setError('Vārds, uzvārds, e-pasts un loma ir obligāti.');
            return;
        }
        if (form.active && !form.password) {
            setError('Aktīvam lietotājam parole ir obligāta. Atstāj kontu neaktīvu, ja parole netiek piešķirta.');
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                name: form.name.trim(),
                surname: form.surname.trim(),
                email: form.email.trim(),
                academicDegree: form.academicDegree.trim() || null,
                position: form.position.trim() || null,
                roleId: parseInt(form.roleId, 10),
                password: form.password || null,
                active: form.active,
            });
        } catch (err) {
            setError(extractErrorMessage(err, 'Saglabāšana neizdevās.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
            onClick={() => !submitting && onClose()}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-vea-green-light flex items-center justify-center shrink-0">
                        <UserPlus className="w-5 h-5 text-vea-green" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold font-heading text-vea-neutral flex-1">
                        Pievienot lietotāju
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        aria-label="Aizvērt dialogu"
                        className="text-gray-400 hover:text-vea-neutral hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-3">
                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-vea-neutral mb-1">Vārds *</label>
                            <input value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-vea-neutral mb-1">Uzvārds *</label>
                            <input value={form.surname} onChange={e => set('surname', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-vea-neutral mb-1">E-pasts *</label>
                        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                            autoComplete="off"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-vea-neutral mb-1">Zin. grāds</label>
                            <input value={form.academicDegree} onChange={e => set('academicDegree', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-vea-neutral mb-1">Amats</label>
                            <input value={form.position} onChange={e => set('position', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-vea-neutral mb-1">Loma *</label>
                        <select value={form.roleId} onChange={e => set('roleId', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm">
                            <option value="">— izvēlies —</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
                        </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-vea-text">
                        <input type="checkbox" checked={form.active}
                            onChange={e => set('active', e.target.checked)} className="w-4 h-4" />
                        Aktīvs (var pieslēgties sistēmai)
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-vea-neutral mb-1">
                            Sākotnējā parole {form.active && '*'}
                        </label>
                        <PasswordInput
                            value={form.password}
                            onChange={e => set('password', e.target.value)}
                            autoComplete="new-password"
                        />
                        {!form.active && !form.password && (
                            <p className="mt-1 text-xs text-gray-500">
                                Neaktīvam lietotājam parole nav obligāta. Kontu var izmantot autoru/pasniedzēju sarakstā bez pieslēgšanās iespējas.
                            </p>
                        )}
                        {(form.active || form.password) && <PasswordHints password={form.password} />}
                    </div>
                </form>

                <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-vea-neutral border border-gray-300 bg-white rounded hover:bg-gray-100">
                        Atcelt
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="px-4 py-2 text-sm font-medium bg-vea-green text-white rounded hover:bg-vea-green-dark disabled:opacity-60">
                        {submitting ? 'Saglabā…' : 'Pievienot'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UserFormDialog;
