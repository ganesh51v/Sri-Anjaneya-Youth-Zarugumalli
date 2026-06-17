import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, X, Loader2, AlertCircle, Bell, Trash2 } from 'lucide-react';

const Announcements = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === 'admin';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.announcements.getAll();
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to fetch announcements.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const openAddModal = () => {
    setTitle('');
    setMessage('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await dbService.announcements.delete(id);
        setAnnouncements(prev => prev.filter(ann => ann.id !== id));
      } catch (err) {
        alert("Failed to delete announcement.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !message) {
      setError('Please enter a title and message.');
      return;
    }

    try {
      const added = await dbService.announcements.add({ title, message });
      setAnnouncements(prev => [added, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save announcement.');
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('announcements')}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('importantUpdates')}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('newAnnouncement')}
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Announcements Timeline List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs text-slate-400">{t('loadingAnnouncements')}</p>
        </div>
      ) : announcements.length > 0 ? (
        <div className="relative border-l border-cream-300 pl-6 space-y-8 ml-2">
          {announcements.map((ann, index) => (
            <div key={ann.id} className="relative group">
              {/* Timeline dot */}
              <div className="absolute -left-[31px] top-1 bg-saffron-500 text-white rounded-full p-1.5 border-4 border-white shadow-sm ring-1 ring-cream-300 group-hover:bg-devored-600 transition-colors">
                <Bell className="w-3.5 h-3.5" />
              </div>
              
              <div className="bg-white border border-cream-200 rounded-2xl p-5 hover:border-saffron-300 hover:shadow-sm transition-all relative">
                {/* Delete button for Admin */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(ann.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-devored-600 p-1.5 rounded-lg hover:bg-devored-50 transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2 pr-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    {ann.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {new Date(ann.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {ann.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cream-100/50 rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-cream-200 flex flex-col items-center gap-2">
          <Bell className="w-8 h-8 text-slate-300" />
          <span>{t('noNotifications')}</span>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">{t('publishAnnouncement')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-saffron-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('title')} *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cleanliness Seva on Sunday"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('messageContent')}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type the message body, details, links or coordinator contact information..."
                  rows="5"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 hover:bg-cream-50 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 saffron-gradient-btn rounded-xl font-bold cursor-pointer"
                >
                  {t('publishNow')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
