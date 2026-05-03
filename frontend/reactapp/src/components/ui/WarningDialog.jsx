import { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * Atkārtoti izmantojams brīdinājuma dialogs ar primāro un sekundāro darbību.
 * Renderē modal overlay ar centrētu kartīti.
 *
 * Props:
 *   open            — vai dialogs ir redzams
 *   title           — virsraksts (string vai node)
 *   description     — neobligāts paskaidrojuma teksts (string vai node)
 *   primaryLabel    — primārās pogas teksts
 *   onPrimary       — primārās pogas handleris
 *   primaryTone     — 'neutral' (noklusējums) vai 'danger' (sarkans, destruktīvai darbībai)
 *   secondaryLabel  — sekundārās pogas teksts (neobligāts)
 *   onSecondary     — sekundārās pogas handleris (neobligāts)
 *   secondaryNote   — neobligāts brīdinājuma teksts zem sekundārās pogas
 *   onClose         — Esc / klikšķis aiz dialoga / krustiņš (lietotājs aizver bez izvēles)
 */
function WarningDialog({
    open,
    title,
    description,
    primaryLabel,
    onPrimary,
    primaryTone = 'neutral',
    secondaryLabel,
    onSecondary,
    secondaryNote,
    onClose,
}) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape' && onClose) onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    if (!open) return null;

    const primaryClasses = primaryTone === 'danger'
        ? 'bg-red-600 hover:bg-red-700 text-white'
        : 'bg-vea-green hover:bg-vea-green-dark text-white';

    return (
        <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="warning-dialog-title"
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Galvene ar ikonu un krustiņu */}
                <div className="flex items-start gap-3 p-5 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-vea-orange-light flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5 text-vea-orange" aria-hidden="true" />
                    </div>
                    <h2 id="warning-dialog-title" className="text-lg font-semibold font-heading text-vea-neutral flex-1 pt-1">
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

                {/* Saturs */}
                {description && (
                    <div className="px-5 py-4 text-sm text-vea-text leading-relaxed">
                        {description}
                    </div>
                )}

                {secondaryNote && (
                    <div className="mx-5 mb-4 px-3 py-2 bg-gray-50 border-l-2 border-gray-300 text-xs text-gray-600 rounded-r">
                        {secondaryNote}
                    </div>
                )}

                {/* Pogas — vienlīdz svarīgas, kompaktas */}
                <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
                    {secondaryLabel && (
                        <button
                            type="button"
                            onClick={onSecondary}
                            className="px-4 py-2 text-sm font-medium text-vea-neutral border border-gray-300 bg-white rounded hover:bg-gray-100 transition-colors"
                        >
                            {secondaryLabel}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onPrimary}
                        className={`px-4 py-2 text-sm font-medium rounded transition-colors ${primaryClasses}`}
                    >
                        {primaryLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WarningDialog;
