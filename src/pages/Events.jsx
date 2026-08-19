import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EventCard from '../components/EventCard';
import { Plus, X, Loader2, AlertCircle, Calendar } from 'lucide-react';
import SEO from '../components/SEO';
import { staggerFadeUp, fadeUp } from '../utils/animate';
import { emailService } from '../services/emailService';

const Events = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === 'admin';

  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('upcoming');

  const headerRef = useRef(null);
  const eventsGridRef = useRef(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.events.getAll();
      setEvents(data);
    } catch (err) {
      setError(language === 'en' ? 'Failed to load events data.' : 'కార్యక్రమాల డేటా లోడ్ చేయడంలో విఫలమైంది.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (headerRef.current) fadeUp(headerRef.current, { delay: 0 });
  }, []);

  useEffect(() => {
    if (!loading && eventsGridRef.current) {
      staggerFadeUp(eventsGridRef.current.querySelectorAll(':scope > div'), { stagger: 80, startDelay: 100 });
    }
  }, [loading, events]);

  const openAddModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDate('');
    setTime('');
    setLocation('Zarugumalli');
    setDescription('');
    setStatus('upcoming');
    setIsModalOpen(true);
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setTime(evt.time);
    setLocation(evt.location);
    setDescription(evt.description);
    setStatus(evt.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deleteEventConfirm'))) {
      try {
        await dbService.events.delete(id);
        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        alert(language === 'en' ? 'Error deleting event.' : 'కార్యక్రమాన్ని తొలగించడంలో లోపం ఏర్పడింది.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !date || !time || !location || !description) {
      setError(t('fillAllDetails'));
      return;
    }

    const eventData = { title, date, time, location, description, status };

    try {
      if (editingEvent) {
        const updated = await dbService.events.update(editingEvent.id, eventData);
        setEvents(prev => prev.map(e => e.id === editingEvent.id ? updated : e));
      } else {
        const added = await dbService.events.add(eventData);
        setEvents(prev => [...prev, added]);

        // Notify members about new event
        dbService.users.getAll().then(allUsers => {
          const emails = allUsers.map(u => u.email).filter(Boolean);
          if (emails.length > 0) {
            emailService.sendEvent(added, emails).catch(e => console.error('Event email error:', e));
          }
        }).catch(err => console.warn('Could not fetch user emails for event notification:', err));
      }
      setIsModalOpen(false);
    } catch (err) {
      setError(language === 'en' ? 'Failed to save event.' : 'కార్యక్రమాన్ని సేవ్ చేయడంలో విఫలమైంది.');
    }
  };

  // Filter events based on active tab
  const displayedEvents = events.filter(e => e.status === activeTab)
    .sort((a, b) => {
      return activeTab === 'upcoming' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <SEO title={t('events')} description="Upcoming and past events organised by Sri Anjaneya Youth Zarugumalli — temple festivals, cultural programmes, seva activities and community gatherings." path="/events" />
      
      {/* Header Panel */}
      <div ref={headerRef} style={{ opacity: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('eventsMeetings')}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('eventsSubtitle')}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('addEvent')}
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border border-cream-200 dark:border-slate-800/80 mb-5 p-1.5 bg-cream-50/50 dark:bg-slate-950 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'upcoming' 
              ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-500/15' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('upcomingEvents')}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'completed' 
              ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-500/15' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('completedActivities')}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs text-slate-400">{t('loadingEvents')}</p>
        </div>
      ) : displayedEvents.length > 0 ? (
        <div ref={eventsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedEvents.map(event => (
            <div key={event.id} className="h-full">
              <EventCard 
                event={event} 
                onEdit={openEditModal} 
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-cream-100/50 rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-cream-200 flex flex-col items-center gap-2">
          <Calendar className="w-8 h-8 text-slate-300" />
          <span>{activeTab === 'upcoming' ? t('noUpcomingEventsInLogs') : t('noCompletedEventsInLogs')}</span>
        </div>
      )}

      {/* Edit/Add Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                {editingEvent ? t('editEventDetails') : t('addNewEvent')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-saffron-100 cursor-pointer">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('eventTitle')} *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sri Hanuman Jayanthi Celebrations"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('date')} *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('time')} *</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('location')} *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sri Anjaneya Temple, Zarugumalli"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('description')} *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity, schedule or instructions..."
                  rows="3"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('status')} *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 cursor-pointer"
                  required
                >
                  <option value="upcoming">{t('upcoming')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
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
                  {t('saveEvent')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
