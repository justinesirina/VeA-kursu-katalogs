import { useEffect, useState } from 'react';
import { X, KeyRound } from 'lucide-react';
import PasswordInput from '../ui/PasswordInput';
import PasswordHints from '../ui/PasswordHints';

// Paroles atiestatīšanas fukcionalitāte — admin uzstāda jaunu paroli lietotājam,
// kurš to ir aizmirsis.
function ResetPasswordDialog({ open, user, onClose, onSubmit }) {
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (open) {
            setPassword('');
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape' && !submitting) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose, submitting]);

    if (!open || !user) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password) {
            setError('Lūdzu, ievadi jauno paroli.');
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await onSubmit(user.id, password);
        } catch (err) {
            setError(err?.response?.data || 'Paroles atiestatīšana neizdevās.');
        } finally {
            setSubmitting(false);
        }
    };

    const fullName = [user.name, user.surname].filter(Boolean).join(' ').trim() || user.email;

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
            onClick={() => !submitting && onClose()}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 p-5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-vea-orange-light flex items-center justify-center shrink-0">
                        <KeyRound className="w-5 h-5 text-vea-orange" aria-hidden="true" />
                    </div>
                    <h2 className="text-lg font-semibold font-heading text-vea-neutral flex-1">
                        Atiestatīt paroli
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

                <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
                    <p className="text-sm text-vea-text">
                        Tiks uzstādīta jauna parole lietotājam <span className="font-semibold">{fullName}</span>.
                        Vecā parole pārstās darboties.
                    </p>

                    {error && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-vea-neutral mb-1">Jaunā parole *</label>
                        <PasswordInput
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="new-password"
                            autoFocus
                        />
                        <PasswordHints password={password} />
                    </div>
                </form>

                <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <button type="button" onClick={onClose} disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-vea-neutral border border-gray-300 bg-white rounded hover:bg-gray-100">
                        Atcelt
                    </button>
                    <button type="button" onClick={handleSubmit} disabled={submitting}
                        className="px-4 py-2 text-sm font-medium bg-vea-orange text-white rounded hover:bg-vea-orange/90 disabled:opacity-60">
                        {submitting ? 'Atiestata…' : 'Atiestatīt paroli'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordDialog;
