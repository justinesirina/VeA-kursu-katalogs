/**
 * Vienota statusu krāsu shēma kursa versiju badžiem.
 * Apstrādā gan tiešus DB statusus (Apstiprināts, Iesniegts, Noraidīts, Melnraksts, Arhivēts),
 * gan vēsturiskās substring atbilstības (apstip/iesniegts/noraid/arhiv).
 */
export const STATUS_NAMES = Object.freeze({
    DRAFT: 'Melnraksts',
    SUBMITTED: 'Iesniegts',
    APPROVED: 'Apstiprināts',
    REJECTED: 'Noraidīts',
    ARCHIVED: 'Arhivēts',
});

export function statusBadgeClass(name) {
    if (!name) return 'vea-badge vea-badge-neutral';
    const lower = name.toLowerCase();
    if (lower.includes('apstip')) return 'vea-badge bg-green-100 text-green-700';
    if (lower.includes('iesniegts')) return 'vea-badge bg-blue-100 text-blue-700';
    if (lower.includes('noraid')) return 'vea-badge bg-red-100 text-red-700';
    if (lower.includes('arhiv')) return 'vea-badge bg-gray-200 text-gray-600';
    return 'vea-badge bg-vea-orange-light text-vea-orange';
}

export function isStatus(name, expected) {
    return (name || '').toLowerCase() === expected.toLowerCase();
}
