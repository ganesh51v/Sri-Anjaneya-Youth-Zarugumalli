import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { Home, Calendar, Image, Bell, Heart, Users, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const { language, t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center max-w-2xl mx-auto space-y-6 animate-fade-in">
      <SEO
        title="404 — Page Not Found"
        description="The page you are looking for does not exist on Sri Anjaneya Youth Zarugumalli portal."
        path="/404"
        noindex={true}
      />

      {/* Decorative 404 badge */}
      <div className="relative">
        <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 via-gold-500 to-devored-600 select-none tracking-tight font-serif">
          404
        </div>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/30 text-saffron-600 dark:text-saffron-400 text-xs font-black uppercase tracking-widest whitespace-nowrap">
          {language === 'en' ? 'Page Not Found' : 'పేజీ కనుగొనబడలేదు'}
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {language === 'en' ? 'Oops! This Path Does Not Exist' : 'క్షమించండి! ఈ పేజీ అందుబాటులో లేదు'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          {language === 'en'
            ? 'The page or URL you navigated to may have been moved, renamed, or is temporarily unavailable.'
            : 'మీరు వెతుకుతున్న పేజీ తరలించబడి ఉండవచ్చు లేదా అందుబాటులో లేదు.'}
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <Link
          to="/"
          className="saffron-gradient-btn px-6 py-3 rounded-2xl text-xs font-black inline-flex items-center gap-2 shadow-lg shadow-saffron-500/20 hover:scale-105 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'en' ? 'Return to Home' : 'హోమ్ పేజీకి తిరిగి వెళ్ళండి'}
        </Link>
      </div>

      {/* Popular Destination Links */}
      <div className="pt-8 border-t border-cream-200 dark:border-slate-800 w-full">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">
          {language === 'en' ? 'Popular Destinations' : 'ముఖ్యమైన పేజీలు'}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link
            to="/events"
            className="card p-3 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-saffron-600 hover:border-saffron-400 transition-all group"
          >
            <Calendar className="w-4 h-4 text-gold-500 group-hover:scale-110 transition-transform" />
            <span>{t('events')}</span>
          </Link>
          <Link
            to="/gallery"
            className="card p-3 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-saffron-600 hover:border-saffron-400 transition-all group"
          >
            <Image className="w-4 h-4 text-gold-500 group-hover:scale-110 transition-transform" />
            <span>{t('gallery')}</span>
          </Link>
          <Link
            to="/announcements"
            className="card p-3 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-saffron-600 hover:border-saffron-400 transition-all group"
          >
            <Bell className="w-4 h-4 text-gold-500 group-hover:scale-110 transition-transform" />
            <span>{t('announcements')}</span>
          </Link>
          <Link
            to="/donate"
            className="card p-3 flex flex-col items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-saffron-600 hover:border-saffron-400 transition-all group"
          >
            <Heart className="w-4 h-4 text-devored-500 group-hover:scale-110 transition-transform" />
            <span>{t('donate')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
