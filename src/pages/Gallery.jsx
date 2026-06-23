import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, X, Loader2, AlertCircle, Image as ImageIcon, Trash2, Camera, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

const Gallery = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const isAdmin = user && user.role === 'admin';

  const [gallery, setGallery] = useState([]);
  const [filteredGallery, setFilteredGallery] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState([]); // Array of base64 files
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Temple Events');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRemoveImage = (indexToRemove) => {
    setImageUrls(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Preset images removed to support direct local file uploads only

  const fetchGallery = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await dbService.gallery.getAll();
      setGallery(data);
      setFilteredGallery(data);
    } catch (err) {
      setError(t('failedFetchGallery') || 'Failed to fetch gallery photos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Filter category
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredGallery(gallery);
    } else {
      const filtered = gallery.filter(item => item.category === activeCategory);
      setFilteredGallery(filtered);
    }
  }, [activeCategory, gallery]);

  const openAddModal = () => {
    setImageUrls([]);
    setCaption('');
    setCategory('Temple Events');
    setRedirectUrl('');
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('deletePhotoConfirm'))) {
      try {
        await dbService.gallery.delete(id);
        setGallery(prev => prev.filter(item => item.id !== id));
        setFilteredGallery(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        alert(t('failedDeletePhoto'));
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (imageUrls.length + files.length > 5) {
      setError(language === 'en' ? 'You can upload a maximum of 5 images per album.' : 'మీరు ఆల్బమ్‌కు గరిష్టంగా 5 చిత్రాలను మాత్రమే అప్‌లోడ్ చేయగలరు.');
      return;
    }

    setError('');
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError(language === 'en' ? `File "${file.name}" exceeds 2MB limit.` : `ఫైల్ "${file.name}" 2MB పరిమితిని దాటింది.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrls(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (imageUrls.length === 0 || !caption || !category) {
      setError(t('fillAllDetails'));
      return;
    }

    setIsSaving(true);
    const finalUrls = [];

    try {
      for (const base64Image of imageUrls) {
        let uploadedUrl = base64Image;
        if (base64Image.startsWith('data:')) {
          try {
            const uploadRes = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ file: base64Image })
            });
            
            const uploadData = await uploadRes.json();
            
            if (uploadRes.ok && uploadData.secure_url) {
              uploadedUrl = uploadData.secure_url;
            } else {
              console.warn('[Gallery] Cloudinary upload failed, using direct Base64 fallback:', uploadData.error);
            }
          } catch (uploadErr) {
            console.warn('[Gallery] Cloudinary helper failed, using direct Base64 fallback:', uploadErr.message);
          }
        }
        finalUrls.push(uploadedUrl);
      }

      const newPhoto = { 
        imageUrl: finalUrls[0], // first image URL for backwards compatibility
        imageUrls: finalUrls,   // array of all image URLs
        caption, 
        category, 
        redirectUrl 
      };
      
      const added = await dbService.gallery.add(newPhoto);
      setGallery(prev => [added, ...prev]); // Prepend new image
      setIsModalOpen(false);
    } catch (err) {
      console.error('[Gallery] Save error:', err);
      setError(err.message || t('failedSavePhoto'));
    } finally {
      setIsSaving(false);
    }
  };

  const categoriesList = ['All', 'Temple Events', 'Festivals', 'Service / Seva'];

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'All': return t('all');
      case 'Temple Events': return t('templeEvents');
      case 'Festivals': return t('festivals');
      case 'Service / Seva': return t('serviceSeva');
      default: return cat;
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      <SEO title="Gallery" description="Photo gallery of Sri Anjaneya Youth Zarugumalli events — temple festivals, cultural programmes, annadanam, youth activities and community celebrations." path="/gallery" />
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('associationGallery')}</h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('gallerySubtitle')}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={openAddModal}
            className="saffron-gradient-btn rounded-xl px-4 py-2.5 text-xs flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t('uploadPhoto')}
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border cursor-pointer hover:scale-105 active:scale-95 ${
              activeCategory === cat
                ? 'bg-saffron-500 border-saffron-500 text-white shadow-md shadow-saffron-500/25'
                : 'bg-white border-cream-300 text-slate-600 hover:border-saffron-300 hover:bg-saffron-50/10'
            }`}
          >
            {getCategoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Photos Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-saffron-600 animate-spin" />
          <p className="mt-2 text-xs text-slate-400">{t('loadingGallery')}</p>
        </div>
      ) : filteredGallery.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredGallery.map(item => (
            <GalleryCard 
              key={item.id} 
              item={item} 
              isAdmin={isAdmin} 
              handleDelete={handleDelete} 
              language={language} 
              t={t} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-cream-100/50 rounded-2xl p-12 text-center text-slate-400 text-xs border border-dashed border-cream-200 flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 text-slate-300" />
          <span>{t('noGalleryItems')}</span>
        </div>
      )}

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-cream-200 overflow-hidden animate-slide-up my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">{t('uploadPhotoTitle')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-saffron-100 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3 rounded-lg text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('choosePhoto')}</label>
                
                {/* Local Photo Upload Container */}
                <div className="bg-cream-50 border border-cream-300 rounded-xl p-4 mb-2 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="gallery-photo-input"
                        onChange={handleImageChange}
                        multiple
                        className="hidden"
                      />
                      <label
                        htmlFor="gallery-photo-input"
                        className="inline-block px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-[10px] font-extrabold text-slate-700 hover:bg-cream-50 cursor-pointer transition-colors"
                      >
                        {t('chooseImage')}
                      </label>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium">PNG/JPG, max 2MB per file, max 5 files</p>
                  </div>

                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-5 gap-2 pt-2 border-t border-cream-200">
                      {imageUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-cream-300 group">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute -top-1 -right-1 bg-devored-600 hover:bg-devored-700 text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
                            title="Remove image"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('categoryLabel')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                >
                  <option value="Temple Events">{getCategoryLabel('Temple Events')}</option>
                  <option value="Festivals">{getCategoryLabel('Festivals')}</option>
                  <option value="Service / Seva">{getCategoryLabel('Service / Seva')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('captionLabel')}</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={t('captionPlaceholder')}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 pl-1">{t('redirectUrlLabel')}</label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder={t('redirectUrlPlaceholder')}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-cream-300 hover:bg-cream-50 rounded-xl text-slate-700 font-bold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 saffron-gradient-btn rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t('savePhoto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryCard = ({ item, isAdmin, handleDelete, language, t }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const images = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];
  const hasMultiple = images.length > 1;

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIdx(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'All': return t('all');
      case 'Temple Events': return t('templeEvents');
      case 'Festivals': return t('festivals');
      case 'Service / Seva': return t('serviceSeva');
      default: return cat;
    }
  };

  return (
    <div className="bg-white border border-cream-200 rounded-2xl overflow-hidden shadow-sm group hover-lift hover-glow-saffron transition-all duration-300 relative flex flex-col">
      <div className="overflow-hidden aspect-video relative bg-slate-950">
        {item.redirectUrl ? (
          <a 
            href={item.redirectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full h-full cursor-pointer"
            title={language === 'en' ? `Click to open link: ${item.redirectUrl}` : `లింక్ ఓపెన్ చేయడానికి క్లిక్ చేయండి: ${item.redirectUrl}`}
          >
            <img 
              src={images[currentIdx]} 
              alt={item.caption} 
              className="w-full h-full object-cover transition-all duration-500"
            />
          </a>
        ) : (
          <img 
            src={images[currentIdx]} 
            alt={item.caption} 
            className="w-full h-full object-cover transition-all duration-500"
          />
        )}
        
        {/* Navigation arrows for carousel */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1 rounded-full hover:scale-105 transition-all cursor-pointer z-10 flex items-center justify-center"
              title="Previous Photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1 rounded-full hover:scale-105 transition-all cursor-pointer z-10 flex items-center justify-center"
              title="Next Photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            {/* Slide Index indicator badge */}
            <span className="absolute bottom-3 left-3 bg-black/55 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest font-mono">
              {currentIdx + 1}/{images.length}
            </span>
          </>
        )}

        {/* Category Badge overlay */}
        <span className="absolute top-3 left-3 bg-slate-900/70 text-gold-300 border border-gold-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
          {getCategoryLabel(item.category || 'Event')}
        </span>

        {/* External Link icon overlay */}
        {item.redirectUrl && (
          <a
            href={item.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 right-3 bg-slate-900/60 text-white p-1.5 rounded-full text-xs hover:bg-slate-900/80 transition-colors shadow-sm cursor-pointer z-10"
            title={item.redirectUrl}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* Delete button overlay for Admins */}
        {isAdmin && (
          <button
            onClick={() => handleDelete(item.id)}
            className="absolute top-3 right-3 bg-devored-700 hover:bg-devored-800 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
            title="Delete Image"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Carousel indicator dots */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIdx(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIdx === idx ? 'bg-saffron-500 scale-125 w-3' : 'bg-white/60 hover:bg-white/95'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <p className="text-xs text-slate-700 font-semibold leading-relaxed mb-2">
          {item.caption}
        </p>
        <span className="text-[9px] text-slate-400 block font-medium">
          {t('uploadedOn')}: {item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN') : 'N/A'}
        </span>
      </div>
    </div>
  );
};

export default Gallery;
