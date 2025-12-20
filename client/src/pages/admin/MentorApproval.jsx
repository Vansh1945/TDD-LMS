import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';

const MentorApproval = () => {
  const { token, API } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch(`${API}/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      const allMentors = data.filter(user => user.role === 'mentor');
      setMentors(allMentors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (userId) => {
    try {
      const response = await fetch(`${API}/users/approve-mentor/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to approve mentor');
      }
      setMentors(mentors.map(mentor =>
        mentor._id === userId ? { ...mentor, isApproved: true } : mentor
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const rejectMentor = async (userId) => {
    try {
      const response = await fetch(`${API}/users/reject-mentor/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to reject mentor');
      }
      setMentors(mentors.filter(mentor => mentor._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteMentor = async (userId) => {
    try {
      const response = await fetch(`${API}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete mentor');
      }
      setMentors(mentors.filter(mentor => mentor._id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const registerMentor = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const response = await fetch(`${API}/users/register-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(registerForm),
      });
      if (!response.ok) {
        throw new Error('Failed to register mentor');
      }
      const data = await response.json();
      setMentors([...mentors, data.mentor]);
      setShowRegisterModal(false);
      setRegisterForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setRegisterLoading(false);
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text">Mentor Management</h1>
                <p className="text-gray-600 mt-2">Approve mentor applications and manage approved mentors</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition duration-150 font-medium"
                >
                  Register New Mentor
                </button>
                <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-medium">
                  Total Mentors: {mentors.length}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Approved Mentors</p>
                    <p className="text-2xl font-bold text-text mt-1">
                      {mentors.filter(m => m.isApproved).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Approval</p>
                    <p className="text-2xl font-bold text-text mt-1">
                      {mentors.filter(m => !m.isApproved).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-warning" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentors List */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Mentor Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mentors.map((mentor) => (
                      <tr key={mentor._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-primary font-semibold">
                                {mentor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-text">{mentor.name}</div>
                              <div className="text-sm text-gray-500">{mentor.email}</div>
                              <div className="text-sm text-gray-500">{mentor.bio}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            mentor.isApproved
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}>
                            {mentor.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!mentor.isApproved ? (
                              <>
                                <button
                                  onClick={() => approveMentor(mentor._id)}
                                  className="px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition duration-150 text-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => rejectMentor(mentor._id)}
                                  className="px-3 py-1.5 bg-warning text-white rounded-lg hover:bg-warning/90 transition duration-150 text-sm"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => deleteMentor(mentor._id)}
                                className="px-3 py-1.5 bg-danger text-white rounded-lg hover:bg-danger/90 transition duration-150 text-sm"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* No mentors */}
              {mentors.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No mentors found</h3>
                  <p className="mt-2 text-gray-500">There are currently no mentor users in the system.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-text">Register New Mentor</h2>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={registerMentor}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                    placeholder="Enter mentor's full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                    placeholder="Enter mentor's email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition duration-150"
                    placeholder="Create a temporary password"
                    required
                  />
                </div>
              </div>
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition duration-150 font-medium disabled:bg-primary/50 disabled:cursor-not-allowed"
                >
                  {registerLoading ? 'Registering...' : 'Register Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MentorApproval;
