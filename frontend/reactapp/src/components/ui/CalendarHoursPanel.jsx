import { computeHoursByType } from '../../utils/calendarHours';

/**
 * Vizuāls indikators kalendāra plāna stundu atbilstībai pret Apraksts mērķvērtībām.
 * Lieto gan kalendāra cilnē (rāda summas pret saglabātajām), gan Apraksts cilnē
 * (rāda kalendāra summas pret lietotāja form vērtībām reāllaikā).
 *
 * Props:
 *   calendarPlan          — CourseDetailsDTO.calendarPlan
 *   targetTotal           — vēlamā kopējo kontaktstundu summa (Apraksts academicHoursTotal)
 *   targetLecture         — vēlamais lekciju stundu skaits (Apraksts lectureHours)
 *   targetPractical       — vēlamais praktisko nodarbību stundu skaits (Apraksts practClassesHours)
 *   missingTargetsMessage — neobligāts pielāgots teksts, ja kāds target trūkst
 */
function CalendarHoursPanel({
    calendarPlan,
    targetTotal,
    targetLecture,
    targetPractical,
    missingTargetsMessage = 'Nav norādīts "Apraksts" sadaļā',
}) {
    const hoursByType = computeHoursByType(calendarPlan);

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <SummaryTile
                    label="Lekcijas"
                    used={hoursByType.lecture}
                    target={targetLecture}
                    missingMessage={missingTargetsMessage}
                />
                <SummaryTile
                    label="Praktiskās"
                    used={hoursByType.practical}
                    target={targetPractical}
                    missingMessage={missingTargetsMessage}
                />
                <SummaryTile
                    label="Kopā kontaktstundas"
                    used={hoursByType.total}
                    target={targetTotal}
                    missingMessage={missingTargetsMessage}
                />
            </div>
            <StatusBanner
                hoursByType={hoursByType}
                targetTotal={targetTotal}
                targetLecture={targetLecture}
                targetPractical={targetPractical}
            />
        </div>
    );
}

function ProgressBar({ used, total }) {
    if (total == null) {
        return (
            <div className="w-full h-2 bg-gray-100 rounded overflow-hidden">
                <div className="h-full bg-gray-300 w-0" />
            </div>
        );
    }
    const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
    const over = used > total;
    const color = over ? 'bg-red-500' : (used === total ? 'bg-vea-green' : 'bg-vea-orange');
    return (
        <div className="w-full h-2 bg-gray-100 rounded overflow-hidden">
            <div className={`h-full ${color} transition-all`} style={{ width: `${over ? 100 : pct}%` }} />
        </div>
    );
}

function SummaryTile({ label, used, target, missingMessage }) {
    const hasTarget = target != null && target !== '' && !Number.isNaN(Number(target));
    const targetNum = hasTarget ? Number(target) : null;
    const diff = hasTarget ? used - targetNum : null;
    const over = hasTarget && diff > 0;
    const exact = hasTarget && diff === 0;
    return (
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
            <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-semibold text-vea-neutral uppercase tracking-wide">{label}</span>
                <span className={`text-sm font-medium ${over ? 'text-red-500' : (exact ? 'text-vea-green' : 'text-vea-neutral')}`}>
                    {used} / {hasTarget ? targetNum : '—'} ak. st.
                </span>
            </div>
            <ProgressBar used={used} total={targetNum} />
            {hasTarget && (
                <p className={`text-sm mt-1 ${over ? 'text-red-500' : (exact ? 'text-vea-green' : 'text-gray-500')}`}>
                    {over
                        ? `Pārsniegts par ${diff} ak. st.`
                        : exact
                            ? 'Atbilst ✓'
                            : `Trūkst: ${-diff} ak. st.`}
                </p>
            )}
            {!hasTarget && (
                <p className="text-sm mt-1 text-gray-500">{missingMessage}</p>
            )}
        </div>
    );
}

function StatusBanner({ hoursByType, targetTotal, targetLecture, targetPractical }) {
    const parts = [];
    const cmp = (used, target, label) => {
        if (target == null || target === '' || Number.isNaN(Number(target))) return;
        const diff = used - Number(target);
        if (diff > 0) parts.push({ kind: 'err', text: `${label} pārsniegts par ${diff} ak. st.` });
        else if (diff < 0) parts.push({ kind: 'warn', text: `${label} trūkst ${-diff} ak. st.` });
    };
    cmp(hoursByType.lecture, targetLecture, 'Lekcijām');
    cmp(hoursByType.practical, targetPractical, 'Praktiskajām nodarbībām');
    cmp(hoursByType.total, targetTotal, 'Kopējām kontaktstundām');

    const anyTargetSet = [targetTotal, targetLecture, targetPractical]
        .some(t => t != null && t !== '' && !Number.isNaN(Number(t)));

    if (parts.length === 0 && anyTargetSet) {
        return (
            <div className="bg-vea-green-light border border-vea-green text-vea-green-dark rounded-lg px-3 py-2 text-sm">
                ✓ Viss sadalījums atbilst sadaļas Apraksts datiem
            </div>
        );
    }

    if (parts.length === 0) return null;

    const hasErr = parts.some(p => p.kind === 'err');
    const boxClass = hasErr
        ? 'bg-red-50 border-red-500 text-red-700'
        : 'bg-vea-orange-light border-vea-orange text-vea-orange';

    return (
        <div className={`border rounded-lg px-3 py-2 text-sm space-y-0.5 ${boxClass}`}>
            {parts.map((p, i) => (<p key={i}>• {p.text}</p>))}
        </div>
    );
}

export default CalendarHoursPanel;
