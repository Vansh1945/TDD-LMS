import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../auth/auth';
import MentorLayout from '../../components/MentorLayout';
import { toast } from 'react-toastify';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowLeft,
  Search,
  Eye
} from 'lucide-react';

const Progress = () => {
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/courses/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not load courses');
      }

      const data = await response.json();
      setCourses(data);

    } catch (error) {
      toast.error('Failed to load courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = async (courseId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API}/progress/mentor`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not load progress data');
      }

      const data = await response.json();
      const courseProgress = data.filter(item => item.course._id === courseId);
      setProgressData(courseProgress);
      toast.success('Progress data loaded successfully');

    } catch (error) {
      toast.error('Failed to load progress data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    getProgress(course._id);
    setSearchTerm("");
  };

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setProgressData([]);
  };



  const getStatus = (percentage) => {
    if (percentage === 100) return 'Completed';
    if (percentage >= 70) return 'Good';
    if (percentage >= 40) return 'Average';
    if (percentage > 0) return 'Slow';
    return 'Not Started';
  };

  const getStatusColor = (percentage) => {
    if (percentage === 100) return 'text-success';
    if (percentage >= 70) return 'text-primary';
    if (percentage >= 40) return 'text-warning';
    if (percentage > 0) return 'text-orange-500';
    return 'text-gray-500';
  };

  const filteredProgress = progressData.filter(item =>
    item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: progressData.length,
    completed: progressData.filter(item => item.progress.completionPercentage === 100).length,
    averageProgress: progressData.length > 0
      ? Math.round(progressData.reduce((sum, item) => sum + item.progress.completionPercentage, 0) / progressData.length)
      : 0,
    totalChapters: progressData[0]?.progress?.totalChapters || 0
  };

  if (loading && !selectedCourse) {
    return (
      <MentorLayout>
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-text">Loading courses...</p>
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">Progress View</h1>
                <p className="text-gray-600 mt-1">Track student progress in your courses</p>
              </div>
              
              {selectedCourse && (
                <button
                  onClick={goBackToCourses}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft size={18} />
                  Back to Courses
                </button>
              )}
            </div>
          </div>

          {/* Course Selection View */}
          {!selectedCourse ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-xl font-bold text-text mb-4">Your Courses</h2>
                <p className="text-gray-600 mb-6">Select a course to view student progress</p>
                
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto text-gray-300" size={48} />
                    <p className="text-text font-medium mt-4">No courses found</p>
                    <p className="text-gray-600 mb-6">Create a course first to track progress</p>
                    <button
                      onClick={() => navigate('/mentor/create-course')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                      Create Course
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => selectCourse(course)}
                        className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md cursor-pointer"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BarChart3 className="text-primary" size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-text line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-gray-500">{course.category || 'General'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{course.students?.length || 0} students</span>
                          <button className="flex items-center gap-1 text-primary">
                            <span>View Progress</span>
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Progress View */
            <div className="space-y-6">
              {/* Course Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                      <BarChart3 className="text-primary" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text">{selectedCourse.title}</h2>
                      <p className="text-gray-600">Student progress tracking</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/mentor/assign-students')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Manage Students
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Students</p>
                      <p className="text-2xl font-bold text-text">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Users className="text-primary" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Completed</p>
                      <p className="text-2xl font-bold text-text">{stats.completed}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50">
                      <CheckCircle className="text-success" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Avg Progress</p>
                      <p className="text-2xl font-bold text-text">{stats.averageProgress}%</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50">
                      <TrendingUp className="text-secondary" size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Chapters</p>
                      <p className="text-2xl font-bold text-text">{stats.totalChapters}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <BookOpen className="text-warning" size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading progress data...</p>
                  </div>
                ) : filteredProgress.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto text-gray-300" size={48} />
                    <p className="text-text font-medium mt-4">No progress data found</p>
                    <p className="text-gray-600">
                      {searchTerm ? 'No students match your search' : 'No students enrolled in this course'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-medium text-sm text-gray-700">Student</th>
                          <th className="text-left p-4 font-medium text-sm text-gray-700">Progress</th>
                          <th className="text-left p-4 font-medium text-sm text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProgress.map((item) => (
                          <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                                  <span className="font-semibold text-primary">
                                    {item.student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-text">{item.student.name}</p>
                                  <p className="text-sm text-gray-500">{item.student.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-600">Chapters</span>
                                  <span className="font-medium">
                                    {item.progress.completedChapters} / {item.progress.totalChapters}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${item.progress.completionPercentage}%` }}
                                  />
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.progress.completionPercentage}% complete
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.progress.completionPercentage)}`}>
                                {getStatus(item.progress.completionPercentage)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-text mb-4">Progress Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-2">Completion Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-success"
                          style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="font-medium">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">Average Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${stats.averageProgress}%` }}
                        />
                      </div>
                      <span className="font-medium">{stats.averageProgress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MentorLayout>
  );
};

export default Progress;