import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService, authService } from '../firebase/config';
import { 
  Users, Calendar, Bell, Heart, MapPin, Mail, Phone, Info, ChevronRight, 
  MessageSquare, Award, Sparkles, Shield, ArrowRight 
} from 'lucide-react';
import SEO from '../components/SEO';
import { heroEntrance, staggerScaleFade, staggerFadeUp, staggerSlideLeft, fadeUp, countUp } from '../utils/animate';

const Dashboard = () => {
  const { user, checkEmailVerification } = useAuth();
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({ members: 0, events: 0, announcements: 0, donationCount: 0, totalAmount: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animation refs
  const heroRef = useRef(null);
  const statCardsRef = useRef(null);
  const membersCountRef = useRef(null);
  const eventsCountRef = useRef(null);
  const announcementsCountRef = useRef(null);
  const eventsGridRef = useRef(null);
  const announcementsListRef = useRef(null);
  const galleryGridRef = useRef(null);
  const sidebarRef = useRef(null);
  const sevaRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [members, events, announcements, gallery, donations] = await Promise.all([
          dbService.members.getAll(),
          dbService.events.getAll(),
          dbService.announcements.getAll(),
          dbService.gallery.getAll(),
          dbService.donations.getAll()
        ]);

        const upcoming = events.filter(e => e.status === 'upcoming');
        const successfulDonations = donations.filter(d => d.status === 'Success');
        const totalAmount = successfulDonations.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

        setStats({
          members: members.length,
          events: upcoming.length,
          announcements: announcements.length,
          donationCount: successfulDonations.length,
          totalAmount: totalAmount
        });

        setUpcomingEvents(upcoming.slice(0, 2));
        setRecentAnnouncements(announcements.slice(0, 2));
        setGalleryPreview(gallery.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (heroRef.current) heroEntrance(heroRef.current, { delay: 0 });
    if (statCardsRef.current) {
      staggerScaleFade(statCardsRef.current.querySelectorAll(':scope > div'), { stagger: 100, startDelay: 200 });
    }
    if (membersCountRef.current) countUp(membersCountRef.current, stats.members, { delay: 350 });
    if (eventsCountRef.current) countUp(eventsCountRef.current, stats.events, { delay: 450 });
    if (announcementsCountRef.current) countUp(announcementsCountRef.current, stats.announcements, { delay: 550 });
    if (eventsGridRef.current) staggerFadeUp(eventsGridRef.current.querySelectorAll(':scope > div'), { stagger: 80, startDelay: 400 });
    if (announcementsListRef.current) staggerSlideLeft(announcementsListRef.current.querySelectorAll(':scope > div'), { stagger: 80, startDelay: 500 });
    if (galleryGridRef.current) staggerScaleFade(galleryGridRef.current.querySelectorAll(':scope > div'), { stagger: 60, startDelay: 600 });
    if (sidebarRef.current) fadeUp(sidebarRef.current, { delay: 300, distance: 20 });
    if (sevaRef.current) fadeUp(sevaRef.current, { delay: 700 });
  }, [loading, stats]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-saffron-200 dark:border-saffron-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-saffron-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">{t('loadingDashboard')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 w-full">
      <SEO title="Dashboard" description="Your Sri Anjaneya Youth Zarugumalli member dashboard — view upcoming events, recent announcements, gallery highlights and community news." path="/" />
      
      {/* Email Verification Banner */}
      {user && !user.emailVerified && !authService.isMock && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-300">
            <Info className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <span className="font-black text-[13px]">Your email address is not verified.</span>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">Please click the link sent to your inbox, then click "I Have Verified" below.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await checkEmailVerification();
                  if (res && res.isVerified) {
                    alert("🎉 Email verified successfully! Your account status has been updated.");
                  } else {
                    alert("Email is not verified yet. Please check your inbox/spam folder and click the verification link first.");
                  }
                } catch (e) {
                  alert("Verification check error: " + e.message);
                }
              }}
              className="btn btn-gold btn-sm"
            >
              I Have Verified
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await authService.sendVerificationEmail();
                  alert("Verification link has been sent to your email address!");
                } catch (e) {
                  alert("Failed to send verification link: " + e.message);
                }
              }}
              className="btn btn-ghost btn-sm"
            >
              Resend Link
            </button>
          </div>
        </div>
      )}

      {/* Devotional Hero Greeting */}
      <div ref={heroRef} style={{ opacity: 0 }} className="welcome-banner rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="badge badge-saffron">
              <Sparkles className="w-3 h-3 text-saffron-500" />
              {t('jaiHanuman')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t('welcome')}, <span className="gold-gradient-text">{user ? user.name : t('bhaktha')}</span>!
          </h1>
          <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-2xl text-[var(--text-secondary)]">
            {t('jaiHanumanDesc')}
          </p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div ref={statCardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="stat-card hover-glow-saffron" style={{ '--stat-accent': 'var(--saffron)' }}>
          <div className="stat-icon bg-saffron-500/10 text-saffron-600 dark:text-saffron-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span ref={membersCountRef} className="stat-number">{stats.members}</span>
            <span className="stat-label">{t('youthMembers')}</span>
          </div>
        </div>

        <div className="stat-card hover-glow-gold" style={{ '--stat-accent': 'var(--gold)' }}>
          <div className="stat-icon bg-gold-500/10 text-gold-600 dark:text-gold-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span ref={eventsCountRef} className="stat-number">{stats.events}</span>
            <span className="stat-label">{t('upcomingEvents')}</span>
          </div>
        </div>

        <div className="stat-card hover-glow-saffron" style={{ '--stat-accent': 'var(--devored)' }}>
          <div className="stat-icon bg-devored-500/10 text-devored-600 dark:text-devored-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <span ref={announcementsCountRef} className="stat-number">{stats.announcements}</span>
            <span className="stat-label">{t('announcements')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Events Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="section-header mb-0">
                <div className="section-icon">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2>{t('upcomingEvents')}</h2>
              </div>
              <Link to="/events" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div ref={eventsGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="card-premium p-5 flex flex-col group">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="badge badge-saffron">
                        {event.date}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 truncate group-hover:text-saffron-600 transition-colors">{event.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">{event.description}</p>
                    <div className="text-[11px] text-[var(--text-subtle)] font-medium flex items-center gap-1 mt-auto">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-[var(--text-muted)] text-xs border-dashed">
                No upcoming events scheduled right now. Check back soon!
              </div>
            )}
          </div>

          {/* Announcements Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="section-header mb-0">
                <div className="section-icon">
                  <Bell className="w-4 h-4" />
                </div>
                <h2>{t('latestAnnouncements')}</h2>
              </div>
              <Link to="/announcements" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentAnnouncements.length > 0 ? (
              <div ref={announcementsListRef} className="space-y-3">
                {recentAnnouncements.map(ann => (
                  <div key={ann.id} className="card p-4 flex gap-3 hover-lift">
                    <div className="bg-saffron-500/10 text-saffron-600 rounded-xl p-2.5 h-10 w-10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-bold text-[var(--text-primary)] mb-1 truncate">{ann.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">{ann.message}</p>
                      <span className="text-[10px] text-[var(--text-subtle)] font-medium mt-1 block">
                        Posted on {new Date(ann.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-[var(--text-muted)] text-xs border-dashed">
                No recent announcements.
              </div>
            )}
          </div>

          {/* Seva / Donation Section */}
          <div ref={sevaRef} style={{ opacity: 0 }} className="seva-section rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="bg-saffron-500 text-white p-2.5 rounded-xl">
                  <Heart className="w-5 h-5 fill-current animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[var(--text-primary)]">{t('donations')}</h2>
                  <p className="text-xs text-[var(--text-muted)]">{t('donationsDashboardDesc')}</p>
                </div>
              </div>
              <Link 
                to="/donate" 
                className="btn btn-primary btn-sm shrink-0"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                {t('donate')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-4.5 flex items-center gap-4 hover-lift">
                <div className="bg-saffron-500/10 p-3 rounded-xl text-saffron-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xl font-black text-[var(--text-primary)]">{stats.donationCount}</span>
                  <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('numberDonations')}</span>
                </div>
              </div>

              <div className="card p-4.5 flex items-center gap-4 hover-lift">
                <div className="bg-gold-500/10 p-3 rounded-xl text-gold-600">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="block text-xl font-black text-[var(--text-primary)]">
                    ₹{stats.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-wider">{t('totalAmountDonated')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Highlights */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="section-header mb-0">
                <div className="section-icon">
                  <Award className="w-4 h-4" />
                </div>
                <h2>{t('galleryHighlights')}</h2>
              </div>
              <Link to="/gallery" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('gallery')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {galleryPreview.length > 0 ? (
              <div ref={galleryGridRef} className="grid grid-cols-3 gap-3">
                {galleryPreview.map(item => (
                  <div key={item.id} className="relative rounded-2xl overflow-hidden aspect-video group shadow-sm hover-lift">
                    <img 
                      src={item.imageUrl} 
                      alt={item.caption} 
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2.5 flex items-end">
                      <p className="text-[10px] text-white font-medium truncate">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center text-[var(--text-muted)] text-xs border-dashed">
                No images uploaded yet.
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column */}
        <div ref={sidebarRef} style={{ opacity: 0 }} className="space-y-8">
          
          {/* About Section */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <Info className="w-5 h-5 text-saffron-500" />
              {t('aboutUsTitle')}
            </h2>
            <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
              <p>{t('aboutPara1')}</p>
              <p>{t('aboutPara2')}</p>
              <p>{t('aboutPara3')}</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <MapPin className="w-5 h-5 text-saffron-500" />
              {t('reachUsTitle')}
            </h2>
            <div className="space-y-3.5 text-xs text-[var(--text-secondary)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-0.5">{t('officeAddressLabel')}</span>
                  <span className="font-medium text-[var(--text-muted)]">{t('officeAddressVal')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-0.5">{t('callCoordinatorLabel')}</span>
                  <a href="tel:+919494994949" className="hover:text-saffron-600 font-semibold transition-colors">+91 94949 94949</a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-[var(--text-primary)] mb-0.5">{t('emailSupportLabel')}</span>
                  <a href="mailto:info@srianjaneyayouth.org" className="hover:text-saffron-600 font-semibold transition-colors font-medium">info@srianjaneyayouth.org</a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
