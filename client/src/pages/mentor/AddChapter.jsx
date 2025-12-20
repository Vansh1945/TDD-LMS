import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MentorLayout from '../../components/MentorLayout';
import { useAuth } from '../../auth/auth';

const AddChapter = () => {
  const { courseId } = useParams();
  const { token, API } = useAuth();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    videoUrl: '',
    sequence: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const fetchChapters = async () => {
    try {
      const response = await axios.get(`${API}/courses/${courseId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(response.data.sort((a, b) => a.sequence - b.sequence));
    } catch (err) {
      setError('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const sequence = parseInt(formData.sequence);
    if (chapters.some(ch => ch.sequence === sequence)) {
      setError('Sequence order must be unique and sequential');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${API}/courses/${courseId}/chapters`, {
        ...formData,
        sequence
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ title: '', description: '', imageUrl: '', videoUrl: '', sequence: '' });
      fetchChapters();
    } catch (err) {
      setError('Failed to add chapter');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add Chapter</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Existing Chapters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Existing Chapters</h2>
          {chapters.length === 0 ? (
            <p className="text-gray-600">No chapters yet.</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <div key={chapter._id} className="border p-4 rounded">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold">{chapter.title}</h3>
                      <p className="text-sm text-gray-600">{chapter.description}</p>
                      <p className="text-xs text-gray-500">Sequence: {chapter.sequence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Chapter Form */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Chapter</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Chapter Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                rows="3"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Video URL</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={submitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sequence Order</label>
              <input
                type="number"
                name="sequence"
                value={formData.sequence}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
                required
                disabled={submitting}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Chapter'}
            </button>
          </form>
        </div>
      </div>
    </MentorLayout>
  );
};

export default AddChapter;
