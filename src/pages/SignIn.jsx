import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../firebase/config';
import { Mail, Lock, LogIn, Download, AlertCircle, Info, Globe, Phone, User } from 'lucide-react';

const SignIn = () => {
  const { user, loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Listen for PWA installation prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    setLoading(true);
    try {
      const appVerifier = authService.setupRecaptcha('phone-signin-btn');
      const result = await authService.sendOtp(phone.trim(), appVerifier);
      setConfirmationResult(result);
      setOtpSent(true);
      setInfo('Verification code (OTP) sent to your mobile number.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Make sure it is in valid international format (e.g. +919876543210).');
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch(e){}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }
    if (!confirmationResult) {
      setError('Please request OTP first by clicking Send OTP.');
      return;
    }

    setLoading(true);
    try {
      const authResult = await confirmationResult.confirm(otp.trim());
      // Normalize the Firebase phone user into the app's expected shape
      const firebaseUser = authResult.user;
      const normalizedUser = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.phoneNumber || 'Bhaktha',
        email: firebaseUser.email || '',
        phone: firebaseUser.phoneNumber || '',
        photoUrl: firebaseUser.photoURL || '',
        village: '',
        role: 'user',
        committeeStatus: 'none',
      };
      loginUser(normalizedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    } else {
      alert("To install, use your browser's 'Add to Home Screen' or 'Install' menu option. (The app is PWA-compatible!)");
    }
  };

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const loggedUser = await authService.signIn(email, password);
      setUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const loggedUser = await authService.signInWithGoogle();
      setUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setInfo('Password reset link sent to your email (or simulated locally).');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-cream-200 overflow-hidden relative glass-panel">
          {/* Logo/Banner Header */}
          <div className="bg-gradient-to-br from-saffron-500 via-saffron-600 to-devored-700 text-white px-6 py-8 text-center relative overflow-hidden">
            {/* Background Halo */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse-slow" />
            
            {/* Custom SVG Hanuman Mace */}
            <div className="relative z-10 flex justify-center mb-3">
              <svg 
                className="w-16 h-16 text-gold-300 drop-shadow-md animate-float"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                <circle cx="12" cy="7" r="5" stroke="currentColor" strokeDasharray="1 1" />
                <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.3" />
                <path d="M12 2v10" strokeWidth="2" />
                <path d="M9 7h6" />
                <path d="M12 12v10" strokeWidth="2.5" />
                <circle cx="12" cy="22" r="1" fill="currentColor" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold tracking-tight relative z-10">
              {t('websiteName')}
            </h2>
            <p className="text-xs uppercase tracking-widest font-bold text-gold-300 relative z-10 mt-1">
              {t('zarugumalli')}
            </p>
            <p className="text-[10px] italic text-saffron-100 relative z-10 mt-2">
              "{t('unitedQuote')}"
            </p>
          </div>

          {/* Form Area */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
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

            {/* Login Method Tab Selection */}
            <div className="flex border-b border-cream-200 dark:border-slate-800 mb-5 text-center">
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); setInfo(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  loginMethod === 'email'
                    ? 'border-saffron-500 text-saffron-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('emailAddressLabel')}
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setError(''); setInfo(''); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'border-saffron-500 text-saffron-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('phoneNumberLabel')}
              </button>
            </div>

            {loginMethod === 'email' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
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

                <div>
                  <div className="flex justify-between items-center mb-1.5 pl-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t('passwordLabel')}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs font-bold text-saffron-600 hover:text-saffron-700 transition-colors"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2"
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
            ) : (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                {!otpSent ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
                      {t('phoneNumberLabel')}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+919876543210"
                        className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 pl-1">
                      {t('otpLabel')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-cream-50/50 border border-cream-300 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  id="phone-signin-btn"
                  disabled={loading}
                  className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {otpSent ? <User className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      {otpSent ? t('verifyOtp') : t('sendOtp')}
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-cream-200"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-widest font-semibold">{t('or')}</span>
              <div className="flex-grow border-t border-cream-200"></div>
            </div>

            {/* Google Sign-in */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border border-cream-300 hover:bg-cream-100/30 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              {t('continueWithGoogle')}
            </button>

            {/* Sign Up Redirect */}
            <p className="text-center text-xs text-slate-500">
              {t('signUpRedirectText')}{' '}
              <Link to="/signup" className="text-saffron-600 font-bold hover:underline">
                {t('signUpRedirectLink')}
              </Link>
            </p>

            {/* Mock Info Alert Box */}
            {authService.isMock && (
              <div className="bg-cream-200/40 border border-cream-300 rounded-xl p-3.5 text-[11px] text-slate-500 leading-normal space-y-1">
                <span className="font-bold text-slate-700 block">{t('mockAccountsText')}</span>
                <div>• Admin: <span className="font-bold">admin@srianjaneya.org</span> (pw: <span className="font-bold">admin123</span>)</div>
                <div>• User: <span className="font-bold">member@srianjaneya.org</span> (pw: <span className="font-bold">member123</span>)</div>
              </div>
            )}

            {/* PWA Install Button */}
            <button
              onClick={handleInstallApp}
              className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gold-400" />
              {t('installAppBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <footer className="text-center py-4 text-xs text-slate-500 font-medium">
        {t('developedBy')} <span className="text-saffron-600 font-bold">Ganesh Nalamalapu</span>
      </footer>
    </div>
  );
};

export default SignIn;
