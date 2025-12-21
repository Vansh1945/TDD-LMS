import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import ProgressBar from '../../components/ProgressBar';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../auth/auth';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Play,
  CheckCircle,
  BookOpen,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';

const CourseViewer = () => {
  const { courseId } = useParams();
  const { user, API, token } = useAuth();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);

        const courseResponse = await axios.get(`${API}/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCourse(courseResponse.data);

        const chaptersResponse = await axios.get(`${API}/chapters/get-chapters`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { courseId }
        });

        const sortedChapters = chaptersResponse.data.sort((a, b) => a.order - b.order);
        setChapters(sortedChapters);

        const progressResponse = await axios.get(`${API}/progress/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProgress(progressResponse.data.progress || []);

        const findCurrentChapterIndex = () => {
          if (sortedChapters.length === 0) return 0;

          const completedChapterIds = new Set(
            (progressResponse.data.progress || [])
              .filter(p => p.completed)
              .map(p => p.chapterId._id || p.chapterId)
          );

          for (let i = 0; i < sortedChapters.length; i++) {
            if (!completedChapterIds.has(sortedChapters[i]._id)) {
              return i;
            }
          }

          return sortedChapters.length - 1;
        };

        setCurrentChapterIndex(findCurrentChapterIndex());

      } catch (err) {
        console.error('Error loading course');
        toast.error('Failed to load course. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && token && courseId) {
      fetchCourseData();
    }
  }, [courseId, user, token, API]);

  const handleMarkComplete = async () => {
    try {
      setMarkingComplete(true);

      const currentChapter = chapters[currentChapterIndex];

      await axios.post(
        `${API}/progress/mark-completed`,
        { chapterId: currentChapter._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const progressResponse = await axios.get(`${API}/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(progressResponse.data.progress || []);
      
      toast.success(`Chapter "${currentChapter.title}" completed!`);

      if (currentChapterIndex < chapters.length - 1) {
        setTimeout(() => {
          setCurrentChapterIndex(currentChapterIndex + 1);
        }, 1000);
      }

    } catch (err) {
      console.error('Error marking complete');
      toast.error('Failed to mark chapter as completed.');
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
    if (index === 0) return true;
    
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
    } else {
      toast.warning('Complete previous chapters first.');
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
    }
  };

  const goToNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      if (isChapterUnlocked(nextIndex)) {
        setCurrentChapterIndex(nextIndex);
      } else {
        toast.warning('Complete this chapter first.');
      }
    }
  };

  const isCourseCompleted = () => {
    const { completedCount, totalChapters } = calculateProgress();
    return totalChapters > 0 && completedCount === totalChapters;
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return '';
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-text/60">Loading course...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!course) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-background flex justify-center items-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto text-text/40 mb-4" />
            <h2 className="text-lg font-medium text-text mb-2">Course not found</h2>
            <p className="text-text/60 mb-6 text-sm">The course doesn't exist or you don't have access.</p>
            <Link
              to="/student/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const { totalChapters, completedCount, percentage } = calculateProgress();
  const currentChapter = chapters[currentChapterIndex];
  const isCurrentCompleted = isChapterCompleted(currentChapter?._id);
  const isCurrentUnlocked = isChapterUnlocked(currentChapterIndex);
  const videoUrl = getYouTubeEmbedUrl(currentChapter?.videoUrl);

  return (
    <StudentLayout>
      <div className="min-h-screen bg-background">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <Link 
                  to="/student/dashboard" 
                  className="inline-flex items-center gap-2 text-text/60 hover:text-primary text-sm mb-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <h1 className="text-xl font-bold text-text mb-2">{course.title}</h1>
                <p className="text-text/60 text-sm">{course.description}</p>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <div className="text-lg font-bold text-text">{percentage}%</div>
                <div className="text-xs text-text/60">Overall Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-text">
                  Chapter {currentChapterIndex + 1} of {totalChapters}
                </span>
              </div>
              <div className="text-sm text-text/60">
                <span className="font-medium text-text">{completedCount}</span>/{totalChapters} completed
              </div>
            </div>
            <ProgressBar progress={percentage} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chapter List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-medium text-text">Course Chapters</h2>
                  <span className="text-sm text-text/60 bg-background px-2 py-1 rounded">
                    {totalChapters}
                  </span>
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
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-primary/10 border border-primary/20'
                            : isUnlocked
                            ? 'hover:bg-background'
                            : 'opacity-50'
                        } ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                            isCurrent
                              ? 'bg-primary text-white'
                              : isCompleted
                              ? 'bg-success/10 text-success'
                              : isUnlocked
                              ? 'bg-background text-text/60'
                              : 'bg-background text-text/40'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : isUnlocked ? (
                              index + 1
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-medium text-sm truncate ${
                              isCurrent ? 'text-primary' : 'text-text'
                            }`}>
                              {chapter.title}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-text/40" />
                              <span className="text-xs text-text/60">Chapter {index + 1}</span>
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
                <div className="bg-white rounded-lg border p-8 text-center">
                  <Lock className="w-12 h-12 mx-auto text-text/40 mb-4" />
                  <h3 className="text-lg font-medium text-text mb-2">Chapter Locked</h3>
                  <p className="text-text/60 text-sm mb-6">
                    Complete the previous chapter to unlock this content.
                  </p>
                  <button
                    onClick={() => goToChapter(currentChapterIndex - 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous Chapter
                  </button>
                </div>
              ) : currentChapter ? (
                <>
                  {/* Chapter Header */}
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-text mb-1">{currentChapter.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-text/60">
                          <span>Chapter {currentChapter.order}</span>
                          <span>•</span>
                          <span>{currentChapterIndex + 1} of {totalChapters}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={goToPreviousChapter}
                          disabled={currentChapterIndex === 0}
                          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-background disabled:opacity-50"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <button
                          onClick={goToNextChapter}
                          disabled={currentChapterIndex === chapters.length - 1 || !isCurrentCompleted}
                          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-background disabled:opacity-50"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Completion Status */}
                    {isCurrentCompleted && (
                      <div className="bg-success/10 border border-success/20 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <div>
                            <p className="font-medium text-success">This chapter is completed</p>
                            <p className="text-sm text-success/80">You can review or proceed to next chapter</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chapter Content */}
                  <div className="bg-white rounded-lg border overflow-hidden">
                    {/* Video Content */}
                    {currentChapter.videoUrl && (
                      <div className="p-4 border-b">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden">
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
                    <div className="p-6">
                      {currentChapter.imageUrl && (
                        <div className="mb-6">
                          <img
                            src={currentChapter.imageUrl}
                            alt={currentChapter.title}
                            className="w-full rounded-lg"
                          />
                        </div>
                      )}

                      <div className="mb-8">
                        <h3 className="font-medium text-text mb-4">Chapter Overview</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-text/80 whitespace-pre-line leading-relaxed">
                            {currentChapter.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 border-t">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div>
                            {isCurrentCompleted ? (
                              <div className="flex items-center gap-2 text-success">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Completed</span>
                              </div>
                            ) : (
                              <p className="text-text/60">Mark this chapter as complete to continue</p>
                            )}
                          </div>
                          
                          <button
                            onClick={handleMarkComplete}
                            disabled={isCurrentCompleted || markingComplete || !isCurrentUnlocked}
                            className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium ${
                              isCurrentCompleted
                                ? 'bg-success/10 text-success'
                                : 'bg-primary text-white hover:bg-primary/90'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {markingComplete ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </>
                            ) : isCurrentCompleted ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                Already Completed
                              </>
                            ) : (
                              <>
                                <Play className="w-5 h-5" />
                                Mark as Complete
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg border p-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto text-text/40 mb-4" />
                  <h3 className="text-lg font-medium text-text mb-2">No chapters available</h3>
                  <p className="text-text/60">This course doesn't have any chapters yet.</p>
                </div>
              )}

              {/* Course Completion Celebration */}
              {isCourseCompleted() && (
                <div className="mt-8 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20 p-8">
                  <div className="text-center">
                    <Award className="w-14 h-14 mx-auto text-success mb-4" />
                    <h3 className="text-2xl font-bold text-text mb-3">Congratulations! 🎉</h3>
                    <p className="text-text/70 mb-6">
                      You've successfully completed "{course.title}"! You can now download your certificate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        to={`/student/certificates`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary font-medium rounded-lg hover:bg-background border border-primary"
                      >
                        View Certificates
                      </Link>
                      <Link
                        to={`/student/dashboard`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90"
                      >
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