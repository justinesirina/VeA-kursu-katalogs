/**
 * Klasificē nodarbības veidu (sessionType) divās VeA kategorijās: lekcijas vai praktiskās.
 *
 * Visi kontaktstundu veidi, kas nav lekcijas (semināri, laboratorijas, praktiskās,
 * pārbaudes darbi u. c.), tiek pieskaitīti praktiskajām nodarbībām.
 *
 * @param {string|undefined|null} name - sessionType nosaukums
 * @returns {'lecture' | 'practical'}
 */
export function classifyType(name) {
    return (name || '').toLowerCase().includes('lekcij') ? 'lecture' : 'practical';
}

/**
 * Aprēķina kalendāra plana stundu sadalījumu pa kategorijām.
 *
 * @param {Array} calendarPlan - CourseDetailsDTO.calendarPlan ([{sessions: [{sessionType, academicHours}]}])
 * @returns {{ lecture: number, practical: number, total: number }}
 */
export function computeHoursByType(calendarPlan) {
    const result = { lecture: 0, practical: 0, total: 0 };
    (calendarPlan || []).forEach(plan => {
        (plan.sessions || []).forEach(session => {
            const hours = Number(session.academicHours) || 0;
            const kind = classifyType(session.sessionType);
            result[kind] += hours;
            result.total += hours;
        });
    });
    return result;
}
