// Šī komponente ļauj lietotājam izveidot jaunu studiju kursu, ievadot tā pamatinformāciju, versiju un saturu.
// Katrs posms tiek saglabāts atsevišķi, izmantojot Axios POST pieprasījumus.

import { useState } from 'react';
import axios from 'axios';

function CourseDetailsForm() {
    // Kursa pamata informācija (Course entītija)
    const [course, setCourse] = useState({
        titleLv: '',
        titleEn: '',
        courseCode: '',
        credits: 2,
        language: 'latviešu'
    });

    // Kursa versijas dati (CourseVersion entītija)
    const [version, setVersion] = useState({
        academicYearId: '',
        semesterId: '',
        statusId: '',
        approvalDate: '',
        decisionNumber: '',
        decisionReference: ''
    });

    // Kursa saturs (CourseInfo entītija)
    const [info, setInfo] = useState({
        assessmentFormId: '',
        annotation: '',
        goal: '',
        academicHoursTotal: 32,
        lectureHours: 16,
        practClassesHours: 8,
        independentWorkHours: 8
    });

    // Saglabātais courseId un versionId, lai sasaistītu nākamās entītijas
    const [courseId, setCourseId] = useState(null);
    const [versionId, setVersionId] = useState(null);

    // Funkcija, lai izveidotu Course ierakstu
    const handleCreateCourse = async () => {
        try {
            const res = await axios.post('/api/courses', course);
            setCourseId(res.data.id);
            alert('Kursa pamata informācija saglabāta.');
        } catch (err) {
            console.error('Kļūda saglabājot kursu:', err);
            alert('Neizdevās saglabāt kursu.');
        }
    };

    // Funkcija, lai izveidotu CourseVersion ierakstu
    const handleCreateVersion = async () => {
        try {
            const payload = { ...version, courseId: courseId };
            const res = await axios.post('/api/course-version', payload);
            setVersionId(res.data.id);
            alert('Kursa versija saglabāta.');
        } catch (err) {
            console.error('Kļūda saglabājot versiju:', err);
            alert('Neizdevās saglabāt kursa versiju.');
        }
    };

    // Funkcija, lai izveidotu CourseInfo ierakstu
    const handleCreateInfo = async () => {
        try {
            const payload = { ...info, courseId: courseId, courseVersionId: versionId };
            await axios.post('/api/course-info', payload);
            alert('Kursa saturs saglabāts. Kurss pilnībā izveidots!');
        } catch (err) {
            console.error('Kļūda saglabājot kursa saturu:', err);
            alert('Neizdevās saglabāt kursa saturu.');
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold">Jauna kursa izveide</h1>

            {/* Kursa pamata informācija */}
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">1. Kursa pamata informācija</h2>
                <input type="text" placeholder="Nosaukums (LV)" className="w-full p-2 border" value={course.titleLv} onChange={e => setCourse({ ...course, titleLv: e.target.value })} />
                <input type="text" placeholder="Nosaukums (EN)" className="w-full p-2 border" value={course.titleEn} onChange={e => setCourse({ ...course, titleEn: e.target.value })} />
                <input type="text" placeholder="Kursa kods" className="w-full p-2 border" value={course.courseCode} onChange={e => setCourse({ ...course, courseCode: e.target.value })} />
                <input type="number" placeholder="Kredītpunkti (KP)" className="w-full p-2 border" value={course.credits} onChange={e => setCourse({ ...course, credits: parseInt(e.target.value) })} />
                <input type="text" placeholder="Valoda" className="w-full p-2 border" value={course.language} onChange={e => setCourse({ ...course, language: e.target.value })} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreateCourse}>Saglabāt kursu</button>
            </section>

            {/* Kursa versija */}
            {courseId && (
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold">2. Kursa versija</h2>
                    <input type="text" placeholder="Akadēmiskā gada ID" className="w-full p-2 border" value={version.academicYearId} onChange={e => setVersion({ ...version, academicYearId: e.target.value })} />
                    <input type="text" placeholder="Semestra ID" className="w-full p-2 border" value={version.semesterId} onChange={e => setVersion({ ...version, semesterId: e.target.value })} />
                    <input type="text" placeholder="Statusa ID" className="w-full p-2 border" value={version.statusId} onChange={e => setVersion({ ...version, statusId: e.target.value })} />
                    <input type="date" className="w-full p-2 border" value={version.approvalDate} onChange={e => setVersion({ ...version, approvalDate: e.target.value })} />
                    <input type="text" placeholder="Lēmuma Nr." className="w-full p-2 border" value={version.decisionNumber} onChange={e => setVersion({ ...version, decisionNumber: e.target.value })} />
                    <input type="text" placeholder="Lēmuma pamatojums" className="w-full p-2 border" value={version.decisionReference} onChange={e => setVersion({ ...version, decisionReference: e.target.value })} />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleCreateVersion}>Saglabāt versiju</button>
                </section>
            )}

            {/* Kursa saturs */}
            {versionId && (
                <section className="space-y-2">
                    <h2 className="text-xl font-semibold">3. Kursa saturs</h2>
                    <input type="text" placeholder="Pārbaudes formas ID" className="w-full p-2 border" value={info.assessmentFormId} onChange={e => setInfo({ ...info, assessmentFormId: e.target.value })} />
                    <textarea placeholder="Mērķis" className="w-full p-2 border" value={info.goal} onChange={e => setInfo({ ...info, goal: e.target.value })} />
                    <textarea placeholder="Anotācija" className="w-full p-2 border" value={info.annotation} onChange={e => setInfo({ ...info, annotation: e.target.value })} />
                    <input type="number" placeholder="Kopējais stundu skaits" className="w-full p-2 border" value={info.academicHoursTotal} onChange={e => setInfo({ ...info, academicHoursTotal: parseInt(e.target.value) })} />
                    <input type="number" placeholder="Lekciju stundas" className="w-full p-2 border" value={info.lectureHours} onChange={e => setInfo({ ...info, lectureHours: parseInt(e.target.value) })} />
                    <input type="number" placeholder="Praktisko nodarbību stundas" className="w-full p-2 border" value={info.practClassesHours} onChange={e => setInfo({ ...info, practClassesHours: parseInt(e.target.value) })} />
                    <input type="number" placeholder="Patstāvīgais darbs (stundas)" className="w-full p-2 border" value={info.independentWorkHours} onChange={e => setInfo({ ...info, independentWorkHours: parseInt(e.target.value) })} />
                    <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleCreateInfo}>Saglabāt saturu</button>
                </section>
            )}
        </div>
    );
}

export default CourseDetailsForm;