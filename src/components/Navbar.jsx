import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { dbService } from '../firebase/config';
import { 
  Menu, X, Home, Users, Calendar, Image, Bell, User, LogOut,
  ShieldAlert, Sun, Moon, Heart, Banknote
} from 'lucide-react';
import { navbarEntrance } from '../utils/animate';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const safeParseReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem('sa_read_announcements') || '[]');
    } catch {
      localStorage.removeItem('sa_read_announcements');
      return [];
    }
  };
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navbarRef = useRef(null);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'te' : 'en');
  };

  // Scroll listener for compact navbar effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Navbar entrance animation
  useEffect(() => {
    if (!user) return;
    if (navbarRef.current) navbarEntrance(navbarRef.current, { delay: 50 });
  }, [user]);

  // Fetch notifications — polls every 90 seconds but pauses when tab is hidden
  useEffect(() => {
    const fetchNotifications = async () => {
      // Skip fetching if tab is not visible to save Firebase reads
      if (document.hidden) return;
      try {
        const data = await dbService.announcements.getAll();
        setNotifications(data);
        const readIds = safeParseReadIds();
        const unread = data.filter(ann => !readIds.includes(ann.id)).length;
        setUnreadCount(unread);
      } catch {
        // Silence expected offline/permission errors
      }
    };

    if (!user) return;

    // Fetch immediately on mount
    fetchNotifications();

    // Poll every 90 seconds (was 20s — reduced to save Firebase quota)
    const interval = setInterval(fetchNotifications, 90000);

    // Pause polling when tab is hidden; resume and immediately refetch when visible
    const handleVisibility = () => {
      if (!document.hidden) fetchNotifications();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  const markAllAsRead = () => {
    const allIds = notifications.map(ann => ann.id);
    localStorage.setItem('sa_read_announcements', JSON.stringify(allIds));
    setUnreadCount(0);
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

  if (!user) return null;

  return (
    <div ref={navbarRef} style={{ opacity: 0, transform: 'translateY(-80px)' }} className="w-full flex justify-center sticky top-3 z-50 px-3 sm:px-4">
      <nav className={`navbar-capsule w-full max-w-7xl rounded-2xl relative transition-all duration-300 ${isScrolled ? 'scrolled py-0.5' : ''}`}>
        
        {/* Sleek top gradient stripe */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 rounded-t-2xl opacity-90" />
        
        <div className="px-3 sm:px-5">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
            
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-saffron-400 to-gold-400 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-300" />
                <img 
                  src="/icon.png" 
                  alt="Sri Anjaneya Youth Logo" 
                  className="relative w-8 h-8 rounded-full object-cover filter drop-shadow group-hover:scale-105 transition-all duration-300 border border-saffron-500/30"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base text-saffron-600 dark:text-saffron-400 tracking-tight leading-none group-hover:text-saffron-500 transition-colors">
                  {t('websiteName')}
                </span>
                <span className="text-[9px] font-extrabold text-gold-600 dark:text-gold-400 uppercase tracking-widest leading-none mt-1">
                  {t('zarugumalli')}
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.filter(item => item.show).map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5 transition-all duration-200 ${
                      isActive 
                        ? 'bg-saffron-500 text-white shadow-md shadow-saffron-500/20' 
                        : 'text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gold-500'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Controls Section */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              
              {/* Theme Switcher */}
              <button 
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                aria-pressed={theme === 'dark'}
                className="flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)] transition-all h-9 w-9 cursor-pointer"
                title={theme === 'light' ? 'Switch to Midnight Dark Mode' : 'Switch to Sophisticated Light Mode'}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 text-slate-700" />
                ) : (
                  <Sun className="w-4 h-4 text-gold-400" />
                )}
              </button>

              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                aria-label={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
                className="flex items-center justify-center p-2 rounded-xl text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)] transition-all text-xs font-black h-9 w-9 cursor-pointer"
                title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
              >
                {language === 'en' ? 'తె' : 'EN'}
              </button>

              {/* Notification Center */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                  aria-expanded={isNotificationsOpen}
                  aria-haspopup="dialog"
                  className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)] transition-all h-9 w-9 flex items-center justify-center cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-devored-600 w-2 h-2 rounded-full animate-pulse border border-[var(--bg-card)]" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotificationsOpen && (
                  <div className="dropdown-menu-card absolute right-0 mt-2.5 w-80 shadow-2xl py-2 animate-slide-up overflow-hidden z-50">
                    <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--bg-muted)] flex justify-between items-center">
                      <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
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

                    <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 4).map(ann => {
                          const readIds = safeParseReadIds();
                          const isRead = readIds.includes(ann.id);
                          return (
                            <div
                              key={ann.id}
                              onClick={() => setIsNotificationsOpen(false)}
                              className={`p-3 hover:bg-[var(--bg-muted)] transition-colors flex gap-2.5 items-start cursor-pointer ${!isRead ? 'bg-saffron-500/5' : ''}`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 ${!isRead ? 'bg-saffron-100 dark:bg-saffron-950/50 text-saffron-600 dark:text-saffron-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                <Bell className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] truncate uppercase tracking-wide">{ann.title}</h4>
                                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">{ann.message}</p>
                                <span className="text-[9px] text-[var(--text-subtle)] font-semibold block mt-1 uppercase">
                                  {new Date(ann.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN')}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-6 text-center text-xs text-[var(--text-subtle)]">
                          {t('noNotifications')}
                        </div>
                      )}
                    </div>

                    <Link 
                      to="/announcements" 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block text-center text-[10px] font-black text-saffron-600 hover:underline py-2.5 border-t border-[var(--border)] uppercase tracking-widest bg-[var(--bg-muted)]"
                    >
                      {t('viewAllNotifications')}
                    </Link>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="Open account menu"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                  className="flex items-center justify-center rounded-full hover:ring-2 hover:ring-saffron-500/30 transition-all duration-200 cursor-pointer focus:outline-none p-0.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-saffron-500 to-gold-500 flex items-center justify-center text-white text-xs font-extrabold border border-saffron-200/50 shadow-sm overflow-hidden shrink-0">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                </button>

                {/* Account Dropdown */}
                {isDropdownOpen && (
                  <div className="dropdown-menu-card absolute right-0 mt-2.5 w-56 shadow-2xl py-2 animate-slide-up overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-muted)]">
                      <span className="block text-xs font-black text-[var(--text-primary)] truncate">{user.name}</span>
                      <span className="block text-[9px] text-saffron-600 font-bold uppercase tracking-wider mt-0.5">{user.role}</span>
                      <span className="block text-[9px] text-[var(--text-muted)] truncate mt-0.5">{user.email}</span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link 
                        to="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)] transition-colors"
                      >
                        <User className="w-4 h-4 text-saffron-500" />
                        {t('myProfile')}
                      </Link>

                      {user && user.role === 'admin' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-devored-600 hover:bg-devored-500/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-devored-500" />
                          Admin Panel
                        </Link>
                      )}

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-slate-400" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation"
                className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-saffron-600 hover:bg-[var(--bg-muted)] transition-all cursor-pointer"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div id="mobile-navigation" role="dialog" aria-label="Mobile navigation" className="lg:hidden mobile-menu-drawer rounded-b-2xl border-t border-[var(--border)] p-4 shadow-xl space-y-2 animate-slide-up">
            {navItems.filter(item => item.show).map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link 
                  key={item.name} 
                  to={item.path} 
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide flex items-center gap-3 transition-all ${
                    isActive 
                      ? 'bg-saffron-500 text-white shadow-md' 
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gold-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
