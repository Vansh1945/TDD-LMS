import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Video,
  Image as ImageIcon,
  ListOrdered,
  Clock,
  Users,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  PlayCircle,
  X,
  Save
} from 'lucide-react';

const AddChapter = () => {
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  // States
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'create' or 'edit'
  const [allCourses, setAllCourses] = useState([]); // New state for all courses
  const [selectedCourseId, setSelectedCourseId] = useState(''); // Use courseId from params as initial selection
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true); // This will indicate if initial course list is loading
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    videoUrl: "",
    order: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeView, setActiveView] = useState("courses"); // "courses" or "chapters"
  const [searchTerm, setSearchTerm] = useState("");

  const axiosAuth = axios.create({
    baseURL: API,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  /* ================= FETCH MENTOR COURSES ================= */
  useEffect(() => {
    fetchMentorCourses();
  }, []);

  const fetchMentorCourses = async () => {
    try {
      setLoading(true);
      const res = await axiosAuth.get("/courses/mentor");
      setAllCourses(res.data);
    } catch (err) {
      console.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH CHAPTERS ================= */
  const fetchChapters = async (courseId) => {
    try {
      const res = await axiosAuth.get(
        `/chapters/get-chapters?courseId=${courseId}`
      );
      // Sort chapters by order
      const sortedChapters = res.data.sort((a, b) => a.order - b.order);
      setChapters(sortedChapters);
    } catch (err) {
      console.error("Failed to load chapters");
    }
  };

  /* ================= COURSE SELECT ================= */
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchChapters(course._id);
    setActiveView("chapters");
    resetForm();
  };

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setChapters([]);
    resetForm();
    setActiveView("courses");
  };

  /* ================= FORM HANDLING ================= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ================= SEQUENTIAL ORDER ENFORCE ================= */
  const getNextOrder = () => {
    if (chapters.length === 0) return 1;
    return Math.max(...chapters.map((c) => c.order)) + 1;
  };

  /* ================= CREATE / UPDATE CHAPTER ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate sequential order for new chapters
    if (!isEditing && Number(formData.order) !== getNextOrder()) {
      alert(`Next allowed sequence is ${getNextOrder()}`);
      return;
    }

    try {
      if (isEditing) {
        await axiosAuth.put(`/chapters/update-chapter/${editId}`, formData);
        alert("Chapter updated successfully!");
      } else {
        await axiosAuth.post("/chapters/create-chapter", {
          ...formData,
          courseId: selectedCourse._id,
        });
        alert("Chapter added successfully!");
      }

      fetchChapters(selectedCourse._id);
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  /* ================= EDIT CHAPTER ================= */
  const handleEdit = (chapter) => {
    setIsEditing(true);
    setEditId(chapter._id);
    setFormData({
      title: chapter.title,
      description: chapter.description,
      imageUrl: chapter.imageUrl,
      videoUrl: chapter.videoUrl,
      order: chapter.order,
    });
  };

  /* ================= DELETE CHAPTER ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await axiosAuth.delete(`/chapters/delete-chapter/${id}`);
      fetchChapters(selectedCourse._id);
      if (isEditing && editId === id) {
        resetForm();
      }
    } catch (err) {
      alert("Failed to delete chapter");
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      videoUrl: "",
      order: getNextOrder(),
    });
  };

  // Filter courses based on search term
  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text">
                  {selectedCourse ? selectedCourse.title : "Manage Chapters"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {selectedCourse 
                    ? `Manage chapters for "${selectedCourse.title}"` 
                    : "Select a course to add or manage chapters"}
                </p>
              </div>
              
              {selectedCourse && (
                <button
                  onClick={goBackToCourses}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Back to Courses
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          {activeView === "courses" ? (
            /* COURSES VIEW */
            <div className="space-y-6">
              {/* Search and Filter */}
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="w-4 h-4" />
                    <span>{filteredCourses.length} courses</span>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ? "Try adjusting your search" : "You haven't created any courses yet"}
                  </p>
                  <button
                    onClick={() => navigate('/mentor/create-course')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      onClick={() => handleCourseSelect(course)}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              {course.duration} hours
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration} hours duration</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{course.students?.length || 0} students enrolled</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ListOrdered className="w-4 h-4" />
                            <span>Click to manage chapters</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-primary font-medium">Manage Chapters</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* CHAPTERS VIEW (When course is selected) */
            <div className="space-y-6">
              {/* Course Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text">{selectedCourse.title}</h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {selectedCourse.duration} hours
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {selectedCourse.students?.length || 0} students
                        </span>
                        <span className="flex items-center gap-1">
                          <ListOrdered className="w-4 h-4" />
                          {chapters.length} chapters
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chapters List */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-text">Course Chapters</h2>
                          <p className="text-gray-600 text-sm">All chapters in sequential order</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-primary text-sm font-medium rounded-full">
                          {chapters.length} chapters
                        </span>
                      </div>
                    </div>

                    {chapters.length === 0 ? (
                      <div className="p-12 text-center">
                        <ListOrdered className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No chapters yet</h3>
                        <p className="text-gray-500 mb-6">
                          Start by adding your first chapter
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {chapters.map((chapter) => (
                          <div
                            key={chapter._id}
                            className="p-6 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              {/* Order Badge */}
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <span className="font-bold text-primary">{chapter.order}</span>
                                </div>
                              </div>

                              {/* Chapter Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-lg font-semibold text-text">
                                      {chapter.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                      {chapter.description}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEdit(chapter)}
                                      className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(chapter._id)}
                                      className="flex items-center gap-1 px-3 py-1 bg-red-50 text-danger rounded-lg hover:bg-red-100 transition-colors text-sm"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {chapter.imageUrl && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      <ImageIcon className="w-3 h-3" />
                                      Has Image
                                    </span>
                                  )}
                                  {chapter.videoUrl && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                      <PlayCircle className="w-3 h-3" />
                                      Has Video
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Add/Edit Chapter Form */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {isEditing ? (
                            <Edit2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Plus className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-text">
                            {isEditing ? "Edit Chapter" : "Add New Chapter"}
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {isEditing ? "Update chapter details" : "Add a new chapter to this course"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                      <div className="space-y-4">
                        {/* Chapter Title */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Chapter Title *
                          </label>
                          <input
                            name="title"
                            placeholder="Enter chapter title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Description *
                          </label>
                          <textarea
                            name="description"
                            placeholder="Enter chapter description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                          />
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Image URL (Optional)
                          </label>
                          <div className="relative">
                            <input
                              name="imageUrl"
                              placeholder="https://example.com/image.jpg"
                              value={formData.imageUrl}
                              onChange={handleChange}
                              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <ImageIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                        </div>

                        {/* Video URL */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Video URL *
                          </label>
                          <div className="relative">
                            <input
                              name="videoUrl"
                              placeholder="https://example.com/video.mp4"
                              value={formData.videoUrl}
                              onChange={handleChange}
                              required
                              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <Video className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                        </div>

                        {/* Sequence Order */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Sequence Order *
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="order"
                              placeholder={`Next order: ${getNextOrder()}`}
                              value={formData.order || getNextOrder()}
                              onChange={handleChange}
                              required
                              min="1"
                              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            />
                            <ListOrdered className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          </div>
                          {!isEditing && (
                            <p className="text-sm text-gray-500">
                              Next sequential order: {getNextOrder()}
                            </p>
                          )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="pt-4 space-y-3">
                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors"
                          >
                            {isEditing ? (
                              <>
                                <Save className="w-5 h-5" />
                                Update Chapter
                              </>
                            ) : (
                              <>
                                <Plus className="w-5 h-5" />
                                Add Chapter
                              </>
                            )}
                          </button>
                          
                          {isEditing && (
                            <button
                              type="button"
                              onClick={resetForm}
                              className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Quick Info */}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <h3 className="font-semibold text-text mb-4">Quick Info</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <ListOrdered className="w-4 h-4 text-primary" />
                        <span>Chapters must be added in sequential order</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-primary" />
                        <span>Video URL is required for each chapter</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <span>Image URL is optional but recommended</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        <span>Current course has {chapters.length} chapters</span>
                      </li>
                    </ul>
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

export default AddChapter;