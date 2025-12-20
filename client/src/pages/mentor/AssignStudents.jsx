import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';
import {
  Users,
  UserPlus,
  Check,
  X,
  Search,
  Filter,
  BookOpen,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  List,
  Eye
} from 'lucide-react';

const AssignStudent = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
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
      setCourses(res.data);
      
      // If courseId is provided in URL, select that course
      if (courseId) {
        const course = res.data.find(c => c._id === courseId);
        if (course) {
          setSelectedCourse(course);
          fetchAllStudents();
          fetchAssignedStudents(course._id);
        }
      }
    } catch (err) {
      setError("Failed to load courses");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH ALL STUDENTS ================= */
  const fetchAllStudents = async () => {
    try {
      const res = await axiosAuth.get("/users/students");
      setStudents(res.data);
    } catch (err) {
      setError("Failed to load students");
      console.error(err);
    }
  };

  /* ================= FETCH ASSIGNED STUDENTS ================= */
  const fetchAssignedStudents = async (courseId) => {
    try {
      const res = await axiosAuth.get(`/courses/${courseId}`);
      const course = res.data;
      setAssignedStudents(course.students || []);
      
      // Pre-select already assigned students
      const assignedIds = new Set(course.students?.map(s => s._id || s) || []);
      setSelectedStudents(assignedIds);
    } catch (err) {
      console.error("Failed to fetch assigned students");
    }
  };

  /* ================= COURSE SELECT ================= */
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedStudents(new Set());
    fetchAllStudents();
    fetchAssignedStudents(course._id);
    setSuccess("");
    setError("");
  };

  /* ================= STUDENT SELECTION ================= */
  const handleStudentSelect = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      const allIds = new Set(filteredStudents.map(s => s._id));
      setSelectedStudents(allIds);
    }
  };

  /* ================= ASSIGN STUDENTS ================= */
  const handleAssignStudents = async () => {
    if (!selectedCourse) {
      setError("Please select a course first");
      return;
    }

    if (selectedStudents.size === 0) {
      setError("Please select at least one student");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      
      const studentIds = Array.from(selectedStudents);
      
      await axiosAuth.post("/courses/assign", {
        courseId: selectedCourse._id,
        studentIds: studentIds
      });

      setSuccess(`Successfully assigned ${studentIds.length} student(s) to ${selectedCourse.title}`);
      
      // Refresh assigned students list
      await fetchAssignedStudents(selectedCourse._id);
      
      // Refresh courses to update student counts
      await fetchMentorCourses();
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign students");
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  /* ================= FILTER STUDENTS ================= */
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate assigned and unassigned students
  const assignedStudentsList = filteredStudents.filter(student => 
    assignedStudents.some(assigned => 
      assigned._id === student._id || assigned === student._id
    )
  );
  
  const unassignedStudentsList = filteredStudents.filter(student => 
    !assignedStudents.some(assigned => 
      assigned._id === student._id || assigned === student._id
    )
  );

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedStudents(new Set());
    setSuccess("");
    setError("");
  };

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
                  {selectedCourse ? `Assign Students to ${selectedCourse.title}` : "Assign Students"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {selectedCourse 
                    ? `Assign students to this course. Students must be assigned to access course content.`
                    : "Select a course to assign students"}
                </p>
              </div>
              
              {selectedCourse && (
                <button
                  onClick={goBackToCourses}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Courses
                </button>
              )}
            </div>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <button
                onClick={() => navigate('/mentor/dashboard')}
                className="hover:text-primary"
              >
                Dashboard
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-text font-medium">Assign Students</span>
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
          {!selectedCourse ? (
            /* COURSES VIEW - Select a course */
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">{courses.length}</div>
                      <div className="text-sm text-gray-500">Your Courses</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">
                        {courses.reduce((sum, course) => sum + (course.students?.length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-500">Total Students Assigned</div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">
                        {students.length}
                      </div>
                      <div className="text-sm text-gray-500">Available Students</div>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Courses Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-text">Your Courses</h2>
                      <p className="text-gray-600 text-sm">Select a course to assign students</p>
                    </div>
                    <button
                      onClick={fetchMentorCourses}
                      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-text hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {courses.length === 0 ? (
                  <div className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No courses found</h3>
                    <p className="text-gray-500 mb-6">
                      You haven't created any courses yet
                    </p>
                    <button
                      onClick={() => navigate('/mentor/create-course')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      Create Your First Course
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => handleCourseSelect(course)}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {course.students?.length || 0} students assigned
                                </span>
                                <span className="flex items-center gap-1">
                                  <List className="w-4 h-4" />
                                  Click to manage assignments
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Duration</div>
                              <div className="font-medium">{course.duration} hours</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STUDENT ASSIGNMENT VIEW - When course is selected */
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
                          <Users className="w-4 h-4" />
                          {assignedStudents.length} students currently assigned
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          Students need assignment to access course
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/mentor/course/${selectedCourse._id}/progress`)}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Progress
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students List */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            {selectedStudents.size} selected
                          </div>
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                      {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center">
                          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">No students found</h3>
                          <p className="text-gray-500">
                            {searchTerm ? "Try adjusting your search" : "No students available"}
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {/* Already Assigned Students */}
                          {assignedStudentsList.length > 0 && (
                            <div className="p-4 bg-green-50">
                              <div className="flex items-center gap-2 mb-2">
                                <UserCheck className="w-4 h-4 text-success" />
                                <span className="font-medium text-success">Already Assigned ({assignedStudentsList.length})</span>
                              </div>
                              {assignedStudentsList.map((student) => (
                                <div key={student._id} className="p-3 hover:bg-green-100 rounded-lg transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-success" />
                                      </div>
                                      <div>
                                        <div className="font-medium text-text">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleStudentSelect(student._id)}
                                      className={`w-5 h-5 border rounded flex items-center justify-center ${
                                        selectedStudents.has(student._id)
                                          ? 'bg-primary border-primary text-white'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {selectedStudents.has(student._id) && <Check className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Unassigned Students */}
                          {unassignedStudentsList.length > 0 && (
                            <div className="p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <UserPlus className="w-4 h-4 text-primary" />
                                <span className="font-medium">Available to Assign ({unassignedStudentsList.length})</span>
                              </div>
                              {unassignedStudentsList.map((student) => (
                                <div key={student._id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-medium text-gray-600">
                                          {student.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                      </div>
                                      <div>
                                        <div className="font-medium text-text">{student.name}</div>
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleStudentSelect(student._id)}
                                      className={`w-5 h-5 border rounded flex items-center justify-center ${
                                        selectedStudents.has(student._id)
                                          ? 'bg-primary border-primary text-white'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {selectedStudents.has(student._id) && <Check className="w-3 h-3" />}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assignment Panel */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text">Assignment Summary</h3>
                        <p className="text-gray-600 text-sm">Assign selected students to course</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Course</span>
                          <span className="font-medium text-primary">{selectedCourse.title}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Currently assigned</span>
                          <span className="font-medium">{assignedStudents.length} students</span>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Selected Students</span>
                          <span className="text-xl font-bold text-primary">{selectedStudents.size}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          {selectedStudents.size === 0 
                            ? "No students selected" 
                            : "Selected students will be assigned/unassigned"}
                        </div>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={handleAssignStudents}
                          disabled={assigning || selectedStudents.size === 0}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {assigning ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-5 h-5" />
                              Assign Selected Students
                            </>
                          )}
                        </button>

                        <button
                          onClick={goBackToCourses}
                          className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Select Different Course
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                    <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/mentor/course/${selectedCourse._id}/add-chapter`)}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-text">Add Chapters</div>
                        <div className="text-sm text-gray-500">Add learning content</div>
                      </button>
                      <button
                        onClick={() => navigate('/mentor/progress')}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-text">View Progress</div>
                        <div className="text-sm text-gray-500">Check student progress</div>
                      </button>
                      <button
                        onClick={() => navigate('/mentor/dashboard')}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="font-medium text-text">Back to Dashboard</div>
                        <div className="text-sm text-gray-500">Return to main dashboard</div>
                      </button>
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

export default AssignStudent;