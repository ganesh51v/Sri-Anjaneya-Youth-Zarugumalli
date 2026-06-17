import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t-2 border-saffron-500">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Association Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <svg 
                className="w-6 h-6 text-saffron-500" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.2" />
                <path d="M12 2v10" strokeWidth="2.5" />
                <path d="M12 11L12 22" strokeWidth="3" />
                <circle cx="12" cy="22" r="1.5" fill="currentColor" />
              </svg>
              <span className="font-extrabold text-lg text-saffron-400 tracking-tight">
                {t('websiteName')}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('jaiHanumanDesc')}
            </p>
            <p className="text-xs italic text-gold-500">
              "{t('unitedQuote')}"
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-saffron-400 font-bold text-sm uppercase tracking-wider">{t('quickLinks')}</h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {user ? (
                <>
                  <li><Link to="/" className="hover:text-gold-400 transition-colors">{t('dashboard')}</Link></li>
                  <li><Link to="/members" className="hover:text-gold-400 transition-colors">{t('members')}</Link></li>
                  <li><Link to="/events" className="hover:text-gold-400 transition-colors">{t('events')}</Link></li>
                  <li><Link to="/gallery" className="hover:text-gold-400 transition-colors">{t('gallery')}</Link></li>
                  <li><Link to="/announcements" className="hover:text-gold-400 transition-colors">{t('announcements')}</Link></li>
                  <li><Link to="/profile" className="hover:text-gold-400 transition-colors">{t('myProfile')}</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/signin" className="hover:text-gold-400 transition-colors">Sign In</Link></li>
                  <li><Link to="/signup" className="hover:text-gold-400 transition-colors">Sign Up</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-saffron-400 font-bold text-sm uppercase tracking-wider">{t('contactAssociation')}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" />
                <span>{t('footerAddressVal')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-500 shrink-0" />
                <span>+91 94949 94949</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-500 shrink-0" />
                <span>info@srianjaneyayouth.org</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Shloka Quote Divider */}
        <div className="my-8 border-t border-slate-800 pt-6 flex justify-center">
          <p className="text-xs text-slate-500 italic max-w-lg text-center leading-relaxed">
            "{t('hanumanShlokaPart1')}"<br />
            "{t('hanumanShlokaPart2')}"
          </p>
        </div>

        {/* Copyright Attribution */}
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} Sri Anjaneya Youth Zarugumalli. {t('footerRights')}</p>
          <p className="flex items-center gap-1 font-semibold text-slate-400">
            <span>{t('footerCredits')}</span>
            <Heart className="w-3.5 h-3.5 text-devored-500 fill-current animate-pulse" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
