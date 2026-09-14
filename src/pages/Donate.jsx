import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { paymentService } from "../services/payment";
import { emailService } from "../services/emailService";
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
  Calendar,
  Upload,
  Trash2,
  Clock,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import SEO from "../components/SEO";
import { fadeUp, staggerScaleFade, heartbeat } from "../utils/animate";

const Donate = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Step state: 'form' | 'qr' | 'receipt'
  const [step, setStep] = useState("form");
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");

  // Form Fields
  const [donorName, setDonorName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PhonePe / UPI QR");
  const [purpose, setPurpose] = useState("General Fund");
  const [donationDate, setDonationDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [message, setMessage] = useState("");

  // Payment Receipt Upload
  const [receiptImage, setReceiptImage] = useState("");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);

  // Form Validation Errors
  const [errors, setErrors] = useState({});

  // Payment Session Info
  const [paymentSession, setPaymentSession] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  // Selected Bank for Netbanking
  const [selectedBank, setSelectedBank] = useState("");

  // Animation refs
  const cardRef = useRef(null);
  const heartRef = useRef(null);
  const amountBtnsRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) fadeUp(cardRef.current, { delay: 100, distance: 30 });
    if (heartRef.current) heartbeat(heartRef.current, { delay: 600 });
    if (amountBtnsRef.current) {
      staggerScaleFade(
        amountBtnsRef.current.querySelectorAll(":scope > button"),
        { stagger: 60, startDelay: 400 },
      );
    }
  }, []);

  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.name || "");
      if (!phone) setPhone(user.phone || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  const upiTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (upiTimerRef.current) clearTimeout(upiTimerRef.current);
    };
  }, []);

  const handleQuickAmount = (val) => {
    setAmount(val.toString());
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: null }));
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText("anjaneyayouth@sbi");
    setCopiedUpi(true);
    if (upiTimerRef.current) clearTimeout(upiTimerRef.current);
    upiTimerRef.current = setTimeout(() => setCopiedUpi(false), 2000);
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!donorName.trim()) tempErrors.donorName = "Donor name is required.";
    if (!phone.trim()) {
      tempErrors.phone = "Mobile number is required.";
    } else if (!/^\+?[0-9]{10,12}$/.test(phone.replace(/\s+/g, ""))) {
      tempErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    const amtNum = parseFloat(amount);
    if (!amount) {
      tempErrors.amount = "Donation amount is required.";
    } else if (isNaN(amtNum) || amtNum <= 0) {
      tempErrors.amount = "Amount must be greater than zero.";
    }

    if (!donationDate) {
      tempErrors.donationDate = "Donation date is required.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        receiptImage: "Please upload an image file (JPG, PNG, WEBP).",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        receiptImage: "File size exceeds 10MB limit.",
      }));
      return;
    }

    try {
      setReceiptUploading(true);
      const compressedBase64 = await compressImage(file);
      setReceiptImage(compressedBase64);
      setReceiptFileName(file.name);
      setErrors((prev) => ({ ...prev, receiptImage: null }));
    } catch (err) {
      console.error("Image compression error:", err);
      setErrors((prev) => ({
        ...prev,
        receiptImage: "Failed to process image. Please try again.",
      }));
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleInitiatePayment = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStep("qr");
    window.scrollTo({ top: 100, behavior: "smooth" });
  };

  const handleConfirmQrPayment = async () => {
    if (!receiptImage) {
      setErrors((prev) => ({
        ...prev,
        receiptImage:
          language === "en"
            ? "Please upload your payment receipt or screenshot to proceed."
            : "దయచేసి కొనసాగడానికి మీ చెల్లింపు రసీదు లేదా స్క్రీన్‌షాట్‌ను అప్‌లోడ్ చేయండి.",
      }));
      return;
    }

    setLoading(true);
    try {
      const savedDonation = await paymentService.recordQrDonation(
        {
          userId: user?.uid || user?.id || "guest",
          donorName,
          phone,
          email,
          amount,
          donationDate,
          message,
          receiptImage,
          paymentMethod: paymentMethod === "UPI" ? "PhonePe / UPI QR" : paymentMethod,
          purpose,
        },
        utrNumber
      );

      setPaymentResult(savedDonation);
      setStep("receipt");
      if (savedDonation && savedDonation.email) {
        emailService
          .sendDonationReceipt(savedDonation)
          .catch((e) => console.error("Receipt email error:", e));
      }
    } catch (err) {
      console.error(err);
      alert("Error confirming donation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
    setUtrNumber("");
    setPaymentMethod("UPI");
    setDonationDate(new Date().toISOString().split("T")[0]);
    setMessage("");
    setReceiptImage("");
    setReceiptFileName("");
    setPaymentSession(null);
    setPaymentResult(null);
    setErrors({});
  };

  const donateSchema = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: "Donate to Sri Anjaneya Youth Zarugumalli",
    description:
      "Support Sri Anjaneya Swamy Temple seva, Annadanam, and community welfare in Zarugumalli village.",
    recipient: {
      "@type": "NGO",
      name: "Sri Anjaneya Youth Association Zarugumalli",
    },
  };

  return (
    <div className="flex-1 max-w-5xl xl:max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 xl:space-y-8 w-full">
      <SEO
        title={t("donate")}
        description="Support Sri Anjaneya Youth Zarugumalli with your generous donation. Contribute to temple seva, Annadanam, cultural preservation and community welfare in Zarugumalli."
        path="/donate"
        schema={donateSchema}
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-gold-400 transition-colors uppercase tracking-wider bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("dashboard")}
        </Link>
        <span className="text-xs text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          {t("secureSsl")}
        </span>
      </div>

      {/* Main Container */}
      <div
        ref={cardRef}
        style={{ opacity: 0 }}
        className="donation-card rounded-3xl overflow-hidden"
      >
        {/* Banner header */}
        <div className="donation-banner text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] animate-pulse-slow" />
          <div className="relative z-10 flex justify-center mb-2">
            <Heart
              ref={heartRef}
              className="w-10 h-10 text-gold-300 fill-current drop-shadow animate-float"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            {t("supportSeva")}
          </h1>
          <p className="text-xs text-saffron-100 max-w-xl mx-auto mt-2 leading-relaxed">
            {t("sevaDesc")}
          </p>
        </div>

        {/* Dynamic Steps */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: DONATION FORM */}
          {step === "form" && (
            <form onSubmit={handleInitiatePayment} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Donor Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t("donorName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => {
                        setDonorName(e.target.value);
                        if (errors.donorName)
                          setErrors((prev) => ({ ...prev, donorName: null }));
                      }}
                      placeholder={t("donorNamePlaceholder")}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.donorName ? "border-red-500" : "border-cream-300 dark:border-slate-800"} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.donorName && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                      {errors.donorName}
                    </p>
                  )}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t("mobileNumber")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone)
                          setErrors((prev) => ({ ...prev, phone: null }));
                      }}
                      placeholder={t("mobileNumberPlaceholder")}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.phone ? "border-red-500" : "border-cream-300 dark:border-slate-800"} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t("emailAddressOptional")}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email)
                          setErrors((prev) => ({ ...prev, email: null }));
                      }}
                      placeholder={t("emailAddressPlaceholder")}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.email ? "border-red-500" : "border-cream-300 dark:border-slate-800"} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Purpose of Donation */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {t("donationPurpose")}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all appearance-none cursor-pointer"
                    >
                      <option
                        value="General Fund"
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        {t("purposeGeneral")}
                      </option>
                      <option
                        value="Annadanam Seva"
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        {t("purposeAnnadanam")}
                      </option>
                      <option
                        value="Temple Renovation"
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        {t("purposeRenovation")}
                      </option>
                      <option
                        value="Community Education Kits"
                        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                      >
                        {t("purposeEducation")}
                      </option>
                    </select>
                    <div className="absolute right-3.5 top-4 w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 3: Donation Date & Optional Message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Donation Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {language === "en" ? "Donation Date *" : "విరాళం తేదీ *"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={donationDate}
                      onChange={(e) => {
                        setDonationDate(e.target.value);
                        if (errors.donationDate)
                          setErrors((prev) => ({ ...prev, donationDate: null }));
                      }}
                      className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.donationDate ? "border-red-500" : "border-cream-300 dark:border-slate-800"} rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                    />
                  </div>
                  {errors.donationDate && (
                    <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                      {errors.donationDate}
                    </p>
                  )}
                </div>

                {/* Optional Message */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {language === "en" ? "Optional Message / Prarthana" : "ఐచ్ఛిక సందేశం / ప్రార్థన"}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        language === "en"
                          ? "e.g., In memory of family, seva prayer..."
                          : "ఉదా: కుటుంబ శ్రేయస్సు కొరకు, సేవా సంకల్పం..."
                      }
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                  {t("donationAmount")}
                </label>
                <div className="relative mb-3">
                  <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount)
                        setErrors((prev) => ({ ...prev, amount: null }));
                    }}
                    placeholder={t("donationAmountPlaceholder")}
                    className={`w-full bg-cream-50/50 dark:bg-slate-950 border ${errors.amount ? "border-red-500" : "border-cream-300 dark:border-slate-800"} rounded-xl py-3 pl-11 pr-4 text-sm font-extrabold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 transition-all`}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[10px] text-red-500 font-bold mt-1 pl-1 mb-2">
                    {errors.amount}
                  </p>
                )}

                {/* Quick select tags */}
                <div className="flex flex-wrap gap-2.5">
                  {[251, 501, 1001, 2001, 5001, 10001].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAmount(val)}
                      className={`amount-tag text-xs px-4 py-2 border rounded-xl font-bold cursor-pointer transition-all ${
                        amount === val.toString()
                          ? "active"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct UPI QR Payment Info Banner */}
              <div className="bg-saffron-50/70 dark:bg-saffron-950/30 border border-saffron-200/70 dark:border-saffron-800/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="bg-saffron-500/10 text-saffron-600 p-2 rounded-xl shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-800 dark:text-white block text-xs">
                      {language === "en" ? "Direct PhonePe & UPI QR Payment" : "ప్రత్యక్ష ఫోన్‌పే & UPI QR చెల్లింపు"}
                    </span>
                    <span className="text-[10.5px] text-slate-400 font-medium">
                      {language === "en" ? "Zero transaction fees • Scan with PhonePe, GPay, Paytm, or BHIM" : "ఎటువంటి లావాదేవీ రుసుములు లేవు • ఫోన్‌పే, జీపే, పేటీఎంలతో చెల్లించండి"}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-extrabold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Direct Seva
                </div>
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
                    <QrCode className="w-4.5 h-4.5" />
                    {language === "en" ? `Proceed to Pay ₹${amount ? Number(amount).toLocaleString("en-IN") : "0"}` : `₹${amount ? Number(amount).toLocaleString("en-IN") : "0"} చెల్లించడానికి కొనసాగండి`}
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PHONEPE QR CODE PAYMENT */}
          {step === "qr" && (
            <div className="space-y-6 max-w-md mx-auto py-2 text-center animate-slide-up">
              <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                {/* Accent line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600" />

                {/* Header Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-saffron-50 dark:bg-saffron-950/50 text-saffron-600 dark:text-saffron-400 border border-saffron-200 dark:border-saffron-800/50 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4">
                  <QrCode className="w-3.5 h-3.5" />
                  {language === "en" ? "PhonePe / UPI QR Payment" : "ఫోన్‌పే / UPI QR చెల్లింపు"}
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-white mb-1">
                  {language === "en" ? "Scan to Donate" : "విరాళం ఇవ్వడానికి స్కాన్ చేయండి"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  {language === "en" ? "Scan with PhonePe, Google Pay, Paytm, or any UPI app" : "ఫోన్‌పే, గూగుల్ పే, పేటీఎం లేదా ఏదైనా UPI యాప్‌తో స్కాన్ చేయండి"}
                </p>

                {/* PhonePe QR Image Container */}
                <div className="flex justify-center mb-4">
                  <div className="p-2.5 bg-black rounded-2xl shadow-2xl border-2 border-saffron-500/30 max-w-[260px] w-full group hover:border-saffron-500 transition-all">
                    <img
                      src="/donation-qr.jpg"
                      alt="PhonePe QR Code - Nalamalapu Ganesh"
                      className="w-full h-auto rounded-xl object-contain filter contrast-[1.03]"
                    />
                  </div>
                </div>

                {/* Beneficiary & Transaction Breakdown */}
                <div className="bg-cream-50/70 dark:bg-slate-950/70 border border-cream-200 dark:border-slate-800 rounded-2xl p-4 mb-4 text-left text-xs divide-y divide-cream-200/60 dark:divide-slate-800/60 space-y-2.5">
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      {language === "en" ? "Beneficiary Name" : "లబ్ధిదారుని పేరు"}
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-white text-xs tracking-wide">
                      NALAMALAPU GANESH
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      {language === "en" ? "Donation Amount" : "విరాళం మొత్తం"}
                    </span>
                    <span className="font-black text-saffron-600 dark:text-saffron-400 text-sm">
                      ₹{Number(amount).toLocaleString("en-IN")}.00
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      {language === "en" ? "Seva Purpose" : "సేవా ఉద్దేశం"}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                      {purpose}
                    </span>
                  </div>
                </div>

                {/* Mobile Intent Button */}
                <div className="mb-4 block sm:hidden">
                  <a
                    href={`upi://pay?pa=nalamalapuganesh@phonepe&pn=NALAMALAPU%20GANESH&am=${amount}&cu=INR&tn=${encodeURIComponent(purpose + " - Sri Anjaneya Youth")}`}
                    className="w-full py-2.5 bg-saffron-50 dark:bg-saffron-950/40 hover:bg-saffron-100 text-saffron-600 dark:text-saffron-400 border border-saffron-300 dark:border-saffron-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <QrCode className="w-4 h-4" />
                    {language === "en" ? "Tap to Open UPI App" : "UPI యాప్‌ని తెరవండి"}
                  </a>
                </div>

                {/* UTR / Reference ID input */}
                <div className="text-left mb-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
                    {language === "en" ? "UPI Ref / UTR No. (Optional)" : "UPI రిఫరెన్స్ / UTR నం. (ఐచ్ఛికం)"}
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 423589123456"
                    className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500 font-mono transition-all"
                  />
                  <span className="block text-[10px] text-slate-400 mt-1 pl-1">
                    {language === "en" ? "Enter the 12-digit UTR from your PhonePe or bank confirmation screen." : "మీ ఫోన్‌పే లేదా బ్యాంక్ నిర్ధారణ స్క్రీన్ నుండి 12 అంకెల UTR నమోదు చేయండి."}
                  </span>
                </div>

                {/* Payment Receipt / Screenshot Upload Box */}
                <div className="text-left mb-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 pl-1 flex items-center justify-between">
                    <span>
                      {language === "en" ? "Payment Receipt / Screenshot" : "చెల్లింపు రసీదు / స్క్రీన్‌షాట్"} <span className="text-red-500 font-black">*</span>
                    </span>
                    {receiptImage && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </label>

                  {receiptImage ? (
                    <div className="relative border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-2xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={receiptImage}
                          alt="Payment Receipt Preview"
                          className="w-14 h-14 object-cover rounded-xl border border-cream-200 dark:border-slate-800 shrink-0 shadow-sm"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {receiptFileName || "payment-receipt.jpg"}
                          </p>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Ready for admin verification
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptImage("");
                          setReceiptFileName("");
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Remove receipt"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className={`border-2 border-dashed ${errors.receiptImage ? "border-red-500 bg-red-50/10" : "border-cream-300 dark:border-slate-800 hover:border-saffron-500"} rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer bg-cream-50/30 dark:bg-slate-950/40 transition-all group`}>
                        <div className="w-10 h-10 rounded-xl bg-saffron-50 dark:bg-saffron-950/40 text-saffron-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {receiptUploading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                            {language === "en" ? "Click to upload payment screenshot" : "చెల్లింపు స్క్రీన్‌షాట్‌ను అప్‌లోడ్ చేయండి"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            JPG, PNG, WEBP (PhonePe/UPI confirmation)
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleReceiptUpload}
                          disabled={receiptUploading}
                        />
                      </label>
                      {errors.receiptImage && (
                        <p className="text-[10px] text-red-500 font-bold mt-1.5 pl-1">
                          {errors.receiptImage}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex-1 py-3 border border-cream-300 dark:border-slate-800 hover:border-saffron-500 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer bg-white dark:bg-slate-900"
                  >
                    {language === "en" ? "← Edit Form" : "← సవరించండి"}
                  </button>
                  <button
                    type="button"
                    disabled={loading || receiptUploading}
                    onClick={handleConfirmQrPayment}
                    className="flex-1 py-3 saffron-gradient-btn rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        {language === "en" ? "Submit Donation for Approval" : "ఆమోదం కోసం సమర్పించండి"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TRANSACTION RECEIPT & STATUS CONFIRMATION */}
          {step === "receipt" && paymentResult && (
            <div className="space-y-6 max-w-lg mx-auto py-2 text-center animate-slide-up">
              <div className="flex flex-col items-center gap-3">
                {paymentResult.status === "Success" && (
                  <>
                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-black text-emerald-600 uppercase tracking-wide">
                      {t("paymentSuccess")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
                      {t("thankYouDonation")}
                    </p>
                  </>
                )}

                {paymentResult.status === "Pending" && (
                  <>
                    <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-500 p-4 rounded-full animate-pulse border border-amber-300 dark:border-amber-800/60">
                      <Clock className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-wider mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {language === "en" ? "Pending Admin Approval" : "అడ్మిన్ ఆమోదం కోసం పెండింగ్‌లో ఉంది"}
                      </div>
                      <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
                        {language === "en" ? "Donation Submitted for Verification" : "విరాళం ధృవీకరణ కోసం సమర్పించబడింది"}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-4 max-w-md">
                      {language === "en"
                        ? "Thank you! Your donation has been recorded with Pending status. Our admin team will review your payment receipt and approve it into the official financial records shortly."
                        : "ధన్యవాదాలు! మీ విరాళం పెండింగ్ స్థితితో నమోదు చేయబడింది. మా అడ్మిన్ మీ రసీదును పరిశీలించి త్వరలోనే అధికారిక లెక్కల్లోకి ఆమోదిస్తారు."}
                    </p>
                  </>
                )}

                {paymentResult.status === "Failed" && (
                  <>
                    <div className="bg-red-100 text-red-600 p-4 rounded-full">
                      <XCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-black text-red-600 uppercase tracking-wide">
                      {t("paymentFailed")}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold px-4">
                      {t("paymentErrorMsg")}
                    </p>
                  </>
                )}
              </div>

              <div className="bg-cream-50/50 dark:bg-slate-950/40 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 text-left text-xs divide-y divide-cream-200/50 dark:divide-slate-800/50 space-y-3.5">
                <div className="flex justify-between items-center pb-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {t("donorDetails")}
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-white">
                    {paymentResult.donorName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {t("amountPaid")}
                  </span>
                  <span className="font-black text-base text-slate-800 dark:text-white">
                    ₹{paymentResult.amount.toLocaleString("en-IN")}.00
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Workflow Status" : "పరిశీలన స్థితి"}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                      paymentResult.status === "Approved" || paymentResult.status === "Success"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : paymentResult.status === "Pending"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          : "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    }`}
                  >
                    {paymentResult.status === "Pending" && <Clock className="w-3 h-3" />}
                    {(paymentResult.status === "Approved" || paymentResult.status === "Success") && <CheckCircle2 className="w-3 h-3" />}
                    {paymentResult.status === "Rejected" && <XCircle className="w-3 h-3" />}
                    {paymentResult.status}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {t("purpose")}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {paymentResult.purpose}
                  </span>
                </div>

                {paymentResult.message && (
                  <div className="flex justify-between items-center py-3">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {language === "en" ? "Donor Message" : "సందేశం"}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 italic text-right max-w-[200px]">
                      "{paymentResult.message}"
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {t("transactionId")} / UTR
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-extrabold">
                    {paymentResult.paymentId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">
                    {language === "en" ? "Donation Date" : "విరాళం తేదీ"}
                  </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {paymentResult.donationDate || new Date(paymentResult.createdAt).toLocaleDateString(language === "en" ? "en-IN" : "te-IN")}
                  </span>
                </div>

                {/* Receipt Image Preview Thumbnail if attached */}
                {paymentResult.receiptImage && (
                  <div className="flex justify-between items-center pt-3">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">
                      {language === "en" ? "Attached Receipt" : "లగించిన రసీదు"}
                    </span>
                    <div className="relative group cursor-pointer">
                      <img
                        src={paymentResult.receiptImage}
                        alt="Submitted Receipt"
                        className="w-12 h-12 rounded-xl object-cover border border-cream-300 dark:border-slate-700 shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 border border-cream-300 dark:border-slate-800 hover:border-saffron-500 hover:bg-saffron-50/5 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer bg-white dark:bg-slate-900"
                >
                  {t("makeAnotherDonation")}
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 py-3 saffron-gradient-btn rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {t("returnToHome")}
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
