import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../firebase/config';
import { Menu, X, Home, Users, Calendar, Image, Bell, User, Settings, LogOut, ChevronDown, ShieldAlert, Globe, Sun, Moon, Heart, Banknote } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeNotification, setActiveNotification] = useState(null);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications for the notification center
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await dbService.announcements.getAll();
        setNotifications(data);
        const readIds = JSON.parse(localStorage.getItem('sa_read_announcements') || '[]');
        const unread = data.filter(ann => !readIds.includes(ann.id)).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error(err);
      }
    };

    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllAsRead = () => {
    const allIds = notifications.map(ann => ann.id);
    localStorage.setItem('sa_read_announcements', JSON.stringify(allIds));
    setUnreadCount(0);
  };

  const readNotification = (ann) => {
    const readIds = JSON.parse(localStorage.getItem('sa_read_announcements') || '[]');
    if (!readIds.includes(ann.id)) {
      readIds.push(ann.id);
      localStorage.setItem('sa_read_announcements', JSON.stringify(readIds));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setActiveNotification(ann);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { name: t('dashboard'), path: '/', icon: Home, show: !!user },
    { name: t('members'), path: '/members', icon: Users, show: !!user },
    { name: t('events'), path: '/events', icon: Calendar, show: !!user },
    { name: t('gallery'), path: '/gallery', icon: Image, show: !!user },
    { name: t('announcements'), path: '/announcements', icon: Bell, show: !!user },
    { name: t('donate'), path: '/donate', icon: Heart, show: !!user },
    { name: 'Expenditure', path: '/expenditure', icon: Banknote, show: !!user },
  ];

  const activeClass = (path) => 
    location.pathname === path 
      ? 'bg-saffron-500/10 text-saffron-600 dark:bg-saffron-500/15 dark:text-saffron-400 font-semibold' 
      : 'text-slate-600 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-saffron-500/5 dark:hover:bg-saffron-500/5 transition-all duration-200';

  const activeMobileClass = (path) => 
    location.pathname === path 
      ? 'bg-saffron-500/10 text-saffron-600 dark:bg-saffron-500/15 dark:text-saffron-400 font-bold shadow-sm' 
      : 'text-slate-700 dark:text-slate-300 hover:bg-cream-100 dark:hover:bg-slate-800 hover:text-saffron-600 font-semibold';

  if (!user) return null; // Don't show navbar if not logged in

  return (
    <div className="w-full flex justify-center sticky top-3 z-50 px-4">
      {/* Floating glassmorphic navbar container */}
      <nav className="navbar-capsule w-full max-w-7xl rounded-2xl transition-all duration-305 relative">
        
        {/* Sleek top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 rounded-t-2xl opacity-90" />
        
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full blur opacity-15 group-hover:opacity-40 transition duration-500" />
                <img 
                  src="/icon.png" 
                  alt="Sri Anjaneya Youth Logo" 
                  className="relative w-8 h-8 rounded-full object-cover filter drop-shadow group-hover:scale-110 transition-all duration-300 border border-saffron-500/30"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-base sm:text-lg text-saffron-600 tracking-tight leading-none group-hover:text-saffron-500 transition-colors">
                  {t('websiteName')}
                </span>
                <span className="text-[10px] font-extrabold text-gold-700 uppercase tracking-widest leading-none mt-1">
                  {t('zarugumalli')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center space-x-1 lg:ml-10">
              {navItems.filter(item => item.show).map((item) => (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${activeClass(item.path)}`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              ))}
            </div>

            {/* User Controls: Language, Notification, Dropdown Menu (Desktop) */}
            <div className="hidden lg:flex items-center space-x-2 shrink-0">
              
              {/* Theme Toggle Switcher */}
              <button 
                onClick={toggleTheme}
                className="flex items-center justify-center p-2 rounded-full hover:bg-saffron-500/5 text-slate-700 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all h-9 w-9 shrink-0 cursor-pointer"
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4.5 h-4.5" />
                ) : (
                  <Sun className="w-4.5 h-4.5 text-amber-500" />
                )}
              </button>

              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="flex items-center justify-center p-2 rounded-full hover:bg-saffron-500/5 text-slate-700 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all text-xs font-bold h-9 w-9 shrink-0 cursor-pointer"
                title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              >
                {language === 'en' ? 'తె' : 'EN'}
              </button>

              {/* Notification Center */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-full hover:bg-saffron-500/5 text-slate-700 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 transition-all h-9 w-9 flex items-center justify-center cursor-pointer"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-devored-600 w-2 h-2 rounded-full animate-pulse border border-white dark:border-slate-900" />
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {isNotificationsOpen && (
                  <div className="dropdown-menu-card absolute right-0 mt-2.5 w-80 rounded-2xl shadow-xl py-2 animate-slide-up overflow-hidden ring-1 ring-black/5 z-50">
                    <div className="px-4 py-2.5 border-b border-cream-100 dark:border-slate-800 bg-cream-50/30 dark:bg-slate-900/40 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5 text-saffron-500" />
                        {t('notifications')}
                      </span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-[9px] font-extrabold text-saffron-600 hover:underline cursor-pointer"
                        >
                          {t('markAsRead')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-cream-100 dark:divide-slate-800">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map(ann => {
                          const readIds = JSON.parse(localStorage.getItem('sa_read_announcements') || '[]');
                          const isRead = readIds.includes(ann.id);
                          return (
                            <button
                              key={ann.id}
                              onClick={() => {
                                setIsNotificationsOpen(false);
                                readNotification(ann);
                              }}
                              className={`w-full text-left p-3 hover:bg-cream-50/50 dark:hover:bg-slate-800/40 transition-colors flex gap-2.5 items-start cursor-pointer ${!isRead ? 'bg-saffron-50/10 dark:bg-saffron-500/5' : ''}`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${!isRead ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-950/50 dark:text-saffron-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <Bell className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate uppercase tracking-wide">{ann.title}</h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{ann.message}</p>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold block mt-1 uppercase">
                                  {new Date(ann.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN')}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {t('noNotifications')}
                        </div>
                      )}
                    </div>

                    <Link 
                      to="/announcements" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block text-center text-[10px] font-black text-saffron-600 hover:underline py-2.5 border-t border-cream-100 dark:border-slate-800 uppercase tracking-widest bg-cream-50/10 dark:bg-slate-900/20 hover:bg-cream-50/40 dark:hover:bg-slate-800/30"
                    >
                      {t('viewAllNotifications')}
                    </Link>
                  </div>
                )}
              </div>

              {/* User Account Dropdown */}
              <div className="relative pl-1" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-saffron-500/20 transition-all duration-200 cursor-pointer focus:outline-none p-0.5"
                >
                  <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-tr from-saffron-400 to-saffron-600 flex items-center justify-center text-white text-xs font-extrabold border border-saffron-200/50 shadow-sm overflow-hidden shrink-0">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                </button>

                {/* Dropdown Menu Card */}
                {isDropdownOpen && (
                  <div className="dropdown-menu-card absolute right-0 mt-2.5 w-56 rounded-2xl shadow-xl py-2 animate-slide-up overflow-hidden ring-1 ring-black/5 z-50">
                    {/* User Summary */}
                    <div className="px-4 py-3 border-b border-cream-100 dark:border-slate-800 bg-cream-50/30 dark:bg-slate-900/40">
                      <span className="block text-xs font-black text-slate-800 dark:text-white truncate">{user.name}</span>
                      <span className="block text-[9px] text-slate-400 capitalize font-medium tracking-wide mt-1">{user.role}</span>
                      <span className="block text-[9px] text-slate-400 truncate mt-0.5">{user.email}</span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-saffron-600 dark:hover:text-saffron-400 hover:bg-saffron-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <User className="w-4 h-4 text-saffron-500" />
                        {t('myProfile')}
                      </Link>

                      {user && user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gold-50/30 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-gold-500" />
                          {t('adminPanel')}
                        </Link>
                      )}

                      <hr className="border-cream-100 dark:border-slate-800 my-1 mx-2" />

                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-devored-600 hover:text-white hover:bg-devored-600 transition-all text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu toggle button */}
            <div className="lg:hidden flex items-center space-x-1 shrink-0">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-saffron-600 hover:bg-saffron-50/30 focus:outline-none transition-colors border border-transparent hover:border-cream-200"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="mobile-menu-drawer lg:hidden absolute top-18 left-0 right-0 shadow-2xl rounded-2xl mx-1.5 p-3.5 animate-slide-up space-y-1 z-50">
            {navItems.filter(item => item.show).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeMobileClass(item.path)}`}
              >
                <item.icon className="w-4.5 h-4.5 text-saffron-500 shrink-0" />
                {item.name}
              </Link>
            ))}
            
            <hr className="border-cream-200 my-2" />

            <div className="p-2.5 rounded-xl bg-cream-50/50 border border-cream-200 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-saffron-400 to-saffron-600 flex items-center justify-center text-white font-extrabold border border-saffron-200 shadow-sm overflow-hidden shrink-0">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-800 leading-none">{user.name}</span>
                    <span className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</span>
                  </div>
                </div>

                {/* Mobile Controls (Language + Theme Switchers) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Theme Switcher */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 bg-white border border-cream-300 rounded-xl text-slate-700 h-9 w-9 flex items-center justify-center cursor-pointer animate-fade-in"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  >
                    {theme === 'light' ? (
                      <Moon className="w-4 h-4 text-slate-600" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500" />
                    )}
                  </button>

                  {/* Mobile Language Switcher */}
                  <button 
                    onClick={toggleLanguage}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-cream-300 text-slate-700 font-extrabold text-[9px] h-9 cursor-pointer"
                  >
                    <Globe className="w-3 h-3 text-saffron-500" />
                    <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="py-2 border border-cream-300 hover:border-saffron-500 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors bg-white"
                >
                  <User className="w-4 h-4 text-saffron-500" />
                  {t('myProfile')}
                </Link>

                {user && user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="py-2 border border-cream-300 hover:border-gold-500 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors bg-white"
                  >
                    <Settings className="w-4 h-4 text-gold-500" />
                    {t('adminPanel')}
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="col-span-2 py-2.5 bg-devored-600 hover:bg-devored-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Announcement Detail Modal */}
      {activeNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto relative">
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-white animate-bounce" />
                {t('notifications')}
              </h2>
              <button 
                onClick={() => setActiveNotification(null)} 
                className="text-white hover:text-saffron-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-cream-100 pb-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {activeNotification.title}
                </h3>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase shrink-0">
                  {new Date(activeNotification.createdAt).toLocaleString(language === 'en' ? 'en-IN' : 'te-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {activeNotification.message}
              </p>
              
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveNotification(null)}
                  className="px-5 py-2 saffron-gradient-btn rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
