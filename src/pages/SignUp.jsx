import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../firebase/config';
import { User, Mail, Phone, MapPin, Lock, UserPlus, AlertCircle, Globe } from 'lucide-react';

const SignUp = () => {
  const { user, loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!name || !email || !phone || !village || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    // Basic phone validation (+91/0 followed by 10 digits or just 10 digits)
    if (!/^[0-9+() -]{10,15}$/.test(phone)) {
      setError('Please enter a valid phone number.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newUser = await authService.signUp(name, email, phone, village, password);
      loginUser(newUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to register. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const loggedUser = await authService.signInWithGoogle();
      loginUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cream-100/30 relative">
      {/* Floating Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-cream-200 text-slate-700 hover:text-saffron-600 shadow-sm transition-all font-extrabold text-[11px] cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-saffron-500" />
          <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>
      </div>

      {/* Decorative accent top */}
      <div className="h-1.5 bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 w-full" />
      
      <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-cream-200 overflow-hidden relative glass-panel">
          {/* Header */}
          <div className="bg-gradient-to-br from-saffron-500 via-saffron-600 to-devored-700 text-white px-6 py-6 text-center relative overflow-hidden">
            {/* Background Halo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse-slow" />
            <h2 className="text-xl font-extrabold tracking-tight relative z-10">
              {t('joinWebsiteName')}
            </h2>
            <p className="text-xs text-gold-300 uppercase tracking-widest font-bold mt-1 relative z-10">
              {t('associationSubtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('fullNameLabel')}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('emailAddressLabel')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailAddressPlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('phoneNumberLabel')}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('phoneNumberPlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Village/Area */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('villageAreaLabel')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={t('villageAreaPlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      {t('signUpBtn')}
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-cream-200"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-widest font-semibold">{t('or')}</span>
              <div className="flex-grow border-t border-cream-200"></div>
            </div>

            {/* Google sign-up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full border border-cream-300 hover:bg-cream-100/30 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {t('signUpWithGoogle')}
            </button>

            {/* Sign In Redirect */}
            <p className="text-center text-xs text-slate-500">
              {t('signInRedirectText')}{' '}
              <Link to="/signin" className="text-saffron-600 font-bold hover:underline">
                {t('signInRedirectLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-500 font-medium">
        {t('developedBy')} <span className="text-saffron-600 font-bold">Ganesh Nalamalapu</span>
      </footer>
    </div>
  );
};

export default SignUp;
