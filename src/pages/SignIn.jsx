import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../firebase/config';
import { Mail, Phone, Lock, LogIn, Download, AlertCircle, Info, Globe, Eye, EyeOff } from 'lucide-react';
import SEO from '../components/SEO';
import { fadeUp, shake } from '../utils/animate';

const SignIn = () => {
  const { user, loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState(''); // email OR phone
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const cardRef = useRef(null);
  const errorRef = useRef(null);

  // Detect whether identifier looks like a phone or email for the icon
  const looksLikePhone = identifier.trim() !== '' && authService._isPhone && authService._isPhone(identifier.trim());

  // Animate card on mount
  useEffect(() => {
    if (cardRef.current) fadeUp(cardRef.current, { delay: 50, distance: 40 });
  }, []);

  // Shake on error
  useEffect(() => {
    if (error && errorRef.current) shake(errorRef.current);
  }, [error]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // PWA install prompt
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const id = identifier.trim();
    if (!id) { setError('Please enter your email or phone number.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    try {
      const loggedUser = await authService.signInWithIdentifier(id, password);
      loginUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(''); setInfo(''); setLoading(true);
    try {
      const loggedUser = await authService.signInWithGoogle();
      loginUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(''); setInfo('');
    const id = identifier.trim();
    if (!id) {
      setError('Please enter your email or phone number first, then click Forgot Password.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPasswordWithIdentifier(id);
      setInfo('Password reset link sent to your registered email address.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      alert("To install, use your browser's 'Add to Home Screen' or 'Install' menu option.");
    }
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'te' : 'en');

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cream-100/30 relative">
      <SEO title="Sign In" description="Sign in to your Sri Anjaneya Youth Zarugumalli member account. Access events, announcements, gallery and community updates." path="/signin" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-cream-200 text-slate-700 hover:text-saffron-600 shadow-sm transition-all font-extrabold text-[11px] cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-saffron-500" />
          <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>
      </div>

      {/* Top accent stripe */}
      <div className="h-1.5 bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 w-full" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div ref={cardRef} style={{ opacity: 0 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-cream-200 overflow-hidden relative glass-panel">

          {/* Header */}
          <div className="bg-gradient-to-br from-saffron-500 via-saffron-600 to-devored-700 text-white px-6 py-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse-slow" />
            <div className="relative z-10 flex justify-center mb-3">
              <img
                src="/icon.png"
                alt="Sri Anjaneya Youth Logo"
                className="w-16 h-16 rounded-full object-cover border-2 border-gold-300 shadow-lg animate-float"
              />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight relative z-10">{t('websiteName')}</h2>
            <p className="text-xs uppercase tracking-widest font-bold text-gold-300 relative z-10 mt-1">{t('zarugumalli')}</p>
            <p className="text-[10px] italic text-saffron-100 relative z-10 mt-2">"{t('unitedQuote')}"</p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">

            {/* Welcome Back label */}
            <h1 className="text-lg font-extrabold text-slate-800 text-center tracking-tight">Welcome Back 🙏</h1>

            {/* Error / Info alerts */}
            {error && (
              <div ref={errorRef} className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="bg-saffron-50 border border-saffron-200 text-saffron-800 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifier: Email or Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  {looksLikePhone
                    ? <Phone className="absolute left-3.5 top-3 w-4 h-4 text-saffron-500" />
                    : <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  }
                  <input
                    id="identifier"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or phone number"
                    className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1">Enter your registered email address or mobile number</p>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5 pl-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t('passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-saffron-600 hover:text-saffron-700 transition-colors cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="signin-btn"
                disabled={loading}
                className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    {t('signInBtn')}
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-cream-200" />
              <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-widest font-semibold">{t('or')}</span>
              <div className="flex-grow border-t border-cream-200" />
            </div>

            {/* Google Sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border border-cream-300 hover:bg-cream-100/30 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {t('continueWithGoogle')}
            </button>

            {/* Sign Up link */}
            <p className="text-center text-xs text-slate-500">
              {t('signUpRedirectText')}{' '}
              <Link to="/signup" className="text-saffron-600 font-bold hover:underline">
                {t('signUpRedirectLink')}
              </Link>
            </p>

            {/* Mock credentials hint */}
            {authService.isMock && (
              <div className="bg-cream-200/40 border border-cream-300 rounded-xl p-3.5 text-[11px] text-slate-500 leading-normal space-y-1">
                <span className="font-bold text-slate-700 block">{t('mockAccountsText')}</span>
                <div>• Admin: <span className="font-bold">admin@srianjaneya.org</span> (pw: <span className="font-bold">admin123</span>)</div>
                <div>• User: <span className="font-bold">member@srianjaneya.org</span> (pw: <span className="font-bold">member123</span>)</div>
              </div>
            )}

            {/* PWA Install */}
            <button
              onClick={handleInstallApp}
              className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-gold-400" />
              {t('installAppBtn')}
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-slate-500 font-medium">
        {t('developedBy')} <span className="text-saffron-600 font-bold">Ganesh Nalamalapu</span>
      </footer>
    </div>
  );
};

export default SignIn;
