import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, X, Loader2, AlertCircle, Image as ImageIcon, Trash2, Camera, ExternalLink } from 'lucide-react';

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
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Temple Events');
  const [redirectUrl, setRedirectUrl] = useState('');

  // Preset beautiful devotional/service Unsplash image choices
  const imagePresets = [
    { name: 'Diya Oil Lamp', url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=800' },
    { name: 'Seva Annadanam', url: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=800' },
    { name: 'Youth Volunteering', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800' },
    { name: 'Indian Temple', url: 'https://images.unsplash.com/photo-1609137144814-72782e46c7de?w=800' },
    { name: 'Festival Lights', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800' },
    { name: 'River Aarti', url: 'https://images.unsplash.com/photo-1566838217578-d90231362740?w=800' }
  ];

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
    setImageUrl('');
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
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      setError(language === 'en' ? 'Image file size must be less than 800KB.' : 'చిత్రం ఫైల్ పరిమాణం 800KB కంటే తక్కువగా ఉండాలి.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageUrl || !caption || !category) {
      setError(t('fillAllDetails'));
      return;
    }

    const newPhoto = { imageUrl, caption, category, redirectUrl };

    try {
      const added = await dbService.gallery.add(newPhoto);
      setGallery(prev => [added, ...prev]); // Prepend new image
      setIsModalOpen(false);
    } catch (err) {
      setError(t('failedSavePhoto'));
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
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              activeCategory === cat
                ? 'bg-saffron-500 border-saffron-500 text-white shadow-sm'
                : 'bg-white border-cream-300 text-slate-600 hover:border-saffron-300'
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
            <div 
              key={item.id} 
              className="bg-white border border-cream-200 rounded-2xl overflow-hidden shadow-sm group hover:border-saffron-300 hover:shadow-md transition-all duration-300 relative flex flex-col"
            >
              <div className="overflow-hidden aspect-video relative">
                {item.redirectUrl ? (
                  <a 
                    href={item.redirectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full h-full cursor-pointer"
                    title={language === 'en' ? `Click to open link: ${item.redirectUrl}` : `లింక్ ఓపెన్ చేయడానికి క్లిక్ చేయండి: ${item.redirectUrl}`}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.caption} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </a>
                ) : (
                  <img 
                    src={item.imageUrl} 
                    alt={item.caption} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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
                <div className="flex items-center gap-4 bg-cream-50 border border-cream-300 rounded-xl p-3 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-saffron-100 border border-cream-300 flex items-center justify-center text-saffron-600 overflow-hidden shrink-0 font-bold text-[10px]">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-saffron-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="gallery-photo-input"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="gallery-photo-input"
                      className="inline-block px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-cream-50 cursor-pointer transition-colors"
                    >
                      {t('chooseImage')}
                    </label>
                    <p className="text-[9px] text-slate-400 mt-0.5">PNG/JPG, max 800KB</p>
                  </div>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] font-bold text-devored-600 hover:text-devored-700 px-2 py-1 cursor-pointer"
                    >
                      {t('remove')}
                    </button>
                  )}
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-cream-200"></div>
                  <span className="flex-shrink mx-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('orUseUrl')}</span>
                  <div className="flex-grow border-t border-cream-200"></div>
                </div>

                <input
                  type="url"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500"
                />
                
                {/* Image presets */}
                <div className="mt-2.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('imagePresetLabel')}</span>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className="border border-cream-300 hover:border-saffron-500 rounded-lg overflow-hidden h-10 transition-colors cursor-pointer"
                        title={preset.name}
                      >
                        <img src={preset.url} className="w-full h-full object-cover" alt="preset" />
                      </button>
                    ))}
                  </div>
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
                  className="px-5 py-2 saffron-gradient-btn rounded-xl font-bold cursor-pointer"
                >
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

export default Gallery;
