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
          null,
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
    window.open(`${API}/certificates/view/${certificateId}?token=${token}`, '_blank');
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

                    </div>
                  );
                })}
              </div>
            )}
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