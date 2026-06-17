import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { paymentService } from '../services/payment';
import { 
  Heart, 
  User, 
  Phone, 
  Mail, 
  IndianRupee, 
  CreditCard, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  QrCode, 
  ShieldCheck, 
  Globe, 
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import SEO from '../components/SEO';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Donate = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Step state: 'form' | 'receipt'
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Form Fields
  const [donorName, setDonorName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [purpose, setPurpose] = useState('General Fund');

  // Form Validation Errors
  const [errors, setErrors] = useState({});

  // Payment Session Info
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Selected Bank for Netbanking
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name || '');
      if (!phone) setPhone(user.phone || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText('anjaneyayouth@sbi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!donorName.trim()) tempErrors.donorName = 'Donor name is required.';
    if (!phone.trim()) {
      tempErrors.phone = 'Mobile number is required.';
    } else if (!/^\+?[0-9]{10,12}$/.test(phone.replace(/\s+/g, ''))) {
      tempErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }
    
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }

    const amtNum = parseFloat(amount);
    if (!amount) {
      tempErrors.amount = 'Donation amount is required.';
    } else if (isNaN(amtNum) || amtNum <= 0) {
      tempErrors.amount = 'Amount must be greater than zero.';
    }

    if (!paymentMethod) {
      tempErrors.paymentMethod = 'Please select a payment method.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleInitiatePayment = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay payment SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Secure order representation locally
      const orderData = await paymentService.initiateDonation({
        donorName,
        phone,
        email,
        amount,
        paymentMethod,
        purpose
      });

      if (!orderData.success) {
        alert('Could not initiate donation order. Please try again.');
        setLoading(false);
        return;
      }

      // Configure Razorpay Options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T0LiAO755ol6LH',
        amount: Math.round(parseFloat(amount) * 100), // paise
        currency: 'INR',
        name: 'Sri Anjaneya Youth Association',
        description: `${purpose} Donation`,
        image: '/logo.svg',
        prefill: {
          name: donorName,
          contact: phone,
          email: email || ''
        },
        theme: {
          color: '#ff7700' // Saffron color theme
        },
        handler: async function (response) {
          setLoading(true);
          try {
            const savedDonation = await paymentService.processPaymentResponse(
              { donorName, phone, email, amount, paymentMethod, purpose },
              {
                orderId: orderData.orderId,
                paymentId: response.razorpay_payment_id,
                status: 'Success'
              }
            );
            setPaymentResult(savedDonation);
            setStep('receipt');
          } catch (err) {
            console.error(err);
            alert('Verification Failed: ' + err.message);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            console.log('[Razorpay Checkout] Dismissed by donor.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Checkout error: ' + err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setAmount('');
    setPaymentMethod('');
    setPaymentSession(null);
    setPaymentResult(null);
    setErrors({});
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      <SEO title="Donate" description="Support Sri Anjaneya Youth Zarugumalli with your generous donation. Contribute to temple seva, annadanam, cultural preservation and community welfare activities." path="/donate" />
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-gold-400 transition-colors uppercase tracking-wider bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('dashboard')}
        </Link>
        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          Secure 256-Bit SSL Encryption
        </span>
      </div>

      {/* Main Container */}
      <div className="donation-card rounded-3xl overflow-hidden">
        
        {/* Banner header */}
        <div className="donation-banner text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse-slow" />
          <div className="relative z-10 flex justify-center mb-2">
            <Heart className="w-10 h-10 text-gold-300 fill-current drop-shadow animate-float" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">{t('supportSeva')}</h1>
          <p className="text-xs text-saffron-100 max-w-xl mx-auto mt-2 leading-relaxed">
            {t('sevaDesc')}
          </p>
        </div>

        {/* Dynamic Steps */}
        <div className="p-6 sm:p-8">
          
          {/* STEP 1: DONATION FORM */}
          {step === 'form' && (
            <form onSubmit={handleInitiatePayment} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t('donorName')}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => {
                        setDonorName(e.target.value);
                        if (errors.donorName) setErrors(prev => ({ ...prev, donorName: null }));
                      }}
                      placeholder={t('donorNamePlaceholder')}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.donorName ? 'border-red-500' : 'border-cream-300 dark:border-slate-800'} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.donorName && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">{errors.donorName}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t('mobileNumber')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                      }}
                      placeholder={t('mobileNumberPlaceholder')}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-cream-300 dark:border-slate-800'} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t('emailAddressOptional')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      placeholder={t('emailAddressPlaceholder')}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-cream-300 dark:border-slate-800'} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">{errors.email}</p>
                  )}
                </div>

                {/* Purpose of Donation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t('donationPurpose')}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="General Fund" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{t('purposeGeneral')}</option>
                      <option value="Annadanam Seva" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{t('purposeAnnadanam')}</option>
                      <option value="Temple Renovation" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{t('purposeRenovation')}</option>
                      <option value="Community Education Kits" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{t('purposeEducation')}</option>
                    </select>
                    <div className="absolute right-3.5 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Amount Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                  {t('donationAmount')}
                </label>
                <div className="relative mb-3">
                  <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors(prev => ({ ...prev, amount: null }));
                    }}
                    placeholder={t('donationAmountPlaceholder')}
                    className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.amount ? 'border-red-500' : 'border-cream-300 dark:border-slate-800'} rounded-xl py-3 pl-11 pr-4 text-sm font-extrabold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 mb-2">{errors.amount}</p>
                )}

                {/* Quick select tags */}
                <div className="flex flex-wrap gap-2.5">
                  {[251, 501, 1001, 2001, 5001, 10001].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`amount-tag text-xs px-4 py-2 border rounded-xl font-bold cursor-pointer transition-all ${
                        amount === val.toString() ? 'active' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 pl-1">
                  {t('paymentMethod')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* UPI Option */}
                  <label className={`payment-card flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'UPI' ? 'active' : ''
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => {
                        setPaymentMethod('UPI');
                        if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: null }));
                      }}
                      className="sr-only"
                    />
                    <div className="bg-saffron-100 dark:bg-saffron-950/50 text-saffron-600 p-2.5 rounded-xl">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-extrabold text-slate-800 dark:text-white">{t('bhimUpiQr')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{t('upiApps')}</span>
                    </div>
                  </label>

                  {/* Card Option */}
                  <label className={`payment-card flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'Card' ? 'active' : ''
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="Card"
                      checked={paymentMethod === 'Card'}
                      onChange={() => {
                        setPaymentMethod('Card');
                        if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: null }));
                      }}
                      className="sr-only"
                    />
                    <div className="bg-gold-100 dark:bg-gold-950/50 text-gold-600 p-2.5 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-extrabold text-slate-800 dark:text-white">{t('creditDebitCard')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{t('cardBrands')}</span>
                    </div>
                  </label>

                  {/* Netbanking Option */}
                  <label className={`payment-card flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === 'Netbanking' ? 'active' : ''
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="Netbanking"
                      checked={paymentMethod === 'Netbanking'}
                      onChange={() => {
                        setPaymentMethod('Netbanking');
                        if (errors.paymentMethod) setErrors(prev => ({ ...prev, paymentMethod: null }));
                      }}
                      className="sr-only"
                    />
                    <div className="bg-devored-100 dark:bg-devored-950/50 text-devored-600 p-2.5 rounded-xl">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xs font-extrabold text-slate-800 dark:text-white">{t('netBanking')}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{t('bankList')}</span>
                    </div>
                  </label>
                </div>
                {errors.paymentMethod && (
                  <p className="text-[10px] text-red-500 font-bold mt-2 pl-1">{errors.paymentMethod}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 saffron-gradient-btn rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-4.5 h-4.5 fill-current" />
                    {t('donateNowBtn')}
                  </>
                )}
              </button>

            </form>
          )}



          {/* STEP 3: TRANSACTION RECEIPT */}
          {step === 'receipt' && paymentResult && (
            <div className="space-y-6 max-w-lg mx-auto py-2 text-center animate-slide-up">
              
              <div className="flex flex-col items-center gap-3">
                {paymentResult.status === 'Success' && (
                  <>
                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-black text-emerald-600 uppercase tracking-wide">
                      {t('paymentSuccess')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
                      {t('thankYouDonation')}
                    </p>
                  </>
                )}

                {paymentResult.status === 'Pending' && (
                  <>
                    <div className="bg-amber-100 text-amber-500 p-4 rounded-full animate-pulse">
                      <AlertCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-black text-amber-500 uppercase tracking-wide">
                      {t('paymentPending')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
                      {t('paymentPendingMsg')}
                    </p>
                  </>
                )}

                {paymentResult.status === 'Failed' && (
                  <>
                    <div className="bg-red-100 text-red-600 p-4 rounded-full">
                      <XCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-black text-red-600 uppercase tracking-wide">
                      {t('paymentFailed')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
                      {t('paymentErrorMsg')}
                    </p>
                  </>
                )}
              </div>

              <div className="bg-cream-50/50 dark:bg-slate-950/40 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 text-left text-xs divide-y divide-cream-200/50 dark:divide-slate-800/50 space-y-3.5">
                <div className="flex justify-between items-center pb-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Donor Details</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{paymentResult.donorName}</span>
                </div>
                
                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Amount Paid</span>
                  <span className="font-black text-base text-slate-800 dark:text-white">
                    ₹{paymentResult.amount.toLocaleString('en-IN')}.00
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Payment Method</span>
                  <span className="font-extrabold text-slate-800 dark:text-white">{paymentResult.paymentMethod}</span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Purpose</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{paymentResult.purpose}</span>
                </div>

                <div className="flex flex-col gap-1 py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Transaction ID</span>
                  <span className="font-mono text-[10px] text-slate-500 font-extrabold">{paymentResult.paymentId}</span>
                </div>

                <div className="flex justify-between items-center pt-3.5">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Date & Time</span>
                  <span className="font-medium text-slate-500">
                    {new Date(paymentResult.createdAt).toLocaleString(language === 'en' ? 'en-IN' : 'te-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 border border-cream-300 dark:border-slate-800 hover:border-saffron-500 hover:bg-saffron-50/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer bg-white dark:bg-slate-900"
                >
                  Make Another Donation
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 saffron-gradient-btn rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  Return to Home
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Donate;
