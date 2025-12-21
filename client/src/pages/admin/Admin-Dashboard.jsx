import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import {
  Users,
  UserCheck,
  BarChart3,
  UserPlus,
  BookOpen,
  Award,
  Clock,
  ArrowUp,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, API } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    mentors: 0,
    courses: 0,
    certificates: 0,
    newUsers: 0,
    pendingMentors: 0,
    publishedCourses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData();
  }, []);

  const getDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/users/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      setStats({
        students: data?.users?.students || 0,
        mentors: data?.users?.mentors || 0,
        courses: data?.courses?.total || 0,
        certificates: data?.certificates?.total || 0,
        newUsers: data?.users?.newUsers || 0,
        pendingMentors: data?.users?.pendingMentors || 0,
        publishedCourses: data?.courses?.published || 0
      });

    } catch (error) {
      toast.error('Could not load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.students,
      icon: <Users size={24} />,
      color: 'primary',
      link: '/admin/users'
    },
    {
      title: 'Total Mentors',
      value: stats.mentors,
      icon: <UserCheck size={24} />,
      color: 'secondary',
      link: '/admin/mentors'
    },
    {
      title: 'Total Courses',
      value: stats.courses,
      icon: <BookOpen size={24} />,
      color: 'success',
      link: '/admin/courses'
    },
    {
      title: 'Certificates',
      value: stats.certificates,
      icon: <Award size={24} />,
      color: 'warning',
      link: '/admin/certificates'
    }
  ];

  const quickLinks = [
    {
      title: 'Manage Users',
      description: 'View and manage all users',
      icon: <Users size={20} />,
      link: '/admin/users',
      color: 'bg-blue-50 text-primary'
    },
    {
      title: 'Mentor Approvals',
      description: 'Approve or reject mentors',
      icon: <UserCheck size={20} />,
      link: '/admin/mentors',
      color: 'bg-green-50 text-success'
    },
    {
      title: 'View Analytics',
      description: 'Detailed system analytics',
      icon: <BarChart3 size={20} />,
      link: '/admin/analytics',
      color: 'bg-purple-50 text-secondary'
    }
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome to your control panel</p>
              </div>
              <button
                onClick={getDashboardData}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${card.color}/10`}>
                    <div className={`text-${card.color}`}>
                      {card.icon}
                    </div>
                  </div>
                  <Link to={card.link} className="text-sm text-primary hover:underline">
                    View
                  </Link>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-text">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.link}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${link.color.split(' ')[0]}`}>
                      <div className={link.color.split(' ')[1]}>
                        {link.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-text mb-1">{link.title}</h3>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Recent Activity</h2>
              <Clock size={20} className="text-gray-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <UserPlus size={20} className="text-blue-500" />
                  <span className="text-sm text-gray-600">New Users (7 days)</span>
                </div>
                <div className="flex items-center justify-center">
                  <p className="text-2xl font-bold text-text">{stats.newUsers}</p>
                  {stats.newUsers > 0 && (
                    <ArrowUp size={16} className="text-success ml-2" />
                  )}
                </div>
              </div>

              <div className="text-center p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <UserCheck size={20} className="text-purple-500" />
                  <span className="text-sm text-gray-600">Pending Mentors</span>
                </div>
                <p className="text-2xl font-bold text-text">{stats.pendingMentors}</p>
              </div>

              <div className="text-center p-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <BookOpen size={20} className="text-orange-500" />
                  <span className="text-sm text-gray-600">Published Courses</span>
                </div>
                <p className="text-2xl font-bold text-text">{stats.publishedCourses}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Last updated: Just now</p>
                <Link
                  to="/admin/analytics"
                  className="text-primary hover:underline text-sm font-medium"
                >
                  View full analytics →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;