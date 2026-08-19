import React from 'react';
import { Calendar, Clock, MapPin, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const EventCard = ({ event, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === 'admin';

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return dateString; }
  };

  const isUpcoming = event.status === 'upcoming';
  const statusLabel = isUpcoming ? t('upcoming') : t('completed');

  return (
    <div className="card-premium flex flex-col h-full group" style={{ '--stat-accent': isUpcoming ? 'var(--saffron)' : '#94a3b8' }}>
      {/* Top accent stripe */}
      <div className={`h-1 w-full ${ isUpcoming ? 'bg-gradient-to-r from-saffron-500 to-gold-500' : 'bg-slate-300 dark:bg-slate-700' }`} />

      <div className="p-5 flex-1 flex flex-col">
        {/* Status + Date row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`badge ${ isUpcoming ? 'badge-saffron pulse-glow-badge' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700' }`}>
            {statusLabel}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--text-muted)]">
            <Calendar className="w-3 h-3 text-gold-500" />
            {formatDate(event.date)}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] group-hover:text-saffron-600 transition-colors mb-3 leading-snug">
          {event.title}
        </h3>

        {/* Meta */}
        <div className="space-y-2 text-xs text-[var(--text-muted)] mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gold-500 shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)] pt-3 mt-auto">
          {event.description}
        </p>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5 flex justify-end gap-2">
          <button
            onClick={() => onEdit(event)}
            className="btn btn-ghost btn-sm cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" /> {t('edit')}
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="btn btn-danger btn-sm cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
