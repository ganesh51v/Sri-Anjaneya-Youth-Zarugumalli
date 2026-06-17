import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import MemberCard from '../components/MemberCard';
import { Plus, Search, X, Loader2, AlertCircle, Camera } from 'lucide-react';

const Members = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === 'admin';

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // Preset avatar options for convenience
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ];

  const fetchMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.members.getAll();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err) {
      setError('Failed to load members.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Handle live search
  useEffect(() => {
    const results = members.filter(m => 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.area.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(results);
  }, [searchTerm, members]);

  const openAddModal = () => {
    setEditingMember(null);
    setName('');
    setRole('Active Volunteer');
    setPhone('');
    setArea('Zarugumalli');
    setPhotoUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setPhone(member.phone);
    setArea(member.area);
    setPhotoUrl(member.photoUrl || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this member from the database?")) {
      try {
        await dbService.members.delete(id);
        setMembers(prev => prev.filter(m => m.id !== id));
      } catch (err) {
        alert("Error deleting member.");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError('Image file size must be less than 800KB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !role || !phone || !area) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    const memberData = { name, role, phone, area, photoUrl };

    try {
      if (editingMember) {
        // Edit existing
        const updated = await dbService.members.update(editingMember.id, memberData);
        setMembers(prev => prev.map(m => m.id === editingMember.id ? updated : m));
      } else {
        // Add new
        const added = await dbService.members.add(memberData);
        setMembers(prev => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to save member details.');
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('associationMembers')}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('activeYouthDesc')}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('addMemberBtn')}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full bg-white border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-saffron-500"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs text-slate-400">{t('loadingMembers')}</p>
        </div>
      ) : filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <MemberCard 
              key={member.id} 
              member={member} 
              onEdit={openEditModal} 
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-cream-100/50 rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-cream-200">
          {t('noMembersFound')}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                {editingMember ? t('editMemberDetails') : t('addMemberBtn')}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-saffron-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('fullName')} *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('roleDesignation')} *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                >
                  <option value="President / Founder">President / Founder</option>
                  <option value="Vice President">Vice President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Youth Coordinator">Youth Coordinator</option>
                  <option value="Seva Representative">Seva Representative</option>
                  <option value="Active Volunteer">Active Volunteer</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('phoneNumber')} *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('villageArea')} *</label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Bypass Road, Zarugumalli"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('memberPhoto')}</label>
                
                {/* Image Upload Box */}
                <div className="flex items-center gap-4 bg-cream-50 border border-cream-300 rounded-xl p-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-saffron-100 border border-cream-300 flex items-center justify-center text-saffron-600 font-bold overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      name ? name[0].toUpperCase() : 'M'
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="member-photo-input"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="member-photo-input"
                      className="inline-block px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-cream-50 cursor-pointer transition-colors animate-fade-in"
                    >
                      {t('chooseImage')}
                    </label>
                    <p className="text-[9px] text-slate-400 mt-0.5">PNG/JPG, max 800KB</p>
                  </div>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-[10px] font-bold text-devored-600 hover:text-devored-700 px-2 py-1 cursor-pointer"
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-cream-200"></div>
                  <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('orUseUrl')}</span>
                  <div className="flex-grow border-t border-cream-200"></div>
                </div>

                <input
                  type="url"
                  value={photoUrl.startsWith('data:') ? '' : photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or paste image link"
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 mt-1"
                />
                
                {/* Avatar Quick Presets */}
                <div className="mt-2.5">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Quick Avatar Presets:</span>
                  <div className="flex gap-2">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(preset)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 ${photoUrl === preset ? 'border-saffron-500' : 'border-transparent hover:border-cream-300'}`}
                      >
                        <img src={preset} className="w-full h-full object-cover" alt="preset" />
                      </button>
                    ))}
                  </div>
                </div>
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
                  {t('saveMember')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
