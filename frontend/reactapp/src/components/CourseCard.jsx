import { useNavigate } from 'react-router-dom';
import { statusBadgeClass } from '../utils/statusBadge';

/**
 * Kursa karte — kompakts kursa attēlojums režģa skatā.
 * Pieņem CourseCatalogItemDTO no /api/courses/catalog: courseId + courseCode +
 * titleLv/En + credits, papildus atspoguļotās versijas metadati (versionNumber,
 * statusName, facultyName, academicYearName, semesterName) un autoru saraksts.
 *
 * @param {Object} props
 * @param {Object} props.item - kataloga rinda
 */
function CourseCard({ item }) {
    const navigate = useNavigate();

    const teacherNames = (item.teachers || [])
        .slice(0, 2)
        .map(t => `${t.name || ''} ${t.surname || ''}`.trim())
        .filter(Boolean);
    const moreTeachers = Math.max(0, (item.teachers?.length || 0) - teacherNames.length);

    const meta = [];
    if (item.facultyName) meta.push(item.facultyName);
    if (item.academicYearName) meta.push(item.academicYearName);
    if (item.semesterName) meta.push(item.semesterName);

    const showStatus = item.statusName && item.statusName !== 'Apstiprināts';

    return (
        <div className="bg-white rounded-lg border border-gray-200 border-t-4 border-t-vea-green p-4 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                    <h3
                        className="text-xl font-semibold font-heading text-vea-neutral hover:text-vea-green hover:underline cursor-pointer leading-snug"
                        onClick={() => navigate(`/courses/${item.courseId}`)}
                    >
                        {item.titleLv}
                    </h3>
                    {item.titleEn && (
                        <p className="text-sm text-gray-500 italic leading-snug">
                            {item.titleEn}
                        </p>
                    )}
                </div>
                {showStatus && (
                    <span className={statusBadgeClass(item.statusName)} title="Versijas statuss">
                        {item.statusName}
                    </span>
                )}
            </div>
            <p className="text-sm text-gray-500 mb-0.5 mt-1">
                Kods: {item.courseCode || '—'} · Kredītpunkti: {item.credits}
            </p>
            {meta.length > 0 && (
                <p className="text-sm text-gray-500 mb-0.5">{meta.join(' · ')}</p>
            )}
            {teacherNames.length > 0 && (
                <p className="text-sm text-gray-500 mb-3">
                    Pasniedzējs: {teacherNames.join(', ')}
                    {moreTeachers > 0 ? ` +${moreTeachers}` : ''}
                </p>
            )}
            <button
                className="mt-auto bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark text-base"
                onClick={() => navigate(`/courses/${item.courseId}`)}
            >
                Skatīt
            </button>
        </div>
    );
}

export default CourseCard;
