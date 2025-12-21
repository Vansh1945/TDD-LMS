import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import {
  Search,
  Filter,
  RefreshCw,
  User,
  Users,
  UserCheck,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const UserList = () => {
  const { token, API } = useAuth();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    getUsers();
  }, []);

  const getUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not load users');
      }

      const data = await response.json();
      setUserList(data);

    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (userId, userName) => {
    if (!confirm(`Delete user ${userName}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setUserList(userList.filter(user => user._id !== userId));
      toast.success('User deleted successfully');

    } catch (error) {
      toast.error('Could not delete user');
      console.error(error);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter users
  const filteredUsers = userList.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                       user.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = role === 'all' || user.role === role;
    return matchSearch && matchRole;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    
    if (sortOrder === 'asc') {
      return aVal.toString().localeCompare(bVal.toString());
    } else {
      return bVal.toString().localeCompare(aVal.toString());
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedUsers.length / perPage);
  const startIndex = (page - 1) * perPage;
  const usersToShow = sortedUsers.slice(startIndex, startIndex + perPage);

  const roleStats = {
    student: userList.filter(u => u.role === 'student').length,
    mentor: userList.filter(u => u.role === 'mentor').length,
    admin: userList.filter(u => u.role === 'admin').length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text">Loading users...</p>
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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">User Management</h1>
                <p className="text-gray-600 mt-1">Manage all user accounts</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Students</p>
                    <p className="text-2xl font-bold text-text">{roleStats.student}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <User className="text-primary" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Mentors</p>
                    <p className="text-2xl font-bold text-text">{roleStats.mentor}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <UserCheck className="text-secondary" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Admins</p>
                    <p className="text-2xl font-bold text-text">{roleStats.admin}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <Users className="text-success" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Role</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-3.5 text-gray-400" size={18} />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 appearance-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearch('');
                      setRole('all');
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center space-x-1 font-medium text-sm text-gray-700 hover:text-text"
                      >
                        <span>Name</span>
                        {sortField === 'name' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center space-x-1 font-medium text-sm text-gray-700 hover:text-text"
                      >
                        <span>Email</span>
                        {sortField === 'email' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4">
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center space-x-1 font-medium text-sm text-gray-700 hover:text-text"
                      >
                        <span>Role</span>
                        {sortField === 'role' && (
                          sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4 font-medium text-sm text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersToShow.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text">{user.name}</p>
                            <p className="text-xs text-gray-500">ID: {user._id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-text">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'mentor'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => removeUser(user._id, user.name)}
                          className="px-3 py-1.5 bg-danger text-white rounded-lg hover:bg-danger/90 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {usersToShow.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-text font-medium">No users found</p>
                <p className="text-gray-600">Try different search terms</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(startIndex + perPage, sortedUsers.length)} of {sortedUsers.length}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`px-3 py-1.5 rounded-lg ${
                          page === num
                            ? 'bg-primary text-white'
                            : 'border border-gray-300'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserList;