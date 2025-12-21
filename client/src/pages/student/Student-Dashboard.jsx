import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import ProgressBar from '../../components/ProgressBar';
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  ChevronRight,
  Search,
  PlayCircle,
  Users,
  CheckCircle,
  Calendar,
  Target,
  BarChart3,
  Zap,
  Trophy
} from 'lucide-react';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalProgress: 0,
    completedCourses: 0,
    streakDays: 0,
    certificatesCount: 0
  });
  const [certificates, setCertificates] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const { token, API, user } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const coursesResponse = await axios.get(`${API}/courses/student-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const enrolledCourses = coursesResponse.data;
        
        const coursesWithProgress = await Promise.all(
          enrolledCourses.map(async (course) => {
            try {
              const progressResponse = await axios.get(`${API}/progress/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              
              const courseDetailsResponse = await axios.get(`${API}/courses/${course._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              const progressData = progressResponse.data;
              return {
                ...course,
                mentor: courseDetailsResponse.data.mentorId,
                progress: progressData.completionPercentage || 0,
                completedChapters: progressData.completedChapters || 0,
                totalChapters: progressData.totalChapters || 0,
                progressDetails: progressData.progress || []
              };
            } catch (error) {
              return {
                ...course,
                progress: 0,
                completedChapters: 0,
                totalChapters: 0,
                progressDetails: []
              };
            }
          })
        );

        setCourses(coursesWithProgress);

        const certificatesResponse = await axios.get(`${API}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCertificates(certificatesResponse.data || []);

        const totalProgress = coursesWithProgress.length > 0 
          ? coursesWithProgress.reduce((acc, course) => acc + course.progress, 0) / coursesWithProgress.length
          : 0;
        
        const completedCourses = coursesWithProgress.filter(course => course.progress === 100).length;

        const activities = [];
        coursesWithProgress.forEach(course => {
          if (course.progressDetails) {
            course.progressDetails.forEach(progress => {
              if (progress.completedAt) {
                activities.push({
                  courseTitle: course.title,
                  date: new Date(progress.completedAt),
                  courseId: course._id
                });
              }
            });
          }
        });

        setStats({
          totalCourses: coursesWithProgress.length,
          totalProgress: Math.round(totalProgress),
          completedCourses,
          streakDays: calculateStreak(activities),
          certificatesCount: certificatesResponse.data?.length || 0
        });

        setRecentActivity(activities.sort((a, b) => b.date - a.date).slice(0, 4));

      } catch (err) {
        console.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, API]);

  const calculateStreak = (activities) => {
    if (activities.length === 0) return 0;
    const dates = [...new Set(activities.map(a => a.date.toDateString()))];
    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i-1]);
      const curr = new Date(dates[i]);
      const diff = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text/60">Loading dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-text">Welcome back, {user?.name || 'Student'}</h1>
                <p className="text-text/60 mt-1">
                  {stats.totalCourses > 0 ? 
                    `You're learning ${stats.totalCourses} course${stats.totalCourses > 1 ? 's' : ''}` : 
                    'Start your learning journey'}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-text/60" />
                  <span className="text-sm">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg">
                  <Zap className="w-4 h-4 text-warning" />
                  <span className="text-sm">{stats.streakDays} day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-text mt-1">{stats.totalCourses}</p>
                </div>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-background">
                <p className="text-sm text-text/60">{stats.completedCourses} completed</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Overall Progress</p>
                  <p className="text-2xl font-bold text-text mt-1">{stats.totalProgress}%</p>
                </div>
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-background">
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-success rounded-full"
                    style={{ width: `${stats.totalProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Certificates</p>
                  <p className="text-2xl font-bold text-text mt-1">{stats.certificatesCount}</p>
                </div>
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-warning" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-background">
                <p className="text-sm text-text/60">Earned</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text/60 text-sm">Learning Streak</p>
                  <p className="text-2xl font-bold text-text mt-1">{stats.streakDays} days</p>
                </div>
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-secondary" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-background">
                <p className="text-sm text-text/60">Keep it up!</p>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-text">Continue Learning</h2>
                <p className="text-text/60 text-sm">Your enrolled courses</p>
              </div>
              <Link
                to="/student/courses"
                className="flex items-center gap-2 text-primary hover:text-primary/80 text-sm"
              >
                <Search className="w-4 h-4" />
                Browse Courses
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <div className="w-14 h-14 mx-auto bg-background rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-text/40" />
                </div>
                <h3 className="text-text font-medium mb-2">No courses yet</h3>
                <p className="text-text/60 text-sm mb-4">Enroll in courses to start learning</p>
                <Link
                  to="/student/courses"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.slice(0, 3).map(course => (
                  <div key={course._id} className="bg-white rounded-lg border hover:border-primary/50 transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 bg-primary/10 rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          course.progress === 100 ? 'bg-success/10 text-success' : 
                          course.progress >= 50 ? 'bg-primary/10 text-primary' : 
                          'bg-warning/10 text-warning'
                        }`}>
                          {course.progress}%
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-text mb-2 line-clamp-2">{course.title}</h3>
                      
                      {course.mentor && (
                        <div className="flex items-center gap-2 text-text/60 text-sm mb-3">
                          <Users className="w-3 h-3" />
                          <span>{course.mentor.name || 'Mentor'}</span>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-text/60 mb-1">
                          <span>Progress</span>
                          <span>{course.completedChapters}/{course.totalChapters} chapters</span>
                        </div>
                        <div className="h-1.5 bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <Link
                        to={`/student/course/${course._id}`}
                        className="flex items-center justify-between text-sm text-primary hover:text-primary/80 pt-3 border-t border-background"
                      >
                        <span className="flex items-center gap-2">
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
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity & Certificates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-text">Recent Activity</h3>
                <p className="text-text/60 text-sm">Your latest progress</p>
              </div>
              
              <div className="p-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 mx-auto bg-background rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-5 h-5 text-text/40" />
                    </div>
                    <p className="text-text/60 text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-background rounded">
                        <div className="w-8 h-8 bg-success/10 rounded flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-success" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text">
                            Completed chapter in <span className="font-medium">{activity.courseTitle}</span>
                          </p>
                          <p className="text-xs text-text/60 mt-1">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text">Certificates</h3>
                    <p className="text-text/60 text-sm">Your achievements</p>
                  </div>
                  <Trophy className="w-5 h-5 text-warning" />
                </div>
              </div>
              
              <div className="p-4">
                {certificates.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 mx-auto bg-background rounded-full flex items-center justify-center mb-3">
                      <Award className="w-5 h-5 text-text/40" />
                    </div>
                    <p className="text-text/60 text-sm">No certificates yet</p>
                    <p className="text-xs text-text/40 mt-1">Complete a course to earn</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.slice(0, 3).map((certificate, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-warning/5 rounded hover:bg-warning/10">
                        <div className="w-8 h-8 bg-warning/10 rounded flex items-center justify-center">
                          <Award className="w-4 h-4 text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text">
                            {certificate.courseId?.title || 'Course Certificate'}
                          </p>
                          <p className="text-xs text-text/60 mt-1">
                            Earned {new Date(certificate.issuedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to={`/student/certificates`}
                          className="text-primary hover:text-primary/80"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6">
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-text mb-4">Learning Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-text">{stats.totalCourses}</div>
                  <p className="text-sm text-text/60 mt-1">Total Courses</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text">{stats.completedCourses}</div>
                  <p className="text-sm text-text/60 mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text">{stats.totalProgress}%</div>
                  <p className="text-sm text-text/60 mt-1">Avg Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-text">{stats.streakDays}</div>
                  <p className="text-sm text-text/60 mt-1">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;