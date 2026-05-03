import { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Konfigurējams dialogs F8 plūsmas darbībām (iesniegt/apstiprināt/noraidīt/atvērt labošanai).
 *
 * Props:
 *   open          — bool
 *   title         — string vai node
 *   description   — neobligāts skaidrojuma teksts
 *   fields        — masīvs ar lauku konfigurāciju:
 *                   { name, label, type ('text'|'date'|'textarea'), required, placeholder, defaultValue }
 *   primaryLabel  — primārās pogas teksts
 *   primaryTone   — 'success' (zaļš), 'danger' (sarkans) vai 'warning' (oranžs)
 *   onConfirm     — callback ar formas vērtībām (objekts {name: value})
 *   onClose       — atcelšanas/aizvēršanas handleris
 *   submitting    — bool — atspējo primāro pogu, kamēr notiek pieprasījums
 */
function ApprovalActionDialog({
    open,
    title,
    description,
    fields = [],
    primaryLabel,
    primaryTone = 'success',
    onConfirm,
    onClose,
    submitting = false,
}) {
    const [values, setValues] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) return;
        const init = {};
        fields.forEach(f => { init[f.name] = f.defaultValue ?? ''; });
        setValues(init);
        setErrors({});
    }, [open, fields]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const primaryClasses =
        primaryTone === 'danger'  ? 'bg-red-600 hover:bg-red-700 text-white'
      : primaryTone === 'warning' ? 'bg-vea-orange hover:bg-vea-orange/90 text-white'
      :                             'bg-vea-green hover:bg-vea-green-dark text-white';

    const handleSubmit = () => {
        const next = {};
        for (const f of fields) {
            if (f.required) {
                const val = values[f.name];
                if (val == null || (typeof val === 'string' && val.trim() === '')) {
                    next[f.name] = `${f.label} ir obligāts`;
                }
            }
        }
        if (Object.keys(next).length > 0) {
            setErrors(next);
            return;
        }
        const payload = {};
        for (const f of fields) {
            const v = values[f.name];
            payload[f.name] = typeof v === 'string' ? v.trim() : v;
        }
        onConfirm(payload);
    };

    const setVal = (name, val) => {
        setValues(prev => ({ ...prev, [name]: val }));
        if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    };

    const inputBase = 'w-full p-2 border rounded focus:ring-1 outline-none text-sm';
    const inputOk   = `${inputBase} border-gray-300 focus:border-vea-green focus:ring-vea-green`;
    const inputErr  = `${inputBase} border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-300`;
    const inputCls  = (name) => errors[name] ? inputErr : inputOk;

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-dialog-title"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start gap-3 p-5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-vea-orange-light flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-vea-orange" aria-hidden="true" />
                    </div>
                    <h2 id="approval-dialog-title" className="text-lg font-semibold font-heading text-vea-neutral flex-1 pt-1">
                        {title}
                    </h2>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-400 hover:text-vea-neutral hover:bg-gray-100 rounded p-1 -mt-1 -mr-1 transition-colors"
                            aria-label="Aizvērt dialogu"
                        >
                            <X className="w-5 h-5" aria-hidden="true" />
                        </button>
                    )}
                </div>

                {description && (
                    <div className="px-5 pt-4 text-sm text-vea-text leading-relaxed">
                        {description}
                    </div>
                )}

                {fields.length > 0 && (
                    <div className="px-5 py-4 space-y-3">
                        {fields.map(f => (
                            <div key={f.name}>
                                <label className="block text-sm font-medium text-vea-neutral mb-1">
                                    {f.label} {f.required && <span className="text-red-500">*</span>}
                                </label>
                                {f.type === 'textarea' ? (
                                    <textarea
                                        className={inputCls(f.name)}
                                        rows={3}
                                        value={values[f.name] ?? ''}
                                        placeholder={f.placeholder || ''}
                                        onChange={e => setVal(f.name, e.target.value)}
                                    />
                                ) : (
                                    <input
                                        type={f.type || 'text'}
                                        className={inputCls(f.name)}
                                        value={values[f.name] ?? ''}
                                        placeholder={f.placeholder || ''}
                                        onChange={e => setVal(f.name, e.target.value)}
                                    />
                                )}
                                {errors[f.name] && (
                                    <p className="text-red-500 text-xs mt-0.5">{errors[f.name]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-4 py-2 text-sm font-medium text-vea-neutral border border-gray-300 bg-white rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        Atcelt
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 ${primaryClasses}`}
                    >
                        {submitting ? 'Apstrādā…' : primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApprovalActionDialog;
