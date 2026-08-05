import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../firebase/config';
import { Mail, Phone, Lock, LogIn, Download, AlertCircle, Info, Globe, Eye, EyeOff, Sparkles, Sun, Moon, ArrowRight, Heart, Code2 } from 'lucide-react';
import SEO from '../components/SEO';
import { fadeUp, shake } from '../utils/animate';
import { triggerConfetti } from '../utils/confetti';

const SignIn = () => {
  const { user, loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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

  // Detect whether identifier looks like a phone or email for icon
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
      triggerConfetti();
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
      triggerConfetti();
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
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-page)] text-[var(--text-primary)] relative overflow-hidden transition-colors duration-300">
      <SEO title="Sign In" description="Sign in to your Sri Anjaneya Youth Zarugumalli member account. Access events, announcements, gallery and community updates." path="/signin" />

      {/* Luminous Animated Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[600px] bg-gradient-to-tr from-saffron-500/15 via-gold-500/15 to-transparent rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-saffron-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navigation Bar: Theme & Language */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2.5">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" /> : <Sun className="w-4 h-4 text-gold-400" />}
        </button>

        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] shadow-lg hover:scale-105 transition-all font-black text-xs cursor-pointer"
        >
          <Globe className="w-4 h-4 text-saffron-500" />
          <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
        </button>
      </div>

      {/* Sleek Top Gold Accent Line */}
      <div className="h-1.5 bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 w-full z-10 shadow-md" />

      {/* Main Sanctuary Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-2">
        
        {/* Outer Filigree Glowing Container */}
        <div ref={cardRef} style={{ opacity: 0 }} className="w-full max-w-md relative group">
          
          {/* Luminous Golden Border Glow */}
          <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-r from-saffron-500 via-gold-400 to-saffron-600 opacity-50 blur-lg transition duration-1000 group-hover:opacity-75" />

          {/* Central Glassmorphic Card */}
          <div className="relative bg-[var(--bg-card)] border-2 border-gold-500/50 rounded-[28px] shadow-2xl overflow-hidden p-5 sm:p-7 text-[var(--text-primary)]">
            
            {/* Ornate Filigree Corner Details */}
            <div className="absolute top-2.5 left-3.5 text-gold-500/60 text-[10px] tracking-widest select-none font-serif">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute top-2.5 right-3.5 text-gold-500/60 text-[10px] tracking-widest select-none font-serif">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute bottom-2.5 left-3.5 text-gold-500/60 text-[10px] tracking-widest select-none font-serif">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute bottom-2.5 right-3.5 text-gold-500/60 text-[10px] tracking-widest select-none font-serif">
              ✦ ── ✤ ── ✦
            </div>

            {/* Header Banner */}
            <div className="text-center space-y-2.5 mb-5 pt-1">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full blur opacity-40 animate-pulse" />
                  <img
                    src="/icon.png"
                    alt="Sri Anjaneya Youth Logo"
                    className="relative w-13 h-13 rounded-full object-cover border-2 border-gold-400 shadow-[0_0_18px_rgba(217,119,6,0.45)] animate-float"
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-saffron-600 dark:text-saffron-400 text-[10px] font-black uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3 h-3 text-gold-500" />
                {t('websiteName')} · {t('zarugumalli')}
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight font-serif text-[var(--text-primary)]">
                Divine Portal Login
              </h1>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed max-w-xs mx-auto">
                &ldquo;{t('unitedQuote')}&rdquo;
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div ref={errorRef} className="bg-devored-500/10 border border-devored-500/30 text-devored-600 dark:text-devored-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-4 animate-fade-in font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Info Alert */}
            {info && (
              <div className="bg-saffron-500/10 border border-saffron-500/30 text-saffron-600 dark:text-saffron-400 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-4 animate-fade-in font-semibold">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider pl-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  {looksLikePhone
                    ? <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron-500" />
                    : <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500" />
                  }
                  <input
                    id="identifier"
                    type="text"
                    inputMode="email"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="user@gmail.com or +919876543210"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1">
                  <label className="block text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">
                    {t('passwordLabel')}
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs font-bold text-saffron-600 hover:text-saffron-500 transition-colors cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-500" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('passwordPlaceholder')}
                    className="input-field pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="signin-btn"
                disabled={loading}
                className="w-full btn btn-primary py-3.5 text-sm flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all font-black"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('signInBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Logins Section */}
            <div className="mt-5 pt-4 border-t border-[var(--border)] space-y-3">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-widest text-[var(--text-subtle)] font-extrabold">{t('or')} continue with</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="btn btn-ghost py-2.5 px-3 text-xs flex items-center justify-center gap-2 cursor-pointer font-bold hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="btn btn-ghost py-2.5 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold col-span-1 sm:col-span-2 hover:scale-[1.02]"
                >
                  <Download className="w-3.5 h-3.5 text-gold-500" />
                  {t('installAppBtn')}
                </button>
              </div>
            </div>

            {/* Sign Up Redirect Link */}
            <p className="text-center text-xs text-[var(--text-muted)] mt-5">
              {t('signUpRedirectText')}{' '}
              <Link to="/signup" className="text-saffron-600 font-extrabold hover:underline">
                {t('signUpRedirectLink')}
              </Link>
            </p>

            {/* Mock Credentials Hint */}
            {authService.isMock && (
              <div className="bg-[var(--bg-muted)] border border-[var(--border)] rounded-xl p-3 text-[11px] text-[var(--text-muted)] leading-normal space-y-1 mt-3">
                <span className="font-bold text-[var(--text-primary)] block">{t('mockAccountsText')}</span>
                <div>• Admin: <span className="font-bold text-[var(--text-secondary)]">admin@srianjaneya.org</span> (pw: <span className="font-bold text-[var(--text-secondary)]">admin123</span>)</div>
                <div>• User: <span className="font-bold text-[var(--text-secondary)]">member@srianjaneya.org</span> (pw: <span className="font-bold text-[var(--text-secondary)]">member123</span>)</div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-4 text-xs font-semibold relative z-10 text-[var(--text-secondary)] border-t border-[var(--border)]">
        Developed by <span className="text-saffron-600 dark:text-saffron-400 font-bold">Ganesh Nalamalapu</span>
      </footer>
    </div>
  );
};

export default SignIn;
