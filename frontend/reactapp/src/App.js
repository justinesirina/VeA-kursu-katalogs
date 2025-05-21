import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AllCourses from './pages/AllCourses';
import CourseDetails from './pages/CourseDetails'; // vēl jāizveido

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AllCourses />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
            </Routes>
        </Router>
    );
}

export default App;
