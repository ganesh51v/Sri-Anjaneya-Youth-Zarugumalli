import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Plus, X, Loader2, AlertCircle, Calendar } from 'lucide-react';

const Events = () => {
  const { user } = useAuth();
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

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.events.getAll();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await dbService.events.delete(id);
        setEvents(prev => prev.filter(e => e.id !== id));
      } catch (err) {
        alert("Error deleting event.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !date || !time || !location || !description) {
      setError('Please fill in all details.');
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
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save event.');
    }
  };

  // Filter events based on active tab
  const displayedEvents = events.filter(e => e.status === activeTab)
    .sort((a, b) => {
      // Sort upcoming events chronologically ascending, completed events descending
      return activeTab === 'upcoming' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Events & Meetings</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Browse upcoming meetings, seva programs, and cultural festival celebrations
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-cream-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'upcoming' 
              ? 'border-saffron-500 text-saffron-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-6 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'completed' 
              ? 'border-saffron-500 text-saffron-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Completed Activities
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
          <p className="mt-2 text-xs text-slate-400">Loading events...</p>
        </div>
      ) : displayedEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <span>No {activeTab} events registered in our logs.</span>
        </div>
      )}

      {/* Edit/Add Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                {editingEvent ? 'Edit Event Details' : 'Add New Event'}
              </h2>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Event Title *</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Time *</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Location *</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Description *</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 hover:bg-cream-50 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 saffron-gradient-btn rounded-xl font-bold"
                >
                  Save Event
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
