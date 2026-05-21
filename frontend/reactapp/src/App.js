import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, matchPath } from 'react-router-dom';
import { Database, Users, GraduationCap, Archive, Settings, BookOpen, FilePlus, FileEdit, History, ScrollText } from 'lucide-react';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails';
import CourseDetailsForm from "./components/CourseDetailsForm";
import CourseEditForm from "./components/CourseEditForm";
import CourseVersionHistory from "./pages/CourseVersionHistory";
import AdminPage from "./pages/AdminPage";
import AdminLanding from "./pages/AdminLanding";
import AdminUsers from "./pages/AdminUsers";
import AdminPrograms from "./pages/AdminPrograms";
import AdminCourseActivityLog from "./pages/AdminCourseActivityLog";
import ArchivedCourses from "./pages/ArchivedCourses";
import DesignPreview from "./pages/DesignPreview";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import { ToastProvider } from './components/ui/ToastProvider';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserMenu from './components/ui/UserMenu';
import veaLogo from './assets/vea-logo.svg';

const SECTION_CONFIGS = [
    { match: '/admin',                                label: 'Administrācija',     Icon: Settings },
    { match: '/admin/system-fields',                  label: 'Sistēmas lauki',     Icon: Database },
    { match: '/admin/users',                          label: 'Lietotāji',          Icon: Users },
    { match: '/admin/programs',                       label: 'Studiju programmas', Icon: GraduationCap },
    { match: '/admin/activity-log',                   label: 'Kursu darbību žurnāls', Icon: ScrollText },
    { match: '/admin/archive',                        label: 'Arhīvs',             Icon: Archive },
    { match: '/courses/new',                          label: 'Jauns kurss',        Icon: FilePlus },
    { match: '/courses/:id/edit',                     label: 'Kursa rediģēšana',   Icon: FileEdit },
    { match: '/courses/:id/versions',                 label: 'Versiju vēsture',    Icon: History },
    { match: '/courses/:id/versions/:versionId/view', label: 'Vēsturiska versija', Icon: History },
    { match: '/courses/:id',                          label: 'Kurss',              Icon: BookOpen },
    { match: '/',                                     label: 'Kursu katalogs',     Icon: BookOpen },
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
    const { user, hasRole } = useAuth();
    const path = location.pathname;
    const isAdminLanding = path === '/admin';
    const isAdminSub = path.startsWith('/admin/');
    const isCourse = path.startsWith('/courses');
    const section = getSection(path);

    const editMatch = matchPath('/courses/:id/edit', path);
    const versionViewMatch = matchPath('/courses/:id/versions/:versionId/view', path);
    const versionsListMatch = matchPath('/courses/:id/versions', path);
    let backTo = null;
    let backLabel = null;
    if (versionViewMatch) {
        backTo = `/courses/${versionViewMatch.params.id}/versions`;
        backLabel = '← Versiju vēsture';
    } else if (versionsListMatch) {
        backTo = `/courses/${versionsListMatch.params.id}`;
        backLabel = '← Uz kursu';
    } else if (editMatch) {
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
                {/* F9: Programmas direktoram pieejams Kursu darbību žurnāls caur Administrācijas
                    paneli (AdminLanding filtrē pēc lomas — PD redz tikai žurnālu). */}
                {user && path === '/' && hasRole('PROGRAM_DIRECTOR') && (
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
                <UserMenu />
            </nav>
        </header>
    );
}

function AppLayout() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    if (isLoginPage) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        );
    }

    return (
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
                    <Route path="/" element={<ProtectedRoute><AllCourses /></ProtectedRoute>} />
                    <Route path="/courses/new" element={<ProtectedRoute requireRole="TEACHER"><CourseDetailsForm /></ProtectedRoute>} />
                    <Route path="/courses/:id/edit" element={<ProtectedRoute requireRole="TEACHER"><CourseEditForm /></ProtectedRoute>} />
                    <Route path="/courses/:id/versions" element={<ProtectedRoute requireRole="TEACHER"><CourseVersionHistory /></ProtectedRoute>} />
                    <Route path="/courses/:id/versions/:versionId/view" element={<ProtectedRoute requireRole="TEACHER"><CourseDetails /></ProtectedRoute>} />
                    <Route path="/courses/:id" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
                    {/* AdminLanding pats filtrē tiles pēc lomas — PD redz tikai Kursu darbību žurnāla tile (F9). */}
                    <Route path="/admin" element={<ProtectedRoute requireRole="PROGRAM_DIRECTOR"><AdminLanding /></ProtectedRoute>} />
                    <Route path="/admin/system-fields" element={<ProtectedRoute requireRole="SYSTEM_ADMIN"><AdminPage /></ProtectedRoute>} />
                    <Route path="/admin/users" element={<ProtectedRoute requireRole="SYSTEM_ADMIN"><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/programs" element={<ProtectedRoute requireRole="ADMIN"><AdminPrograms /></ProtectedRoute>} />
                    <Route path="/admin/activity-log" element={<ProtectedRoute requireRole="PROGRAM_DIRECTOR"><AdminCourseActivityLog /></ProtectedRoute>} />
                    <Route path="/admin/archive" element={<ProtectedRoute requireRole="ADMIN"><ArchivedCourses /></ProtectedRoute>} />
                    <Route path="/design-preview" element={<DesignPreview />} />
                    {/* Catch-all 404: neatpazīts URL. Aizsargāts ar autentifikāciju,
                        lai neautorizēts lietotājs vispirms tiek novirzīts uz /login. */}
                    <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ToastProvider>
                    <AppLayout />
                </ToastProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
