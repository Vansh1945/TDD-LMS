import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/auth';
import MentorLayout from '../../components/MentorLayout';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Users,
  BarChart3,
  PlusCircle,
  Award,
  ChevronRight,
  Clock
} from 'lucide-react';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    progress: 0,
    tasks: 0
  });
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData();
  }, []);

  const getDashboardData = async () => {
    try {
      setLoading(true);

      // Get mentor courses
      const coursesRes = await fetch(`${API}/courses/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!coursesRes.ok) {
        throw new Error('Could not load courses');
      }

      const courses = await coursesRes.json();
      setCourseList(courses);

      // Get mentor progress
      const progressRes = await fetch(`${API}/progress/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!progressRes.ok) {
        throw new Error('Could not load progress data');
      }

      const progressData = await progressRes.json();

      // Calculate stats
      const totalStudents = courses.reduce((sum, course) => 
        sum + (course.students ? course.students.length : 0), 0
      );

      const avgProgress = progressData.length > 0 
        ? Math.round(progressData.reduce((sum, p) => sum + p.progress.completionPercentage, 0) / progressData.length)
        : 0;
        
      const pendingTasks = progressData.reduce((sum, p) => sum + (p.progress.totalChapters - p.progress.completedChapters), 0);

      setStats({
        courses: courses.length,
        students: totalStudents,
        progress: avgProgress,
        tasks: pendingTasks
      });


    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Courses',
      value: stats.courses,
      icon: <BookOpen size={24} />,
      color: 'primary',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Students',
      value: stats.students,
      icon: <Users size={24} />,
      color: 'success',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Progress',
      value: `${stats.progress}%`,
      icon: <BarChart3 size={24} />,
      color: 'secondary',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Tasks',
      value: stats.tasks,
      icon: <Clock size={24} />,
      color: 'warning',
      bgColor: 'bg-yellow-50'
    }
  ];

  const quickActions = [
    {
      title: 'Create Course',
      description: 'Start new learning path',
      path: '/mentor/create-course',
      icon: <PlusCircle size={20} />,
      color: 'from-blue-50 to-white border-blue-200 hover:border-blue-300'
    },
    {
      title: 'View Progress',
      description: 'Track student performance',
      path: '/mentor/progress',
      icon: <BarChart3 size={20} />,
      color: 'from-green-50 to-white border-green-200 hover:border-green-300'
    },
    {
      title: 'Manage Students',
      description: 'View and assign students',
      path: '/mentor/students',
      icon: <Users size={20} />,
      color: 'from-purple-50 to-white border-purple-200 hover:border-purple-300'
    },
    {
      title: 'Course Materials',
      description: 'Edit and organize content',
      path: '/mentor/create-course',
      icon: <BookOpen size={20} />,
      color: 'from-yellow-50 to-white border-yellow-200 hover:border-yellow-300'
    }
  ];

  if (!user?.isApproved) {
    return (
      <MentorLayout>
        <div className="p-4 md:p-6">
          <div className="max-w-lg mx-auto text-center py-12">
            <div className="w-20 h-20 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-6">
              <Award className="text-warning" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-text mb-3">Awaiting Approval</h1>
            <p className="text-gray-600 mb-6">
              Your mentor account is pending admin approval. You'll get access once approved.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-50 text-warning rounded-lg">
              <Clock size={18} />
              <span className="font-medium">Pending Review</span>
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  if (loading) {
    return (
      <MentorLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user?.name || 'Mentor'}!</h1>
                  <p className="text-blue-100">Guide your students towards success</p>
                </div>
                <button
                  onClick={() => navigate('/mentor/create-course')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary font-medium rounded-lg hover:bg-blue-50"
                >
                  <PlusCircle size={18} />
                  Create New Course
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <div className={`text-${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-text">{card.value}</div>
                </div>
                <h3 className="text-gray-600 text-sm">{card.title}</h3>
              </div>
            ))}
          </div>

          {/* Courses Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text">Your Courses</h2>
                <p className="text-gray-600">Manage your teaching materials</p>
              </div>
              <button
                onClick={() => navigate('/mentor/courses')}
                className="px-4 py-2 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
              >
                View All
              </button>
            </div>

            {courseList.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-text mb-2">No courses yet</h3>
                <p className="text-gray-600 mb-4">Create your first course to get started</p>
                <button
                  onClick={() => navigate('/mentor/create-course')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  <PlusCircle size={18} />
                  Create First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseList.slice(0, 6).map((course) => (
                  <div key={course._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <BookOpen className="text-primary" size={20} />
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-primary text-xs font-medium rounded">
                        {course.students?.length || 0} students
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-text mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {course.description || 'No description provided'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category</span>
                        <span className="font-medium">{course.category || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Students</span>
                        <span className="font-medium">{course.students?.length || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate('/mentor/add-chapter')}
                        className="flex-1 px-3 py-1.5 bg-blue-50 text-primary text-sm rounded hover:bg-blue-100"
                      >
                        Add Chapter
                      </button>
                      <button
                        onClick={() => navigate('/mentor/assign-students')}
                        className="flex-1 px-3 py-1.5 bg-green-50 text-success text-sm rounded hover:bg-green-100"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border ${action.color} transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color.split(' ')[0]?.replace('from-', 'bg-')?.split('-50')[0]}-50`}>
                        <div className={action.color.split(' ')[0]?.replace('from-', 'text-')?.split('-50')[0] + '-600'}>
                          {action.icon}
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-text">{action.title}</h4>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400" size={18} />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-xl font-bold text-text mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {courseList.length > 0 ? (
                  <>
                    {courseList.slice(0, 3).map((course) => (
                      <div key={course._id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <p className="text-sm font-medium text-text">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.students?.length || 0} students enrolled • Last updated recently
                        </p>
                      </div>
                    ))}
                    <button
                      onClick={() => navigate('/mentor/courses')}
                      className="text-primary hover:text-secondary text-sm font-medium"
                    >
                      View all courses →
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="mx-auto text-gray-300" size={32} />
                    <p className="text-gray-500 mt-2">No activity yet</p>
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