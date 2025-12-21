import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Admin-Dashboard';
import UserList from './pages/admin/UserList';
import MentorApproval from './pages/admin/MentorApproval';
import Analytics from './pages/admin/Analytics';

// Mentor Pages
import MentorDashboard from './pages/mentor/MentorDashboard';
import CreateCourse from './pages/mentor/CreateCourse';
import AddChapter from './pages/mentor/AddChapter';
import AssignStudent from './pages/mentor/AssignStudents';
import Progress from './pages/mentor/Progress';

// Student Pages
import StudentDashboard from './pages/student/Student-Dashboard';
import CourseViewer from './pages/student/CourseViewer';
import Courses from './pages/student/Courses';
import Certificates from './pages/student/Certificates';

// Protected Route
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      {/* Toast Notification */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/mentors"
          element={
            <ProtectedRoute requiredRole="admin">
              <MentorApproval />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* ================= MENTOR ROUTES ================= */}
        <Route
          path="/mentor/dashboard"
          element={
            <ProtectedRoute requiredRole="mentor">
              <MentorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/create-course"
          element={
            <ProtectedRoute requiredRole="mentor">
              <CreateCourse />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/add-chapter"
          element={
            <ProtectedRoute requiredRole="mentor">
              <AddChapter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mentor/assign-students"
          element={
            <ProtectedRoute requiredRole="mentor">
              <AssignStudent />
            </ProtectedRoute>
          }
        />

        {/* mentor can see progress of all students OR course-wise */}
        <Route
          path="/mentor/progress"
          element={
            <ProtectedRoute requiredRole="mentor">
              <Progress />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT ROUTES ================= */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute requiredRole="student">
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/course/:courseId"
          element={
            <ProtectedRoute requiredRole="student">
              <CourseViewer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/certificates"
          element={
            <ProtectedRoute requiredRole="student">
              <Certificates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/certificate/:courseId"
          element={
            <ProtectedRoute requiredRole="student">
              <Certificates />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
