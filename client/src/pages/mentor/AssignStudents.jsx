import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';
import {
  Users,
  UserCheck,
  UserPlus,
  ArrowLeft,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  ChevronRight,
  ListFilter
} from 'lucide-react';

const AssignStudent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('all'); // 'all', 'assigned', 'unassigned'
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Fetch course details and students
  useEffect(() => {
    fetchCourseAndStudents();
  }, [courseId]);

  const fetchCourseAndStudents = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch course details
      const courseResponse = await axios.get(`${API}/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(courseResponse.data);
      
      // Fetch all students
      const studentsResponse = await axios.get(`${API}/users/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllStudents(studentsResponse.data);
      
      // Get already assigned students from course data
      const assignedIds = courseResponse.data.students || [];
      setAssignedStudents(assignedIds);
      
      // Initialize selected students with already assigned ones
      setSelectedStudents(assignedIds);
      
    } catch (err) {
      setError('Failed to load course details or students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      // Deselect all
      setSelectedStudents([]);
    } else {
      // Select all filtered students
      const allFilteredIds = filteredStudents.map(student => student._id);
      setSelectedStudents(allFilteredIds);
    }
  };

  // Handle assign students
  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student to assign');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API}/courses/assign`, {
        courseId,
        studentIds: selectedStudents
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(`Successfully assigned ${selectedStudents.length} student(s) to the course!`);
      
      // Refresh data
      setTimeout(() => {
        fetchCourseAndStudents();
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign students to course');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students based on search and filter
  const filteredStudents = allStudents.filter(student => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Assignment status filter
    const isAssigned = assignedStudents.some(id => id.toString() === student._id.toString());
    
    if (filterAssigned === 'assigned') return matchesSearch && isAssigned;
    if (filterAssigned === 'unassigned') return matchesSearch && !isAssigned;
    return matchesSearch; // 'all'
  });

  // Calculate stats
  const assignedCount = allStudents.filter(student => 
    assignedStudents.some(id => id.toString() === student._id.toString())
  ).length;

  const selectedCount = selectedStudents.length;
  const newlySelectedCount = selectedStudents.filter(id => 
    !assignedStudents.some(assignedId => assignedId.toString() === id.toString())
  ).length;

  if (loading) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary border-t-secondary rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-gray-600 text-lg">Loading course and student data...</p>
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
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-text"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-3xl font-bold text-text">Assign Students</h1>
                </div>
                
                {/* Course Info */}
                {course && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-text">{course.title}</h2>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {course.duration} hours
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {assignedCount} students already assigned
                          </span>
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-4 h-4" />
                            {allStudents.length} total students available
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <p className="text-green-800 font-medium">{success}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-danger" />
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* Filters and Actions */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterAssigned}
                    onChange={(e) => setFilterAssigned(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="all">All Students</option>
                    <option value="assigned">Already Assigned</option>
                    <option value="unassigned">Not Assigned</option>
                  </select>
                  
                  <button
                    onClick={fetchCourseAndStudents}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span>{selectedCount} selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{newlySelectedCount} newly selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{assignedCount} already assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span>{filteredStudents.length} showing</span>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-text">Available Students</h2>
                    <p className="text-gray-600 text-sm">
                      Select students to assign to this course
                    </p>
                  </div>
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    {selectedStudents.length === filteredStudents.length ? (
                      <>
                        <X className="w-4 h-4" />
                        Deselect All
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Select All ({filteredStudents.length})
                      </>
                    )}
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No students found</h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || filterAssigned !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'No students available to assign'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredStudents.map((student) => {
                    const isAssigned = assignedStudents.some(id => id.toString() === student._id.toString());
                    const isSelected = selectedStudents.includes(student._id);
                    
                    return (
                      <div 
                        key={student._id} 
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Checkbox */}
                          <div className="flex-shrink-0 pt-1">
                            <input
                              type="checkbox"
                              id={`student-${student._id}`}
                              checked={isSelected}
                              onChange={() => handleStudentSelect(student._id)}
                              className="w-5 h-5 text-primary rounded focus:ring-primary border-gray-300"
                            />
                          </div>

                          {/* Student Avatar */}
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="font-semibold text-primary text-lg">
                              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>

                          {/* Student Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-3">
                                  <label 
                                    htmlFor={`student-${student._id}`}
                                    className="text-lg font-semibold text-text cursor-pointer hover:text-primary transition-colors"
                                  >
                                    {student.name}
                                  </label>
                                  {isAssigned && (
                                    <span className="px-2 py-1 bg-green-100 text-success text-xs font-medium rounded-full">
                                      Already Assigned
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {student.email}
                                  </span>
                                  {student.assignedCourses && (
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-4 h-4" />
                                      {student.assignedCourses.length} courses
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="flex items-center gap-2">
                                  <span className="px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                                    Selected
                                  </span>
                                  <ChevronRight className="w-5 h-5 text-primary" />
                                </div>
                              )}
                            </div>
                            
                            {/* Status Indicator */}
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`flex items-center gap-2 ${
                                isAssigned ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                <div className={`w-2 h-2 rounded-full ${
                                  isAssigned ? 'bg-green-500' : 'bg-gray-400'
                                }`}></div>
                                {isAssigned ? 'Already in this course' : 'Not in this course'}
                              </span>
                              
                              {student.lastLogin && (
                                <span className="text-gray-500">
                                  Last active: {new Date(student.lastLogin).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-text mb-2">Assignment Summary</h3>
                  <div className="space-y-1 text-gray-600">
                    <p>• {selectedCount} student(s) selected for assignment</p>
                    <p>• {newlySelectedCount} will be newly assigned to this course</p>
                    <p>• {selectedCount - newlySelectedCount} are already in this course</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Note: Students need to be assigned to access course content
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssignStudents}
                    disabled={submitting || selectedCount === 0}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        Assign Selected Students ({selectedCount})
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <ListFilter className="w-5 h-5" />
                Quick Tips
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-text">About Assignment</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>Students must be assigned to access course content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>You can assign multiple students at once</span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-text">Filter Options</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span>"Already Assigned" shows students in this course</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                      <span>"Not Assigned" shows available students</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
};

export default AssignStudent;