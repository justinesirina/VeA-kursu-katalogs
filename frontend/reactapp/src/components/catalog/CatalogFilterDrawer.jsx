import { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * F5 mobilā drawer — sānjoslas saturs zem 768 px.
 * Klikšķis ārpus drawer / Esc taustiņš / krustiņš -> onClose.
 * Lieto WarningDialog overlay paterns no docs/design.md (§4.14).
 */
function CatalogFilterDrawer({ open, onClose, children }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[300] md:hidden" role="dialog" aria-modal="true" aria-label="Filtri">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
                    <h2 className="text-sm font-semibold text-vea-neutral uppercase tracking-wider">
                        Filtri
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-vea-neutral hover:bg-gray-100 rounded"
                        aria-label="Aizvērt filtrus"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="p-0">
                    {children}
                </div>
            </aside>
        </div>
    );
}

export default CatalogFilterDrawer;
