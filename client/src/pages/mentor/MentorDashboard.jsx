import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCourses();
    }
  }, [token, API]);

  if (!user?.approved) {
    return (
      <MentorLayout>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Mentor Dashboard</h1>
          <p className="text-xl text-red-600">Your account is not approved by the admin yet. Please wait for approval.</p>
        </div>
      </MentorLayout>
    );
  }

  const totalCourses = courses.length;
  const totalStudents = courses.reduce((sum, course) => sum + (course.assignedStudents || 0), 0);

  if (loading) {
    return (
      <MentorLayout>
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading...</p>
        </div>
      </MentorLayout>
    );
  }

  if (error) {
    return (
      <MentorLayout>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Welcome, {user?.name || 'Mentor'}</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Courses Created</h3>
            <p className="text-2xl font-bold text-gray-800">{totalCourses}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Students Assigned</h3>
            <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
          </div>
        </div>

        {/* Courses List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-600">No courses created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{course.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/mentor/add-chapter?courseId=${course._id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Add Chapter
                  </button>
                  <button
                    onClick={() => navigate(`/mentor/assign-student?courseId=${course._id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Assign Students
                  </button>
                  <button
                    onClick={() => navigate(`/mentor/progress?courseId=${course._id}`)}
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                  >
                    View Progress
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default MentorDashboard;
