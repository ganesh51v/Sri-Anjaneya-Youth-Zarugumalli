import React from 'react';
import { Phone, MapPin, Edit, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const AVATAR_GRADIENTS = [
  'from-saffron-400 to-saffron-600',
  'from-gold-400 to-gold-600',
  'from-devored-500 to-devored-700',
  'from-emerald-400 to-emerald-600',
  'from-sky-400 to-sky-600',
  'from-violet-400 to-violet-600',
];

const getGradient = (name) => {
  const idx = (name ? name.charCodeAt(0) : 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
};

const MemberCard = ({ member, onEdit, onDelete }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user && user.role === 'admin';
  const isOfficer = member.role?.toLowerCase().includes('president') || member.role?.toLowerCase().includes('secretary');

  return (
    <div className="card-premium flex flex-col group">
      {/* Gold top stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-saffron-400 via-gold-400 to-saffron-600" />

      <div className="p-5 flex items-start gap-4 flex-1">
        {/* Avatar */}
        <div className="relative shrink-0">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-[var(--border-strong)] group-hover:border-saffron-400 group-hover:scale-105 transition-all duration-300"
            />
          ) : (
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradient(member.name)} flex items-center justify-center text-white font-black text-xl group-hover:scale-105 transition-all duration-300 shadow-md`}>
              {member.name ? member.name[0].toUpperCase() : 'Y'}
            </div>
          )}
          {isOfficer && (
            <div className="absolute -bottom-1.5 -right-1.5 bg-gold-500 text-white p-1 rounded-lg border-2 border-[var(--bg-card)] shadow-sm" title={t('officeBearer')}>
              <Shield className="w-2.5 h-2.5 fill-current" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] truncate group-hover:text-saffron-600 transition-colors">
            {member.name}
          </h3>
          <p className="text-[11px] font-bold text-saffron-600 mb-2.5 uppercase tracking-wide">
            {member.role}
          </p>
          <div className="space-y-1.5">
            <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-saffron-500 transition-colors group/link">
              <Phone className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span>{member.phone}</span>
            </a>
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span className="truncate">{member.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="mt-auto border-t border-[var(--border)] bg-[var(--bg-muted)] px-4 py-2.5 flex justify-end gap-2">
          <button onClick={() => onEdit(member)} className="btn btn-ghost btn-sm cursor-pointer">
            <Edit className="w-3.5 h-3.5" /> {t('edit')}
          </button>
          <button onClick={() => onDelete(member.id)} className="btn btn-danger btn-sm cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
