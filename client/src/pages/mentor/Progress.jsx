import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';

const Progress = () => {
  const { courseId } = useParams();
  const { token, API } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgress();
  }, [courseId]);

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgressData(response.data);
    } catch (err) {
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const markChapterCompleted = async (studentId, chapterId) => {
    try {
      await axios.post(`${API}/progress/mark-completed`, {
        studentId,
        chapterId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProgress();
    } catch (err) {
      setError('Failed to mark chapter as completed');
    }
  };

  if (loading) {
    return (
      <MentorLayout>
        <div className="max-w-4xl mx-auto text-center">
          <p>Loading...</p>
        </div>
      </MentorLayout>
    );
  }

  if (error) {
    return (
      <MentorLayout>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </MentorLayout>
    );
  }

  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Student Progress</h1>

        {progressData.length === 0 ? (
          <p className="text-gray-600">No students assigned to this course yet.</p>
        ) : (
          <div className="space-y-6">
            {progressData.map((studentProgress) => (
              <div key={studentProgress.student._id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{studentProgress.student.name}</h2>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Progress</span>
                    <span>{studentProgress.completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${studentProgress.completionPercentage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Chapters</h3>
                  <div className="space-y-2">
                    {studentProgress.chapters.map((chapter) => (
                      <div key={chapter._id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{chapter.title}</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${
                            chapter.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {chapter.completed ? 'Completed' : 'Not Completed'}
                          </span>
                        </div>
                        {!chapter.completed && (
                          <button
                            onClick={() => markChapterCompleted(studentProgress.student._id, chapter._id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
};

export default Progress;
