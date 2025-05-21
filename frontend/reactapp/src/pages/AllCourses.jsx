import { useEffect, useState } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';

function AllCourses() {
    const [courses, setCourses] = useState([]);
    const [query, setQuery] = useState('');

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

            <input
                type="text"
                placeholder="Meklēt pēc nosaukuma vai koda..."
                className="w-full p-2 mb-6 border rounded"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            {filteredCourses.length === 0 ? (
                <p className="text-gray-600">Nav neviena kursa, kas atbilst meklēšanai.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllCourses;
