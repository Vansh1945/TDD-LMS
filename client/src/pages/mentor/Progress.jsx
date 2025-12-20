import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  UserCheck,
  Percent,
  Target,
  Award,
  AlertCircle,
  MoreVertical,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Progress = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token, API } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalChapters: 0,
    avgCompletion: 0,
    completedStudents: 0
  });
  
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
          fetchProgressData(course._id);
        }
      }
    } catch (err) {
      console.error("Failed to load courses", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PROGRESS DATA ================= */
  const fetchProgressData = async (courseId) => {
    try {
      setLoading(true);
      const res = await axiosAuth.get("/progress/mentor");
      
      // Filter progress for the selected course
      const courseProgress = res.data.filter(item => 
        item.course._id === courseId
      );
      
      // Sort by student name initially
      const sortedData = courseProgress.sort((a, b) => 
        a.student.name.localeCompare(b.student.name)
      );
      
      setProgressData(sortedData);
      calculateStats(sortedData);
      
    } catch (err) {
      console.error("Failed to fetch progress data", err);
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= CALCULATE STATISTICS ================= */
  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({
        totalStudents: 0,
        totalChapters: selectedCourse?.chapters?.length || 0,
        avgCompletion: 0,
        completedStudents: 0
      });
      return;
    }

    const totalStudents = data.length;
    const totalChapters = data[0]?.progress?.totalChapters || 0;
    const avgCompletion = data.reduce((sum, item) => 
      sum + item.progress.completionPercentage, 0
    ) / totalStudents;
    
    const completedStudents = data.filter(item => 
      item.progress.completionPercentage === 100
    ).length;

    setStats({
      totalStudents,
      totalChapters,
      avgCompletion: Math.round(avgCompletion * 100) / 100,
      completedStudents
    });
  };

  /* ================= COURSE SELECT ================= */
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchProgressData(course._id);
    setSearchTerm("");
    setFilterStatus('all');
  };

  const goBackToCourses = () => {
    setSelectedCourse(null);
    setProgressData([]);
    setSearchTerm("");
    setFilterStatus('all');
  };

  /* ================= SORTING ================= */
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedData = [...progressData].sort((a, b) => {
      if (key === 'name') {
        return direction === 'ascending' 
          ? a.student.name.localeCompare(b.student.name)
          : b.student.name.localeCompare(a.student.name);
      } 
      else if (key === 'completed') {
        return direction === 'ascending'
          ? a.progress.completedChapters - b.progress.completedChapters
          : b.progress.completedChapters - a.progress.completedChapters;
      }
      else if (key === 'percentage') {
        return direction === 'ascending'
          ? a.progress.completionPercentage - b.progress.completionPercentage
          : b.progress.completionPercentage - a.progress.completionPercentage;
      }
      return 0;
    });
    
    setProgressData(sortedData);
  };

  /* ================= FILTERING ================= */
  const getFilteredData = () => {
    let filtered = progressData;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        const percentage = item.progress.completionPercentage;
        if (filterStatus === 'completed') return percentage === 100;
        if (filterStatus === 'good') return percentage >= 70 && percentage < 100;
        if (filterStatus === 'average') return percentage >= 40 && percentage < 70;
        if (filterStatus === 'low') return percentage > 0 && percentage < 40;
        if (filterStatus === 'not-started') return percentage === 0;
        return true;
      });
    }
    
    return filtered;
  };

  /* ================= GET STATUS COLOR ================= */
  const getStatusColor = (percentage) => {
    if (percentage === 100) return 'bg-success';
    if (percentage >= 70) return 'bg-green-500';
    if (percentage >= 40) return 'bg-warning';
    if (percentage > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusText = (percentage) => {
    if (percentage === 100) return 'Completed';
    if (percentage >= 70) return 'Good Progress';
    if (percentage >= 40) return 'Average Progress';
    if (percentage > 0) return 'Slow Progress';
    return 'Not Started';
  };

  /* ================= VIEW CHAPTER DETAILS ================= */
  const viewChapterDetails = (studentId, courseId) => {
    navigate(`/mentor/student-progress/${studentId}/${courseId}`);
  };

  /* ================= EXPORT DATA ================= */
  const exportData = () => {
    const exportData = getFilteredData().map(item => ({
      'Student Name': item.student.name,
      'Email': item.student.email,
      'Chapters Completed': item.progress.completedChapters,
      'Total Chapters': item.progress.totalChapters,
      'Completion Percentage': `${item.progress.completionPercentage}%`,
      'Status': getStatusText(item.progress.completionPercentage)
    }));

    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `progress-report-${selectedCourse?.title || 'course'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !selectedCourse) {
    return (
      <MentorLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </MentorLayout>
    );
  }

  const filteredData = getFilteredData();

  return (
    <MentorLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-text">
                  {selectedCourse ? `Progress: ${selectedCourse.title}` : "Student Progress"}
                </h1>
                <p className="text-gray-600 mt-2">
                  {selectedCourse 
                    ? `Track student progress and completion rates`
                    : "Select a course to view student progress"}
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
              <span className="text-text font-medium">Progress Tracking</span>
            </div>
          </div>

          {/* Main Content */}
          {!selectedCourse ? (
            /* COURSES VIEW - Select a course */
            <div className="space-y-6">
              {/* Courses Grid */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-text">Your Courses</h2>
                      <p className="text-gray-600 text-sm">Select a course to view student progress</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        onClick={() => handleCourseSelect(course)}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-text">
                              {course.students?.length || 0}
                            </span>
                            <div className="text-sm text-gray-500">Students</div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-text mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        
                        <div className="space-y-2 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration} hours</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{course.students?.length || 0} enrolled</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.chapters?.length || 0} chapters</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-primary font-medium">View Progress</span>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PROGRESS VIEW - When course is selected */
            <div className="space-y-6">
              {/* Course Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-text">{selectedCourse.title}</h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {stats.totalStudents} students enrolled
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {stats.totalChapters} chapters
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Last updated: {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/mentor/assign-students`)}
                    className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Manage Students
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">{stats.totalStudents}</div>
                      <div className="text-sm text-gray-500">Total Students</div>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">{stats.avgCompletion}%</div>
                      <div className="text-sm text-gray-500">Average Progress</div>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Percent className="w-5 h-5 text-success" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">{stats.completedStudents}</div>
                      <div className="text-sm text-gray-500">Completed Course</div>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-text">{stats.totalChapters}</div>
                      <div className="text-sm text-gray-500">Total Chapters</div>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                  
                  <div className="flex gap-3">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="all">All Students</option>
                      <option value="completed">Completed (100%)</option>
                      <option value="good">Good Progress (70-99%)</option>
                      <option value="average">Average Progress (40-69%)</option>
                      <option value="low">Slow Progress (1-39%)</option>
                      <option value="not-started">Not Started (0%)</option>
                    </select>
                    
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                      disabled={filteredData.length === 0}
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                    
                    <button
                      onClick={() => fetchProgressData(selectedCourse._id)}
                      className="flex items-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            Student
                            {sortConfig.key === 'name' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUp className="w-4 h-4" /> 
                                : <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('completed')}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            Chapters Completed
                            {sortConfig.key === 'completed' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUp className="w-4 h-4" /> 
                                : <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <button
                            onClick={() => handleSort('percentage')}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            Completion %
                            {sortConfig.key === 'percentage' && (
                              sortConfig.direction === 'ascending' 
                                ? <ChevronUp className="w-4 h-4" /> 
                                : <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-gray-100">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                              <h3 className="text-lg font-semibold text-gray-700 mb-2">No students found</h3>
                              <p className="text-gray-500">
                                {searchTerm || filterStatus !== 'all'
                                  ? "Try adjusting your search or filter"
                                  : "No students enrolled in this course yet"}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-gray-600">
                                    {item.student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-text">{item.student.name}</div>
                                  <div className="text-sm text-gray-500">{item.student.email}</div>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <div className="font-medium text-text">
                                  {item.progress.completedChapters} / {item.progress.totalChapters}
                                </div>
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${getStatusColor(item.progress.completionPercentage)}`}
                                    style={{ width: `${(item.progress.completedChapters / item.progress.totalChapters) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-text">
                                  {item.progress.completionPercentage}%
                                </span>
                                <TrendingUp className="w-5 h-5 text-green-500" />
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                item.progress.completionPercentage === 100 
                                  ? 'bg-green-100 text-success'
                                  : item.progress.completionPercentage >= 70
                                  ? 'bg-blue-100 text-primary'
                                  : item.progress.completionPercentage >= 40
                                  ? 'bg-yellow-100 text-warning'
                                  : item.progress.completionPercentage > 0
                                  ? 'bg-orange-100 text-orange-600'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.progress.completionPercentage === 100 && <CheckCircle className="w-3 h-3" />}
                                {getStatusText(item.progress.completionPercentage)}
                              </span>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => viewChapterDetails(item.student._id, item.course._id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-primary rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                >
                                  <Eye className="w-3 h-3" />
                                  Details
                                </button>
                                <button
                                  onClick={() => navigate(`/mentor/assign-students`)}
                                  className="flex items-center gap-1 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {filteredData.length > 0 && (
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Showing {filteredData.length} of {progressData.length} students
                      </div>
                      <div className="flex items-center gap-4">
                        <span>Average Progress: {stats.avgCompletion}%</span>
                        <span>Completion Rate: {Math.round((stats.completedStudents / stats.totalStudents) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-text mb-4">Performance Insights</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Course Completion Rate</span>
                        <span className="font-medium">{Math.round((stats.completedStudents / stats.totalStudents) * 100)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-success"
                          style={{ width: `${(stats.completedStudents / stats.totalStudents) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Average Progress</span>
                        <span className="font-medium">{stats.avgCompletion}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${stats.avgCompletion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate(`/mentor/add-chapter`)}
                      className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-text">Add Chapters</div>
                      <div className="text-sm text-gray-500">Add learning content</div>
                    </button>
                    <button
                      onClick={() => navigate(`/mentor/assign-students`)}
                      className="w-full text-left px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-text">Assign Students</div>
                      <div className="text-sm text-gray-500">Manage student enrollment</div>
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
          )}
        </div>
      </div>
    </MentorLayout>
  );
};

export default Progress;