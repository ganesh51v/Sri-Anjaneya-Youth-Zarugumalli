import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Heart, Home, Users, Calendar, Image, Bell, User, Banknote } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const navLinks = [
    { to: '/', icon: Home, label: t('dashboard') },
    { to: '/members', icon: Users, label: t('members') },
    { to: '/events', icon: Calendar, label: t('events') },
    { to: '/gallery', icon: Image, label: t('gallery') },
    { to: '/announcements', icon: Bell, label: t('announcements') },
    { to: '/profile', icon: User, label: t('myProfile') },
    { to: '/expenditure', icon: Banknote, label: 'Expenditure' },
  ];

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--bg-card)]">
      {/* Top gradient stripe */}
      <div className="h-[3px] bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-full object-cover border border-saffron-300/50" />
              <div>
                <span className="block font-black text-sm text-saffron-600 leading-tight">{t('websiteName')}</span>
                <span className="block text-[9px] font-bold text-gold-600 uppercase tracking-widest">{t('zarugumalli')}</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)] max-w-xs">
              {t('jaiHanumanDesc')}
            </p>
            <p className="text-xs italic text-gold-600 font-semibold">
              &ldquo;{t('unitedQuote')}&rdquo;
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
              {t('quickLinks')}
            </h3>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
              {navLinks.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-saffron-600 transition-colors font-medium group"
                  >
                    <Icon className="w-3 h-3 text-gold-500 group-hover:text-saffron-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">
              {t('contactAssociation')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
                <span className="text-xs text-[var(--text-muted)]">{t('footerAddressVal')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <a href="tel:+919494994949" className="text-xs text-[var(--text-muted)] hover:text-saffron-600 transition-colors">+91 94949 94949</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                <a href="mailto:info@srianjaneyayouth.org" className="text-xs text-[var(--text-muted)] hover:text-saffron-600 transition-colors">info@srianjaneyayouth.org</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Shloka divider */}
        <div className="my-8">
          <div className="traditional-divider">
            <div className="traditional-divider-dot" />
          </div>
          <p className="text-center text-[10px] text-[var(--text-subtle)] italic max-w-md mx-auto leading-relaxed mt-3">
            &ldquo;{t('hanumanShlokaPart1')}&rdquo;<br />
            &ldquo;{t('hanumanShlokaPart2')}&rdquo;
          </p>
        </div>

        {/* Copyright */}
        <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[var(--text-subtle)]">
          <p>&copy; {new Date().getFullYear()} Sri Anjaneya Youth Zarugumalli. {t('footerRights')}</p>
          <p className="flex items-center gap-1 font-semibold">
            {t('footerCredits')}
            <Heart className="w-3 h-3 text-devored-500 fill-current animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
