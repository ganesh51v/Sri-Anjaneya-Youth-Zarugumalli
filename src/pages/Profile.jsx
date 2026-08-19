import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService, authService } from '../firebase/config';
import { Phone, MapPin, Mail, ShieldAlert, Check, Edit, LogOut, Loader2, AlertCircle, Lock, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { fadeUp, rotateFadeIn } from '../utils/animate';

const Profile = () => {
  const { user, loginUser, signOut } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [village, setVillage] = useState(user?.village || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [photoFile, setPhotoFile] = useState(null);  // holds the File object for Cloudinary upload
  const [photoPreview, setPhotoPreview] = useState(user?.photoUrl || ''); // local preview only
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Animation refs
  const cardRef = useRef(null);
  const avatarRef = useRef(null);
  useEffect(() => {
    if (cardRef.current) fadeUp(cardRef.current, { delay: 50, distance: 30 });
    if (avatarRef.current) rotateFadeIn(avatarRef.current, { delay: 200 });
  }, []);

  // Sync state with user when it changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setVillage(user.village || '');
      setPhotoUrl(user.photoUrl || '');
      setPhotoPreview(user.photoUrl || '');
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError('');
    setPhotoFile(file);
    // Show a local preview immediately while we wait for the upload
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Upload photo to Cloudinary via the /api/upload serverless function
  const uploadPhotoToCloudinary = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: reader.result }) // send base64 to server
          });
          const data = await res.json();
          if (!res.ok || !data.secure_url) {
            reject(new Error(data.error || 'Image upload failed.'));
          } else {
            resolve(data.secure_url);
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
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

  const userId = user?.uid || user?.id;

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
      let finalPhotoUrl = photoUrl;

      // If the user selected a new photo, upload it to Cloudinary first
      if (photoFile) {
        try {
          finalPhotoUrl = await uploadPhotoToCloudinary(photoFile);
          setPhotoUrl(finalPhotoUrl);
          setPhotoFile(null);
        } catch (uploadErr) {
          // Upload failed — keep the existing photoUrl rather than crashing
          console.warn('[Profile] Cloudinary upload notice:', uploadErr.message);
          setError('Photo upload failed — profile saved without new photo. Please try again.');
          finalPhotoUrl = user?.photoUrl || '';
        }
      }

      await dbService.users.updateDetails(userId, { name, phone, village, photoUrl: finalPhotoUrl });
      const sessionUser = { ...user, name, phone, village, photoUrl: finalPhotoUrl };
      localStorage.setItem('sa_current_user', JSON.stringify(sessionUser));
      loginUser(sessionUser);

      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCommittee = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      await dbService.users.updateCommitteeStatus(userId, 'pending');
      const updatedUser = { ...user, committeeStatus: 'pending' };
      localStorage.setItem('sa_current_user', JSON.stringify(updatedUser));
      loginUser(updatedUser);
      setSuccess(true);
    } catch (_err) {
      setError(language === 'en' ? 'Failed to request committee membership.' : 'కమిటీ సభ్యత్వం అభ్యర్థించడంలో విఫలమైంది.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-lg mx-auto px-4 py-10 w-full text-[var(--text-primary)]">
      <SEO title="My Profile" description="Manage your Sri Anjaneya Youth Zarugumalli member profile — update your information, view your membership details and activity history." path="/profile" />
      
      <div ref={cardRef} style={{ opacity: 0 }} className="bg-[var(--bg-card)] rounded-[28px] border-2 border-gold-500/30 shadow-2xl overflow-hidden relative transition-colors duration-300">
        
        {/* Header Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-saffron-500 via-gold-400 to-devored-600 w-full" />

        {/* Profile Card Header */}
        <div className="p-8 text-center border-b border-[var(--border)] bg-gradient-to-b from-saffron-500/10 via-[var(--bg-muted)]/50 to-transparent relative">
          <div ref={avatarRef} style={{ opacity: 0 }} className="w-24 h-24 rounded-full bg-gradient-to-tr from-saffron-500/20 to-gold-500/20 border-4 border-gold-400 shadow-xl mx-auto flex items-center justify-center text-saffron-600 dark:text-saffron-400 text-3xl font-black overflow-hidden relative group">
            {(isEditing ? photoPreview : photoUrl) ? (
              <img src={isEditing ? photoPreview : photoUrl} alt={name || 'User'} className="w-full h-full object-cover" />
            ) : (
              name ? name[0].toUpperCase() : 'U'
            )}
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <h2 className="text-xl font-black text-[var(--text-primary)] mt-4 tracking-tight">{user?.name || user?.email}</h2>
          
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400 bg-gold-500/10 border border-gold-500/30 mt-2 shadow-sm">
            <Sparkles className="w-3 h-3 text-gold-500" />
            <span>{user?.role || 'Member'} {t('memberRole')}</span>
          </div>
        </div>

        {/* Details and Edit form */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="bg-devored-500/10 border border-devored-500/30 text-devored-600 dark:text-devored-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-semibold animate-fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{t('detailsUpdated')}</span>
            </div>
          )}

          {passwordError && (
            <div className="bg-devored-500/10 border border-devored-500/30 text-devored-600 dark:text-devored-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 font-semibold animate-fade-in">
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{t('passwordUpdated')}</span>
            </div>
          )}

          {isChangingPassword ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('newPassword')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  placeholder={t('enterNewPassword')}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('confirmNewPassword')}</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-field"
                  placeholder={t('confirmPasswordPlaceholder')}
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordError('');
                  }}
                  className="w-1/2 btn btn-ghost py-2.5 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-1/2 btn btn-primary py-2.5 font-black cursor-pointer"
                >
                  {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('updatePassword')}
                </button>
              </div>
            </form>
          ) : isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('memberPhoto')}</label>
                <div className="flex items-center gap-4 bg-[var(--bg-muted)] border border-[var(--border)] rounded-2xl p-3.5">
                  <div className="w-12 h-12 rounded-full bg-saffron-500/10 border border-gold-500/40 flex items-center justify-center text-saffron-600 font-bold overflow-hidden shrink-0">
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
                      className="inline-block px-4 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text-primary)] hover:border-saffron-500 cursor-pointer transition-colors"
                    >
                      {t('chooseImage')}
                    </label>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">PNG or JPG, maximum 800KB</p>
                  </div>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-xs font-bold text-devored-500 hover:text-devored-600 px-2 py-1 cursor-pointer"
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('fullName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('phoneNumber')}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 pl-1">{t('villageArea')}</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-1/2 btn btn-ghost py-2.5 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 btn btn-primary py-2.5 font-black cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('saveDetails')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Display Attributes */}
              <div className="grid grid-cols-1 gap-3 text-xs">
                
                {/* Email Item */}
                <div className="flex items-center gap-3.5 bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-2xl shadow-sm transition-all hover:border-gold-500/40">
                  <div className="w-9 h-9 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-saffron-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{t('emailAddress')}</span>
                    <span className="font-extrabold text-sm text-[var(--text-primary)] truncate block">{user?.email}</span>
                  </div>
                </div>

                {/* Contact Number Item */}
                <div className="flex items-center gap-3.5 bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-2xl shadow-sm transition-all hover:border-gold-500/40">
                  <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-gold-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{t('contactNumber')}</span>
                    <span className="font-extrabold text-sm text-[var(--text-primary)] block">{user?.phone || t('notAdded')}</span>
                  </div>
                </div>

                {/* Address Item */}
                <div className="flex items-center gap-3.5 bg-[var(--bg-muted)] border border-[var(--border)] p-4 rounded-2xl shadow-sm transition-all hover:border-gold-500/40">
                  <div className="w-9 h-9 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-saffron-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{t('address')}</span>
                    <span className="font-extrabold text-sm text-[var(--text-primary)] block">{user?.village || 'Zarugumalli'}</span>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="flex items-center gap-3.5 bg-gold-500/10 border border-gold-500/30 p-4 rounded-2xl">
                    <ShieldAlert className="w-5 h-5 text-gold-500 shrink-0" />
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-gold-600 dark:text-gold-400">{t('adminAccess')}</span>
                      <span className="font-bold text-xs text-[var(--text-primary)]">{t('adminAccessDesc')}</span>
                    </div>
                  </div>
                )}

                {/* Committee Membership Status block */}
                <div className="flex flex-col gap-2.5 border border-[var(--border)] p-4 rounded-2xl bg-[var(--bg-muted)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] mb-0.5">{t('committeeMembership')}</span>
                      <span className="text-xs font-black text-[var(--text-primary)]">
                        {user?.committeeStatus === 'approved' && (
                          <span className="text-emerald-500 font-black flex items-center gap-1 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                            {t('committeeApprovedStatus')}
                          </span>
                        )}
                        {user?.committeeStatus === 'pending' && (
                          <span className="text-saffron-500 font-black flex items-center gap-1.5 mt-0.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-saffron-500"></span>
                            {t('committeePendingStatus')}
                          </span>
                        )}
                        {(!user?.committeeStatus || user?.committeeStatus === 'none') && (
                          <span className="text-[var(--text-secondary)] font-bold mt-0.5 block">{t('notACommitteeMember')}</span>
                        )}
                      </span>
                    </div>
                    
                    {(!user?.committeeStatus || user?.committeeStatus === 'none') && (
                      <button
                        type="button"
                        onClick={handleRequestCommittee}
                        disabled={loading}
                        className="btn btn-primary py-2 px-3 text-xs font-extrabold cursor-pointer shrink-0 shadow-md"
                      >
                        {t('requestCommitteeBtn')}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-ghost py-3 font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:border-saffron-500"
                  >
                    <Edit className="w-4 h-4 text-saffron-500" />
                    {t('editProfile')}
                  </button>
                  
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="btn btn-ghost py-3 font-extrabold flex items-center justify-center gap-2 cursor-pointer hover:border-gold-500"
                  >
                    <Lock className="w-4 h-4 text-gold-500" />
                    {t('password')}
                  </button>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full btn btn-ghost py-3 text-xs font-extrabold border-devored-500/30 text-devored-600 dark:text-devored-400 hover:bg-devored-500/10 hover:border-devored-500 flex items-center justify-center gap-2 cursor-pointer transition-all"
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
