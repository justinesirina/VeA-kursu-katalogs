import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Database, Users, GraduationCap, Archive, Settings, BookOpen, FilePlus, FileEdit } from 'lucide-react';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails';
import CourseDetailsForm from "./components/CourseDetailsForm";
import CourseEditForm from "./components/CourseEditForm";
import AdminPage from "./pages/AdminPage";
import AdminLanding from "./pages/AdminLanding";
import AdminUsers from "./pages/AdminUsers";
import AdminPrograms from "./pages/AdminPrograms";
import ArchivedCourses from "./pages/ArchivedCourses";
import DesignPreview from "./pages/DesignPreview";
import { ToastProvider } from './components/ui/ToastProvider';
import veaLogo from './assets/vea-logo.svg';

const SECTION_CONFIGS = [
    { match: '/admin',                 label: 'Administrācija',     Icon: Settings },
    { match: '/admin/system-fields',   label: 'Sistēmas lauki',     Icon: Database },
    { match: '/admin/users',           label: 'Lietotāji',          Icon: Users },
    { match: '/admin/programs',        label: 'Studiju programmas', Icon: GraduationCap },
    { match: '/admin/archive',         label: 'Arhīvs',             Icon: Archive },
    { match: '/courses/new',           label: 'Jauns kurss',        Icon: FilePlus },
    { match: '/courses/:id/edit',      label: 'Kursa rediģēšana',   Icon: FileEdit },
    { match: '/courses/:id',           label: 'Kurss',              Icon: BookOpen },
];

function getSection(pathname) {
    for (const cfg of SECTION_CONFIGS) {
        if (matchPath(cfg.match, pathname)) return cfg;
    }
    return null;
}

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const isAdminLanding = path === '/admin';
    const isAdminSub = path.startsWith('/admin/');
    const isCourse = path.startsWith('/courses');
    const section = getSection(path);

    const editMatch = matchPath('/courses/:id/edit', path);
    let backTo = null;
    let backLabel = null;
    if (editMatch) {
        backTo = `/courses/${editMatch.params.id}`;
        backLabel = '← Uz kursu';
    } else if (isAdminSub) {
        backTo = '/admin';
        backLabel = '← Administrācija';
    } else if (isAdminLanding || isCourse) {
        backTo = '/';
        backLabel = '← Kursu saraksts';
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-vea-green shadow-md flex items-center px-4 md:px-6 print:hidden">
            <button
                onClick={() => navigate('/')}
                className="flex items-center focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-vea-green rounded shrink-0"
                aria-label="Uz sākumlapu — Kursu katalogs"
            >
                <img
                    src={veaLogo}
                    alt="Ventspils Augstskola — Kursu katalogs"
                    className="h-8 w-auto"
                    style={{ filter: 'brightness(0) invert(1)' }}
                />
            </button>

            {section && (
                <>
                    <div className="w-px h-6 bg-white/30 mx-3 shrink-0" aria-hidden="true" />
                    <div className="flex items-center gap-2 text-white min-w-0">
                        <section.Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                        <span className="font-heading font-semibold text-sm sm:text-base truncate">
                            {section.label}
                        </span>
                    </div>
                </>
            )}

            <nav className="ml-auto pl-3 flex items-center gap-2 shrink-0" aria-label="Galvenā navigācija">
                {path === '/' && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                    >
                        Administrācija
                    </button>
                )}
                {backTo && (
                    <button
                        onClick={() => navigate(backTo)}
                        className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors whitespace-nowrap"
                    >
                        {backLabel}
                    </button>
                )}
            </nav>
        </header>
    );
}

function App() {
    return (
        <Router>
            <ToastProvider>
            <div className="min-h-screen bg-vea-bg flex flex-col">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-vea-green focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-sm focus:font-medium"
                >
                    Pāriet uz saturu
                </a>
                <NavBar />
                <main className="pt-14 flex-1" id="main-content">
                    <Routes>
                        <Route path="/" element={<AllCourses />} />
                        <Route path="/courses/new" element={<CourseDetailsForm />} />
                        <Route path="/courses/:id/edit" element={<CourseEditForm />} />
                        <Route path="/courses/:id" element={<CourseDetails />} />
                        <Route path="/admin" element={<AdminLanding />} />
                        <Route path="/admin/system-fields" element={<AdminPage />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/programs" element={<AdminPrograms />} />
                        <Route path="/admin/archive" element={<ArchivedCourses />} />
                        <Route path="/design-preview" element={<DesignPreview />} />
                    </Routes>
                </main>
            </div>
            </ToastProvider>
        </Router>
    );
}

export default App;
