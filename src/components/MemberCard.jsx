import React from 'react';
import { Phone, MapPin, Edit, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const { user } = useAuth();
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden hover:border-saffron-300 hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Decorative colored strip */}
      <div className="h-1.5 bg-gradient-to-r from-saffron-400 to-gold-400 w-full" />
      
      <div className="p-5 flex items-start gap-4">
        {/* Photo Container */}
        <div className="relative shrink-0">
          {member.photoUrl ? (
            <img 
              src={member.photoUrl} 
              alt={member.name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-saffron-100 group-hover:border-saffron-400 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-saffron-100 border-2 border-saffron-200 flex items-center justify-center text-saffron-600 font-extrabold text-xl">
              {member.name ? member.name[0].toUpperCase() : 'Y'}
            </div>
          )}
          
          {/* Admin badge inside photo */}
          {member.role.toLowerCase().includes('president') || member.role.toLowerCase().includes('secretary') ? (
            <div className="absolute -bottom-1 -right-1 bg-gold-500 text-white p-1 rounded-full border border-white" title="Office Bearer">
              <Shield className="w-3 h-3 fill-current" />
            </div>
          ) : null}
        </div>

        {/* Member Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-800 truncate group-hover:text-saffron-600 transition-colors">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-saffron-600 mb-2">
            {member.role}
          </p>

          <div className="space-y-1 text-xs text-slate-500">
            <a href={`tel:${member.phone}`} className="flex items-center gap-1.5 hover:text-saffron-500 transition-colors">
              <Phone className="w-3.5 h-3.5 text-gold-500" />
              <span>{member.phone}</span>
            </a>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-500" />
              <span className="truncate">{member.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Buttons */}
      {isAdmin && (
        <div className="mt-auto border-t border-cream-200 bg-cream-50/50 px-4 py-2.5 flex justify-end gap-2 text-xs">
          <button 
            onClick={() => onEdit(member)}
            className="flex items-center gap-1 text-slate-600 hover:text-saffron-600 px-2 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-cream-200 transition-all font-medium"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
          <button 
            onClick={() => onDelete(member.id)}
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

export default MemberCard;
