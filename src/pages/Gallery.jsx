import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Loader2, 
  AlertCircle, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar,
  Grid
} from 'lucide-react';
import SEO from '../components/SEO';

const Gallery = () => {
  const { language, t } = useLanguage();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Fetch albums on mount
  const fetchAlbums = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.gallery.getAll();
      setAlbums(data);
    } catch (err) {
      setError(t('failedFetchGallery') || 'Failed to fetch gallery albums.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  // Helper to map old data shapes to new album shape
  const normalizeAlbum = (item) => {
    const images = item.imageUrls && item.imageUrls.length > 0 
      ? item.imageUrls 
      : (item.imageUrl ? [item.imageUrl] : []);
    
    return {
      id: item.id,
      title: item.title || item.caption || 'Untitled Event',
      description: item.description || item.category || '',
      coverImageUrl: item.coverImageUrl || item.imageUrl || (images[0] || ''),
      eventDate: item.eventDate || item.uploadedAt || '',
      imageUrls: images
    };
  };

  const handleOpenAlbum = (album) => {
    setSelectedAlbum(normalizeAlbum(album));
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <SEO 
        title="Gallery" 
        description="Photo gallery of Sri Anjaneya Youth Zarugumalli events — temple festivals, seva activities, and community celebrations." 
        path="/gallery" 
      />

      {/* Header Panel */}
      <div className="border-b border-cream-250 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('associationGallery')}
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          {t('gallerySubtitle')}
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Albums Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-500 animate-spin" />
          <p className="mt-2 text-xs text-slate-400">{t('loadingGallery')}</p>
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {albums.map((item) => {
            const album = normalizeAlbum(item);
            return (
              <div 
                key={album.id}
                onClick={() => handleOpenAlbum(item)}
                className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm group hover-lift hover-glow-saffron cursor-pointer flex flex-col"
              >
                {/* Cover Photo */}
                <div className="overflow-hidden aspect-video relative bg-slate-950">
                  <img 
                    src={album.coverImageUrl} 
                    alt={album.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Photos count badge */}
                  <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest font-mono">
                    {album.imageUrls.length} {t('photosCount').toUpperCase()}
                  </span>
                  
                  {/* Date Badge */}
                  {album.eventDate && (
                    <span className="absolute top-3 left-3 bg-slate-900/70 text-gold-300 border border-gold-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gold-400" />
                      {new Date(album.eventDate).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN')}
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white line-clamp-1">
                      {album.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 flex items-center gap-1 mt-4">
                    <Grid className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Open Album' : 'ఆల్బమ్ చూడండి'} &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-cream-100/50 dark:bg-slate-900/50 rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-cream-250 dark:border-slate-800 flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          <span>{t('noGalleryAlbums')}</span>
        </div>
      )}

      {/* ALBUM DETAILS GRID MODAL */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-40 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-5 flex justify-between items-start gap-4">
              <div>
                <h2 className="font-extrabold text-sm uppercase tracking-wider">
                  {selectedAlbum.title}
                </h2>
                <p className="text-xs text-saffron-100 mt-1 line-clamp-2">
                  {selectedAlbum.description}
                </p>
                {selectedAlbum.eventDate && (
                  <span className="text-[10px] text-gold-300 font-bold block mt-1">
                    Event Date: {new Date(selectedAlbum.eventDate).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedAlbum(null)}
                className="text-white hover:text-saffron-100 bg-white/10 hover:bg-white/20 p-1.5 rounded-full cursor-pointer transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Images Grid */}
            <div className="overflow-y-auto p-6 md:p-8 flex-1 bg-cream-50/10 dark:bg-slate-950/20">
              {selectedAlbum.imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedAlbum.imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="aspect-square bg-slate-950 rounded-xl overflow-hidden border border-cream-250 dark:border-slate-800 cursor-pointer shadow-sm group hover-lift transition-all"
                    >
                      <img
                        src={url}
                        alt={`${selectedAlbum.title} ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No images in this album.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN TOUCH LIGHTBOX */}
      {selectedAlbum && lightboxIndex !== -1 && (
        <Lightbox 
          album={selectedAlbum} 
          index={lightboxIndex} 
          setIndex={setLightboxIndex} 
          onClose={() => setLightboxIndex(-1)} 
        />
      )}
    </div>
  );
};

/* Lightbox Component with Swipe Gestures, Download, Spinner, and Fallback */
const Lightbox = ({ album, index, setIndex, onClose }) => {
  const currentImage = album.imageUrls[index];

  // Touch Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const handlePrev = () => {
    setIndex(prev => (prev === 0 ? album.imageUrls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex(prev => (prev === album.imageUrls.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  // Swipe Navigation Handlers
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const handleDownload = async () => {
    try {
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${album.title.replace(/\s+/g, '_')}_img_${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('CORS blob download failed, falling back to direct tab link:', err.message);
      window.open(currentImage, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between select-none animate-fade-in">
      {/* Lightbox Header */}
      <div className="p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10">
        <span className="text-white font-mono text-xs font-bold tracking-widest bg-black/40 px-3 py-1 rounded-full">
          {index + 1} / {album.imageUrls.length}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="text-white hover:text-saffron-400 bg-black/40 p-2 rounded-full cursor-pointer hover:scale-105 transition-all"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="text-white hover:text-saffron-400 bg-black/40 p-2 rounded-full cursor-pointer hover:scale-105 transition-all"
            title="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lightbox Body (Swipe area) */}
      <div 
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="flex-1 flex items-center justify-center relative w-full h-full"
      >
        {/* Navigation Arrows (Large screens) */}
        {album.imageUrls.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 md:left-8 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full cursor-pointer hover:scale-105 transition-all z-10 hidden sm:flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 md:right-8 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full cursor-pointer hover:scale-105 transition-all z-10 hidden sm:flex items-center justify-center"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Load-optimized Display Image */}
        <LightboxImage src={currentImage} alt={`${album.title} Large view`} />
      </div>

      {/* Lightbox Footer */}
      <div className="p-5 text-center bg-gradient-to-t from-black/80 to-transparent z-10 text-white space-y-1">
        <h4 className="font-extrabold text-sm tracking-wide uppercase">{album.title}</h4>
        {album.description && (
          <p className="text-xs text-slate-400 max-w-md mx-auto line-clamp-1">
            {album.description}
          </p>
        )}
      </div>
    </div>
  );
};

/* Sub-component to manage image loading indicator and fallback errors */
const LightboxImage = ({ src, alt }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [src]);

  return (
    <div className="relative max-w-full max-h-full flex items-center justify-center p-4">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-500 animate-spin" />
        </div>
      )}
      {error ? (
        <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-10 border border-dashed border-slate-800 rounded-2xl bg-slate-900/40">
          <ImageIcon className="w-10 h-10 text-slate-600 animate-pulse" />
          <span className="text-xs font-semibold">Image failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          className={`max-w-full max-h-[75vh] md:max-h-[82vh] object-contain rounded-xl shadow-xl transition-opacity duration-300 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}
    </div>
  );
};

export default Gallery;
