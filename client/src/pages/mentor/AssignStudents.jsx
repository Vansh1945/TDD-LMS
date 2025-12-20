import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';

const AssignStudent = () => {
  const { courseId } = useParams();
  const { token, API } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailableStudents();
  }, [courseId]);

  const fetchAvailableStudents = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/available-students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (err) {
      setError('Failed to load available students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudents.length === 0) {
      setError('Please select at least one student.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API}/courses/${courseId}/assign-students`, {
        studentIds: selectedStudents,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedStudents([]);
      fetchAvailableStudents();
    } catch (err) {
      setError('Failed to assign students');
    } finally {
      setSubmitting(false);
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

  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Assign Students</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Students</label>
            {students.length === 0 ? (
              <p className="text-gray-600">No available students to assign.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {students.map((student) => (
                  <label key={student._id} className="flex items-center p-3 border rounded">
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={() => handleStudentChange(student._id)}
                      className="mr-3"
                      disabled={submitting}
                    />
                    <div>
                      <span className="font-medium">{student.name}</span>
                      <span className="text-gray-500 ml-2">({student.email})</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {students.length > 0 && (
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting || selectedStudents.length === 0}
            >
              {submitting ? 'Assigning...' : 'Assign Students'}
            </button>
          )}
        </form>
      </div>
    </MentorLayout>
  );
};

export default AssignStudent;
