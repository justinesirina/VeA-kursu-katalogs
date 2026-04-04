// Šī komponente pagaidām ļauj izveidot tikai studiju kursa pamatinformāciju.
// Tas ir pirmais solis, lai pārbaudītu, ka frontend korekti saglabā datus backend pusē.

import { useState } from 'react';
import api from '../services/axiosConfig';

function CourseDetailsForm() {
    // Kursa pamata informācija atbilstoši Course entītijai
    const [course, setCourse] = useState({
        titleLv: '',
        titleEn: '',
        courseCode: '',
        slug: '',
        credits: 2
    });

    // Saglabātais kursa ID pēc veiksmīgas izveides
    const [courseId, setCourseId] = useState(null);

    /**
     * Funkcija izveido jaunu Course ierakstu datubāzē.
     * Šeit tiek sūtīti tikai tie lauki, kas reāli eksistē Course entītijā.
     */
    const handleCreateCourse = async () => {
        try {
            const payload = {
                titleLv: course.titleLv,
                titleEn: course.titleEn,
                courseCode: course.courseCode,
                slug: course.slug || null,
                credits: Number(course.credits)
            };

            const res = await api.post('/courses', payload);

            setCourseId(res.data.id);
            alert('Kurss veiksmīgi saglabāts!');
            console.log('Saglabātais kurss:', res.data);
        } catch (err) {
            console.error('Kļūda saglabājot kursu:', err);
            alert('Neizdevās saglabāt kursu. Skaties konsolē kļūdu.');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Jauna kursa izveide</h1>

            <section className="space-y-3 bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold">1. Kursa pamata informācija</h2>

                <input
                    type="text"
                    placeholder="Nosaukums latviski"
                    className="w-full p-2 border rounded"
                    value={course.titleLv}
                    onChange={e => setCourse({ ...course, titleLv: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Nosaukums angliski"
                    className="w-full p-2 border rounded"
                    value={course.titleEn}
                    onChange={e => setCourse({ ...course, titleEn: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Kursa kods"
                    className="w-full p-2 border rounded"
                    value={course.courseCode}
                    onChange={e => setCourse({ ...course, courseCode: e.target.value })}
                />

                <input
                    type="text"
                    placeholder="Slug (piemēram: datu-strukturas)"
                    className="w-full p-2 border rounded"
                    value={course.slug}
                    onChange={e => setCourse({ ...course, slug: e.target.value })}
                />

                <input
                    type="number"
                    placeholder="Kredītpunkti"
                    className="w-full p-2 border rounded"
                    value={course.credits}
                    onChange={e => setCourse({ ...course, credits: e.target.value })}
                />

                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={handleCreateCourse}
                >
                    Saglabāt kursu
                </button>
            </section>

            {courseId && (
                <section className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="font-semibold text-green-700">Kurss veiksmīgi izveidots.</p>
                    <p className="text-sm text-gray-700 mt-1">Kursa ID: {courseId}</p>
                </section>
            )}
        </div>
    );
}

export default CourseDetailsForm;