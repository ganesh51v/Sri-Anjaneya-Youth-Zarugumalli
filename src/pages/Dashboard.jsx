import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../firebase/config';
import { Users, Calendar, Bell, Heart, MapPin, Mail, Phone, Info, ChevronRight, MessageSquare, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({ members: 0, events: 0, announcements: 0, donationCount: 0, totalAmount: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // Take top 2 upcoming events
        setUpcomingEvents(upcoming.slice(0, 2));
        // Take top 2 announcements
        setRecentAnnouncements(announcements.slice(0, 2));
        // Take top 3 gallery images
        setGalleryPreview(gallery.slice(0, 3));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-saffron-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-saffron-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-medium">{t('loadingDashboard')}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Devotional Hero Greeting */}
      <div className="welcome-banner rounded-3xl p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
        {/* Decorative background radial pattern */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-saffron-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2.5">
          <span className="badge inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {t('jaiHanuman')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('welcome')}, {user ? user.name : t('bhaktha')}!
          </h1>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed max-w-2xl">
            {t('jaiHanumanDesc')}
          </p>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-cream-200 p-5 rounded-2xl flex items-center gap-4 hover:border-saffron-300 transition-colors shadow-sm">
          <div className="bg-saffron-100 p-3 rounded-xl text-saffron-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-800">{stats.members}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('youthMembers')}</span>
          </div>
        </div>

        <div className="bg-white border border-cream-200 p-5 rounded-2xl flex items-center gap-4 hover:border-saffron-300 transition-colors shadow-sm">
          <div className="bg-gold-100 p-3 rounded-xl text-gold-700">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-800">{stats.events}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('upcomingEvents')}</span>
          </div>
        </div>

        <div className="bg-white border border-cream-200 p-5 rounded-2xl flex items-center gap-4 hover:border-saffron-300 transition-colors shadow-sm">
          <div className="bg-devored-100 p-3 rounded-xl text-devored-700">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-800">{stats.announcements}</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('announcements')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left & Middle Column (Events, Announcements, Seva, Gallery) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upcoming Events Widget */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-saffron-500" />
                {t('upcomingEvents')}
              </h2>
              <Link to="/events" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="bg-white border border-cream-200 rounded-2xl p-5 hover:border-saffron-300 transition-all flex flex-col shadow-sm">
                    <span className="text-[10px] bg-saffron-50 text-saffron-700 border border-saffron-100 px-2 py-0.5 rounded-full font-bold uppercase w-max mb-3">
                      {event.date}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 mb-2 truncate">{event.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{event.description}</p>
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-auto">
                      <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-cream-50 border border-dashed border-cream-300 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No upcoming events scheduled right now. Check back soon!
              </div>
            )}
          </div>

          {/* Announcements Widget */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Bell className="w-5 h-5 text-saffron-500" />
                {t('latestAnnouncements')}
              </h2>
              <Link to="/announcements" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentAnnouncements.length > 0 ? (
              <div className="space-y-3">
                {recentAnnouncements.map(ann => (
                  <div key={ann.id} className="bg-white border border-cream-200 rounded-2xl p-4 hover:border-saffron-300 transition-all flex gap-3 shadow-sm">
                    <div className="bg-saffron-50 text-saffron-600 rounded-xl p-2.5 h-10 w-10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 mb-1">{ann.title}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{ann.message}</p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                        Posted on {new Date(ann.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-cream-50 border border-dashed border-cream-300 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No recent announcements.
              </div>
            )}
          </div>

          {/* Donation Stats Section */}
          <div className="seva-section rounded-3xl p-6 sm:p-8 space-y-5 relative shadow-inner">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="bg-saffron-500 text-white p-2.5 rounded-xl">
                  <Heart className="w-6 h-6 fill-current animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800">{t('donations')}</h2>
                  <p className="text-xs text-slate-500">{t('donationsDashboardDesc')}</p>
                </div>
              </div>
              <Link 
                to="/donate" 
                className="text-xs px-4.5 py-2.5 saffron-gradient-btn rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-saffron-500/10 hover:scale-105 transition-all shrink-0"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                {t('donate')}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Donations */}
              <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="bg-saffron-100 dark:bg-saffron-950/40 p-3 rounded-xl text-saffron-600">
                  <Users className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="block text-xl font-black text-slate-800 dark:text-white">{stats.donationCount}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('numberDonations')}</span>
                </div>
              </div>

              {/* Total Amount Donated */}
              <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4.5 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="bg-gold-100 dark:bg-gold-950/40 p-3 rounded-xl text-gold-600">
                  <Heart className="w-5.5 h-5.5 fill-current" />
                </div>
                <div>
                  <span className="block text-xl font-black text-slate-800 dark:text-white">
                    ₹{stats.totalAmount.toLocaleString('en-IN')}.00
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('totalAmountDonated')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Preview */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-saffron-500" />
                {t('galleryHighlights')}
              </h2>
              <Link to="/gallery" className="text-xs font-bold text-saffron-600 hover:underline flex items-center gap-0.5">
                {t('gallery')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {galleryPreview.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {galleryPreview.map(item => (
                  <div key={item.id} className="relative rounded-xl overflow-hidden aspect-video group shadow-sm">
                    <img 
                      src={item.imageUrl} 
                      alt={item.caption} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex items-end">
                      <p className="text-[9px] text-white font-medium truncate">{item.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-cream-50 border border-dashed border-cream-300 rounded-2xl p-8 text-center text-slate-400 text-xs">
                No images uploaded yet.
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar Column (About, Contact Details) */}
        <div className="space-y-8">
          
          {/* About Section */}
          <div className="bg-white border border-cream-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-cream-100 pb-3">
              <Info className="w-5 h-5 text-saffron-500" />
              {t('aboutUsTitle')}
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-semibold">
              <p>{t('aboutPara1')}</p>
              <p>{t('aboutPara2')}</p>
              <p>{t('aboutPara3')}</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white border border-cream-200 rounded-3xl p-6 space-y-4 shadow-sm">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-cream-100 pb-3">
              <MapPin className="w-5 h-5 text-saffron-500" />
              {t('reachUsTitle')}
            </h2>
            <div className="space-y-3.5 text-xs text-slate-600 font-semibold">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-800 mb-0.5">{t('officeAddressLabel')}</span>
                  <span className="font-medium">{t('officeAddressVal')}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-800 mb-0.5">{t('callCoordinatorLabel')}</span>
                  <a href="tel:+919494994949" className="hover:text-saffron-500 font-semibold transition-colors">+91 94949 94949</a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-800 mb-0.5">{t('emailSupportLabel')}</span>
                  <a href="mailto:info@srianjaneyayouth.org" className="hover:text-saffron-500 font-semibold transition-colors font-medium">info@srianjaneyayouth.org</a>
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
