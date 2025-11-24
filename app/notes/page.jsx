'use client';

import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, isAuthenticated, removeToken } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      try {
        const data = await getTasks();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
        removeToken();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setMessage('Title and content are required');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      if (editingId) {
        const updatedNote = await updateTask(editingId, formData.title, formData.content);
        setNotes(notes.map(note => 
          note._id === editingId ? updatedNote : note
        ));
        setMessage('Note updated successfully!');
        setEditingId(null);
      } else {
        const newNote = await createTask(formData.title, formData.content);
        setNotes([newNote, ...notes]);
        setMessage('Note created successfully!');
      }

      setFormData({ title: '', content: '' });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, content: note.content });
    setEditingId(note._id);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await deleteTask(id);
      setNotes(notes.filter(note => note._id !== id));
      setMessage('Note deleted successfully!');
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', content: '' });
    setEditingId(null);
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
            </div>
            <a href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create/Edit Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white">
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-3 rounded-xl ${editingId ? 'bg-yellow-100' : 'bg-green-100'}`}>
              <svg className={`w-7 h-7 ${editingId ? 'text-yellow-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingId ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              {editingId ? 'Edit Note' : 'Create New Note'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter a catchy title..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                placeholder="Write your thoughts here..."
                rows="6"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${message.includes('successfully') ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <p className={`text-sm font-semibold ${message.includes('successfully') ? 'text-green-700' : 'text-red-700'}`}>
                  {message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold shadow-xl"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingId ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
                    </svg>
                    {editingId ? 'Update Note' : 'Create Note'}
                  </span>
                )}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Notes List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Your Notes</h2>
            <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold">
              {notes.length} {notes.length === 1 ? 'Note' : 'Notes'}
            </span>
          </div>
          
          {notes.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-16 text-center border border-white">
              <div className="inline-block p-5 bg-gray-100 rounded-2xl mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No notes yet</h3>
              <p className="text-gray-500">Create your first note above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map(note => (
                <div key={note._id} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all border border-white group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition line-clamp-1 flex-1">{note.title}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap ml-2 font-semibold">
                      {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-3">{note.content}</p>
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(note)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2.5 rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all transform hover:scale-105 font-semibold shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
