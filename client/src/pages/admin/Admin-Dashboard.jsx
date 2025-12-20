import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';
import {
  Users,
  UserCheck,
  BarChart3,
  UserPlus,
  BookOpen,
  Award,
  TrendingUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, API } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API}/users/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-6">
              <div className="flex items-center">
                <svg className="h-6 w-6 text-danger mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-danger">Error: {error}</h3>
              </div>
              <button
                onClick={fetchAnalytics}
                className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition duration-150"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome to your admin control center</p>
          </div>

          {/* Quick Links */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-text mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                to="/admin/users"
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">Manage Users</h3>
                    <p className="text-sm text-gray-600">View and manage all users</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/mentors"
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">Mentor Approvals</h3>
                    <p className="text-sm text-gray-600">Approve or reject mentors</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/admin/analytics"
                className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">View Analytics</h3>
                    <p className="text-sm text-gray-600">Detailed system analytics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Students</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.users?.students || 0}</p>
                  <p className="text-sm text-green-600 mt-1">Active learners</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Mentors */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Mentors</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.users?.mentors || 0}</p>
                  <p className="text-sm text-purple-600 mt-1">{analytics?.users?.approvedMentors || 0} approved</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Total Courses */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.courses?.total || 0}</p>
                  <p className="text-sm text-orange-600 mt-1">{analytics?.courses?.published || 0} published</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Total Certificates */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Certificates</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.certificates?.total || 0}</p>
                  <p className="text-sm text-green-600 mt-1">Issued</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-text">Recent Activity</h3>
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 mb-6">Activity from the last 7 days</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analytics?.users?.newUsers || 0}</div>
                <div className="text-gray-600">New Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analytics?.courses?.newCourses || 0}</div>
                <div className="text-gray-600">New Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analytics?.certificates?.newCertificates || 0}</div>
                <div className="text-gray-600">New Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
