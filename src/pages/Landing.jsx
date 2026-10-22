import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../firebase/config';
import {
  Sparkles,
  Heart,
  Users,
  Calendar,
  Droplet,
  BookOpen,
  Banknote,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  Menu,
  X,
  Utensils,
  Flame,
  Bell,
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  heroEntrance,
  staggerFadeUp,
  staggerScaleFade,
  fadeUp,
  countUp
} from '../utils/animate';

const Landing = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Mobile menu state for public navbar (when user is guest)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedUPI, setCopiedUPI] = useState(false);

  // Live statistics loaded directly from Firebase
  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    announcements: 0,
    donationsCount: 0,
    totalDonations: 0,
  });

  // Animation element references
  const heroRef = useRef(null);
  const heroBadgeRef = useRef(null);
  const statRowRef = useRef(null);
  const membersCountRef = useRef(null);
  const eventsCountRef = useRef(null);
  const announcementsCountRef = useRef(null);
  const donationsCountRef = useRef(null);
  const pillarsGridRef = useRef(null);
  const highlightsGridRef = useRef(null);
  const testimonialsRef = useRef(null);
  const closingCtaRef = useRef(null);

  // Toggle Telugu / English language
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  // Copy UPI ID to clipboard
  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText('anjaneyayouth@sbi');
      setCopiedUPI(true);
      setTimeout(() => setCopiedUPI(false), 2500);
    } catch {
      alert('UPI ID: anjaneyayouth@sbi');
    }
  };

  // Fetch live stats & highlights from Firebase
  useEffect(() => {
    let isMounted = true;
    const fetchLandingData = async () => {
      try {
        const [membersData, eventsData, announcementsData, donationsData] =
          await Promise.allSettled([
            dbService.members.getAll(),
            dbService.events.getAll(),
            dbService.announcements.getAll(),
            dbService.donations.getAll(),
          ]);

        if (!isMounted) return;

        const members = membersData.status === 'fulfilled' ? membersData.value : [];
        const events = eventsData.status === 'fulfilled' ? eventsData.value : [];
        const announcements = announcementsData.status === 'fulfilled' ? announcementsData.value : [];
        const donations = donationsData.status === 'fulfilled' ? donationsData.value : [];

        const approvedDonations = donations.filter(
          (d) => d.status === 'Approved' || d.status === 'Success'
        );
        const totalAmount = approvedDonations.reduce(
          (sum, d) => sum + parseFloat(d.amount || 0),
          0
        );

        setStats({
          members: members.length,
          events: events.length,
          announcements: announcements.length,
          donationsCount: approvedDonations.length,
          totalDonations: totalAmount,
        });
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    };

    fetchLandingData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Trigger Anime.js entrance animations on mount
  useEffect(() => {
    if (heroRef.current) heroEntrance(heroRef.current, { delay: 100 });
    if (heroBadgeRef.current) fadeUp(heroBadgeRef.current, { delay: 50, distance: 20 });
    if (statRowRef.current) {
      staggerScaleFade(statRowRef.current.querySelectorAll(':scope > div'), {
        stagger: 90,
        startDelay: 250,
      });
    }

    if (pillarsGridRef.current) {
      staggerFadeUp(pillarsGridRef.current.querySelectorAll(':scope > div'), {
        stagger: 100,
        startDelay: 400,
      });
    }

    if (highlightsGridRef.current) {
      staggerFadeUp(highlightsGridRef.current.querySelectorAll(':scope > div'), {
        stagger: 90,
        startDelay: 500,
      });
    }

    if (testimonialsRef.current) {
      staggerScaleFade(testimonialsRef.current.querySelectorAll(':scope > div'), {
        stagger: 100,
        startDelay: 600,
      });
    }

    if (closingCtaRef.current) {
      fadeUp(closingCtaRef.current, { delay: 700, distance: 30 });
    }
  }, []);

  // Animate count-up whenever live stats arrive from Firebase
  useEffect(() => {
    if (membersCountRef.current && stats.members > 0) {
      countUp(membersCountRef.current, stats.members, { delay: 50 });
    }
    if (eventsCountRef.current && stats.events > 0) {
      countUp(eventsCountRef.current, stats.events, { delay: 150 });
    }
    if (announcementsCountRef.current && stats.announcements > 0) {
      countUp(announcementsCountRef.current, stats.announcements, { delay: 250 });
    }
    if (donationsCountRef.current && stats.donationsCount > 0) {
      countUp(donationsCountRef.current, stats.donationsCount, { delay: 350 });
    }
  }, [stats.members, stats.events, stats.announcements, stats.donationsCount]);

  // Content Data: Core Seva Pillars
  const sevaPillars = [
    {
      icon: Flame,
      titleEn: 'Temple Seva & Hanuman Jayanthi',
      titleTe: 'దేవాలయ సేవ & హనుమాన్ జయంతి ఉత్సవాలు',
      descEn:
        'Active coordination of religious pujas, special Abhishekam, Akhanda Bhajans, and grand annual Hanuman Jayanthi Shobha Yatra in Zarugumalli Village.',
      descTe:
        'జరుగమల్లి శ్రీ ఆంజనేయ స్వామి వారి ఆలయ సేవలు, అభిషేకాలు, భజన కార్యక్రమాలు మరియు హనుమాన్ జయంతి శోభాయాత్ర నిర్వహణలో యువత సమగ్ర భాగస్వామ్యం.',
      accent: 'var(--saffron)',
      badge: language === 'en' ? 'Cultural Heritage' : 'ఆధ్యాత్మిక వైభవం',
    },
    {
      icon: Utensils,
      titleEn: 'Free Annadanam Community Feeds',
      titleTe: 'నిత్య అన్నదానం & ఆకలి తీర్చే సేవ',
      descEn:
        'Serving sanctified, nutritious food to thousands of pilgrims, villagers, and underprivileged devotees during festival occasions and community gatherings.',
      descTe:
        'ఉత్సవాల సమయంలో గ్రామానికి విచ్చేసే వేలాది మంది భక్తులకు, వృద్ధులకు మరియు నిరుపేదలకు నాణ్యమైన, పవిత్రమైన అన్నప్రసాద వితరణ.',
      accent: 'var(--gold)',
      badge: language === 'en' ? 'Mass Meals' : 'అన్నప్రసాదం',
    },
    {
      icon: Droplet,
      titleEn: 'Emergency Blood Donation Network',
      titleTe: 'ఆపద్బాంధవ రక్తదాన శిబిరాలు',
      descEn:
        'A round-the-clock emergency blood donor youth group connecting willing donors to regional hospitals across Prakasam District in critical times.',
      descTe:
        'ప్రకాశం జిల్లాలోని ఆసుపత్రులలో అత్యవసర పరిస్థితుల్లో ప్రాణాపాయంలో ఉన్న రోగులకు తక్షణమే రక్తం అందించే నిరంతర యువజన నెట్‌వర్క్.',
      accent: 'var(--devored)',
      badge: language === 'en' ? 'Life Saving' : 'ప్రాణదానం',
    },
    {
      icon: BookOpen,
      titleEn: 'Youth Leadership & Student Aid',
      titleTe: 'యువజన వికాసం & విద్యార్థుల ప్రోత్సాహం',
      descEn:
        'Distributing study kits, books, and scholarship aid to deserving rural students, while nurturing youth leadership and civic responsibility.',
      descTe:
        'గ్రామీణ విద్యార్థులకు ఉచిత నోట్‌బుక్స్, విద్యా సామగ్రి పంపిణీ మరియు గ్రామాభివృద్ధిలో యువతకు నాయకత్వ శిక్షణ.',
      accent: '#0f9f6e',
      badge: language === 'en' ? 'Education' : 'విద్యా సేవ',
    },
    {
      icon: ShieldCheck,
      titleEn: 'Village Greenery & Sanitation Drives',
      titleTe: 'గ్రామ పరిశుభ్రత & పచ్చదనం కార్యక్రమాలు',
      descEn:
        'Regular Swachh Zarugumalli cleanliness drives, temple surroundings upkeep, and tree plantation campaigns to keep our village pristine.',
      descTe:
        'స్వచ్ఛ జరుగమల్లి పరిశుభ్రతా కార్యక్రమాలు, దేవాలయ పరిసరాల శుభ్రత మరియు గ్రామంలో మొక్కలు నాటే పచ్చదనం పెంపొందింపు.',
      accent: '#2563eb',
      badge: language === 'en' ? 'Clean Village' : 'పరిశుభ్రత',
    },
    {
      icon: Banknote,
      titleEn: '100% Financial Transparency',
      titleTe: '100% పారదర్శక నిధుల నిర్వహణ',
      descEn:
        'Every donation rupee received and every expenditure incurred is openly logged and verifiable on our public digital balance sheet.',
      descTe:
        'భక్తులు మరియు దాతలు అందించే ప్రతి రూపాయి లెక్క డిజిటల్ లెడ్జర్‌లో పారదర్శకంగా నమోదు చేయబడి ప్రజలందరికీ అందుబాటులో ఉంటుంది.',
      accent: 'var(--gold-dark)',
      badge: language === 'en' ? 'Audited' : 'పారదర్శకత',
    },
  ];

  // Content Data: Feature Highlights of Portal
  const portalFeatures = [
    {
      icon: Users,
      titleEn: 'Verified Member Directory',
      titleTe: 'సభ్యుల సమగ్ర వివరాలు',
      descEn:
        'Browse profiles of registered youth members, their area/street in Zarugumalli, and committee coordinators.',
      descTe:
        'జరుగమల్లిలోని అన్ని వీధుల నుంచి నమోదైన సేవా సభ్యులు, నాయకత్వ కమిటీ వివరాలు సులభంగా వీక్షించండి.',
    },
    {
      icon: Calendar,
      titleEn: 'Live Events & Festival Calendar',
      titleTe: 'కార్యక్రమాలు & ఉత్సవాల క్యాలెండర్',
      descEn:
        'Stay informed about upcoming yajnas, community meetings, volunteer calls, and festival dates in real time.',
      descTe:
        'రాబోయే పూజా కార్యక్రమాలు, రక్తదాన శిబిరాలు మరియు ఉత్సవ తేదీల ప్రత్యక్ష సమాచారం తెలుసుకోండి.',
    },
    {
      icon: Banknote,
      titleEn: 'Digital Receipts & Expense Audits',
      titleTe: 'డిజిటల్ రసీదులు & ఖర్చుల వివరాలు',
      descEn:
        'Secure online UPI/card payments with instant downloadable digital donation receipts and public expense charts.',
      descTe:
        'ఆన్‌లైన్ ద్వారా విరాళాలు ఇచ్చి తక్షణ రసీదు పొందండి; ఖర్చు చేసిన నిధుల పూర్తి వివరాలు పరిశీలించండి.',
    },
    {
      icon: ImageIcon,
      titleEn: 'Cultural Seva Photo Gallery',
      titleTe: 'ఉత్సవ శోభాయాత్ర ఫోటో గ్యాలరీ',
      descEn:
        'High-resolution photo memories capturing our devotion, Shobha Yatra, Annadanam moments, and seva archives.',
      descTe:
        'గ్రామంలో నిర్వహించిన చారిత్రక శోభాయాత్రలు, సేవలు మరియు దేవాలయ జ్ఞాపకాల సుందర చిత్రమాలిక.',
    },
  ];

  // Content Data: Testimonials & Voices from Zarugumalli
  /* [EDITABLE_PLACEHOLDER: Testimonials & Village Voices] */
  const testimonials = [
    {
      quoteEn:
        '“The discipline and devotion shown by Sri Anjaneya Youth during Hanuman Jayanthi Annadanam is inspiring. Serving thousands without a glitch is a testament to our village unity.”',
      quoteTe:
        '“హనుమాన్ జయంతి అన్నదానం నిర్వహణలో శ్రీ ఆంజనేయ యూత్ సభ్యుల క్రమశిక్షణ, సేవా భావం శ్లాఘనీయం. వేలాది మంది భక్తులకు లోటులేకుండా ప్రసాదం అందించడం మా గ్రామ సమైక్యతకు నిదర్శనం.”',
      authorEn: 'K. Venkateswarlu',
      authorTe: 'కె. వెంకటేశ్వర్లు',
      roleEn: 'Village Elder & Devotee, Zarugumalli',
      roleTe: 'గ్రామ పెద్ద & భక్తులు, జరుగమల్లి',
      initials: 'KV',
    },
    {
      quoteEn:
        '“When a patient at Kandukur needed urgent blood at 2 AM, the youth association coordinator arranged a donor in 20 minutes. This network is genuinely saving lives.”',
      quoteTe:
        '“కందుకూరు ఆసుపత్రిలో రాత్రి 2 గంటలకు రక్తం అవసరమైనప్పుడు మన యువత 20 నిమిషాల్లో దాతను సమకూర్చారు. ఈ రక్తదాన నెట్‌వర్క్ నిజంగా అనేక కుటుంబాలకు ఆపద్బాంధవుడిగా నిలుస్తోంది.”',
      authorEn: 'R. Srinivasa Rao',
      authorTe: 'ఆర్. శ్రీనివాస రావు',
      roleEn: 'Community Healthcare Volunteer',
      roleTe: 'సామాజిక సేవా కార్యకర్త',
      initials: 'RS',
    },
    {
      quoteEn:
        '“Being able to see exactly where donations go through the public expenditure portal gives immense confidence. It is a benchmark for community organizations.”',
      quoteTe:
        '“మేము ఇచ్చిన విరాళం ప్రతి పైసా ఏ సేవకు ఖర్చు చేశారో డిజిటల్ లెడ్జర్ ద్వారా స్పష్టంగా చూడగలగడం ఎంతో సంతృప్తినిచ్చింది. ఈ పారదర్శకత ప్రశంసనీయం.”',
      authorEn: 'N. Prasad',
      authorTe: 'ఎన్. ప్రసాద్',
      roleEn: 'NRI Devotee & Seva Contributor',
      roleTe: 'ఎన్నారై భక్తులు & దాత',
      initials: 'NP',
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-hidden">
      {/* Page SEO Meta Tags */}
      <SEO
        title={language === 'en' ? 'Community Seva & Village Empowerment' : 'గ్రామ సేవ & సాంస్కృతిక వైభవం'}
        description="Sri Anjaneya Youth Association Zarugumalli — official community landing portal. Discover our temple seva, Annadanam hunger relief, blood donation camps, and village youth empowerment."
        path="/landing"
      />

      {/* Luminous Animated Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-saffron-500/15 via-gold-500/10 to-transparent rounded-full blur-[140px] animate-pulse-slow" />
        <div className="absolute top-[45%] -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-[75%] -right-32 w-96 h-96 bg-saffron-500/10 rounded-full blur-[120px]" />
      </div>

      {/* PUBLIC HEADER: Rendered if visitor is NOT authenticated */}
      {!user && (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[var(--bg-card)]/85 border-b border-[var(--border)] transition-all duration-300 shadow-sm">
          {/* Top Tri-Color Accent Line */}
          <div className="h-[3px] bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 w-full" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Brand Logo & Name */}
            <Link
              to="/landing"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-500 rounded-xl p-1"
            >
              <div className="relative shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron-500 to-gold-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <img
                  src="/icon.png"
                  alt="Sri Anjaneya Youth Zarugumalli Logo"
                  width="44"
                  height="44"
                  decoding="async"
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gold-400 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base xl:text-lg text-saffron-600 dark:text-saffron-400 tracking-tight leading-tight group-hover:text-saffron-500 transition-colors">
                  {t('websiteName')}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] sm:text-[10.5px] font-extrabold text-gold-600 dark:text-gold-400 uppercase tracking-widest leading-none">
                    {t('zarugumalli')}
                  </span>
                  <span className="text-[8.5px] sm:text-[9.5px] text-[var(--text-subtle)] font-semibold italic border-l border-[var(--border-strong)] pl-1.5 leading-none">
                    Estd. 2013
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs xl:text-sm font-bold text-[var(--text-secondary)]">
              <a
                href="#pillars"
                className="hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {language === 'en' ? 'Our Pillars' : 'సేవా రంగాలు'}
              </a>
              <a
                href="#highlights"
                className="hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {language === 'en' ? 'Community Features' : 'సౌకర్యాలు'}
              </a>
              <a
                href="#impact"
                className="hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {language === 'en' ? 'Impact & Stats' : 'గణాంకాలు'}
              </a>
              <a
                href="#transparency"
                className="hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {language === 'en' ? 'Transparency' : 'పారదర్శకత'}
              </a>
              <a
                href="#contact"
                className="hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                {language === 'en' ? 'Contact' : 'సంప్రదించండి'}
              </a>
            </nav>

            {/* Top Bar Controls & CTA Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                className="p-2 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-primary)] hover:border-saffron-400 hover:scale-105 transition-all cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-gold-400" />
                )}
              </button>

              {/* Language Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-primary)] hover:border-saffron-400 hover:scale-105 transition-all text-xs font-black cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-saffron-500" />
                <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
              </button>

              {/* Sign In */}
              <Link to="/signin" className="btn btn-ghost btn-sm">
                {t('signInBtn')}
              </Link>

              {/* Sign Up / Join */}
              <Link to="/signup" className="btn btn-primary btn-sm shadow-md">
                <span>{language === 'en' ? 'Join Youth' : 'సభ్యుడిగా చేరండి'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={toggleLanguage}
                className="p-2 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-bold text-saffron-600 cursor-pointer"
              >
                {language === 'en' ? 'తె' : 'EN'}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-gold-400" />}
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-primary)] cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden px-4 pt-2 pb-6 border-t border-[var(--border)] bg-[var(--bg-card)] space-y-3 animate-fade-in shadow-xl">
              <nav className="flex flex-col space-y-2.5 pt-2 text-sm font-bold text-[var(--text-secondary)]">
                <a
                  href="#pillars"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] hover:text-saffron-600"
                >
                  {language === 'en' ? 'Our Pillars' : 'సేవా రంగాలు'}
                </a>
                <a
                  href="#highlights"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] hover:text-saffron-600"
                >
                  {language === 'en' ? 'Community Features' : 'సౌకర్యాలు'}
                </a>
                <a
                  href="#impact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] hover:text-saffron-600"
                >
                  {language === 'en' ? 'Impact & Stats' : 'గణాంకాలు'}
                </a>
                <a
                  href="#transparency"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] hover:text-saffron-600"
                >
                  {language === 'en' ? 'Transparency' : 'పారదర్శకత'}
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] hover:text-saffron-600"
                >
                  {language === 'en' ? 'Contact' : 'సంప్రదించండి'}
                </a>
              </nav>
              <div className="pt-3 border-t border-[var(--border)] flex flex-col gap-2">
                <Link
                  to="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost w-full py-2.5 text-center text-xs font-bold"
                >
                  {t('signInBtn')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full py-2.5 text-center text-xs font-bold justify-center"
                >
                  <span>{language === 'en' ? 'Join Youth Association' : 'సభ్యుడిగా చేరండి'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </header>
      )}

      {/* AUTHENTICATED MEMBER NOTICE BANNER: If logged in user views landing */}
      {user && (
        <div className="bg-saffron-500/10 border-b border-saffron-500/20 py-2.5 px-4 text-xs font-bold text-center flex items-center justify-center gap-2 text-saffron-700 dark:text-saffron-300">
          <Sparkles className="w-3.5 h-3.5 text-gold-500" />
          <span>
            {language === 'en' ? 'Signed in as' : 'నమోదైన సభ్యులు:'}{' '}
            <strong className="text-[var(--text-primary)]">{user.name || user.email}</strong>
          </span>
          <span className="mx-1.5 opacity-40">|</span>
          <Link
            to="/"
            className="text-saffron-600 dark:text-saffron-400 hover:underline flex items-center gap-1 font-black"
          >
            <span>{language === 'en' ? 'Go to Member Dashboard' : 'డ్యాష్‌బోర్డ్‌కు వెళ్లండి'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* MAIN LANDING CONTENT */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 xl:py-16 space-y-16 sm:space-y-24 xl:space-y-32">
        {/* =========================================================================
            1. HERO SECTION
           ========================================================================= */}
        <section
          ref={heroRef}
          aria-labelledby="hero-heading"
          className="relative pt-4 sm:pt-8 pb-4 text-center space-y-6 sm:space-y-8"
        >
          {/* Top Pill Badge */}
          <div ref={heroBadgeRef} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-600 dark:text-saffron-400 text-xs sm:text-sm font-black tracking-wide shadow-sm">
              <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
              <span>
                {language === 'en'
                  ? 'Seva • Culture • Community · Zarugumalli'
                  : 'సేవ • సంస్కృతి • సమైక్యత · జరుగమల్లి'}
              </span>
            </div>
          </div>

          {/* Primary Headline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1
              id="hero-heading"
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.15]"
            >
              {language === 'en' ? (
                <>
                  Uniting Youth for Devotion,{' '}
                  <span className="text-gradient-saffron">Community Seva</span> &{' '}
                  <span className="text-gradient-gold">Village Welfare</span>
                </>
              ) : (
                <>
                  గ్రామ సేవ • దైవ భక్తి • సమాజ సంక్షేమం{' '}
                  <span className="text-gradient-saffron">సమైక్య</span>{' '}
                  <span className="text-gradient-gold">యువతరం</span>
                </>
              )}
            </h1>

            {/* Supporting Line */}
            <p className="text-sm sm:text-lg lg:text-xl text-[var(--text-secondary)] font-medium max-w-3xl mx-auto leading-relaxed">
              {language === 'en'
                ? 'Under the divine grace of Sri Anjaneya Swamy, we bring together dedicated youth in Zarugumalli Village to organize temple celebrations, mass Annadanam meals, life-saving blood donation drives, and village education aid.'
                : 'శ్రీ ఆంజనేయ స్వామి వారి కృపా కటాక్షాలతో జరుగమల్లి గ్రామంలో దేవాలయ సేవలు, ఉచిత నిత్య అన్నదానం, ఆపదలో ఆదుకునే రక్తదానం మరియు నిరుపేద విద్యార్థుల ప్రోత్సాహం కోసం మా యువత నిరంతరం పాటుపడుతోంది.'}
            </p>
          </div>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2">
            <Link
              to={user ? '/' : '/signup'}
              className="w-full sm:w-auto btn btn-primary py-3.5 px-7 text-sm sm:text-base font-black shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{user ? t('dashboard') : (language === 'en' ? 'Join Sri Anjaneya Youth' : 'సంఘంలో చేరండి')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/donate"
              className="w-full sm:w-auto btn btn-ghost py-3.5 px-6 text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:border-saffron-500 hover:text-saffron-600"
            >
              <Heart className="w-4 h-4 text-devored-500 fill-current animate-pulse" />
              <span>{t('donate')}</span>
            </Link>

            <a
              href="#pillars"
              className="w-full sm:w-auto px-5 py-3.5 text-xs sm:text-sm font-bold text-[var(--text-muted)] hover:text-saffron-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>{language === 'en' ? 'Explore Our Missions' : 'మా సేవా వివరాలు'}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Hero Visual Emblem / Trust Cards */}
          <div className="pt-6 sm:pt-10 max-w-4xl mx-auto">
            <div className="card-premium p-6 sm:p-8 relative overflow-hidden border-2 border-gold-400/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-left">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-saffron-500 via-gold-400 to-saffron-600 rounded-full blur opacity-50 animate-pulse" />
                    <img
                      src="/icon.png"
                      alt="Sri Anjaneya Youth Zarugumalli Emblem"
                      width="68"
                      height="68"
                      decoding="async"
                      className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gold-400 shadow-xl"
                    />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg xl:text-xl font-black text-[var(--text-primary)]">
                      {t('websiteName')} · {t('zarugumalli')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-0.5">
                      {language === 'en'
                        ? 'Serving Zarugumalli Village, Prakasam District, Andhra Pradesh'
                        : 'జరుగమల్లి గ్రామం, ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {language === 'en' ? 'Community Registered' : 'అధీకృత యువజన సంఘం'}
                      </span>
                      <span className="text-[11px] font-bold text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded-full border border-gold-500/20">
                        ★ {language === 'en' ? 'Active Since 2013' : '2013 నుండి నిరంతర సేవ'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-[var(--text-subtle)] font-bold block">
                      {language === 'en' ? 'Public UPI Donation' : 'డైరెక్ట్ యూపీఐ విరాళం'}
                    </span>
                    <span className="font-mono text-xs font-black text-saffron-600 dark:text-saffron-400">
                      anjaneyayouth@sbi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUPI}
                    className="btn btn-ghost btn-sm text-xs font-bold hover:border-gold-500"
                  >
                    {copiedUPI
                      ? (language === 'en' ? '✓ Copied!' : '✓ కాపీ అయింది!')
                      : (language === 'en' ? 'Copy UPI' : 'యూపీఐ కాపీ')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. STATS COUNTER ROW (Verified Impact Metrics)
           ========================================================================= */}
        <section
          id="impact"
          ref={statRowRef}
          aria-labelledby="impact-heading"
          className="space-y-6"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge badge-saffron text-xs font-bold uppercase tracking-wider">
              {language === 'en' ? 'Our Tangible Footprint' : 'సేవా విజయాలు'}
            </span>
            <h2 id="impact-heading" className="text-2xl sm:text-3xl xl:text-4xl font-black">
              {language === 'en' ? 'Impacting Lives Across Zarugumalli' : 'గ్రామంలో మా సేవలతో లభించిన ఫలితాలు'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
              {language === 'en'
                ? 'Every initiative is powered by our voluntary youth, kind-hearted village elders, and benevolent donors.'
                : 'ప్రతి సేవా కార్యక్రమం మన గ్రామ యువకుల శ్రమదానం మరియు దాతల సహకారంతో విజయవంతంగా జరుగుతోంది.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1: Registered Volunteers */}
            <div className="stat-card hover-glow-saffron" style={{ '--stat-accent': 'var(--saffron)' }}>
              <div className="stat-icon bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
                <Users className="w-6 h-6 xl:w-8 xl:h-8" />
              </div>
              <div>
                <span ref={membersCountRef} className="stat-number">
                  {stats.members}
                </span>
                <span className="stat-label">
                  {language === 'en' ? 'Active Youth Volunteers' : 'క్రియాశీలక యువ సభ్యులు'}
                </span>
              </div>
            </div>

            {/* Stat 2: Completed Events */}
            <div className="stat-card hover-glow-gold" style={{ '--stat-accent': 'var(--gold)' }}>
              <div className="stat-icon bg-gold-500/10 text-gold-600 dark:text-gold-400">
                <Calendar className="w-6 h-6 xl:w-8 xl:h-8" />
              </div>
              <div>
                <span ref={eventsCountRef} className="stat-number">
                  {stats.events}
                </span>
                <span className="stat-label">
                  {language === 'en' ? 'Festivals & Seva Events' : 'నిర్వహించిన ఉత్సవాలు'}
                </span>
              </div>
            </div>

            {/* Stat 3: Announcements */}
            <div className="stat-card hover-glow-saffron" style={{ '--stat-accent': 'var(--devored)' }}>
              <div className="stat-icon bg-devored-500/10 text-devored-600 dark:text-devored-400">
                <Bell className="w-6 h-6 xl:w-8 xl:h-8" />
              </div>
              <div>
                <span ref={announcementsCountRef} className="stat-number">
                  {stats.announcements}
                </span>
                <span className="stat-label">
                  {language === 'en' ? 'Announcements & Updates' : 'ప్రకటనలు & సమాచారం'}
                </span>
              </div>
            </div>

            {/* Stat 4: Approved Donations */}
            <div className="stat-card hover-glow-gold" style={{ '--stat-accent': '#0f9f6e' }}>
              <div className="stat-icon bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Heart className="w-6 h-6 xl:w-8 xl:h-8" />
              </div>
              <div>
                <span ref={donationsCountRef} className="stat-number">
                  {stats.donationsCount}
                </span>
                <span className="stat-label">
                  {language === 'en' ? 'Contributions Received' : 'అందిన విరాళాలు'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. KEY VALUE POINTS / CORE PILLARS OF SERVICE
           ========================================================================= */}
        <section
          id="pillars"
          aria-labelledby="pillars-heading"
          className="space-y-8 sm:space-y-12"
        >
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="badge badge-saffron text-xs font-bold uppercase tracking-wider">
              {language === 'en' ? 'Foundational Values' : 'మా సేవా మూలస్తంభాలు'}
            </span>
            <h2 id="pillars-heading" className="text-2xl sm:text-4xl xl:text-5xl font-black">
              {language === 'en' ? 'Pillars of Sri Anjaneya Youth' : 'మా సంఘం అనుసరించే ధ్యేయాలు'}
            </h2>
            <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
              {language === 'en'
                ? 'We believe in selfless service (Nishkama Seva), cultural preservation, emergency relief, and village togetherness.'
                : 'నిష్కామ కర్మ, ఆధ్యాత్మిక సాంస్కృతిక విలువల పరిరక్షణ మరియు గ్రామ సంక్షేమమే లక్ష్యంగా మా ప్రతి అడుగు పడుతోంది.'}
            </p>
          </div>

          <div
            ref={pillarsGridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8"
          >
            {sevaPillars.map((pillar, idx) => {
              const IconComp = pillar.icon;
              return (
                <article
                  key={idx}
                  className="card-premium p-6 sm:p-7 flex flex-col justify-between group hover-lift transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                        style={{
                          backgroundColor: `${pillar.accent}18`,
                          color: pillar.accent,
                        }}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-muted)]">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] group-hover:text-saffron-600 transition-colors">
                      {language === 'en' ? pillar.titleEn : pillar.titleTe}
                    </h3>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                      {language === 'en' ? pillar.descEn : pillar.descTe}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-gold-600 dark:text-gold-400">
                    <span>{language === 'en' ? 'Dedicated Seva' : 'నిరంతర సేవ'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. DIGITAL COMMUNITY FEATURES & HIGHLIGHTS
           ========================================================================= */}
        <section
          id="highlights"
          aria-labelledby="highlights-heading"
          className="space-y-8 sm:space-y-12"
        >
          <div className="card-premium p-6 sm:p-10 xl:p-14 relative overflow-hidden bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-saffron-500/5">
            <div className="max-w-3xl space-y-3 mb-10">
              <span className="badge badge-saffron text-xs font-bold uppercase tracking-wider">
                {language === 'en' ? 'Modern Community Platform' : 'డిజిటల్ సేవలు'}
              </span>
              <h2 id="highlights-heading" className="text-2xl sm:text-4xl font-black">
                {language === 'en'
                  ? 'Built for Every Villager, Volunteer & Devotee'
                  : 'గ్రామస్తులందరికీ సులభంగా అందుబాటులో ఉండే డిజిటల్ పోర్టల్'}
              </h2>
              <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
                {language === 'en'
                  ? 'Our web application bridges the gap between traditional village seva and modern convenience, offering full transparency and bilingual access.'
                  : 'మా పోర్టల్ ద్వారా సభ్యుల వివరాలు, దేవాలయ కార్యక్రమాలు మరియు విరాళాల ఖర్చులు పారదర్శకంగా తెలుగు మరియు ఆంగ్లంలో ఎవరైనా పరిశీలించవచ్చు.'}
              </p>
            </div>

            <div
              ref={highlightsGridRef}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:gap-8"
            >
              {portalFeatures.map((feat, idx) => {
                const FeatIcon = feat.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-muted)]/70 border border-[var(--border)] space-y-3 hover:border-gold-400 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-saffron-500/10 text-saffron-600 dark:text-saffron-400 flex items-center justify-center shrink-0">
                        <FeatIcon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        {language === 'en' ? feat.titleEn : feat.titleTe}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                      {language === 'en' ? feat.descEn : feat.descTe}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>
                  {language === 'en'
                    ? 'Secure Firebase Authentication & Cloud Database'
                    : 'సురక్షితమైన ఆధునిక ఫైర్‌బేస్ క్లౌడ్ డేటాబేస్ భద్రత'}
                </span>
              </div>
              <Link
                to={user ? '/members' : '/signin'}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <span>{language === 'en' ? 'Access Member Portal' : 'పోర్టల్ ప్రవేశించండి'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FINANCIAL STEWARDSHIP & TRANSPARENCY SHOWCASE
           ========================================================================= */}
        <section
          id="transparency"
          aria-labelledby="transparency-heading"
          className="welcome-banner rounded-3xl p-6 sm:p-10 xl:p-12 relative overflow-hidden"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-4">
              <span className="badge badge-saffron text-xs px-3 py-1">
                <Banknote className="w-3.5 h-3.5 text-saffron-500" />
                {language === 'en' ? 'Open Governance' : 'సంపూర్ణ పారదర్శకత'}
              </span>
              <h2 id="transparency-heading" className="text-2xl sm:text-4xl font-black">
                {language === 'en'
                  ? 'Zero Secrets. Every Rupee Accounted For.'
                  : 'ప్రతి పైసా సేవకే అంకితం — లెక్కలు బహిరంగం'}
              </h2>
              <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed max-w-2xl">
                {language === 'en'
                  ? 'We maintain public audit logs of all donations received and all expenditures incurred during Annadanam, Shobha Yatra, and village seva. View our live expenditure balance sheet anytime.'
                  : 'అన్నదానం, విద్యుత్ దీపాలంకరణ, శోభాయాత్ర మరియు గ్రామ సేవల ఖర్చుల వివరాలన్నీ మా వెబ్‌సైట్ ద్వారా ప్రజలందరి సమక్షంలో బహిరంగంగా ప్రదర్శిస్తున్నాము.'}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/expenditure" className="btn btn-primary btn-sm sm:btn-md shadow-md">
                  <Banknote className="w-4 h-4" />
                  <span>{language === 'en' ? 'View Public Expenditure' : 'ఖర్చుల వివరాలు చూడండి'}</span>
                </Link>
                <Link to="/donate" className="btn btn-ghost btn-sm sm:btn-md">
                  <Heart className="w-4 h-4 text-devored-500" />
                  <span>{t('supportSeva')}</span>
                </Link>
              </div>
            </div>

            <div className="card p-6 space-y-4 border-2 border-gold-400/40 shadow-lg text-center lg:text-left">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                {language === 'en' ? 'Live Seva Statistics' : 'ప్రత్యక్ష సేవా గణాంకాలు'}
              </h3>
              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">
                    {language === 'en' ? 'Total Contributions Logged' : 'మొత్తం నమోదైన విరాళాలు'}
                  </span>
                  <span className="font-mono text-saffron-600 font-bold">
                    ₹{stats.totalDonations.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">
                    {language === 'en' ? 'Verified Seva Donations' : 'ధృవీకరించిన విరాళాలు'}
                  </span>
                  <span className="font-mono text-gold-600 font-bold">
                    {stats.donationsCount}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">
                    {language === 'en' ? 'Registered Youth Volunteers' : 'క్రియాశీలక సభ్యులు'}
                  </span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {stats.members}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold text-devored-600">
                  <span>{language === 'en' ? 'Admin / Overhead' : 'నిర్వహణ ఖర్చులు'}</span>
                  <span className="font-mono">
                    0% ({language === 'en' ? '100% Voluntary' : 'పూర్తిగా స్వచ్ఛంద సేవ'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. SOCIAL PROOF / VOICES FROM THE VILLAGE
           ========================================================================= */}
        <section
          aria-labelledby="testimonials-heading"
          className="space-y-8 sm:space-y-12"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge badge-saffron text-xs font-bold uppercase tracking-wider">
              {language === 'en' ? 'Community Trust' : 'గ్రామస్తుల ఆదరాభిమానాలు'}
            </span>
            <h2 id="testimonials-heading" className="text-2xl sm:text-4xl font-black">
              {language === 'en' ? 'Voices From Zarugumalli' : 'గ్రామ ప్రజల మరియు భక్తుల అనుభవాలు'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
              {language === 'en'
                ? 'What villagers, elders, and contributors say about Sri Anjaneya Youth.'
                : 'మన సంఘం అందిస్తున్న నిస్వార్థ సేవపై గ్రామ పెద్దలు మరియు దాతల మాటలు.'}
            </p>
          </div>

          <div
            ref={testimonialsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 xl:gap-8"
          >
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="card-premium p-6 sm:p-7 flex flex-col justify-between space-y-5 hover-lift"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold-500">
                    {'★'.repeat(5)}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic font-medium leading-relaxed">
                    {language === 'en' ? item.quoteEn : item.quoteTe}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-saffron-500 to-gold-400 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {language === 'en' ? item.authorEn : item.authorTe}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] font-medium">
                      {language === 'en' ? item.roleEn : item.roleTe}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            7. CLOSING CALL TO ACTION (The Grand Seva Invitation)
           ========================================================================= */}
        <section
          ref={closingCtaRef}
          aria-labelledby="cta-heading"
          className="relative max-w-4xl mx-auto"
        >
          {/* Glowing Aura Outer Border */}
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-saffron-500 via-gold-400 to-devored-600 opacity-60 blur-xl animate-pulse-slow" />

          {/* Central Ornate Card */}
          <div className="relative bg-[var(--bg-card)] border-2 border-gold-500/60 rounded-[28px] shadow-2xl overflow-hidden p-6 sm:p-10 xl:p-14 text-center space-y-6">
            {/* Ornate Filigree Corner Accents */}
            <div className="absolute top-3 left-4 text-gold-500/70 text-[10px] sm:text-xs select-none font-serif tracking-widest hidden sm:block">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute top-3 right-4 text-gold-500/70 text-[10px] sm:text-xs select-none font-serif tracking-widest hidden sm:block">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute bottom-3 left-4 text-gold-500/70 text-[10px] sm:text-xs select-none font-serif tracking-widest hidden sm:block">
              ✦ ── ✤ ── ✦
            </div>
            <div className="absolute bottom-3 right-4 text-gold-500/70 text-[10px] sm:text-xs select-none font-serif tracking-widest hidden sm:block">
              ✦ ── ✤ ── ✦
            </div>

            {/* Emblem icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full blur opacity-40 animate-pulse" />
                <img
                  src="/icon.png"
                  alt="Sri Anjaneya Swamy Association Emblem"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-gold-400 shadow-xl"
                />
              </div>
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h2
                id="cta-heading"
                className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tight"
              >
                {language === 'en'
                  ? 'Join Hands for Seva, Culture & Village Progress'
                  : 'జరుగమల్లి సేవలో మాతో కలిసి అడుగేయండి'}
              </h2>
              <p className="text-xs sm:text-base text-[var(--text-secondary)] font-medium leading-relaxed">
                {language === 'en'
                  ? 'Whether you reside in Zarugumalli, work elsewhere in India, or live abroad as a global devotee — your support and enthusiasm strengthen our village and preserve our heritage.'
                  : 'మీరు జరుగమల్లిలో ఉన్నా లేదా దేశ విదేశాలలో నివసిస్తున్నా, మన గ్రామ అభివృద్ధిలో మరియు ఆలయ సంస్కృతి పరిరక్షణలో మీ వంతు చేయూత అందించండి.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to={user ? '/' : '/signup'}
                className="w-full sm:w-auto btn btn-primary py-3.5 px-8 text-sm sm:text-base font-black shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>{user ? t('dashboard') : (language === 'en' ? 'Register as a Youth Member' : 'యువజన సభ్యుడిగా చేరండి')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/donate"
                className="w-full sm:w-auto btn btn-ghost py-3.5 px-7 text-sm sm:text-base font-bold flex items-center justify-center gap-2 hover:border-gold-500"
              >
                <Heart className="w-4 h-4 text-devored-500 fill-current" />
                <span>{language === 'en' ? 'Make a Contribution' : 'విరాళం అందించండి'}</span>
              </Link>
            </div>

            <p className="text-[11px] sm:text-xs text-[var(--text-subtle)] font-medium pt-2">
              &ldquo;{t('unitedQuote')}&rdquo;
            </p>
          </div>
        </section>

        {/* =========================================================================
            8. CONTACT & LOCATION SECTION
           ========================================================================= */}
        <section
          id="contact"
          aria-labelledby="contact-heading"
          className="space-y-6 pt-6"
        >
          <div className="card p-6 sm:p-8 xl:p-10 border border-[var(--border)]">
            <h2
              id="contact-heading"
              className="text-lg sm:text-xl font-black text-[var(--text-primary)] flex items-center gap-2.5 border-b border-[var(--border)] pb-4"
            >
              <MapPin className="w-5 h-5 text-saffron-500" />
              <span>{t('reachUsTitle')}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-1">
                    {t('officeAddressLabel')}
                  </span>
                  <span className="text-[var(--text-muted)] font-medium leading-relaxed">
                    {language === 'en'
                      ? 'Near Hanuman Statue, Main Road, Zarugumalli Village, Zarugumalli Mandal, Prakasam Dist, Andhra Pradesh - 523274'
                      : 'శ్రీ ఆంజనేయ స్వామి విగ్రహం దగ్గర, మెయిన్ రోడ్డు, జరుగమల్లి, ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్ - 523274'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-1">
                    {t('callCoordinatorLabel')}
                  </span>
                  <a
                    href="tel:+918185851424"
                    className="font-semibold text-saffron-600 dark:text-saffron-400 hover:underline block text-sm"
                  >
                    +91 81858 51424
                  </a>
                  <span className="text-[11px] text-[var(--text-subtle)]">
                    {language === 'en' ? 'Available 8 AM - 9 PM IST' : 'ఉదయం 8 నుండి రాత్రి 9 వరకు'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-1">
                    {t('emailSupportLabel')}
                  </span>
                  <a
                    href="mailto:srianjaneyayouth09@gmail.com"
                    className="font-semibold text-saffron-600 dark:text-saffron-400 hover:underline block text-sm"
                  >
                    srianjaneyayouth09@gmail.com
                  </a>
                  <span className="text-[11px] text-[var(--text-subtle)]">
                    {language === 'en' ? 'Official Inquiries & Volunteer Support' : 'అధికారిక విచారణలు & సేవా సమాచారం'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PUBLIC FOOTER: Rendered when user is a guest (App.jsx Footer renders when user is logged in) */}
      {!user && (
        <footer className="mt-12 sm:mt-20 border-t border-[var(--border)] bg-[var(--bg-card)] relative z-10">
          <div className="h-[3px] bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 xl:py-14 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
              {/* Brand Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src="/icon.png"
                    alt="Sri Anjaneya Youth Zarugumalli Logo"
                    width="40"
                    height="40"
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full object-cover border border-saffron-300/50"
                  />
                  <div>
                    <span className="block font-black text-base text-saffron-600 leading-tight">
                      {t('websiteName')}
                    </span>
                    <span className="block text-[10px] font-bold text-gold-600 uppercase tracking-widest">
                      {t('zarugumalli')}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
                  {t('jaiHanumanDesc')}
                </p>
                <p className="text-xs italic text-gold-600 font-semibold">
                  &ldquo;{t('unitedQuote')}&rdquo;
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                  {t('quickLinks')}
                </h3>
                <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs sm:text-sm font-medium">
                  <li>
                    <a href="#pillars" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {language === 'en' ? 'Our Pillars' : 'సేవా రంగాలు'}
                    </a>
                  </li>
                  <li>
                    <a href="#impact" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {language === 'en' ? 'Impact Numbers' : 'గణాంకాలు'}
                    </a>
                  </li>
                  <li>
                    <a href="#transparency" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {language === 'en' ? 'Transparency' : 'పారదర్శకత'}
                    </a>
                  </li>
                  <li>
                    <Link to="/donate" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {t('donate')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/signin" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {t('signInBtn')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className="text-[var(--text-muted)] hover:text-saffron-600 transition-colors">
                      {language === 'en' ? 'Sign Up' : 'నమోదు'}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Sacred Temple Location */}
              <div className="space-y-4">
                <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                  {language === 'en' ? 'Sacred Seva Center' : 'ఆలయ వివరాలు'}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {language === 'en'
                    ? 'Sri Anjaneya Swamy Temple, Main Bazaar, Zarugumalli Village, Prakasam District, Andhra Pradesh - 523274.'
                    : 'శ్రీ ఆంజనేయ స్వామి దేవాలయం, మెయిన్ బజార్, జరుగమల్లి గ్రామం, ప్రకాశం జిల్లా, ఆంధ్రప్రదేశ్ - 523274.'}
                </p>
                <div className="text-xs text-gold-600 font-bold">
                  UPI: anjaneyayouth@sbi
                </div>
              </div>
            </div>

            {/* Traditional Shloka Divider */}
            <div className="my-6">
              <div className="traditional-divider">
                <div className="traditional-divider-dot" />
              </div>
              <p className="text-center text-xs sm:text-sm text-[var(--text-subtle)] italic max-w-lg mx-auto leading-relaxed mt-3">
                &ldquo;{t('hanumanShlokaPart1')}&rdquo;<br />
                &ldquo;{t('hanumanShlokaPart2')}&rdquo;
              </p>
            </div>

            {/* Copyright & Credits */}
            <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-subtle)]">
              <p>
                &copy; {new Date().getFullYear()} {t('websiteName')} {t('zarugumalli')}. {t('footerRights')}
              </p>
              <p className="flex items-center gap-1.5 font-semibold">
                {t('footerCredits')}
                <Heart className="w-3.5 h-3.5 text-devored-500 fill-current animate-pulse" />
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Landing;
