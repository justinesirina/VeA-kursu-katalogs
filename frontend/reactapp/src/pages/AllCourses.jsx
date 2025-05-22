import { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import ViewToggle from '../components/ViewToggle';

function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState('');
    const [view, setView] = useState('cards');


    useEffect(() => {
        axios.get('/api/courses')
            .then(res => setCourses(res.data))
            .catch(() => {
                setCourses([
                    {
                        id: 'mock-1',
                        courseCode: 'ITB101',
                        titleLv: 'Programmēšanas pamati',
                        credits: 4
                    },
                    {
                        id: 'mock-2',
                        courseCode: 'ITB102',
                        titleLv: 'Datu struktūras',
                        credits: 3
                    }
                ]);
            });
    }, []);

    const filteredCourses = courses.filter(course =>
        course.titleLv.toLowerCase().includes(query.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Visi studiju kursi</h1>

            {/* Meklēšanas ievade */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Meklēt pēc nosaukuma vai koda..."
                    className="w-full md:w-1/2 p-2 border rounded"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
            {/* Pārslēgšanas poga */}
                <ViewToggle view={view} setView={setView} />
            </div>

            {/* Kursu attēlošana pēc izvēlētā skata */}
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
                                  onClick={() => window.location.href = `/courses/${course.id}`}
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
                                    onClick={() => window.location.href = `/courses/${course.id}`}
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
