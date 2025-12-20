 import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/Admin-Dashboard';
import UserList from './pages/admin/UserList';
import MentorApproval from './pages/admin/MentorApproval';
import Analytics from './pages/admin/Analytics';
import MentorDashboard from './pages/mentor/MentorDashboard';
import StudentDashboard from './pages/student/Student-Dashboard';
import CourseViewer from './pages/student/CourseViewer';
import Courses from './pages/student/Courses';
import Certificates from './pages/student/Certificates';

import CreateCourse from './pages/mentor/CreateCourse';
import AddChapter from './pages/mentor/AddChapter';
import AssignStudent from './pages/mentor/AssignStudents';
import Progress from './pages/mentor/Progress';


import ProtectedRoute from './components/ProtectedRoute';
import ProgressBar from './components/ProgressBar';

function App() {
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
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
       
        {/* Mentor Routes */}
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
        <Route
          path="/mentor/course/:courseId/progress"
          element={
            <ProtectedRoute requiredRole="mentor">
              <Progress />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/courses/:courseId"
          element={
            <ProtectedRoute requiredRole="student">
              <CourseViewer />
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
  );
}

export default App;
