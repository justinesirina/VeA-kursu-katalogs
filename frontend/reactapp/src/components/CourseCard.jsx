import { useNavigate } from 'react-router-dom';

/**
 * Kursa karte — kompakts kursa attēlojums režģa skatā.
 *
 * @param {Object} props
 * @param {Object} props.course - kursa objekts
 * @param {string} props.course.id - kursa UUID
 * @param {string} props.course.titleLv - kursa nosaukums latviski
 * @param {string} props.course.courseCode - kursa kods
 * @param {number} props.course.credits - kredītpunktu skaits
 */
function CourseCard({ course }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded shadow p-4 border hover:shadow-lg transition">
            <h3
                className="text-xl font-semibold mb-1 text-blue-600 hover:underline cursor-pointer"
                onClick={() => navigate(`/courses/${course.id}`)}
            >
                {course.titleLv}
            </h3>
            <p className="text-sm text-gray-600 mb-1">Kods: {course.courseCode}</p>
            <p className="text-sm text-gray-600 mb-3">Kredītpunkti: {course.credits}</p>
            <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                onClick={() => navigate(`/courses/${course.id}`)}
            >
                Skatīt
            </button>
        </div>
    );
}

export default CourseCard;
