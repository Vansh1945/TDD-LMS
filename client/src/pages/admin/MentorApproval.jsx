import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/auth';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'react-toastify';
import {
  UserCheck,
  UserX,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  X
} from 'lucide-react';

const MentorApproval = () => {
  const { token, API } = useAuth();
  const [mentorList, setMentorList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    getMentors();
  }, []);

  const getMentors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/users/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not load mentors');
      }

      const data = await response.json();
      const mentors = data.filter(user => user.role === 'mentor');
      setMentorList(mentors);

    } catch (error) {
      toast.error('Failed to load mentors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveMentor = async (mentorId) => {
    try {
      const response = await fetch(`${API}/users/approve-mentor/${mentorId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Approval failed');
      }

      setMentorList(mentorList.map(mentor =>
        mentor._id === mentorId ? { ...mentor, isApproved: true } : mentor
      ));
      toast.success('Mentor approved successfully');

    } catch (error) {
      toast.error('Could not approve mentor');
      console.error(error);
    }
  };

  const removeMentor = async (mentorId, mentorName) => {
    if (!confirm(`Remove mentor ${mentorName}?`)) {
      return;
    }

    try {
      const response = await fetch(`${API}/users/${mentorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setMentorList(mentorList.filter(mentor => mentor._id !== mentorId));
      toast.success('Mentor removed successfully');

    } catch (error) {
      toast.error('Could not remove mentor');
      console.error(error);
    }
  };

  const addMentor = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/users/register-mentor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setMentorList([...mentorList, data.mentor]);
      setShowForm(false);
      setFormData({ name: '', email: '', password: '' });
      toast.success('Mentor added successfully');

    } catch (error) {
      toast.error('Could not add mentor');
      console.error(error);
    }
  };

  const stats = {
    approved: mentorList.filter(m => m.isApproved).length,
    pending: mentorList.filter(m => !m.isApproved).length,
    total: mentorList.length
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text">Loading mentors...</p>
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
                <h1 className="text-2xl md:text-3xl font-bold text-text">Mentor Approval</h1>
                <p className="text-gray-600 mt-1">Manage mentor applications</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                <Plus size={18} />
                <span>Add Mentor</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Approved Mentors</p>
                    <p className="text-2xl font-bold text-text">{stats.approved}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <CheckCircle className="text-success" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Approval</p>
                    <p className="text-2xl font-bold text-text">{stats.pending}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50">
                    <UserX className="text-warning" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Mentors</p>
                    <p className="text-2xl font-bold text-text">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Users className="text-primary" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mentors List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {mentorList.length === 0 ? (
              <div className="text-center py-12">
                <UserCheck className="mx-auto text-gray-400" size={48} />
                <p className="mt-4 text-text font-medium">No mentors found</p>
                <p className="text-gray-600">Add your first mentor</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-sm text-gray-700">Mentor</th>
                      <th className="text-left p-4 font-medium text-sm text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-sm text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mentorList.map((mentor) => (
                      <tr key={mentor._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="font-semibold text-primary">
                                {mentor.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-text">{mentor.name}</p>
                              <p className="text-sm text-gray-500">{mentor.email}</p>
                              {mentor.bio && (
                                <p className="text-xs text-gray-400 mt-1">{mentor.bio}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            mentor.isApproved
                              ? 'bg-green-100 text-success'
                              : 'bg-yellow-100 text-warning'
                          }`}>
                            {mentor.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {!mentor.isApproved ? (
                              <>
                                <button
                                  onClick={() => approveMentor(mentor._id)}
                                  className="px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 text-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => removeMentor(mentor._id, mentor.name)}
                                  className="px-3 py-1.5 bg-danger text-white rounded-lg hover:bg-danger/90 text-sm"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => removeMentor(mentor._id, mentor.name)}
                                className="px-3 py-1.5 bg-danger text-white rounded-lg hover:bg-danger/90 text-sm"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Mentor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text">Add New Mentor</h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={addMentor}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Temporary password"
                      required
                    />
                  </div>
                </div>

                <div className="mt-8 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ name: '', email: '', password: '' });
                    }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Add Mentor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default MentorApproval;