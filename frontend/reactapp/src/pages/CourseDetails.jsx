import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get(`/api/courses/${id}`)
            .then(response => setCourse(response.data))
            .catch(() => {
                // MOCK: Pilns kursa apraksts
                setCourse({
                    courseCode: 'ITB123',
                    titleLv: 'Datu struktūras un pamatalgoritmi',
                    credits: 4,
                    version: {
                        versionNumber: 1,
                        academicYear: { name: '2024/2025' },
                        semester: { name: 'Rudens' },
                        status: { name: 'Apstiprināts' },
                        approvalDate: '2024-05-10'
                    },
                    info: {
                        goal: 'Sniegt pamatzināšanas par datu struktūrām un to pielietojumu.',
                        annotation: 'Kurss aptver pamata datu struktūras un algoritmus.',
                        prerequisitesDescription: 'Programmēšanas pamati',
                        academicHoursTotal: 32,
                        lectureHours: 16,
                        practClassesHours: 16,
                        independentWorkHours: 48,
                        assessmentForm: { name: 'Eksāmens' },
                        language: 'Latviešu',
                        studyField: 'Informācijas tehnoloģijas',
                        laisCode: 'DatZB031',
                        studyPart: 'Obligātā daļa'
                    },
                    createdBy: { name: 'Dace', surname: 'Docētāja' }
                });
            });
    }, [id]);

    if (!course) return <div className="p-6">Notiek ielāde...</div>;

    const version = course.version || {};
    const info = course.info || {};
    const author = course.createdBy || {};

    // MOCK: Papilddati
    const mockResults = [
        { category: 'Zināšanas', code: 'SKR 1.1.', description: 'Izprot datu struktūru pielietojumu', spsr: 'SPSR 1.1.' },
        { category: 'Prasmes', code: 'SKR 2.1.', description: 'Spēj izmantot algoritmus', spsr: 'SPSR 2.3.' },
        { category: 'Kompetences', code: 'SKR 3.1.', description: 'Spēj patstāvīgi risināt problēmas', spsr: 'SPSR 3.2.' }
    ];

    const mockAssessment = [
        { component: 'Tests', percentage: 30 },
        { component: 'Projekts', percentage: 40 },
        { component: 'Eksāmens', percentage: 30 }
    ];

    const mockTopics = [
        'Ievads. Terminoloģija',
        'Lineārās struktūras',
        'Sakārtoti masīvi un binārā meklēšana',
        'Koki un meklēšanas algoritmi'
    ];

    const mockCalendar = [
        { week: 1, topic: 'Ievads. Terminoloģija', type: 'Lekcija', hours: 2 },
        { week: 2, topic: 'Lineārās struktūras', type: 'Lekcija', hours: 2 },
        { week: 3, topic: 'Lineārās struktūras', type: 'Praktiskā nodarbība', hours: 2 },
        { week: 4, topic: 'Meklēšana', type: 'Lekcija', hours: 2 }
    ];

    const selfStudy = [
        { type: 'Teorijas apgūšana', percentage: 40 },
        { type: 'Mājas darbi', percentage: 40 },
        { type: 'Gatavošanās eksāmenam', percentage: 20 }
    ];

    const mockLiterature = [
        { title: '“Programmēšana Java valodā”', author: 'J. Bērziņš', year: 2021, type: 'primārā' },
        { title: '“Datu struktūras praksē”', author: 'L. Kalniņš', year: 2019, type: 'primārā' },
        { title: '“Clean Code”', author: 'R. Martin', year: 2018, type: 'papildu' }
    ];

    const totalHours = mockCalendar.reduce((sum, e) => sum + e.hours, 0);

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto text-gray-900 print:text-black">
            <button onClick={() => navigate('/')} className="text-blue-600 hover:underline mb-2">← Atpakaļ uz kursiem</button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-1">{course.titleLv}</h1>
                    <p className="text-sm text-gray-700">Kods: {course.courseCode} · KP: {course.credits}</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">PDF</button>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded">Rediģēt</button>
                </div>
            </div>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Pamata informācija</h2>
                <ul className="space-y-1">
                    <li><strong>Studiju programma:</strong> Datorzinātnes</li>
                    <li><strong>Daļa:</strong> {info.studyPart}</li>
                    <li><strong>Studiju joma:</strong> {info.studyField}</li>
                    <li><strong>LAIS kods:</strong> {info.laisCode}</li>
                    <li><strong>Pārbaudes forma:</strong> {info.assessmentForm?.name}</li>
                </ul>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Kursa versija</h2>
                <ul className="space-y-1">
                    <li><strong>Versijas numurs:</strong> {version.versionNumber}</li>
                    <li><strong>Akadēmiskais gads:</strong> {version.academicYear?.name}</li>
                    <li><strong>Semestris:</strong> {version.semester?.name}</li>
                    <li><strong>Statuss:</strong> {version.status?.name}</li>
                    <li><strong>Apstiprināšanas datums:</strong> {version.approvalDate}</li>
                </ul>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Anotācija un mērķis</h2>
                <p><strong>Mērķis:</strong> {info.goal}</p>
                <p className="mt-2"><strong>Anotācija:</strong> {info.annotation}</p>
                <p className="mt-2"><strong>Priekšnoteikumi:</strong> {info.prerequisitesDescription}</p>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Studiju rezultāti</h2>
                {['Zināšanas', 'Prasmes', 'Kompetences'].map(cat => (
                    <div key={cat} className="mb-2">
                        <h3 className="text-md font-semibold text-blue-800">{cat}</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {mockResults.filter(r => r.category === cat).map((r, i) => (
                                <li key={i}><strong>{r.code}</strong> {r.description} <span className="text-sm text-gray-500">({r.spsr})</span></li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-4">Vērtēšana</h2>
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr><th className="p-2">Komponente</th><th className="p-2">%</th></tr>
                    </thead>
                    <tbody>
                    {mockAssessment.map((a, i) => (
                        <tr key={i} className="even:bg-gray-50">
                            <td className="p-2 border-b">{a.component}</td>
                            <td className="p-2 border-b">{a.percentage}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Tēmas</h2>
                <ol className="list-decimal list-inside space-y-1">
                    {mockTopics.map((t, i) => <li key={i}>{t}</li>)}
                </ol>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Kalendārais plānojums</h2>
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr><th className="p-2">Nedēļa</th><th className="p-2">Tēma</th><th className="p-2">Tips</th><th className="p-2">Stundas</th></tr>
                    </thead>
                    <tbody>
                    {mockCalendar.map((e, i) => (
                        <tr key={i} className="even:bg-gray-50">
                            <td className="p-2 border-b">{e.week}</td>
                            <td className="p-2 border-b">{e.topic}</td>
                            <td className="p-2 border-b">{e.type}</td>
                            <td className="p-2 border-b">{e.hours}</td>
                        </tr>
                    ))}
                    <tr className="font-semibold bg-gray-100">
                        <td colSpan={3} className="p-2 border-t">Kopā:</td>
                        <td className="p-2 border-t">{totalHours}</td>
                    </tr>
                    </tbody>
                </table>
                {totalHours !== info.academicHoursTotal && (
                    <p className="text-red-600 mt-2">
                        ⚠️ Stundu summa nesakrīt ar kontaktstundām: {info.academicHoursTotal} stundas
                    </p>
                )}
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Patstāvīgā darba organizācija</h2>
                <table className="w-full border border-gray-300">
                    <thead className="bg-gray-100">
                    <tr><th className="p-2">Darbības veids</th><th className="p-2">%</th></tr>
                    </thead>
                    <tbody>
                    {selfStudy.map((s, i) => (
                        <tr key={i} className="even:bg-gray-50">
                            <td className="p-2 border-b">{s.type}</td>
                            <td className="p-2 border-b">{s.percentage}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </section>

            <section className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-semibold mb-2">Literatūra</h2>
                {['primārā', 'papildu'].map(type => (
                    <div key={type} className="mb-4">
                        <h3 className="text-md font-semibold text-blue-800 mb-1 capitalize">{type} literatūra</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {mockLiterature.filter(l => l.type === type).map((l, i) => (
                                <li key={i}>{l.author}. {l.title}. {l.year}.</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <footer className="text-sm text-gray-500 text-right">Autors: {author.name} {author.surname}</footer>
        </div>
    );
}

export default CourseDetails;
