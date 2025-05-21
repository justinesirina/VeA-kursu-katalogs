import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // navigācijai uz kursa skatu

function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('/api/courses')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setCourses(response.data);
                } else {
                    setCourses([
                        { id: '1', courseCode: 'ITB101', titleLv: 'Programmēšanas pamati', credits: 4 },
                        { id: '2', courseCode: 'ITB102', titleLv: 'Datu struktūras', credits: 3 },
                    ]);
                }
            })
            .catch(() => {
                setCourses([
                    { id: '1', courseCode: 'ITB101', titleLv: 'Programmēšanas pamati', credits: 4 },
                    { id: '2', courseCode: 'ITB102', titleLv: 'Datu struktūras', credits: 3 },
                ]);
            });
    }, []);

    // Filtrēšana pēc meklējamā vārda
    const filteredCourses = courses.filter(course =>
        course.titleLv.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Visi studiju kursi</h1>

            {/* Meklēšanas lauks */}
            <input
                type="text"
                placeholder="Meklēt pēc nosaukuma..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 p-2 border rounded w-full max-w-md"
            />

            {/* Kursu kartītes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map(course => (
                    <div
                        key={course.id}
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="p-4 bg-white rounded shadow border cursor-pointer hover:bg-blue-50 transition"
                    >
                        <h2 className="text-xl font-semibold mb-1">{course.titleLv}</h2>
                        <p className="text-sm text-gray-700">Kods: {course.courseCode}</p>
                        <p className="text-sm text-gray-700">Kredītpunkti: {course.credits}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllCourses;
