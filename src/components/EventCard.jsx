import React from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EventCard = ({ event, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  // Format date nicely
  const formatDate = (dateString) => {
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-IN', options);
    } catch {
      return dateString;
    }
  };

  const isUpcoming = event.status === 'upcoming';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden hover-lift hover-glow-saffron transition-all duration-300 flex flex-col group h-full">
      {/* Decorative top accent */}
      <div className={`h-1.5 ${isUpcoming ? 'bg-gradient-to-r from-saffron-500 to-gold-500' : 'bg-slate-400'} w-full`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Header & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
            isUpcoming 
              ? 'bg-saffron-50 text-saffron-600 border border-saffron-100/50 pulse-glow-badge text-saffron-600' 
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {event.status}
          </span>
          
          <span className="text-xs text-slate-400 font-semibold tracking-wide">
            {formatDate(event.date)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-800 group-hover:text-saffron-600 transition-colors mb-3 leading-snug">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-2 text-xs text-slate-600 mb-4 mt-auto">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gold-500 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed border-t border-cream-200/50 pt-3">
          {event.description}
        </p>
      </div>

      {/* Admin Action Buttons */}
      {isAdmin && (
        <div className="border-t border-cream-200 bg-cream-50/50 px-4 py-2.5 flex justify-end gap-2 text-xs">
          <button 
            onClick={() => onEdit(event)}
            className="flex items-center gap-1 text-slate-600 hover:text-saffron-600 px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-cream-200 transition-all font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="flex items-center gap-1 text-devored-600 hover:text-white px-2 py-1.5 rounded-lg hover:bg-devored-600 transition-all font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
