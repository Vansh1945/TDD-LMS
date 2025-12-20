import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import {
  Award,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  Sparkles,
  Trophy,
  ChevronRight,
  Clock,
  BookOpen,
  Zap,
  ExternalLink,
  Star,
  TrendingUp,
  Shield,
  Globe,
  FileCheck,
  CheckSquare,
  XCircle,
  RefreshCw
} from 'lucide-react';

const Certificates = () => {
  const { user, API, token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalCourses: 0,
    completedCourses: 0,
    averageProgress: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch certificates
        const certificatesResponse = await axios.get(`${API}/certificates`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Certificates data:', certificatesResponse.data);
        setCertificates(certificatesResponse.data || []);

        // Fetch student courses to get progress
        const coursesResponse = await axios.get(`${API}/courses/student-courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const enrolledCourses = coursesResponse.data || [];
        
        // Calculate statistics
        const completedCourses = certificatesResponse.data?.length || 0;
        const totalProgress = enrolledCourses.length > 0 
          ? enrolledCourses.reduce((acc, course) => acc + (course.progress || 0), 0) / enrolledCourses.length
          : 0;

        setStats({
          totalCertificates: certificatesResponse.data?.length || 0,
          totalCourses: enrolledCourses.length,
          completedCourses,
          averageProgress: Math.round(totalProgress)
        });

      } catch (err) {
        console.error('Certificates fetch error:', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch certificates. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && token) {
      fetchData();
    }
  }, [user, token, API]);

  const handleDownload = async (certificate) => {
    if (downloading) return;
    
    setDownloading(certificate._id);
    try {
      // Generate certificate if not already generated
      if (!certificate.certificateUrl) {
        await axios.post(
          `${API}/certificates/generate/${certificate.courseId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Refresh certificates list
        const refreshed = await axios.get(`${API}/certificates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCertificates(refreshed.data || []);
        
        // Find the updated certificate
        const updatedCert = refreshed.data.find(c => c._id === certificate._id);
        certificate = updatedCert || certificate;
      }

      // Download certificate
      const response = await axios.get(
        `${API}/certificates/download/${certificate._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.courseId?.title || certificate._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // Show success toast
      showToast('Certificate downloaded successfully!', 'success');
      
    } catch (err) {
      console.error('Download error:', err);
      let errorMessage = 'Failed to download certificate';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.response?.status === 404) {
        errorMessage = 'Certificate not found';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied';
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleView = (certificateId) => {
    window.open(`${API}/certificates/view/${certificateId}`, '_blank');
  };

  const showToast = (message, type = 'success') => {
    // You can implement a toast notification component here
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg font-medium ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    } animate-slide-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('animate-slide-out');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCertificateStatus = (certificate) => {
    if (certificate.certificateUrl) return 'generated';
    return 'pending';
  };

  const refreshCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(response.data || []);
      showToast('Certificates refreshed!', 'success');
    } catch (err) {
      console.error('Refresh error:', err);
      showToast('Failed to refresh certificates', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-blue-500 animate-pulse" />
          </div>
          <p className="mt-6 text-gray-600 text-lg">Loading your achievements...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Certificates</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={refreshCertificates}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                    <Link
                      to="/student/dashboard"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Your Achievements 🏆</h1>
                    <p className="text-blue-100 mt-2">Certificates earned through hard work and dedication</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <Award className="w-4 h-4" />
                    {stats.totalCertificates} Certificate{stats.totalCertificates !== 1 ? 's' : ''} Earned
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    {stats.completedCourses} Course{stats.completedCourses !== 1 ? 's' : ''} Completed
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    {stats.averageProgress}% Average Progress
                  </span>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 min-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-100">Achievement Summary</h3>
                  <Sparkles className="w-5 h-5 text-blue-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalCertificates}</div>
                    <div className="text-sm text-blue-200">Certificates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalCourses}</div>
                    <div className="text-sm text-blue-200">Enrolled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.completedCourses}</div>
                    <div className="text-sm text-blue-200">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.averageProgress}%</div>
                    <div className="text-sm text-blue-200">Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.totalCertificates}</span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-2">Certificates Earned</h3>
              <p className="text-gray-600 text-sm">Recognized achievements</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.completedCourses}</span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-2">Courses Completed</h3>
              <p className="text-gray-600 text-sm">100% progress achieved</p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</span>
              </div>
              <h3 className="text-gray-800 font-semibold mb-2">Overall Progress</h3>
              <p className="text-gray-600 text-sm">Average across all courses</p>
            </div>
          </div>

          {/* Certificates Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
                <p className="text-gray-600">Download and share your achievements</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={refreshCertificates}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {certificates.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <Award className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-2">No certificates yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Complete your courses to earn certificates and showcase your achievements to the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/student/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5"
                  >
                    <FileText className="w-5 h-5" />
                    Browse Courses
                  </Link>
                  <Link
                    to="/student/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all border border-gray-300"
                  >
                    <ChevronRight className="w-5 h-5" />
                    View Progress
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(certificate => {
                  const status = getCertificateStatus(certificate);
                  const courseTitle = certificate.courseId?.title || 'Course Certificate';
                  
                  return (
                    <div 
                      key={certificate._id} 
                      className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    >
                      {/* Certificate Header */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                            <Award className="w-6 h-6 text-yellow-600" />
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'generated' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {status === 'generated' ? 'Ready' : 'Pending'}
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {courseTitle}
                        </h3>
                        <p className="text-sm text-gray-600">Certificate of Completion</p>
                      </div>

                      {/* Certificate Details */}
                      <div className="p-6">
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">Issued</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {formatDate(certificate.issuedAt)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                              <FileCheck className="w-4 h-4" />
                              <span className="text-sm">Status</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {status === 'generated' ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              )}
                              <span className="font-medium text-gray-900">
                                {status === 'generated' ? 'Generated' : 'Pending Generation'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Shield className="w-4 h-4" />
                              <span className="text-sm">ID</span>
                            </div>
                            <span className="font-mono text-sm text-gray-500 truncate ml-2">
                              {certificate._id.substring(0, 8)}...
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <button
                            onClick={() => handleView(certificate._id)}
                            disabled={status !== 'generated'}
                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                              status === 'generated'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                            Preview Certificate
                          </button>
                          
                          <button
                            onClick={() => handleDownload(certificate)}
                            disabled={downloading === certificate._id || status !== 'generated'}
                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                              status === 'generated'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {downloading === certificate._id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <Download className="w-4 h-4" />
                                Download PDF
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Certificate Footer */}
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-500">Share on LinkedIn</span>
                          </div>
                          <Link
                            to={`/student/course/${certificate.courseId}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                          >
                            View Course
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Share Your Achievement */}
          {certificates.length > 0 && (
            <div className="mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 p-8">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Share Your Achievement</h3>
                        <p className="text-gray-600">Showcase your certificates on social media</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-xl hover:bg-[#006699] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#333] text-white rounded-xl hover:bg-black transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#1da1f2] text-white rounded-xl hover:bg-[#0d95e8] transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                        Twitter
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-2">Show the world what you've achieved!</p>
                    <div className="flex items-center gap-2 justify-end">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-gray-900">Build your professional portfolio</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How to Use Certificates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Maximize Your Certificates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Add to Resume</h4>
                <p className="text-sm text-gray-600">Include certificates in your CV to showcase specific skills</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">LinkedIn Profile</h4>
                <p className="text-sm text-gray-600">Share achievements on LinkedIn to attract opportunities</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Skill Validation</h4>
                <p className="text-sm text-gray-600">Use certificates to validate skills during interviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Container (CSS for animations) */}
        <style>{`
          @keyframes slide-in {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slide-out {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
          .animate-slide-in { animation: slide-in 0.3s ease-out; }
          .animate-slide-out { animation: slide-out 0.3s ease-in forwards; }
        `}</style>
      </div>
    </StudentLayout>
  );
};

export default Certificates;