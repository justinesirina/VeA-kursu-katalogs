import { useState } from 'react';
import LookupSection from '../components/admin/LookupSection';
import AcademicYearSection from '../components/admin/AcademicYearSection';
import UserSection from '../components/admin/UserSection';
import StudyProgramSection from '../components/admin/StudyProgramSection';

const SECTIONS = [
    { key: 'semesters',             label: 'Semestri' },
    { key: 'academic-years',        label: 'Akadēmiskie gadi' },
    { key: 'version-statuses',      label: 'Versiju statusi' },
    { key: 'faculties',             label: 'Fakultātes' },
    { key: 'languages',             label: 'Valodas' },
    { key: 'assessment-forms',      label: 'Vērtēšanas formas' },
    { key: 'assessment-components', label: 'Vērtēšanas komponentes' },
    { key: 'self-study-activities', label: 'Patstāv. darba aktivitātes' },
    { key: 'results-categories',    label: 'SKR/SPSR kategorijas' },
    { key: 'literature-types',      label: 'Literatūras veidi' },
    { key: 'session-types',         label: 'Nodarbību veidi' },
    { key: 'user-roles',            label: 'Lietotāju lomas' },
    { key: 'users',                 label: 'Lietotāji' },
    { key: 'study-programs',        label: 'Studiju programmas' },
];

const LOOKUP_CONFIGS = {
    'semesters': {
        title: 'Semestri',
        endpoint: '/semesters',
        fields: [
            { key: 'name', label: 'Nosaukums', required: true },
        ],
    },
    'version-statuses': {
        title: 'Versiju statusi',
        endpoint: '/version-statuses',
        fields: [
            { key: 'name',        label: 'Nosaukums',  required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'faculties': {
        title: 'Fakultātes',
        endpoint: '/faculties',
        fields: [
            { key: 'name', label: 'Nosaukums', required: true },
            { key: 'slug', label: 'Saīsinājums (slug)', required: false },
        ],
    },
    'languages': {
        title: 'Valodas',
        endpoint: '/languages',
        fields: [
            { key: 'name', label: 'Nosaukums', required: true },
            { key: 'code', label: 'Kods (lv, en...)', required: false },
        ],
    },
    'assessment-forms': {
        title: 'Vērtēšanas formas',
        subtitle: 'Studiju kursa noslēguma pārbaudījumu veidi, kurā tiek vērtēta studējošā studiju rezultātu (zināšanu, prasmju un kompetenču) sasniegšanas pakāpe noteiktā studiju kursā.',
        endpoint: '/assessment-forms',
        fields: [
            { key: 'name',        label: 'Nosaukums', required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'assessment-components': {
        title: 'Vērtēšanas komponentes',
        subtitle: 'Pārbaudījumu veidi studējošo studiju rezultātu sasniegšanas pakāpes vērtēšanai studiju kursa ietvaros.',
        endpoint: '/assessment-components',
        fields: [
            { key: 'name',        label: 'Nosaukums', required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'self-study-activities': {
        title: 'Patstāvīgā darba aktivitātes',
        endpoint: '/self-study-activities',
        fields: [
            { key: 'name',        label: 'Nosaukums', required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'results-categories': {
        title: 'SKR/SPSR kategorijas',
        endpoint: '/results-categories',
        fields: [
            { key: 'name', label: 'Nosaukums', required: true },
        ],
    },
    'literature-types': {
        title: 'Literatūras veidi',
        endpoint: '/literature-types',
        fields: [
            { key: 'name',        label: 'Nosaukums', required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'session-types': {
        title: 'Nodarbību veidi',
        endpoint: '/session-types',
        fields: [
            { key: 'name',        label: 'Nosaukums', required: true },
            { key: 'description', label: 'Apraksts', required: false, multiline: true },
        ],
    },
    'user-roles': {
        title: 'Lietotāju lomas',
        endpoint: '/user-roles',
        fields: [
            { key: 'roleName', label: 'Lomas nosaukums', required: true },
        ],
    },
};

function renderSection(key) {
    if (key === 'academic-years') return <AcademicYearSection />;
    if (key === 'users')          return <UserSection />;
    if (key === 'study-programs') return <StudyProgramSection />;
    const cfg = LOOKUP_CONFIGS[key];
    if (cfg) return <LookupSection key={key} title={cfg.title} subtitle={cfg.subtitle} endpoint={cfg.endpoint} fields={cfg.fields} />;
    return <p className="text-gray-400">Sekcija nav konfigurēta.</p>;
}

function AdminPage() {
    const [activeSection, setActiveSection] = useState('semesters');

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] bg-vea-bg">
            <nav className="w-56 border-r border-gray-200 bg-white flex flex-col" aria-label="Administrācijas navigācija">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-base font-bold font-heading text-vea-neutral">Administrācija</h1>
                </div>
                <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setActiveSection(s.key)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                activeSection === s.key
                                    ? 'bg-vea-green text-white font-medium'
                                    : 'text-vea-neutral hover:bg-vea-green-light'
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="flex-1 p-6 overflow-auto">
                {renderSection(activeSection)}
            </main>
        </div>
    );
}

export default AdminPage;
