/**
 * Stacked 100% horizontal bar ar krāsotām leģendām zem tā.
 * Izmanto % sadalījuma tabulās (vērtēšana, patstāvīgais darbs) gan edit, gan view skatā.
 *
 * Props:
 *   rows      — objektu masīvs ar `percentage` lauku (nepieciešams) un etiķetes lauku
 *   labelKey  — etiķetes lauka nosaukums rindā (piem., "componentName" vai "activityName")
 */

const SEGMENT_COLORS = [
    'bg-vea-green',
    'bg-vea-green-dark',
    'bg-vea-orange',
    'bg-emerald-400',
    'bg-emerald-600',
    'bg-amber-500',
    'bg-vea-neutral',
];

function PercentageStackBar({ rows, labelKey }) {
    const filled = (rows || []).filter(r => Number(r.percentage) > 0);
    const total = filled.reduce((s, r) => s + Number(r.percentage), 0);
    if (filled.length === 0 || total === 0) return null;
    return (
        <div className="mb-3">
            <div className="flex h-3 w-full rounded overflow-hidden border border-gray-200">
                {filled.map((r, i) => (
                    <div
                        key={i}
                        title={`${r[labelKey] || '—'}: ${r.percentage}%`}
                        style={{ width: `${r.percentage}%` }}
                        className={`${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} border-r border-white last:border-r-0`}
                    />
                ))}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-vea-text">
                {filled.map((r, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded-sm ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`} />
                        <span className="truncate max-w-[14rem]">{r[labelKey] || '—'}</span>
                        <span className="font-semibold">{r.percentage}%</span>
                    </span>
                ))}
            </div>
        </div>
    );
}

export default PercentageStackBar;
