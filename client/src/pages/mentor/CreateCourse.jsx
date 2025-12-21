import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../auth/auth';
import MentorLayout from '../../components/MentorLayout';
import { toast } from 'react-toastify';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  Tag,
  Users,
  ArrowLeft
} from 'lucide-react';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
  });

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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.duration) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const url = editingCourse 
        ? `${API}/courses/update-course/${editingCourse._id}`
        : `${API}/courses/create-course`;

      const method = editingCourse ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save course');
      }

      toast.success(editingCourse ? 'Course updated successfully' : 'Course created successfully');
      
      getCourses();
      resetForm();

    } catch (error) {
      toast.error('Failed to save course');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      category: course.category || "",
      duration: course.duration || "",
    });
  };

  const deleteCourse = async (courseId) => {
    if (!confirm('Delete this course?')) return;

    try {
      const response = await fetch(`${API}/courses/delete-course/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      toast.success('Course deleted successfully');
      getCourses();

      if (editingCourse && editingCourse._id === courseId) {
        resetForm();
      }

    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
    });
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MentorLayout>
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-text">Course Management</h1>
                <p className="text-gray-600 mt-1">Create and manage your courses</p>
              </div>
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-xl font-bold text-text mb-4">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            
            <form onSubmit={saveCourse}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Course Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter course title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Web Development"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Duration (hours) *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Course duration in hours"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Status</label>
                  <div className="px-4 py-2.5 bg-green-50 text-success rounded-lg border border-green-200">
                    {editingCourse ? 'Course will be updated' : 'Course will be active'}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Course description"
                  rows="3"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
                </button>
                
                {editingCourse && (
                  <>
                    <button
                      type="button"
                      onClick={() => deleteCourse(editingCourse._id)}
                      className="px-5 py-2.5 bg-danger text-white rounded-lg hover:bg-danger/90"
                    >
                      Delete Course
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 border border-gray-300 text-text rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>

          {/* Courses List Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-text">Your Courses</h2>
                <p className="text-gray-600 text-sm">Manage your existing courses</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto text-gray-300" size={48} />
                <p className="text-text font-medium mt-4">No courses found</p>
                <p className="text-gray-600">
                  {searchTerm ? 'No courses match your search' : 'Create your first course above'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BookOpen className="text-primary" size={18} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text">{course.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <Tag size={14} />
                                {course.category || 'General'}
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <Clock size={14} />
                                {course.duration} hours
                              </span>
                              <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                                <Users size={14} />
                                {course.students?.length || 0} students
                              </span>
                            </div>
                          </div>
                        </div>
                        {course.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editCourse(course)}
                          className="p-2 text-primary hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          className="p-2 text-danger hover:bg-red-50 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MentorLayout>
  );
};

export default CreateCourse;