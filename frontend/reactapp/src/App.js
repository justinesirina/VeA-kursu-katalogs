import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails';
import CourseDetailsForm from "./components/CourseDetailsForm";
import CourseEditForm from "./components/CourseEditForm";
import AdminPage from "./pages/AdminPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AllCourses />} />
                <Route path="/courses/new" element={<CourseDetailsForm />} />
                <Route path="/courses/:id/edit" element={<CourseEditForm />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/admin" element={<AdminPage />} />
            </Routes>
        </Router>
    );
}

export default App;
