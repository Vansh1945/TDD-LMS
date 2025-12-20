import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { token, API } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/mentor/dashboard');
    } catch (err) {
      setError('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MentorLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Course</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Course Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                rows="4"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </form>
        </div>
      </div>
    </MentorLayout>
  );
};

export default CreateCourse;
