
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../../components/ProgressBar';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import { ChevronLeft, ChevronRight, Lock, Play, CheckCircle, AlertCircle } from 'lucide-react';

const CourseViewer = () => {
  const { courseId } = useParams();
  const { user, API } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);



  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const [courseResponse, chaptersResponse, progressResponse] = await Promise.all([
          axios.get(`${API}/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/chapters/get-chapters?courseId=${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API}/progress/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setCourse(courseResponse.data);
        setChapters(courseResponse.data.chapters || chaptersResponse.data);
        setProgress(progressResponse.data.progress || []);

        // Set current chapter to the first unlocked chapter
        const progressData = progressResponse.data.progress || [];
        let firstUnlockedIndex = 0;
        for (let i = 0; i < chaptersResponse.data.length; i++) {
          const chapterProgress = progressData.find(p => p.chapterId._id === chaptersResponse.data[i]._id);
          if (!chapterProgress || !chapterProgress.completed) {
            firstUnlockedIndex = i;
            break;
          }
        }
        setCurrentChapterIndex(firstUnlockedIndex);
      } catch (err) {
        console.error('Course fetch error:', err);
        if (err.response && err.response.status === 403) {
          setError('Access Denied: You are not enrolled in this course or do not have permission to view it.');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch course data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourseData();
    }
  }, [courseId, user, API]);

  const handleMarkComplete = async () => {
    if (markingComplete) return;
    setMarkingComplete(true);
    try {
      const token = localStorage.getItem('token');
      const currentChapter = chapters[currentChapterIndex];
      await axios.post(`${API}/progress/mark-completed`, {
        chapterId: currentChapter._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh progress
      const progressResponse = await axios.get(`${API}/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(progressResponse.data.progress || []);

      // Move to next chapter if available
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
      }
    } catch (err) {
      console.error('Mark complete error:', err);
      setError(err.response?.data?.message || 'Failed to mark chapter as completed');
    } finally {
      setMarkingComplete(false);
    }
  };

  const isChapterUnlocked = (index) => {
    if (index === 0) return true; // First chapter always unlocked
    const prevChapter = chapters[index - 1];
    const prevProgress = progress.find(p => p.chapterId._id === prevChapter._id);
    return prevProgress && prevProgress.completed;
  };

  const isChapterCompleted = (index) => {
    const chapter = chapters[index];
    const chapterProgress = progress.find(p => p.chapterId._id === chapter._id);
    return chapterProgress && chapterProgress.completed;
  };

  const goToChapter = (index) => {
    if (isChapterUnlocked(index)) {
      setCurrentChapterIndex(index);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center text-red-500">Error: {error}</div>;
  }

  if (!course) {
    return <div className="min-h-screen bg-gray-100 p-8 flex justify-center items-center">Course not found.</div>;
  }

  const totalChapters = chapters.length;
  const completedCount = progress.filter(p => p.completed).length;
  const progressPercentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  const currentChapter = chapters[currentChapterIndex];
  const isCurrentCompleted = isChapterCompleted(currentChapterIndex);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                <p className="text-gray-600">
                  Chapter {currentChapterIndex + 1} of {totalChapters} • {completedCount} completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{progressPercentage}%</div>
                <div className="text-sm text-gray-500">Course Progress</div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar progress={progressPercentage} />
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Course Chapters</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToChapter(currentChapterIndex - 1)}
                  disabled={currentChapterIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() => goToChapter(currentChapterIndex + 1)}
                  disabled={currentChapterIndex === chapters.length - 1 || !isCurrentCompleted}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chapter Progress Indicators */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {chapters.map((chapter, index) => {
                const isCompleted = isChapterCompleted(index);
                const isUnlocked = isChapterUnlocked(index);
                const isCurrent = index === currentChapterIndex;

                return (
                  <button
                    key={chapter._id}
                    onClick={() => goToChapter(index)}
                    disabled={!isUnlocked}
                    className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : isUnlocked
                        ? 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : isUnlocked ? (
                      index + 1
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Chapter Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentChapter.title}</h3>
                {currentChapter.image && (
                  <div className="mb-6">
                    <img
                      src={currentChapter.image}
                      alt={currentChapter.title}
                      className="w-full max-w-2xl mx-auto rounded-xl shadow-sm"
                    />
                  </div>
                )}
                {currentChapter.videoLink && (
                  <div className="mb-6">
                    <div className="aspect-video max-w-4xl mx-auto">
                      <iframe
                        src={currentChapter.videoLink}
                        title={currentChapter.title}
                        className="w-full h-full rounded-xl"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mark as Complete Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleMarkComplete}
                  disabled={isCurrentCompleted || markingComplete}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
                    isCurrentCompleted
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {markingComplete ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Marking Complete...
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

          {/* Certificate Section */}
          {progressPercentage === 100 && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 p-8">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations! 🎉</h3>
                <p className="text-gray-600 mb-6">
                  You've completed the entire course. Download your certificate to showcase your achievement.
                </p>
                <Link
                  to={`/student/certificate/${courseId}`}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default CourseViewer;
