import { useState, useEffect, useRef } from 'react';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [isSaving, setIsSaving] = useState(false);

  const headerRef = useRef(null);
  const eventsGridRef = useRef(null);

  const fetchEvents = async (isMounted) => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.events.getAll();
      if (isMounted) setEvents(data);
    } catch (err) {
      if (isMounted) setError(language === 'en' ? 'Failed to load events data.' : 'కార్యక్రమాల డేటా లోడ్ చేయడంలో విఫలమైంది.');
      console.error(err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchEvents(isMounted);
    return () => { isMounted = false; };
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
    if (isSaving) return;
    setIsSaving(true);

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
    } finally {
      setIsSaving(false);
    }
  };

  // Filter events based on active tab
  const displayedEvents = events.filter(e => e.status === activeTab)
    .sort((a, b) => {
      return activeTab === 'upcoming' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    });

  const eventsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Sri Anjaneya Youth Zarugumalli Events',
    'description': 'Upcoming and completed devotional and seva events in Zarugumalli village.',
    'itemListElement': displayedEvents.slice(0, 10).map((evt, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'item': {
        '@type': 'Event',
        'name': evt.title,
        'description': evt.description,
        'startDate': evt.date,
        'eventStatus': evt.status === 'upcoming' ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCompleted',
        'location': {
          '@type': 'Place',
          'name': evt.location || 'Sri Anjaneya Swamy Temple, Zarugumalli',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Zarugumalli',
            'addressRegion': 'Andhra Pradesh',
            'addressCountry': 'IN'
          }
        }
      }
    }))
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 xl:space-y-8 w-full">
      <SEO 
        title={t('events')} 
        description="Upcoming and past events organised by Sri Anjaneya Youth Zarugumalli — temple festivals, cultural programmes, seva activities and community gatherings." 
        path="/events"
        schema={eventsSchema}
      />

      {/* Header Panel */}
      <div ref={headerRef} style={{ opacity: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5 xl:pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-slate-800 tracking-tight">{t('eventsMeetings')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('eventsSubtitle')}
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4.5 py-2.5 xl:px-5 xl:py-3 text-xs xl:text-sm flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 xl:w-5 xl:h-5" />
            {t('addEvent')}
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border border-cream-200 dark:border-slate-800/80 mb-5 p-1.5 bg-cream-50/50 dark:bg-slate-950 rounded-2xl w-full max-w-md xl:max-w-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'upcoming' 
              ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white shadow-md shadow-saffron-500/15' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {t('upcomingEvents')}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 xl:py-3 rounded-xl text-xs xl:text-sm font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
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
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs sm:text-sm flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs sm:text-sm text-slate-400">{t('loadingEvents')}</p>
        </div>
      ) : displayedEvents.length > 0 ? (
        <div ref={eventsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8">
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
        <div className="card p-12 xl:p-16 text-center text-slate-400 text-xs sm:text-sm border border-dashed flex flex-col items-center justify-center gap-3">
          <Calendar className="w-10 h-10 text-slate-300" />
          <span>{activeTab === 'upcoming' ? t('noUpcomingEventsInLogs') : t('noCompletedEventsInLogs')}</span>
        </div>
      )}

      {/* Edit/Add Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-cream-200 dark:border-slate-800 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm xl:text-base uppercase tracking-wider">
                {editingEvent ? t('editEventDetails') : t('addNewEvent')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-saffron-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 xl:space-y-5">
              {error && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('eventTitle')} *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sri Hanuman Jayanthi Celebrations"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 xl:gap-4">
                <div>
                  <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('date')} *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('time')} *</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 08:00 AM"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('location')} *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sri Anjaneya Temple, Zarugumalli"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('description')} *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the activity, schedule or instructions..."
                  rows="3"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-input)] rounded-xl py-2.5 px-3 text-xs sm:text-sm text-[var(--text-primary)] focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs xl:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1 pl-1">{t('status')} *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="input-field cursor-pointer"
                  required
                >
                  <option value="upcoming">{t('upcoming')}</option>
                  <option value="completed">{t('completed')}</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('saving') || 'Saving…'}</> : t('saveEvent')}
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