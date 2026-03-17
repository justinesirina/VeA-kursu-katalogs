import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails';
import CourseDetailsForm from "./components/CourseDetailsForm";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AllCourses />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/new" element={<CourseDetailsForm />} />
            </Routes>
        </Router>
    );
}

export default App;
