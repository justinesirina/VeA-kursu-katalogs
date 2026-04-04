import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';
import CourseCard from '../components/CourseCard';
import ViewToggle from '../components/ViewToggle';

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
            <h1 className="text-3xl font-bold mb-4">Visi studiju kursi</h1>

            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Meklēt pēc nosaukuma vai koda..."
                    className="w-full md:w-1/2 p-2 border rounded"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <ViewToggle view={view} setView={setView} />
            </div>

            {filteredCourses.length === 0 ? (
                <p className="text-gray-600">Nav neviena kursa, kas atbilst meklēšanai.</p>
            ) : view === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            ) : (
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Nosaukums</th>
                        <th className="p-2 text-left">Kods</th>
                        <th className="p-2 text-left">KP</th>
                        <th className="p-2 text-left"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredCourses.map(course => (
                        <tr key={course.id} className="border-t hover:bg-gray-50">
                            <td className="p-2">
                                <span
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="text-blue-600 hover:underline cursor-pointer"
                                >
                                    {course.titleLv}
                                </span>
                            </td>
                            <td className="p-2">{course.courseCode}</td>
                            <td className="p-2">{course.credits}</td>
                            <td className="p-2">
                                <button
                                    className="text-blue-600 hover:underline text-sm"
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                >
                                    Skatīt
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AllCourses;
