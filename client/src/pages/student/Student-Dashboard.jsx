import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/ProgressBar';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import {
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  Target,
  ChevronRight,
  Sparkles,
  Trophy,
  BarChart3,
  Zap,
  Search,
  Filter,
  PlayCircle
} from 'lucide-react';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProgress: 0,
    completedCourses: 0,
    streakDays: 7
  });
  const { token, API, user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const [coursesResponse, progressResponse] = await Promise.all([
          axios.get(`${API}/courses/student-courses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/progress/student-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const enrolledCourses = coursesResponse.data;
        const progressData = progressResponse.data || [];

        // Combine course data with progress data
        const coursesWithProgress = enrolledCourses.map(course => {
          const courseProgress = progressData.find(p => p.courseId === course._id);
          return {
            ...course,
            progress: courseProgress?.completionPercentage || 0,
            completedChapters: courseProgress?.completedChapters || 0,
            totalChapters: courseProgress?.totalChapters || course.chapters?.length || 0,
            lastAccessed: courseProgress?.lastAccessed || null
          };
        });

        setCourses(coursesWithProgress);

        // Calculate statistics
        const totalProgress = coursesWithProgress.length > 0 
          ? coursesWithProgress.reduce((acc, course) => acc + course.progress, 0) / coursesWithProgress.length
          : 0;
        
        const completedCourses = coursesWithProgress.filter(course => course.progress === 100).length;

        setStats({
          totalCourses: coursesWithProgress.length,
          totalProgress: Math.round(totalProgress),
          completedCourses,
          streakDays: 7 // This should come from backend
        });

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API]);

  const getProgressColor = (progress) => {
    if (progress === 100) return 'text-green-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getProgressBgColor = (progress) => {
    if (progress === 100) return 'bg-gradient-to-r from-green-100 to-green-50';
    if (progress >= 70) return 'bg-gradient-to-r from-blue-100 to-blue-50';
    if (progress >= 40) return 'bg-gradient-to-r from-yellow-100 to-yellow-50';
    return 'bg-gradient-to-r from-gray-100 to-gray-50';
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-600 text-lg">Loading your learning journey...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Oops! Something went wrong</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Welcome back, {user?.name || 'Student'}! 👋</h1>
                    <p className="text-blue-100 mt-2">Keep up the great work on your learning journey</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4" />
                    {stats.streakDays} day streak
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-100">Learning Summary</h3>
                  <TrendingUp className="w-5 h-5 text-blue-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalCourses}</div>
                    <div className="text-sm text-blue-200">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.completedCourses}</div>
                    <div className="text-sm text-blue-200">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalProgress}%</div>
                    <div className="text-sm text-blue-200">Avg Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">A</div>
                    <div className="text-sm text-blue-200">Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <BookOpen className="w-10 h-10 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalCourses}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Enrolled Courses</h3>
              <p className="text-sm text-gray-500 mt-1">Active learning paths</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-10 h-10 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalProgress}%</span>
              </div>
              <h3 className="text-gray-700 font-medium">Overall Progress</h3>
              <p className="text-sm text-gray-500 mt-1">Average completion rate</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.streakDays}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Learning Streak</h3>
              <p className="text-sm text-gray-500 mt-1">Days in a row</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-10 h-10 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.completedCourses}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Achievements</h3>
              <p className="text-sm text-gray-500 mt-1">Courses completed</p>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Learning Journey</h2>
                <p className="text-gray-600">Continue where you left off</p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  You haven't enrolled in any courses yet. Start your learning journey by exploring available courses.
                </p>
                <Link
                  to="/student/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5" />
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(course.progress)} ${getProgressBgColor(course.progress)}`}>
                          {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {course.description || 'Start your learning journey with this course'}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{course.progress}%</span>
                          </div>
                          <ProgressBar progress={course.progress} />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {course.completedChapters}/{course.totalChapters} chapters
                          </span>
                          {course.lastAccessed && (
                            <span className="text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Last: {new Date(course.lastAccessed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <Link
                          to={`/student/course/${course._id}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {course.progress === 100 ? (
                            <>
                              <Award className="w-4 h-4" />
                              View Certificate
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-4 h-4" />
                              Continue Learning
                            </>
                          )}
                        </Link>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover New Courses</h3>
                  <p className="text-gray-600 mb-4">Expand your knowledge with our curated collection</p>
                </div>
                <Sparkles className="w-8 h-8 text-blue-500" />
              </div>
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all transform hover:-translate-y-0.5 border border-blue-200"
              >
                <Search className="w-4 h-4" />
                Explore Catalog
              </Link>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Achievements & Certificates</h3>
                  <p className="text-gray-600 mb-4">Showcase your learning accomplishments</p>
                </div>
                <Trophy className="w-8 h-8 text-green-500" />
              </div>
              <Link
                to="/student/certificates"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-green-600 font-medium rounded-xl hover:bg-green-50 transition-all transform hover:-translate-y-0.5 border border-green-200"
              >
                <Award className="w-4 h-4" />
                View Certificates
              </Link>
            </div>
          </div>

          {/* Upcoming Deadlines (Placeholder) */}
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Learning Goals</h3>
                <p className="text-gray-600">Stay on track with your objectives</p>
              </div>
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Complete 2 courses this month</h4>
                    <p className="text-sm text-gray-500">Keep up the momentum!</p>
                  </div>
                </div>
                <span className="text-blue-600 font-medium">2/5 done</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Maintain 7-day learning streak</h4>
                    <p className="text-sm text-gray-500">You're on fire! 🔥</p>
                  </div>
                </div>
                <span className="text-green-600 font-medium">{stats.streakDays} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;