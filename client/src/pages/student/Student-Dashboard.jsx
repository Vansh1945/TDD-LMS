import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import ProgressBar from '../../components/ProgressBar';
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
  PlayCircle,
  Users,
  CheckCircle,
  TrendingDown,
  Download,
  Eye
} from 'lucide-react';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProgress: 0,
    completedCourses: 0,
    streakDays: 0,
    certificatesCount: 0,
    totalChapters: 0,
    completedChapters: 0
  });
  const [certificates, setCertificates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const { token, API, user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        // Fetch student's assigned courses
        const coursesResponse = await axios.get(`${API}/courses/student-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrolledCourses = coursesResponse.data;
        
        // For each course, fetch progress data
        const coursesWithProgress = await Promise.all(
          enrolledCourses.map(async (course) => {
            try {
              const progressResponse = await axios.get(`${API}/progress/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              // Also fetch course details including mentor info
              const courseDetailsResponse = await axios.get(`${API}/courses/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              return {
                ...course,
                mentor: courseDetailsResponse.data.mentorId,
                progress: progressResponse.data.completionPercentage || 0,
                completedChapters: progressResponse.data.completedChapters || 0,
                totalChapters: progressResponse.data.totalChapters || 0,
                progressDetails: progressResponse.data.progress || [],
                lastActivity: progressResponse.data.progress?.length > 0 
                  ? new Date(Math.max(...progressResponse.data.progress
                    .filter(p => p.completedAt)
                    .map(p => new Date(p.completedAt).getTime()))) 
                  : null
              };
            } catch (error) {
              console.error(`Error fetching progress for course ${course._id}:`, error);
              return {
                ...course,
                progress: 0,
                completedChapters: 0,
                totalChapters: 0,
                progressDetails: [],
                lastActivity: null
              };
            }
          })
        );

        setCourses(coursesWithProgress);

        // Fetch certificates
        const certificatesResponse = await axios.get(`${API}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(certificatesResponse.data || []);

        // Calculate statistics
        const totalProgress = coursesWithProgress.length > 0 
          ? coursesWithProgress.reduce((acc, course) => acc + course.progress, 0) / coursesWithProgress.length
          : 0;
        
        const completedCourses = coursesWithProgress.filter(course => course.progress === 100).length;
        const totalChapters = coursesWithProgress.reduce((acc, course) => acc + course.totalChapters, 0);
        const completedChapters = coursesWithProgress.reduce((acc, course) => acc + course.completedChapters, 0);

        // Calculate learning streak (mock for now - should come from backend)
        const streakDays = calculateLearningStreak(coursesWithProgress);

        // Get recent activity
        const activities = getRecentActivity(coursesWithProgress);

        setStats({
          totalCourses: coursesWithProgress.length,
          totalProgress: Math.round(totalProgress),
          completedCourses,
          streakDays,
          certificatesCount: certificatesResponse.data?.length || 0,
          totalChapters,
          completedChapters
        });

        setRecentActivity(activities.slice(0, 5)); // Last 5 activities

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.response?.data?.message || 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API]);

  // Helper function to calculate learning streak (mock)
  const calculateLearningStreak = (courses) => {
    if (courses.length === 0) return 0;
    
    // Get all completion dates
    const completionDates = [];
    courses.forEach(course => {
      if (course.progressDetails) {
        course.progressDetails.forEach(progress => {
          if (progress.completedAt) {
            completionDates.push(new Date(progress.completedAt));
          }
        });
      }
    });

    // Sort dates and calculate streak
    const sortedDates = [...new Set(completionDates.map(d => d.toDateString()))]
      .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (sortedDates.includes(today.toDateString())) {
      streak++;
      // Check consecutive days
      for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const prevDate = new Date(sortedDates[i-1]);
        const diffDays = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    } else if (sortedDates.includes(yesterday.toDateString())) {
      streak = 1; // Started yesterday
    }
    
    return streak;
  };

  // Get recent activity from progress
  const getRecentActivity = (courses) => {
    const activities = [];
    
    courses.forEach(course => {
      if (course.progressDetails) {
        course.progressDetails.forEach(progress => {
          if (progress.completedAt) {
            activities.push({
              type: 'chapter_completed',
              courseTitle: course.title,
              chapterId: progress.chapterId,
              date: new Date(progress.completedAt),
              courseId: course._id
            });
          }
        });
      }
    });
    
    // Sort by date (newest first)
    return activities.sort((a, b) => b.date - a.date);
  };

  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get progress color class
  const getProgressColor = (progress) => {
    if (progress === 100) return 'text-green-600 bg-green-100';
    if (progress >= 70) return 'text-blue-600 bg-blue-100';
    if (progress >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
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
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
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
                    <p className="text-blue-100 mt-2">
                      {stats.totalCourses > 0 
                        ? `You're making great progress on ${stats.totalCourses} course${stats.totalCourses > 1 ? 's' : ''}!`
                        : 'Start your learning journey today!'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Zap className="w-4 h-4" />
                    {stats.streakDays} day{stats.streakDays !== 1 ? 's' : ''} streak
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Award className="w-4 h-4" />
                    {stats.certificatesCount} certificate{stats.certificatesCount !== 1 ? 's' : ''}
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
                    <div className="text-2xl font-bold">
                      {stats.totalChapters > 0 ? Math.round((stats.completedChapters / stats.totalChapters) * 100) : 0}%
                    </div>
                    <div className="text-sm text-blue-200">Chapters</div>
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
              <p className="text-sm text-gray-500 mt-1">
                {stats.completedCourses} completed, {stats.totalCourses - stats.completedCourses} in progress
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-10 h-10 text-green-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.totalProgress}%</span>
              </div>
              <h3 className="text-gray-700 font-medium">Overall Progress</h3>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalProgress >= 70 ? 'Great progress!' : stats.totalProgress >= 40 ? 'Keep going!' : 'Get started!'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 text-purple-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.completedChapters}/{stats.totalChapters}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Chapters Completed</h3>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalChapters > 0 
                  ? `${Math.round((stats.completedChapters / stats.totalChapters) * 100)}% of all chapters`
                  : 'No chapters yet'}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="w-10 h-10 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900">{stats.certificatesCount}</span>
              </div>
              <h3 className="text-gray-700 font-medium">Certificates Earned</h3>
              <p className="text-sm text-gray-500 mt-1">
                {stats.certificatesCount > 0 
                  ? `${stats.certificatesCount} course${stats.certificatesCount !== 1 ? 's' : ''} completed`
                  : 'Complete a course to earn'}
              </p>
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
                <Link
                  to="/student/courses"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Browse More Courses
                </Link>
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
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(course.progress)}`}>
                          {course.progress === 100 ? 'Completed' : `${course.progress}%`}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {course.description || 'Start your learning journey with this course'}
                      </p>
                      
                      {course.mentor && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                          <Users className="w-4 h-4" />
                          <span>Mentor: {course.mentor.name || 'Unknown'}</span>
                        </div>
                      )}
                      
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
                          {course.lastActivity && (
                            <span className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Last: {formatDate(course.lastActivity)}
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
                        <div className="flex items-center gap-2">
                          {course.progress === 100 && (
                            <Link
                              to={`/student/certificates`}
                              className="text-green-600 hover:text-green-700"
                              title="View Certificate"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          )}
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two Column Layout: Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                    <p className="text-gray-600">Your learning updates</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent activity yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start learning to see your activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            Completed chapter in {activity.courseTitle}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.date)}
                          </p>
                        </div>
                        <Link
                          to={`/student/course/${activity.courseId}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
                
                {recentActivity.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                      to="/student/progress"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                    >
                      View all activity
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                    <p className="text-gray-600">Access quickly</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
                
                <div className="space-y-3">
                  <Link
                    to="/student/courses"
                    className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Browse Courses</h4>
                      <p className="text-sm text-blue-600">Discover new learning paths</p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  
                  <Link
                    to="/student/certificates"
                    className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">My Certificates</h4>
                      <p className="text-sm text-green-600">
                        {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  
                  
                  {stats.completedCourses > 0 && (
                    <Link
                      to="/student/progress"
                      className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Progress Report</h4>
                        <p className="text-sm text-yellow-600">View detailed progress</p>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Goals & Certificates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Goals */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
                      <h4 className="font-medium text-gray-900">Complete {Math.max(2, stats.completedCourses + 1)} courses</h4>
                      <p className="text-sm text-gray-500">Monthly learning goal</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-medium">
                    {stats.completedCourses}/{Math.max(2, stats.completedCourses + 1)} done
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Maintain {Math.max(7, stats.streakDays + 3)}-day streak</h4>
                      <p className="text-sm text-gray-500">Consistency is key!</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">
                    {stats.streakDays}/{Math.max(7, stats.streakDays + 3)} days
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Earn {Math.max(1, stats.certificatesCount + 1)} certificates</h4>
                      <p className="text-sm text-gray-500">Showcase your achievements</p>
                    </div>
                  </div>
                  <span className="text-purple-600 font-medium">
                    {stats.certificatesCount}/{Math.max(1, stats.certificatesCount + 1)} earned
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Certificates */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Recent Certificates</h3>
                  <p className="text-gray-600">Your latest achievements</p>
                </div>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No certificates yet</p>
                  <p className="text-sm text-gray-400 mt-1">Complete a course to earn your first certificate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.slice(0, 3).map((certificate, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {certificate.courseId?.title || 'Course Certificate'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Issued: {new Date(certificate.issuedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/certificates/download/${certificate._id}`}
                          className="text-blue-600 hover:text-blue-700"
                          title="Download Certificate"
                        >
                          <Download className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/student/certificates`}
                          className="text-green-600 hover:text-green-700"
                          title="View Certificate"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  
                  {certificates.length > 3 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <Link
                        to="/student/certificates"
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                      >
                        View all {certificates.length} certificates
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;