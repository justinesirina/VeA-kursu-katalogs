import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import CourseCard from '../components/CourseCard';
import ViewToggle from '../components/ViewToggle';

/**
 * Kursu saraksta skats — ielādē visus aktīvos kursus no GET /api/courses/filter/active.
 * Atbalsta režģa un saraksta skatu (ViewToggle).
 *
 * @returns {JSX.Element} Kursu saraksts ar meklēšanu un skatu pārslēgšanu
 */
function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState('');
    const [view, setView] = useState('cards');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setError(null);
        api.get('/courses')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setCourses(response.data);
                } else {
                    console.warn('API neatgrieza masīvu:', response.data);
                    setCourses([]);
                }
            })
            .catch(error => {
                console.error('Kļūda ielādējot kursus:', error);
                setError('Neizdevās ielādēt kursus. Lūdzu, pārbaudi, vai serveris darbojas.');
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredCourses = courses.filter(course =>
        course.titleLv?.toLowerCase().includes(query.toLowerCase()) ||
        course.courseCode?.toLowerCase().includes(query.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Ielādē kursus...</div>;
    if (error) return <div className="p-8 text-red-600">{error}</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl md:text-[2.5rem] font-bold font-heading text-vea-neutral">Visi studiju kursi</h1>
                <button
                    onClick={() => navigate('/courses/new')}
                    className="bg-vea-green text-white px-4 py-2 rounded hover:bg-vea-green-dark text-base"
                >
                    + Pievienot kursu
                </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Meklēt pēc nosaukuma vai koda..."
                    className="flex-1 md:max-w-sm p-2 border border-gray-300 rounded focus:border-vea-green focus:ring-1 focus:ring-vea-green outline-none text-base"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    aria-label="Meklēt kursus"
                />
                <ViewToggle view={view} setView={setView} />
                <div aria-live="polite" className="sr-only">
                    {filteredCourses.length === 0 ? 'Nav rezultātu' : `${filteredCourses.length} kursi atrasti`}
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <p className="text-gray-500 text-base">Nav neviena kursa, kas atbilst meklēšanai.</p>
            ) : view === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <div className="vea-table-wrap">
                    <table className="vea-table">
                        <thead>
                        <tr>
                            <th scope="col">Nosaukums</th>
                            <th scope="col">Kods</th>
                            <th scope="col">KP</th>
                            <th scope="col" aria-label="Darbības"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCourses.map(course => (
                            <tr key={course.id}>
                                <td className="vea-td">
                                    <button
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                        className="text-vea-green hover:underline text-left"
                                    >
                                        {course.titleLv}
                                    </button>
                                </td>
                                <td className="vea-td text-gray-600">{course.courseCode}</td>
                                <td className="vea-td text-gray-600">{course.credits}</td>
                                <td className="vea-td">
                                    <button
                                        className="text-vea-green hover:underline"
                                        onClick={() => navigate(`/courses/${course.id}`)}
                                    >
                                        Skatīt
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AllCourses;
