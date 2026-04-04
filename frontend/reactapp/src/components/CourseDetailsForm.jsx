/**
 * Kursa izveides forma — POST /api/courses → izveido jaunu kursu.
 * Pēc veiksmīgas iesniegšanas rāda saiti uz izveidoto kursu un atiestata formu.
 *
 * @returns {JSX.Element} Kursa izveides forma ar validāciju un kļūdu attēlošanu
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axiosConfig';

const EMPTY_FORM = {
    titleLv: '',
    titleEn: '',
    courseCode: '',
    slug: '',
    credits: 2
};

function CourseDetailsForm() {
    const [course, setCourse] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [successId, setSuccessId] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /**
     * Izveido jaunu Course ierakstu datubāzē.
     * Sūta tikai tos laukus, kas eksistē Course entītijā.
     */
    const handleCreateCourse = async () => {
        setSubmitting(true);
        setError(null);
        setSuccessId(null);

        try {
            const payload = {
                titleLv: course.titleLv,
                titleEn: course.titleEn,
                courseCode: course.courseCode,
                slug: course.slug || null,
                credits: Number(course.credits)
            };

            const res = await api.post('/courses', payload);
            setSuccessId(res.data.id);
            setCourse(EMPTY_FORM);
        } catch (err) {
            console.error('Kļūda saglabājot kursu:', err);
            setError('Neizdevās saglabāt kursu. Lūdzu, pārbaudi ievades datus un mēģini vēlreiz.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Jauna kursa izveide</h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:underline text-sm"
                >
                    ← Atpakaļ uz kursiem
                </button>
            </div>

            <section className="space-y-3 bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold">1. Kursa pamata informācija</h2>

                <input
                    type="text"
                    placeholder="Nosaukums latviski *"
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
                    placeholder="Kursa kods *"
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
                    min={1}
                />

                {error && (
                    <p className="text-red-600 text-sm">{error}</p>
                )}

                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCreateCourse}
                    disabled={submitting || !course.titleLv.trim() || !course.courseCode.trim()}
                >
                    {submitting ? 'Saglabā...' : 'Saglabāt kursu'}
                </button>
            </section>

            {successId && (
                <section className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="font-semibold text-green-700">Kurss veiksmīgi izveidots!</p>
                    <p className="text-sm text-gray-700 mt-1">Kursa ID: {successId}</p>
                    <button
                        className="mt-2 text-blue-600 hover:underline text-sm"
                        onClick={() => navigate(`/courses/${successId}`)}
                    >
                        Skatīt kursu →
                    </button>
                </section>
            )}
        </div>
    );
}

export default CourseDetailsForm;
