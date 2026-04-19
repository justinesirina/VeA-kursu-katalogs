import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails';
import CourseDetailsForm from "./components/CourseDetailsForm";
import CourseEditForm from "./components/CourseEditForm";
import AdminPage from "./pages/AdminPage";
import DesignPreview from "./pages/DesignPreview";
import { ToastProvider } from './components/ui/ToastProvider';
import veaLogo from './assets/vea-logo.svg';

function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-vea-green shadow-md flex items-center px-4 md:px-6 print:hidden">
            <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-vea-green rounded"
                aria-label="Uz sākumlapu"
            >
                <img
                    src={veaLogo}
                    alt="Ventspils Augstskola"
                    className="h-8 w-auto"
                    style={{ filter: 'brightness(0) invert(1)' }}
                />
                <span className="text-white font-heading font-semibold text-base hidden sm:block tracking-wide">
                    Kursu katalogs
                </span>
            </button>

            <nav className="ml-auto flex items-center gap-2" aria-label="Galvenā navigācija">
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                    >
                        Administrācija
                    </button>
                )}
                {isAdmin && (
                    <button
                        onClick={() => navigate('/')}
                        className="text-white/80 hover:text-white text-sm px-3 py-1.5 rounded hover:bg-white/10 transition-colors"
                    >
                        ← Kursu saraksts
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
                        <Route path="/admin" element={<AdminPage />} />
                        <Route path="/design-preview" element={<DesignPreview />} />
                    </Routes>
                </main>
            </div>
            </ToastProvider>
        </Router>
    );
}

export default App;
