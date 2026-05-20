/**
 * Aprēķina URL, uz kuru aizvest no kataloga kartītes.
 * Ja kartīte rāda apstiprinātu versiju — publiskais skats /courses/:id.
 * Citiem statusiem — konkrētā versija /courses/:id/versions/:versionId/view.
 */
export function catalogItemTarget(item) {
    if (!item?.courseId) return '/';
    const isApproved = item.statusName === 'Apstiprināts';
    if (isApproved || !item.versionId) {
        return `/courses/${item.courseId}`;
    }
    return `/courses/${item.courseId}/versions/${item.versionId}/view`;
}
