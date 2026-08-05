import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../firebase/config';
import {
  User, Mail, Phone, MapPin, Lock, UserPlus,
  AlertCircle, Globe, Eye, EyeOff, MessageSquare,
  ShieldCheck, RotateCcw, ChevronLeft
} from 'lucide-react';
import SEO from '../components/SEO';
import { fadeUp, shake } from '../utils/animate';
import { triggerConfetti } from '../utils/confetti';

// ─── OTP digit box component ─────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.padEnd(6, '').split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = value.slice(0, i > 0 ? i - 1 : 0);
      onChange(next);
      if (i > 0 && refs[i - 1].current) refs[i - 1].current.focus();
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const arr = value.split('');
    arr[i] = e.key;
    const next = arr.join('').slice(0, 6);
    onChange(next);
    if (i < 5 && refs[i + 1].current) refs[i + 1].current.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onKeyDown={(e) => handleKey(i, e)}
          onChange={() => {}} // controlled via onKeyDown
          className="w-10 h-12 text-center text-lg font-extrabold rounded-xl border-2 border-cream-300 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 bg-cream-50/50 dark:bg-slate-950 dark:border-slate-700 dark:text-white outline-none transition-all font-mono"
          aria-label={`OTP digit ${i + 1}`}
        />
      ))}
    </div>
  );
};

// ─── Password strength helper ─────────────────────────────────────────────────
const getPasswordStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Weak', color: 'bg-red-400' },
    { level: 2, label: 'Fair', color: 'bg-yellow-400' },
    { level: 3, label: 'Good', color: 'bg-blue-400' },
    { level: 4, label: 'Strong', color: 'bg-green-500' },
  ];
  return levels[score] || levels[4];
};

// ─── Main SignUp component ────────────────────────────────────────────────────
const SignUp = () => {
  const { user, loginUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  // ── Step tracking ──
  const [step, setStep] = useState(1); // 1 = form, 2 = otp verify

  // ── Form fields ──
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── OTP channel selection ──
  const [otpChannel, setOtpChannel] = useState('phone'); // 'phone' | 'email'

  // ── OTP step state ──
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpFallbackCode, setOtpFallbackCode] = useState(''); // shown during dev/trial

  // ── UI ──
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) fadeUp(cardRef.current, { delay: 50, distance: 40 });
  }, []);

  useEffect(() => {
    if (error && cardRef.current) shake(cardRef.current);
  }, [error]);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // ── Countdown timer for resend ──
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const pwStrength = getPasswordStrength(password);

  // ── Form validation ──
  const validateForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !village.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.'); return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.'); return false;
    }
    if (!/^\d{10}$/.test(phone.replace(/\D/g, '').slice(-10))) {
      setError('Please enter a valid 10-digit phone number.'); return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.'); return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.'); return false;
    }
    return true;
  };

  // ── Step 1: Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!validateForm()) return;

    const destination = otpChannel === 'phone'
      ? authService._normalizePhone(phone)
      : email.trim();

    setLoading(true);
    try {
      const result = await authService.sendRegistrationOtp(destination, otpChannel);
      setStep(2);
      setCountdown(300); // 5 min

      const channelLabel = otpChannel === 'phone'
        ? `📱 ${destination}`
        : `✉️ ${destination}`;
      setInfo(`OTP sent to ${channelLabel}. Enter the 6-digit code below to verify and create your account.`);

      // In dev / Twilio trial: show fallback code prominently
      if (result.code) {
        setOtpFallbackCode(result.code);
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP and create account ──
  const handleVerifyAndCreate = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');

    if (otpValue.length < 6) {
      setError('Please enter the complete 6-digit OTP.'); return;
    }

    setLoading(true);
    try {
      // 1. Verify 2Factor OTP
      await authService.verifyRegistrationOtp(otpValue);

      // 2. Create the user account
      const newUser = await authService.signUp(name.trim(), email.trim(), phone.trim(), village.trim(), password);
      triggerConfetti();
      loginUser(newUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──
  const handleResend = async () => {
    if (countdown > 0) return;
    setError(''); setInfo('');
    const destination = otpChannel === 'phone' ? authService._normalizePhone(phone) : email.trim();
    setLoading(true);
    try {
      const result = await authService.sendRegistrationOtp(destination, otpChannel);
      setCountdown(300);
      setOtpValue('');
      setInfo('A new OTP has been sent.');
      if (result.code) setOtpFallbackCode(result.code);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(''); setLoading(true);
    try {
      const loggedUser = await authService.signInWithGoogle();
      triggerConfetti();
      loginUser(loggedUser);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => setLanguage(language === 'en' ? 'te' : 'en');

  const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cream-100/30 relative">
      <SEO title="Sign Up" description="Join Sri Anjaneya Youth Zarugumalli. Register as a new member and participate in seva, cultural events and community activities." path="/signup" />

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

      <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div ref={cardRef} style={{ opacity: 0 }} className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-cream-200 overflow-hidden relative glass-panel">

          {/* Header */}
          <div className="bg-gradient-to-br from-saffron-500 via-saffron-600 to-devored-700 text-white px-6 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] animate-pulse-slow" />

            {/* Step indicator */}
            <div className="relative z-10 flex justify-center gap-2 mb-3">
              {[1, 2].map(n => (
                <div key={n} className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold transition-all ${
                  step >= n
                    ? 'bg-white text-saffron-600 shadow'
                    : 'bg-white/30 text-white/70'
                }`}>
                  {n}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-extrabold tracking-tight relative z-10">
              {step === 1 ? t('joinWebsiteName') : 'Verify Your Account'}
            </h2>
            <p className="text-xs text-gold-300 uppercase tracking-widest font-bold mt-1 relative z-10">
              {step === 1 ? 'Step 1 of 2 — Fill Details' : 'Step 2 of 2 — Enter OTP'}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {/* Error / Info */}
            {error && (
              <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {info && (
              <div className="bg-saffron-50 border border-saffron-200 text-saffron-800 p-3.5 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{info}</span>
              </div>
            )}

            {/* ─── STEP 1: Registration form ─── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('fullNameLabel')}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                      required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('emailAddressLabel')}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder={t('emailAddressPlaceholder')}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                      required />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('phoneNumberLabel')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                      required />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-1">India (+91) • 10 digits only</p>
                </div>

                {/* Village */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('villageAreaLabel')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type="text" value={village} onChange={e => setVillage(e.target.value)}
                      placeholder={t('villageAreaPlaceholder')}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                      required />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('newPassword')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                      required />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {password && (
                    <div className="mt-1.5 pl-1">
                      <div className="flex gap-1 mb-0.5">
                        {[1,2,3,4].map(n => (
                          <div key={n} className={`h-1 flex-1 rounded-full transition-all ${n <= pwStrength.level ? pwStrength.color : 'bg-cream-200'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">{pwStrength.label}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('confirmPasswordLabel')}</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border rounded-xl py-2.5 pl-11 pr-11 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-400'
                          : 'border-cream-300 dark:border-slate-800'
                      }`}
                      required />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-0.5 pl-1">Passwords don't match</p>
                  )}
                </div>

                {/* OTP Channel selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 pl-1">
                    Send OTP To
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpChannel('phone')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                        otpChannel === 'phone'
                          ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                          : 'border-cream-300 text-slate-500 hover:border-saffron-300'
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      Phone
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpChannel('email')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer ${
                        otpChannel === 'email'
                          ? 'border-saffron-500 bg-saffron-50 text-saffron-700'
                          : 'border-cream-300 text-slate-500 hover:border-saffron-300'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
                    {otpChannel === 'phone'
                      ? `OTP will be sent via SMS to +91${phone || 'XXXXXXXXXX'}`
                      : `OTP will be sent to ${email || 'your email address'}`}
                  </p>
                </div>

                {/* Send OTP button */}
                <div className="sm:col-span-2 pt-1">
                  <button type="submit" disabled={loading}
                    className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2">
                    {loading
                      ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <>
                          <MessageSquare className="w-4 h-4" />
                          Send OTP to {otpChannel === 'phone' ? 'Phone' : 'Email'}
                        </>
                    }
                  </button>
                </div>
              </form>
            )}

            {/* ─── STEP 2: OTP verification ─── */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndCreate} className="space-y-5">

                {/* Destination hint */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold">
                    {otpChannel === 'phone' ? <Phone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    {otpChannel === 'phone' ? `+91${phone}` : email}
                  </div>
                </div>



                {/* 6-digit OTP boxes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 text-center">
                    Enter 6-Digit OTP
                  </label>
                  <OtpInput value={otpValue} onChange={setOtpValue} />
                </div>

                {/* Countdown + Resend */}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setOtpValue(''); setError(''); setInfo(''); setOtpFallbackCode(''); }}
                    className="flex items-center gap-1 text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Change Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className={`flex items-center gap-1 font-bold cursor-pointer ${
                      countdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-saffron-600 hover:text-saffron-700'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : 'Resend OTP'}
                  </button>
                </div>

                {/* Verify & Create Account */}
                <button type="submit" disabled={loading || otpValue.length < 6}
                  className="w-full saffron-gradient-btn rounded-xl py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>
                        <UserPlus className="w-4 h-4" />
                        Verify &amp; Create Account
                      </>
                  }
                </button>
              </form>
            )}

            {/* ─── Google sign-up (step 1 only) ─── */}
            {step === 1 && (
              <>
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-cream-200" />
                  <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-widest font-semibold">{t('or')}</span>
                  <div className="flex-grow border-t border-cream-200" />
                </div>

                <button onClick={handleGoogleSignUp} disabled={loading}
                  className="w-full border border-cream-300 hover:bg-cream-100/30 text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  {t('signUpWithGoogle')}
                </button>
              </>
            )}

            {/* Sign In link */}
            <p className="text-center text-xs text-slate-500">
              {t('signInRedirectText')}{' '}
              <Link to="/signin" className="text-saffron-600 font-bold hover:underline">{t('signInRedirectLink')}</Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-slate-500 font-medium">
        {t('developedBy')} <span className="text-saffron-600 font-bold">Ganesh Nalamalapu</span>
      </footer>
    </div>
  );
};

export default SignUp;
