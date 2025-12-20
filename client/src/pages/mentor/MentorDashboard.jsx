import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';
import {
  BookOpen,
  Users,
  BarChart3,
  PlusCircle,
  UserCheck,
  TrendingUp,
  Calendar,
  ChevronRight,
  Award,
  Clock,
  FileText,
  Settings,
  Sparkles,
  Target,
  Filter,
  Search,
  Activity,
  CheckCircle,
  UserPlus
} from 'lucide-react';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    averageProgress: 0,
    pendingTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch mentor stats from backend
        const statsResponse = await axios.get(`${API}/users/mentor/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch mentor courses
        const coursesResponse = await axios.get(`${API}/courses/mentor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch all students
        const studentsResponse = await axios.get(`${API}/users/students`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch progress data for all courses
        const progressResponse = await axios.get(`${API}/progress/mentor`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mentorCourses = coursesResponse.data;
        const progressData = progressResponse.data || [];
        const allStudents = studentsResponse.data || [];
        
        // Calculate real student count from actual data
        const studentIds = new Set();
        mentorCourses.forEach(course => {
          if (course.students && Array.isArray(course.students)) {
            course.students.forEach(studentId => studentIds.add(studentId.toString()));
          }
        });

        setCourses(mentorCourses);
        
        // Set stats from backend
        setStats({
          totalCourses: statsResponse.data.coursesCount || 0,
          totalStudents: statsResponse.data.studentsCount || 0,
          averageProgress: statsResponse.data.averageProgress || 0,
          pendingTasks: 0 // Will be calculated below
        });

        // Generate recent activity from progress data
        const activities = [];
        
        // Add progress completions as activity
        progressData.forEach(item => {
          item.progress.details.forEach(detail => {
            if (detail.completed && detail.completedAt) {
              const completedDate = new Date(detail.completedAt);
              const now = new Date();
              const hoursAgo = Math.floor((now - completedDate) / (1000 * 60 * 60));
              
              let timeText;
              if (hoursAgo < 1) timeText = 'Just now';
              else if (hoursAgo < 24) timeText = `${hoursAgo} hours ago`;
              else timeText = `${Math.floor(hoursAgo / 24)} days ago`;

              activities.push({
                id: detail._id,
                type: 'progress',
                title: `${item.student.name} completed "${detail.chapterId?.title || 'a chapter'}" in ${item.course.title}`,
                time: timeText,
                timestamp: completedDate
              });
            }
          });
        });

        // Sort activities by timestamp (newest first)
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        // Take only 5 most recent activities
        setRecentActivity(activities.slice(0, 5));

        // Calculate pending tasks (students with less than 50% progress)
        const pendingTasks = progressData.filter(item => 
          item.progress.completionPercentage < 50
        ).length;
        
        setStats(prev => ({
          ...prev,
          pendingTasks
        }));

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // If specific endpoint fails, try to get basic data
        try {
          const coursesResponse = await axios.get(`${API}/courses/mentor`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const mentorCourses = coursesResponse.data;
          setCourses(mentorCourses);
          
          // Calculate basic stats manually
          const totalStudents = mentorCourses.reduce((sum, course) => 
            sum + (course.students ? course.students.length : 0), 0
          );
          
          setStats({
            totalCourses: mentorCourses.length,
            totalStudents,
            averageProgress: 0,
            pendingTasks: 0
          });
          
        } catch (fallbackErr) {
          setError('Unable to load dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.isApproved) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [token, API, user]);

  const getCourseStudentCount = (course) => {
    return course.students ? course.students.length : 0;
  };

  const getCourseProgress = (courseId) => {
    // This would need a separate API call per course or aggregate data
    // For now, return 0 - in production, you'd want to calculate this
    return 0;
  };

  if (!user?.isApproved) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Award className="w-12 h-12 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Awaiting Approval</h1>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                Your mentor account is pending approval from the administrator. You'll gain full access to the mentor dashboard once approved.
              </p>
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Status: Pending Review</span>
              </div>
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  if (loading) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-600 text-lg">Loading your mentor dashboard...</p>
        </div>
      </MentorLayout>
    );
  }

  if (error) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Dashboard Error</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Welcome, Mentor {user?.name || ''}! 👨‍🏫</h1>
                    <p className="text-blue-100 mt-2">Guide your students towards success</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    {stats.averageProgress}% average progress
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/mentor/create-course')}
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 shadow-lg"
              >
                <PlusCircle className="w-5 h-5" />
                Create New Course
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalCourses}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Total Courses</h3>
              <p className="text-sm text-gray-500 mt-1">Courses created by you</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Students Assigned</h3>
              <p className="text-sm text-gray-500 mt-1">Total learners under guidance</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</span>
              </div>
              <h3 className="text-gray-700 font-medium">Average Progress</h3>
              <p className="text-sm text-gray-500 mt-1">Across all students</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Attention Needed</h3>
              <p className="text-sm text-gray-500 mt-1">Students below 50% progress</p>
            </div>
          </div>

          {/* Courses Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
                <p className="text-gray-600">Manage and track your teaching materials</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/mentor/courses')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  View All
                </button>
                <button 
                  onClick={() => navigate('/mentor/students')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Manage Students
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses created yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start your mentoring journey by creating your first course. Share your knowledge with students.
                </p>
                <button
                  onClick={() => navigate('/mentor/create-course')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 6).map((course) => {
                  const studentCount = getCourseStudentCount(course);
                  const durationText = course.duration ? `${course.duration} weeks` : 'Self-paced';
                  
                  return (
                    <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                              {studentCount} students
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                              {course.category || 'General'}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {course.description || 'A comprehensive course designed by you'}
                        </p>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{durationText}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Category</span>
                            <span className="font-medium">{course.category || 'General'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Enrolled Students</span>
                            <span className="font-medium">{studentCount}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => navigate(`/mentor/course/${course._id}/add-chapter`)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group/btn"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Chapter</span>
                          </button>
                          <button
                            onClick={() => navigate(`/mentor/course/${course._id}/assign-students`)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors group/btn"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">Assign</span>
                          </button>
                          <button
                            onClick={() => navigate(`/mentor/course/${course._id}/progress`)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors group/btn"
                          >
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-sm font-medium">Progress</span>
                          </button>
                          <button
                            onClick={() => navigate(`/mentor/course/${course._id}`)}
                            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors group/btn"
                          >
                            <Settings className="w-4 h-4" />
                            <span className="text-sm font-medium">Manage</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/mentor/create-course')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl hover:border-blue-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Create New Course</h4>
                      <p className="text-sm text-gray-500">Start a new learning path</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-blue-500 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/mentor/progress')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-white border border-green-200 rounded-xl hover:border-green-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">View Progress</h4>
                      <p className="text-sm text-gray-500">Track student performance</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-green-500 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/mentor/students')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-white border border-purple-200 rounded-xl hover:border-purple-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Manage Students</h4>
                      <p className="text-sm text-gray-500">View and assign students</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-purple-500 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/mentor/courses')}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-white border border-yellow-200 rounded-xl hover:border-yellow-300 transition-all group"
                  >
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900">Course Materials</h4>
                      <p className="text-sm text-gray-500">Edit and organize content</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto group-hover:text-yellow-500 transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  <>
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'assignment' ? 'bg-blue-100' :
                          activity.type === 'progress' ? 'bg-green-100' :
                          'bg-purple-100'
                        }`}>
                          {activity.type === 'assignment' ? <UserCheck className="w-4 h-4 text-blue-600" /> :
                           activity.type === 'progress' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                           <PlusCircle className="w-4 h-4 text-purple-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/mentor/progress')}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
                    >
                      View All Activity →
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent activity</p>
                    <button 
                      onClick={() => navigate('/mentor/progress')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Check student progress →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
};

export default MentorDashboard;