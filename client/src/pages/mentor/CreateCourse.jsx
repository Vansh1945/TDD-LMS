import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MentorLayout from '../../components/MentorLayout';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Clock, 
  Tag, 
  Users,
  Eye,
  RefreshCw,
  Filter,
  ArrowLeft,
  CheckCircle,
  X
} from 'lucide-react';

const API = "http://localhost:5000/api/courses";

const CreateCourse = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState("mentor"); // "mentor" or "all"
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    duration: "",
  });

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Get unique categories from courses
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))];

  // Filter courses based on search term and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === "" || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === "all" || course.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  /* ============================
     FETCH MENTOR COURSES
  ============================ */
  const getMentorCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/mentor`, { headers });
      setCourses(res.data);
      setViewMode("mentor");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     FETCH ALL ACTIVE COURSES
  ============================ */
  const getAllCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}`, { headers });
      setCourses(res.data);
      setViewMode("all");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMentorCourses();
  }, []);

  /* ============================
     HANDLE INPUT
  ============================ */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ============================
     CREATE / UPDATE COURSE
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(
          `${API}/update-course/${editId}`,
          formData,
          { headers }
        );
        alert("Course updated successfully!");
      } else {
        await axios.post(
          `${API}/create-course`,
          {
            ...formData,
            duration: Number(formData.duration),
          },
          { headers }
        );
        alert("Course created successfully!");
      }

      resetForm();
      getMentorCourses();
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred");
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     EDIT COURSE
  ============================ */
  const handleEdit = (course) => {
    setIsEditing(true);
    setEditId(course._id);
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      duration: course.duration.toString(),
    });
  };

  /* ============================
     DELETE COURSE
  ============================ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      setLoading(true);
      await axios.delete(`${API}/delete-course/${id}`, { headers });
      alert("Course deleted successfully!");
      getMentorCourses();
    } catch (error) {
      alert("Failed to delete course");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     RESET FORM
  ============================ */
  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      duration: "",
    });
  };

  return (
    <MentorLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text">Course Management</h1>
                <p className="text-gray-600 mt-2">
                  {isEditing ? "Edit Course" : "Create, update, and manage your courses"}
                </p>
              </div>
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={resetForm}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  !isEditing
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-text'
                }`}
              >
                <Plus className="w-4 h-4" />
                Create Course
              </button>
              <button
                onClick={() => {
                  resetForm();
                  getMentorCourses();
                }}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  isEditing
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 hover:text-text'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                {isEditing ? "Editing Course" : "My Courses"}
              </button>
            </div>
          </div>

          {/* Form Section */}
          {!isEditing ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-text">Create New Course</h2>
                <p className="text-gray-600 text-sm mt-1">Fill in the course details below</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter course title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      disabled={loading}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Enter course category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      disabled={loading}
                    />
                    <p className="text-sm text-gray-500">Example: Web Development, Data Science, etc.</p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (hours) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="duration"
                        placeholder="Enter duration in hours"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        disabled={loading}
                      />
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Status
                    </label>
                    <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-green-700 font-medium">Course will be active upon creation</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe what students will learn in this course..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    disabled={loading}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Create Course
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-text">Edit Course</h2>
                    <p className="text-gray-600 text-sm mt-1">Update course details</p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel Edit
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="Enter course title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      disabled={loading}
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Category *
                    </label>
                    <input
                      type="text"
                      name="category"
                      placeholder="Enter course category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                      disabled={loading}
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (hours) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="duration"
                        placeholder="Enter duration in hours"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        min="1"
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        disabled={loading}
                      />
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Edit Status
                    </label>
                    <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Edit2 className="w-5 h-5 text-warning" />
                        <span className="text-yellow-700 font-medium">Editing course details</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course Description *
                  </label>
                  <textarea
                    name="description"
                    placeholder="Describe what students will learn in this course..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    disabled={loading}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="mt-8 flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-5 h-5" />
                        Update Course
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(editId)}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-danger text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete Course
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Courses List Section */}
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={getMentorCourses}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      viewMode === "mentor"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text hover:bg-gray-200"
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </button>
                  
                  <button
                    onClick={getAllCourses}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      viewMode === "all"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-text hover:bg-gray-200"
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    All Courses
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Showing {filteredCourses.length} of {courses.length} courses
                </span>
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  {viewMode === "mentor" ? "Your courses" : "All active courses"}
                </span>
              </div>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterCategory !== "all"
                    ? "No courses match your search criteria"
                    : "You haven't created any courses yet"}
                </p>
                <button
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Course
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          course.isActive 
                            ? 'bg-green-100 text-success' 
                            : 'bg-red-100 text-danger'
                        }`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-text mb-2">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Tag className="w-4 h-4" />
                          <span>{course.category || "Uncategorized"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{course.students?.length || 0} students</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {new Date(course.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-warning text-white rounded-lg hover:bg-yellow-600 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-danger text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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