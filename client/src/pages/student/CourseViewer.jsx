import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/ProgressBar';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
  Download,
  Sparkles,
  XCircle,
  Eye
} from 'lucide-react';

const CourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, API, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');

  useEffect(() => {
    if (user && user.role !== 'student') {
      // Redirect non-student users to their dashboard
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/login');
      }
      return; // Stop further execution of the effect
    }

    const fetchCourseData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch course details
        const courseResponse = await axios.get(`${API}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCourse(courseResponse.data);

        // Fetch chapters for the course
        const chaptersResponse = await axios.get(`${API}/chapters/get-chapters`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { courseId }
        });

        const sortedChapters = chaptersResponse.data.sort((a, b) => a.order - b.order);
        setChapters(sortedChapters);

        // Fetch progress for this course
        const progressResponse = await axios.get(`${API}/progress/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProgress(progressResponse.data.progress || []);

        // Find current chapter (first incomplete chapter or last completed)
        const findCurrentChapterIndex = () => {
          if (sortedChapters.length === 0) return 0;

          // Check which chapters are completed
          const completedChapterIds = new Set(
            (progressResponse.data.progress || [])
              .filter(p => p.completed)
              .map(p => p.chapterId._id || p.chapterId)
          );

          // Find first incomplete chapter
          for (let i = 0; i < sortedChapters.length; i++) {
            if (!completedChapterIds.has(sortedChapters[i]._id)) {
              return i;
            }
          }

          // All chapters completed, show last chapter
          return sortedChapters.length - 1;
        };

        setCurrentChapterIndex(findCurrentChapterIndex());

      } catch (err) {
        console.error('Course fetch error:', err);
        if (err.response?.status === 403) {
          setError('Access Denied: You are not enrolled in this course or do not have permission to view it.');
        } else if (err.response?.status === 404) {
          setError('Course not found.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch course data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user && token && courseId) {
      fetchCourseData();
    } else {
      navigate('/login');
    }
  }, [courseId, user, token, API, navigate]);

  const handleMarkComplete = async () => {
    try {
      setMarkingComplete(true);
      setCompletionMessage('');

      const currentChapter = chapters[currentChapterIndex];

      // Mark chapter as completed
      await axios.post(
        `${API}/progress/mark-completed`,
        { chapterId: currentChapter._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh progress
      const progressResponse = await axios.get(`${API}/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(progressResponse.data.progress || []);

      // Show success message
      setCompletionMessage(`Chapter "${currentChapter.title}" marked as completed!`);

      // Auto-advance to next chapter if available
      setTimeout(() => {
        if (currentChapterIndex < chapters.length - 1) {
          setCurrentChapterIndex(currentChapterIndex + 1);
          setCompletionMessage('');
        }
      }, 1500);

    } catch (err) {
      console.error('Mark complete error:', err);
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('must be completed first')) {
        setCompletionMessage(err.response.data.message);
      } else {
        setCompletionMessage(err.response?.data?.message || 'Failed to mark chapter as completed.');
      }
    } finally {
      setMarkingComplete(false);
    }
  };

  const isChapterCompleted = (chapterId) => {
    const chapterProgress = progress.find(p => 
      (p.chapterId._id === chapterId) || (p.chapterId === chapterId)
    );
    return chapterProgress && chapterProgress.completed;
  };

  const isChapterUnlocked = (index) => {
    if (index === 0) return true; // First chapter always unlocked
    
    // Check if all previous chapters are completed
    for (let i = 0; i < index; i++) {
      if (!isChapterCompleted(chapters[i]._id)) {
        return false;
      }
    }
    return true;
  };

  const goToChapter = (index) => {
    if (isChapterUnlocked(index)) {
      setCurrentChapterIndex(index);
      setCompletionMessage('');
    }
  };

  const calculateProgress = () => {
    const totalChapters = chapters.length;
    const completedCount = progress.filter(p => p.completed).length;
    const percentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;
    
    return {
      totalChapters,
      completedCount,
      percentage
    };
  };

  const goToPreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
      setCompletionMessage('');
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      if (isChapterUnlocked(nextIndex)) {
        setCurrentChapterIndex(nextIndex);
        setCompletionMessage('');
      }
    }
  };

  const isCourseCompleted = () => {
    const { completedCount, totalChapters } = calculateProgress();
    return totalChapters > 0 && completedCount === totalChapters;
  };

  // Check certificate eligibility
  const checkCertificateEligibility = async () => {
    try {
      const response = await axios.get(
        `${API}/certificates/eligibility/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.eligible;
    } catch (error) {
      console.error('Certificate eligibility check failed:', error);
      return false;
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
          <p className="mt-6 text-gray-600 text-lg">Loading course content...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Unable to load course</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Link
                  to="/student/dashboard"
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!course) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8 flex justify-center items-center">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access.</p>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    // Regular expression to find the video ID from various YouTube URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
        videoId = match[1];
    }
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const { totalChapters, completedCount, percentage } = calculateProgress();
  const currentChapter = chapters[currentChapterIndex];
  const isCurrentCompleted = isChapterCompleted(currentChapter?._id);
  const isCurrentUnlocked = isChapterUnlocked(currentChapterIndex);
  const videoUrl = getYouTubeEmbedUrl(currentChapter?.videoUrl);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Link 
                  to="/student/dashboard" 
                  className="inline-flex items-center gap-2 text-blue-100 hover:text-white font-medium mb-4 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-blue-100 max-w-3xl">{course.description}</p>
              </div>
              <div className="hidden md:block bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center min-w-[140px]">
                <div className="text-3xl font-bold">{percentage}%</div>
                <div className="text-sm text-blue-200">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">
                  Chapter {currentChapterIndex + 1} of {totalChapters}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{completedCount}/{totalChapters}</span>
                <span className="text-gray-500 ml-1">chapters completed</span>
              </div>
            </div>
            <ProgressBar progress={percentage} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chapter List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Chapters</h2>
                  <span className="text-sm text-gray-500">{totalChapters} total</span>
                </div>

                <div className="space-y-2">
                  {chapters.map((chapter, index) => {
                    const isCompleted = isChapterCompleted(chapter._id);
                    const isUnlocked = isChapterUnlocked(index);
                    const isCurrent = index === currentChapterIndex;

                    return (
                      <button
                        key={chapter._id}
                        onClick={() => goToChapter(index)}
                        disabled={!isUnlocked}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          isCurrent
                            ? 'bg-blue-50 border border-blue-200'
                            : isUnlocked
                            ? 'hover:bg-gray-50'
                            : 'opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCurrent
                              ? 'bg-blue-500 text-white'
                              : isCompleted
                              ? 'bg-green-100 text-green-700'
                              : isUnlocked
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isUnlocked ? (
                              index + 1
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-medium truncate ${
                                isCurrent ? 'text-blue-700' : 'text-gray-700'
                              }`}>
                                {chapter.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Chapter {index + 1}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chapter Content */}
            <div className="lg:col-span-3">
              {!isCurrentUnlocked ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="text-center">
                    <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Chapter Locked 🔒</h3>
                    <p className="text-gray-600 mb-6">
                      Complete the previous chapter to unlock this content.
                    </p>
                    <button
                      onClick={() => goToChapter(currentChapterIndex - 1)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Go to Previous Chapter
                    </button>
                  </div>
                </div>
              ) : currentChapter ? (
                <>
                  {/* Chapter Header */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{currentChapter.title}</h2>
                        <p className="text-gray-600 mt-2">Chapter {currentChapter.order} • {currentChapterIndex + 1} of {totalChapters}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={goToPreviousChapter}
                          disabled={currentChapterIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <button
                          onClick={goToNextChapter}
                          disabled={currentChapterIndex === chapters.length - 1 || !isCurrentCompleted}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Completion Status */}
                    {isCurrentCompleted && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">This chapter has been completed</p>
                            <p className="text-sm text-green-600 mt-1">
                              You can review the content or proceed to the next chapter.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Completion Message */}
                    {completionMessage && (
                      <div className={`mb-6 p-4 rounded-xl ${
                        completionMessage.includes('marked as completed')
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          {completionMessage.includes('marked as completed') ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          )}
                          <p className={completionMessage.includes('marked as completed') ? 'text-green-800' : 'text-yellow-800'}>
                            {completionMessage}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapter Content */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Video Content */}
                    {currentChapter.videoUrl && (
                      <div className="p-6 border-b border-gray-200">
                        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                          <iframe
                            src={videoUrl}
                            title={currentChapter.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}

                    {/* Chapter Description */}
                    <div className="p-8">
                      {currentChapter.imageUrl && (
                        <div className="mb-6">
                          <img
                            src={currentChapter.imageUrl}
                            alt={currentChapter.title}
                            className="w-full max-w-2xl mx-auto rounded-xl shadow-sm"
                          />
                        </div>
                      )}

                      <div className="prose max-w-none">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">About this chapter</h3>
                        <p className="text-gray-700 whitespace-pre-line">{currentChapter.description}</p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            {isCurrentCompleted ? (
                              <div className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Completed ✓</span>
                              </div>
                            ) : (
                              <p className="text-gray-600">Complete this chapter to continue</p>
                            )}
                          </div>
                          
                          <button
                            onClick={handleMarkComplete}
                            disabled={isCurrentCompleted || markingComplete || !isCurrentUnlocked}
                            className={`flex items-center gap-3 px-8 py-3 rounded-xl font-semibold transition-all ${
                              isCurrentCompleted
                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {markingComplete ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </>
                            ) : isCurrentCompleted ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Chapter Completed
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5" />
                                Mark as Completed
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No chapters available</h3>
                    <p className="text-gray-600">This course doesn't have any chapters yet.</p>
                  </div>
                </div>
              )}

              {/* Course Completion Celebration */}
              {isCourseCompleted() && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 p-8">
                  <div className="text-center">
                    <Award className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
                    <p className="text-gray-600 mb-6">
                      You've successfully completed "{course.title}"! You can now download your certificate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to={`/student/certificates`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-600 font-medium rounded-xl hover:bg-green-50 transition-all border border-green-200"
                      >
                        <Eye className="w-5 h-5" />
                        View Certificates
                      </Link>
                      <Link
                        to={`/student/dashboard`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default CourseViewer;