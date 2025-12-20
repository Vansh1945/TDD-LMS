import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import { Award, Download, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const Certificates = () => {
  const { courseId } = useParams();
  const { user, API } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [certificatesResponse, coursesResponse] = await Promise.all([
          axios.get(`${API}/certificates`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/courses/student-courses`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setCertificates(certificatesResponse.data);
        setCourses(coursesResponse.data);
      } catch (err) {
        console.error('Certificates fetch error:', err);
        setError(err.response?.data?.message || 'Failed to fetch certificates');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, API]);

  const handleDownload = async (certificateId) => {
    if (downloading) return;
    setDownloading(certificateId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/certificates/download/${certificateId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download certificate');
    } finally {
      setDownloading(null);
    }
  };

  const getCourseProgress = (courseId) => {
    const course = courses.find(c => c._id === courseId);
    return course?.progress || 0;
  };

  const canDownloadCertificate = (courseId) => {
    return getCourseProgress(courseId) === 100;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your certificates...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error</h3>
                  <p className="text-red-600">{error}</p>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Certificates</h1>
            <p className="text-gray-600">Showcase your learning achievements</p>
          </div>

          {/* Certificates Grid */}
          {certificates.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
              <Award className="w-20 h-20 mx-auto text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No certificates yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Complete your courses to earn certificates and showcase your achievements.
              </p>
              <Link
                to="/student/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                <FileText className="w-5 h-5" />
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(certificate => {
                const course = courses.find(c => c._id === certificate.courseId);
                const progress = getCourseProgress(certificate.courseId);
                const canDownload = canDownloadCertificate(certificate.courseId);

                return (
                  <div key={certificate._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center">
                          <Award className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{course?.title || 'Course'}</h3>
                          <p className="text-sm text-gray-500">Certificate Earned</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className={`font-medium ${progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(certificate.issuedAt).toLocaleDateString()}
                        </div>
                        {certificate.downloadedAt && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Downloaded
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDownload(certificate._id)}
                        disabled={!canDownload || downloading === certificate._id}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                          canDownload
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                      >
                        {downloading === certificate._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            {canDownload ? 'Download Certificate' : 'Complete Course to Download'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Course Progress Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.filter(course => course.progress < 100).map(course => (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <span className="text-sm font-medium text-blue-600">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <Link
                    to={`/student/course/${course._id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Continue Learning →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default Certificates;
