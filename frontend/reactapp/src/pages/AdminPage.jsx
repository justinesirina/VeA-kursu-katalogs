import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import LookupSection from '../components/admin/LookupSection';
import AcademicYearSection from '../components/admin/AcademicYearSection';

const SECTIONS = [
    { key: 'semesters',             label: 'Semestri' },
    { key: 'academic-years',        label: 'Akadēmiskie gadi' },
    { key: 'version-statuses',      label: 'Versiju statusi' },
    { key: 'faculties',             label: 'Fakultātes' },
    { key: 'languages',             label: 'Valodas' },
    { key: 'assessment-forms',      label: 'Pārbaudes formas' },
    { key: 'assessment-components', label: 'Vērtēšanas komponentes' },
    { key: 'self-study-activities', label: 'Patstāv. darba aktivitātes' },
    { key: 'results-categories',    label: 'SKR/SPSR kategorijas' },
    { key: 'literature-types',      label: 'Literatūras veidi' },
    { key: 'session-types',         label: 'Nodarbību veidi' },
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
        title: 'Pārbaudes formas',
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
};

function renderSection(key) {
    if (key === 'academic-years') return <AcademicYearSection />;
    const cfg = LOOKUP_CONFIGS[key];
    if (cfg) return <LookupSection key={key} title={cfg.title} subtitle={cfg.subtitle} endpoint={cfg.endpoint} fields={cfg.fields} />;
    return <p className="text-gray-400">Sekcija nav konfigurēta.</p>;
}

function AdminPage() {
    const [activeSection, setActiveSection] = useState('semesters');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSelect = (key) => {
        setActiveSection(key);
        setSidebarOpen(false);
    };

    const activeLabel = SECTIONS.find(s => s.key === activeSection)?.label ?? '';

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] bg-vea-bg">
            <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden fixed top-[4.25rem] left-3 z-30 bg-white border border-gray-200 rounded shadow-sm px-3 py-2 flex items-center gap-2 text-sm text-vea-neutral hover:border-vea-green"
                aria-label="Atvērt sadaļu izvēlni"
                aria-expanded={sidebarOpen}
                aria-controls="admin-sidebar"
            >
                <Menu className="w-4 h-4" aria-hidden="true" />
                <span className="font-medium">{activeLabel}</span>
            </button>

            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden fixed inset-0 top-14 bg-black/40 z-30"
                    aria-hidden="true"
                />
            )}

            <nav
                id="admin-sidebar"
                aria-label="Sistēmas lauku navigācija"
                className={`fixed md:static top-14 bottom-0 left-0 w-64 md:w-56 z-40 border-r border-gray-200 bg-white flex flex-col transform transition-transform duration-200 ease-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-gray-200">
                    <span className="font-heading font-semibold text-vea-neutral text-sm">
                        Sadaļas
                    </span>
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded hover:bg-vea-green-light text-vea-neutral"
                        aria-label="Aizvērt izvēlni"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
                <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
                    {SECTIONS.map(s => (
                        <button
                            key={s.key}
                            onClick={() => handleSelect(s.key)}
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

            <main className="flex-1 p-6 pt-16 md:pt-6 overflow-auto">
                {renderSection(activeSection)}
            </main>
        </div>
    );
}

export default AdminPage;
