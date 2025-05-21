import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function CourseDetails() {
    const { id } = useParams(); // Iegūst kursa ID no URL
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get(`/api/courses/${id}`)
            .then(response => {
                setCourse(response.data);
            })
            .catch(error => {
                console.error('Kļūda ielādējot kursa datus:', error);
            });
    }, [id]);

    if (!course) {
        return <div className="p-6">Notiek ielāde...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{course.titleLv}</h1>
            <p className="text-gray-700 mb-1">Kods: {course.courseCode}</p>
            <p className="text-gray-700 mb-1">Kredītpunkti: {course.credits}</p>
            {/* Papildu dati, kad būs pieejami no CourseVersion / CourseInfo */}
            <p className="text-gray-700 mt-4">Šeit var parādīt versijas, rezultātus, literatūru u.c.</p>
        </div>
    );
}

export default CourseDetails;
