import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * F5 lapu izkārtojums — "‹ Iepriekšējā · 1 2 3 … N · Nākamā ›" + lapas
 * izmēra dropdown (25/50/100/500). Lietots gan zem rezultātiem, gan
 * (pēc izvēles) augšā. Lapas range veidots ar ellipsis, lai paliek kompakts
 * pat ar lielu kopskaitu.
 */
function buildPageRange(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i);
    }
    const range = new Set([0, total - 1, current]);
    if (current - 1 >= 0) range.add(current - 1);
    if (current + 1 < total) range.add(current + 1);
    if (current === 0) range.add(1);
    if (current === total - 1) range.add(total - 2);
    const sorted = [...range].sort((a, b) => a - b);
    const out = [];
    for (let i = 0; i < sorted.length; i += 1) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push('ellipsis');
        out.push(sorted[i]);
    }
    return out;
}

function CatalogPagination({
    page,
    size,
    totalElements,
    totalPages,
    allowedSizes,
    onPageChange,
    onSizeChange,
}) {
    if (totalElements === 0) return null;

    const rangeStart = page * size + 1;
    const rangeEnd = Math.min(totalElements, (page + 1) * size);
    const items = buildPageRange(page, totalPages);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 text-sm">
            <p className="text-gray-600">
                Rāda <span className="font-semibold text-vea-neutral">{rangeStart}–{rangeEnd}</span>
                {' '}no <span className="font-semibold text-vea-neutral">{totalElements}</span>
            </p>

            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-gray-600">
                    Rādīt
                    <select
                        value={size}
                        onChange={e => onSizeChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none"
                        aria-label="Lapas izmērs"
                    >
                        {allowedSizes.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>

                <nav className="flex items-center gap-1" aria-label="Lapu navigācija">
                    <button
                        type="button"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page <= 0}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-white text-vea-neutral hover:bg-vea-green-light disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Iepriekšējā lapa"
                    >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {items.map((it, idx) => (
                        it === 'ellipsis' ? (
                            <span key={`e-${idx}`} className="px-2 text-gray-400">…</span>
                        ) : (
                            <button
                                key={it}
                                type="button"
                                onClick={() => onPageChange(it)}
                                aria-current={it === page ? 'page' : undefined}
                                className={
                                    'min-w-[2rem] px-2 py-1 rounded border text-sm '
                                    + (it === page
                                        ? 'bg-vea-green text-white border-vea-green'
                                        : 'bg-white text-vea-neutral border-gray-300 hover:bg-vea-green-light')
                                }
                            >
                                {it + 1}
                            </button>
                        )
                    ))}

                    <button
                        type="button"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page >= totalPages - 1}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-gray-300 bg-white text-vea-neutral hover:bg-vea-green-light disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Nākamā lapa"
                    >
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default CatalogPagination;
