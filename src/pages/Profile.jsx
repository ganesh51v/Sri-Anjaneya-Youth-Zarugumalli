import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService, authService } from '../firebase/config';
import { User, Phone, MapPin, Mail, ShieldAlert, Check, Edit, LogOut, Loader2, AlertCircle, Lock, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const Profile = () => {
  const { user, loginUser, signOut } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState(user?.village || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Sync state with user when it changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setVillage(user.village || '');
      setPhotoUrl(user.photoUrl || '');
    }
  }, [user]);

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

  const handleCancelEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setVillage(user?.village || '');
    setPhotoUrl(user?.photoUrl || '');
    setError('');
    setIsEditing(false);
  };

  // Password Change State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordSuccess(false);
    setPasswordError('');
    setSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      await authService.changePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmNewPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    if (!name || !phone || !village) {
      setError('Please fill in all details.');
      setLoading(false);
      return;
    }

    try {
      // Find user in database and update
      await dbService.users.updateDetails(user.id, { name, phone, village, photoUrl });
      
      // Update session details
      const sessionUser = { ...user, name, phone, village, photoUrl };
      localStorage.setItem('sa_current_user', JSON.stringify(sessionUser));
      loginUser(sessionUser);

      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCommittee = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await dbService.users.updateCommitteeStatus(user.id, 'pending');
      const updatedUser = { ...user, committeeStatus: 'pending' };
      localStorage.setItem('sa_current_user', JSON.stringify(updatedUser));
      loginUser(updatedUser);
      setSuccess(true);
    } catch (err) {
      setError(language === 'en' ? 'Failed to request committee membership.' : 'కమిటీ సభ్యత్వం అభ్యర్థించడంలో విఫలమైంది.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-xl mx-auto px-4 py-12 animate-fade-in w-full">
      <SEO title="My Profile" description="Manage your Sri Anjaneya Youth Zarugumalli member profile — update your information, view your membership details and activity history." path="/profile" />
      <div className="bg-white rounded-3xl border border-cream-200 shadow-sm overflow-hidden relative glass-panel">
        
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 w-full" />

        {/* Profile Card Header */}
        <div className="p-8 text-center border-b border-cream-100 bg-cream-50/20 relative">
          <div className="w-24 h-24 rounded-full bg-saffron-100 border-4 border-white shadow-md mx-auto flex items-center justify-center text-saffron-600 text-3xl font-black overflow-hidden relative group">
            {photoUrl ? (
              <img src={photoUrl} alt={name || 'User'} className="w-full h-full object-cover" />
            ) : (
              name ? name[0].toUpperCase() : 'U'
            )}
            {isEditing && (
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity animate-fade-in">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-800 mt-4 leading-none">{user?.name}</h2>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-gold-700 bg-gold-50 border border-gold-200/50 mt-2">
            {user?.role} Role
          </span>
        </div>

        {/* Details and Edit form */}
        <div className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Details updated successfully!</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 font-semibold"
                  placeholder={t('enterNewPassword')}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 font-semibold"
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordError('');
                  }}
                  className="w-1/2 py-2 border border-cream-300 rounded-xl font-bold text-slate-700 hover:bg-cream-50 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-1/2 py-2 saffron-gradient-btn rounded-xl flex items-center justify-center cursor-pointer"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('updatePassword')}
                </button>
              </div>
            </form>
          ) : isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('memberPhoto')}</label>
                <div className="flex items-center gap-4 bg-cream-50/50 border border-cream-300 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-full bg-saffron-100 border border-cream-300 flex items-center justify-center text-saffron-600 font-bold overflow-hidden shrink-0">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      name ? name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-photo-input"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-photo-input"
                      className="inline-block px-4 py-2 bg-white border border-cream-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-cream-50 cursor-pointer transition-colors"
                    >
                      {t('chooseImage')}
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1">PNG or JPG, maximum 800KB</p>
                  </div>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs font-bold text-devored-600 hover:text-devored-700 px-2 py-1 cursor-pointer"
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 pl-1">{t('villageArea')}</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 py-2 border border-cream-300 rounded-xl font-bold text-slate-700 hover:bg-cream-50 transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 saffron-gradient-btn rounded-xl flex items-center justify-center cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('saveDetails')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Display Attributes */}
              <div className="grid grid-cols-1 gap-3.5 text-xs">
                <div className="flex items-center gap-3 bg-cream-50/50 border border-cream-200/50 p-3 rounded-2xl">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('emailAddress')}</span>
                    <span className="font-semibold text-slate-800">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-cream-50/50 border border-cream-200/50 p-3 rounded-2xl">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('contactNumber')}</span>
                    <span className="font-semibold text-slate-800">{user?.phone || 'Not added'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-cream-50/50 border border-cream-200/50 p-3 rounded-2xl">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('address')}</span>
                    <span className="font-semibold text-slate-800">{user?.village || 'Zarugumalli'}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-3 bg-gold-50/30 border border-gold-200/40 p-3 rounded-2xl">
                    <ShieldAlert className="w-4 h-4 text-gold-600" />
                    <div>
                      <span className="block text-[9px] text-gold-600 font-bold uppercase tracking-wider">{t('adminAccess')}</span>
                      <span className="font-semibold text-gold-800">{t('adminAccessDesc')}</span>
                    </div>
                  </div>
                )}

                {/* Committee Membership Status block */}
                <div className="flex flex-col gap-2 border border-cream-200/60 p-4 rounded-2xl bg-cream-50/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">{t('committeeMembership')}</span>
                      <span className="text-xs font-semibold text-slate-800">
                        {user?.committeeStatus === 'approved' && (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                            {t('committeeApprovedStatus')}
                          </span>
                        )}
                        {user?.committeeStatus === 'pending' && (
                          <span className="text-amber-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {t('committeePendingStatus')}
                          </span>
                        )}
                        {(!user?.committeeStatus || user?.committeeStatus === 'none') && (
                          <span className="text-slate-500 font-medium mt-0.5 block">Not a Committee Member</span>
                        )}
                      </span>
                    </div>
                    
                    {(!user?.committeeStatus || user?.committeeStatus === 'none') && (
                      <button
                        type="button"
                        onClick={handleRequestCommittee}
                        disabled={loading}
                        className="text-[10px] font-bold text-white bg-saffron-500 hover:bg-saffron-600 px-3 py-1.5 rounded-xl transition-colors shrink-0 shadow-sm cursor-pointer"
                      >
                        {t('requestCommitteeBtn')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-1/2 py-2.5 border border-cream-300 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-cream-50 transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-saffron-500" />
                    {t('editProfile')}
                  </button>
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="w-1/2 py-2.5 border border-cream-300 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-1.5 hover:bg-cream-50 transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-gold-500" />
                    {t('password')}
                  </button>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 border border-devored-200 rounded-xl font-bold text-devored-700 flex items-center justify-center gap-1.5 hover:bg-devored-50 transition-colors text-xs cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;
