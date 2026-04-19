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
        <div className="bg-white rounded-lg border border-gray-200 border-t-4 border-t-vea-green p-4 hover:shadow-md transition-shadow flex flex-col">
            <h3
                className="text-xl font-semibold font-heading mb-1 text-vea-neutral hover:text-vea-green hover:underline cursor-pointer leading-snug"
                onClick={() => navigate(`/courses/${course.id}`)}
            >
                {course.titleLv}
            </h3>
            <p className="text-sm text-gray-500 mb-0.5">Kods: {course.courseCode}</p>
            <p className="text-sm text-gray-500 mb-4">Kredītpunkti: {course.credits}</p>
            <button
                className="mt-auto bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark text-base"
                onClick={() => navigate(`/courses/${course.id}`)}
            >
                Skatīt
            </button>
        </div>
    );
}

export default CourseCard;
