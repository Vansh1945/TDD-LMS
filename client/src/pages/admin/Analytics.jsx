import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const Analytics = () => {
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
            <h1 className="text-3xl font-bold text-text">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of system performance and metrics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.users?.total || 0}</p>
                  <p className="text-sm text-green-600 mt-1">+{analytics?.users?.newUsers || 0} this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM7 6v2a3 3 0 1 0 6 0V6a3 3 0 1 0-6 0zm-3.65 8.44a8 8 0 0 0 13.3 0 15.94 15.94 0 0 0-13.3 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.users?.active || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">{analytics?.users?.students || 0} students</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Courses</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.courses?.total || 0}</p>
                  <p className="text-sm text-purple-600 mt-1">{analytics?.courses?.published || 0} published</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Certificates</p>
                  <p className="text-3xl font-bold text-text mt-1">{analytics?.certificates?.total || 0}</p>
                  <p className="text-sm text-orange-600 mt-1">+{analytics?.certificates?.newCertificates || 0} this month</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-text mb-4">User Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold text-text">{analytics?.users?.students || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mentors</span>
                  <span className="font-semibold text-text">{analytics?.users?.mentors || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Approved Mentors</span>
                  <span className="font-semibold text-text">{analytics?.users?.approvedMentors || 0}</span>
                </div>
              </div>
            </div>

            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-text mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Chapters</span>
                  <span className="font-semibold text-text">{analytics?.chapters?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Progress Records</span>
                  <span className="font-semibold text-text">{analytics?.progress?.total || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Progress</span>
                  <span className="font-semibold text-text">{analytics?.progress?.completed || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Course Completion Rate */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-text mb-4">Course Completion Rate</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{analytics?.courses?.completionRate || 0}%</div>
              <p className="text-gray-600">Overall completion rate across all courses</p>
            </div>
          </div>

          {/* Most Popular Courses */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-text mb-4">Most Popular Courses</h3>
            {analytics?.courses?.popularCourses?.length > 0 ? (
              <div className="space-y-4">
                {analytics.courses.popularCourses.map((course, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-text">{course.title}</span>
                    <span className="text-sm text-gray-600">{course.count} enrollments</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No course data available</p>
            )}
          </div>

          {/* Charts Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Registration Trend */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-text mb-4">User Registration Trend (Last 12 Months)</h3>
              {analytics?.trends?.userRegistrations?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trends.userRegistrations.map(item => ({
                    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                    users: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600">No trend data available</p>
              )}
            </div>

            {/* Course Completion Trend */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-text mb-4">Course Completion Trend (Last 12 Months)</h3>
              {analytics?.trends?.courseCompletions?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.trends.courseCompletions.map(item => ({
                    month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
                    completions: item.count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completions" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-600">No trend data available</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-text mb-4">Recent Activity (Last 30 Days)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{analytics?.users?.newUsers || 0}</div>
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

export default Analytics;
