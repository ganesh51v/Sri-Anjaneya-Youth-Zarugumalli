import React, { useState, useEffect } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  Calendar, 
  Bell, 
  Image, 
  Shield, 
  Trash2, 
  ArrowRightLeft, 
  UserCheck, 
  Settings, 
  Award,
  Heart,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  IndianRupee,
  Banknote,
  TrendingDown,
  Plus,
  X,
  Edit2,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [counts, setCounts] = useState({ members: 0, events: 0, announcements: 0, gallery: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'donations' | 'gallery'
  
  // Gallery Management States
  const [gallery, setGallery] = useState([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    coverImage: '',
    newGalleryImages: [],
    existingGalleryImages: []
  });
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [gallerySuccess, setGallerySuccess] = useState('');

  // Image compressor using HTML5 canvas
  const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new window.Image();
        img.src = e.target.result;
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const openGalleryModal = (item = null) => {
    setGalleryError('');
    setGallerySuccess('');
    if (item) {
      setEditingGalleryItem(item);
      setGalleryForm({
        title: item.title || item.caption || '',
        description: item.description || item.category || '',
        eventDate: item.eventDate || (item.uploadedAt ? item.uploadedAt.split('T')[0] : ''),
        coverImage: item.coverImageUrl || item.imageUrl || '',
        newGalleryImages: [],
        existingGalleryImages: item.imageUrls || (item.imageUrl ? [item.imageUrl] : [])
      });
    } else {
      setEditingGalleryItem(null);
      setGalleryForm({
        title: '',
        description: '',
        eventDate: new Date().toISOString().split('T')[0],
        coverImage: '',
        newGalleryImages: [],
        existingGalleryImages: []
      });
    }
    setIsGalleryModalOpen(true);
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setGalleryError('Only image files (JPG, PNG, WEBP) are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setGalleryError('Original image size cannot exceed 5MB.');
      return;
    }

    setGalleryError('');
    try {
      const compressed = await compressImage(file);
      setGalleryForm(prev => ({ ...prev, coverImage: compressed }));
    } catch (err) {
      console.error(err);
      setGalleryError('Failed to process cover image.');
    }
  };

  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setGalleryError('');
    const newCompressedImages = [];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setGalleryError('Only image files (JPG, PNG, WEBP) are allowed.');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setGalleryError('Original image size cannot exceed 5MB.');
        continue;
      }

      try {
        const compressed = await compressImage(file);
        newCompressedImages.push(compressed);
      } catch (err) {
        console.error(err);
        setGalleryError('Failed to process some gallery images.');
      }
    }

    if (newCompressedImages.length > 0) {
      setGalleryForm(prev => ({
        ...prev,
        newGalleryImages: [...prev.newGalleryImages, ...newCompressedImages]
      }));
    }
  };

  const handleRemoveExistingImage = (idxToRemove) => {
    setGalleryForm(prev => ({
      ...prev,
      existingGalleryImages: prev.existingGalleryImages.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleRemoveNewImage = (idxToRemove) => {
    setGalleryForm(prev => ({
      ...prev,
      newGalleryImages: prev.newGalleryImages.filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSaveGallery = async (e) => {
    e.preventDefault();
    setGalleryError('');
    setGallerySuccess('');

    const { title, description, eventDate, coverImage, newGalleryImages, existingGalleryImages } = galleryForm;

    if (!title || !description || !eventDate) {
      setGalleryError('Please fill in Title, Description, and Event Date.');
      return;
    }

    if (!editingGalleryItem && !coverImage) {
      setGalleryError('Please upload a Cover Image.');
      return;
    }

    setIsSavingGallery(true);
    try {
      // 1. Upload Cover Image (if provided as data URI)
      let coverImageUrl = editingGalleryItem ? editingGalleryItem.coverImageUrl : '';
      if (coverImage && coverImage.startsWith('data:')) {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: coverImage })
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.secure_url) {
          coverImageUrl = uploadData.secure_url;
        } else {
          throw new Error(uploadData.error || 'Failed to upload cover image to Cloudinary.');
        }
      } else if (coverImage) {
        coverImageUrl = coverImage;
      }

      // 2. Upload New Gallery Images
      const uploadedGalleryUrls = [];
      for (const base64Img of newGalleryImages) {
        if (base64Img.startsWith('data:')) {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64Img })
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.secure_url) {
            uploadedGalleryUrls.push(uploadData.secure_url);
          } else {
            throw new Error(uploadData.error || 'Failed to upload a gallery image.');
          }
        } else {
          uploadedGalleryUrls.push(base64Img);
        }
      }

      // Combine existing and new gallery images
      const imageUrls = [...existingGalleryImages, ...uploadedGalleryUrls];

      const galleryData = {
        title,
        description,
        coverImageUrl: coverImageUrl || (imageUrls.length > 0 ? imageUrls[0] : ''),
        eventDate,
        imageUrls,
        imageUrl: coverImageUrl || (imageUrls.length > 0 ? imageUrls[0] : '') // compatibility field
      };

      if (editingGalleryItem) {
        const updated = await dbService.gallery.update(editingGalleryItem.id, galleryData);
        setGallery(prev => prev.map(g => g.id === editingGalleryItem.id ? updated : g));
        setGallerySuccess('Gallery card updated successfully!');
      } else {
        const added = await dbService.gallery.add(galleryData);
        setGallery(prev => [added, ...prev]);
        setCounts(prev => ({ ...prev, gallery: prev.gallery + 1 }));
        setGallerySuccess('Gallery card created successfully!');
      }

      // Close modal after delay
      setTimeout(() => {
        setIsGalleryModalOpen(false);
        setEditingGalleryItem(null);
      }, 1500);

    } catch (err) {
      console.error(err);
      setGalleryError(err.message || 'An error occurred while saving the gallery card.');
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (window.confirm('Warning! Are you sure you want to permanently delete this entire gallery album?')) {
      try {
        await dbService.gallery.delete(id);
        setGallery(prev => prev.filter(g => g.id !== id));
        setCounts(prev => ({ ...prev, gallery: Math.max(0, prev.gallery - 1) }));
        alert('Gallery album deleted successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to delete gallery album.');
      }
    }
  };

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allUsers, allMembers, allEvents, allAnnouncements, allGallery, allDonations] = await Promise.all([
        dbService.users.getAll(),
        dbService.members.getAll(),
        dbService.events.getAll(),
        dbService.announcements.getAll(),
        dbService.gallery.getAll(),
        dbService.donations.getAll()
      ]);

      setUsers(allUsers);
      setDonations(allDonations);
      setGallery(allGallery);
      setCounts({
        members: allMembers.length,
        events: allEvents.length,
        announcements: allAnnouncements.length,
        gallery: allGallery.length
      });
    } catch (err) {
      setError('Failed to load administration database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonations = () => {
    return donations.filter(d => {
      const matchesSearch = 
        d.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.paymentId?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesPurpose = purposeFilter === 'all' || d.purpose === purposeFilter;
      
      return matchesSearch && matchesStatus && matchesPurpose;
    });
  };

  const handleExportCSV = () => {
    const headers = ['Donor Name', 'Mobile Number', 'Email', 'Amount (INR)', 'Payment Method', 'Purpose', 'Transaction ID', 'Status', 'Date'];
    const rows = filteredDonations().map(d => [
      d.donorName,
      d.phone,
      d.email || 'N/A',
      d.amount,
      d.paymentMethod,
      d.purpose,
      d.paymentId,
      d.status,
      new Date(d.createdAt).toLocaleString('en-IN')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `donations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (userId === currentUser.id) {
      alert("You cannot demote yourself. Please ask another admin to change your role.");
      return;
    }

    if (window.confirm(`Are you sure you want to change this user's role to ${nextRole.toUpperCase()}?`)) {
      try {
        await dbService.users.updateRole(userId, nextRole);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
      } catch (err) {
        alert("Failed to update user role.");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (window.confirm("Warning! This will permanently remove this user account from the registration database. Confirm deletion?")) {
      try {
        await dbService.users.delete(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (err) {
        alert("Failed to delete user.");
      }
    }
  };

  const handleApproveRequest = async (reqUser) => {
    if (window.confirm(`Are you sure you want to approve ${reqUser.name} as a Committee Member?`)) {
      try {
        await dbService.users.updateCommitteeStatus(reqUser.id, 'approved');
        
        const newMember = {
          name: reqUser.name,
          role: 'Member',
          phone: reqUser.phone || '',
          area: reqUser.village || 'Zarugumalli',
          photoUrl: reqUser.photoUrl || ''
        };
        await dbService.members.add(newMember);

        setUsers(prev => prev.map(u => u.id === reqUser.id ? { ...u, committeeStatus: 'approved' } : u));
        setCounts(prev => ({ ...prev, members: prev.members + 1 }));
        
        alert(`${reqUser.name} has been approved and added to the committee members list.`);
      } catch (err) {
        console.error("Error approving request:", err);
        alert("Failed to approve request.");
      }
    }
  };

  const handleDeclineRequest = async (userId) => {
    if (window.confirm("Are you sure you want to decline this request?")) {
      try {
        await dbService.users.updateCommitteeStatus(userId, 'none');
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, committeeStatus: 'none' } : u));
        alert("Request has been declined.");
      } catch (err) {
        console.error("Error declining request:", err);
        alert("Failed to decline request.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-saffron-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-saffron-500 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-xs text-slate-500 font-semibold animate-pulse">Loading Admin Database...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <SEO title="Admin Dashboard" description="Sri Anjaneya Youth Zarugumalli admin control panel — manage members, events, announcements, gallery and donations." path="/admin" />
      
      {/* Page Header */}
      <div className="border-b border-cream-200 pb-5">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-saffron-600 animate-spin" style={{ animationDuration: '6s' }} />
          Administrative Control Panel
        </h1>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
          Review statistics and manage registered portal users
        </p>
      </div>

      {/* Pending Committee Requests Section */}
      {users.filter(u => u.committeeStatus === 'pending').length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/20 border border-amber-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-slate-800">
              Pending Committee Membership Requests ({users.filter(u => u.committeeStatus === 'pending').length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {users.filter(u => u.committeeStatus === 'pending').map(req => (
              <div key={req.id} className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200 overflow-hidden shrink-0 text-sm">
                    {req.photoUrl ? (
                      <img src={req.photoUrl} alt={req.name} className="w-full h-full object-cover" />
                    ) : (
                      req.name ? req.name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{req.name}</span>
                    <span className="text-xs text-slate-500 font-semibold">{req.email} | {req.phone || 'No phone'} | {req.village || 'No area'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleApproveRequest(req)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeclineRequest(req.id)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-cream-300 rounded-xl font-bold transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Quick Navigation Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <Link to="/members" className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-saffron-400 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <Users className="w-5 h-5 text-saffron-500" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-saffron-500 transition-colors uppercase">Manage</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{counts.members}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Members Card List</span>
          </div>
        </Link>

        <Link to="/events" className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-saffron-400 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <Calendar className="w-5 h-5 text-saffron-500" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-saffron-500 transition-colors uppercase">Manage</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{counts.events}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Events</span>
          </div>
        </Link>

        <Link to="/announcements" className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-saffron-400 hover:shadow-sm transition-all group">
          <div className="flex justify-between items-start mb-2">
            <Bell className="w-5 h-5 text-saffron-500" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-saffron-500 transition-colors uppercase">Manage</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{counts.announcements}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Announcements</span>
          </div>
        </Link>

        <div 
          onClick={() => { setActiveTab('gallery'); }}
          className={`bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-saffron-400 hover:shadow-sm transition-all group cursor-pointer ${
            activeTab === 'gallery' ? 'ring-2 ring-saffron-500 border-transparent shadow' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <Image className="w-5 h-5 text-saffron-500" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-saffron-500 transition-colors uppercase font-mono">Manage</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white">{counts.gallery}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gallery Albums</span>
          </div>
        </div>

        {/* Total Donations stat card */}
        <div 
          onClick={() => { setActiveTab('donations'); setSearchTerm(''); setStatusFilter('all'); }}
          className={`bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-saffron-400 hover:shadow-sm transition-all group cursor-pointer ${
            activeTab === 'donations' ? 'ring-2 ring-saffron-500 border-transparent shadow' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <Heart className="w-5 h-5 text-saffron-500 fill-current animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-saffron-500 transition-colors uppercase">Ledger</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
              ₹{donations.filter(d => d.status === 'Success').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Donations</span>
          </div>
        </div>

        {/* Expenditure quick-nav card */}
        <Link
          to="/expenditure"
          className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between hover:border-emerald-400 hover:shadow-sm transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <Banknote className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600 transition-colors uppercase">Manage</span>
          </div>
          <div>
            <span className="block text-xl sm:text-2xl font-black text-slate-800 dark:text-white flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expenditure</span>
          </div>
        </Link>

      </div>

      {/* Tab Switcher Navigation */}
      <div className="flex border-b border-cream-200 dark:border-slate-800 gap-6 mt-4">
        <button
          onClick={() => { setActiveTab('users'); setSearchTerm(''); setStatusFilter('all'); setPurposeFilter('all'); }}
          className={`pb-3 text-xs uppercase tracking-wider font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'users'
              ? 'border-saffron-500 text-saffron-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Portal Accounts ({users.length})
        </button>
        <button
          onClick={() => { setActiveTab('donations'); setSearchTerm(''); setStatusFilter('all'); setPurposeFilter('all'); }}
          className={`pb-3 text-xs uppercase tracking-wider font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'donations'
              ? 'border-saffron-500 text-saffron-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Donations Ledger ({donations.length})
        </button>
        <button
          onClick={() => { setActiveTab('gallery'); setSearchTerm(''); }}
          className={`pb-3 text-xs uppercase tracking-wider font-black transition-all border-b-2 cursor-pointer ${
            activeTab === 'gallery'
              ? 'border-saffron-500 text-saffron-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Gallery Management ({counts.gallery})
        </button>
      </div>

      {/* Active Tab Panel */}
      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
          {/* Section Header */}
          <div className="bg-cream-50/50 dark:bg-slate-950/20 border-b border-cream-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-saffron-600" />
              Registered Portal Accounts ({users.length})
            </h2>
            <button 
              onClick={loadData}
              className="text-xs font-bold text-saffron-600 hover:text-saffron-700 hover:underline cursor-pointer"
            >
              Refresh Database
            </button>
          </div>

          {error && (
            <div className="m-6 bg-devored-50 border border-devored-200 text-devored-700 p-4 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* User Table (Responsive scroll container) */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cream-200 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-cream-50/20 font-extrabold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">User Details</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Phone</th>
                  <th scope="col" className="px-6 py-4">Village</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-900">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/20 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Name column */}
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-saffron-100 dark:bg-saffron-950/50 flex items-center justify-center text-saffron-700 dark:text-saffron-400 font-bold border border-saffron-200 dark:border-saffron-900 text-[10px]">
                          {item.name ? item.name[0].toUpperCase() : 'U'}
                        </div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    
                    {/* Email */}
                    <td className="px-6 py-4">{item.email}</td>
                    
                    {/* Phone */}
                    <td className="px-6 py-4">{item.phone || '-'}</td>
                    
                    {/* Village */}
                    <td className="px-6 py-4">{item.village || '-'}</td>
                    
                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        item.role === 'admin' 
                          ? 'bg-gold-100 dark:bg-gold-950/50 text-gold-800 dark:text-gold-400 border border-gold-200 dark:border-gold-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right flex justify-end gap-2 text-slate-500">
                      <button
                        onClick={() => handleToggleRole(item.id, item.role)}
                        className="p-1.5 rounded-lg border border-cream-300 dark:border-slate-800 text-slate-500 hover:text-saffron-600 hover:border-saffron-200 hover:bg-saffron-50/30 transition-all flex items-center gap-1 cursor-pointer"
                        title={`Switch role to ${item.role === 'admin' ? 'user' : 'admin'}`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Toggle Role
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-devored-600 hover:bg-devored-50 transition-all cursor-pointer"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No registered portal accounts found in database.
            </div>
          )}
        </div>
      ) : activeTab === 'donations' ? (
        /* DONATIONS TAB PANEL */
        <div className="space-y-6 animate-fade-in">
          {/* Donations Stat grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-250 dark:border-emerald-900/40 p-4 rounded-2xl">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold uppercase tracking-wider block mb-1">
                Successful Donations
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  ₹{donations.filter(d => d.status === 'Success').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  ({donations.filter(d => d.status === 'Success').length} paid)
                </span>
              </div>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-250 dark:border-amber-900/40 p-4 rounded-2xl">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider block mb-1">
                Pending Verification
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  ₹{donations.filter(d => d.status === 'Pending').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  ({donations.filter(d => d.status === 'Pending').length} pending)
                </span>
              </div>
            </div>

            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-250 dark:border-red-900/40 p-4 rounded-2xl">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider block mb-1">
                Failed/Rejected Transactions
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-800 dark:text-white">
                  ₹{donations.filter(d => d.status === 'Failed').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  ({donations.filter(d => d.status === 'Failed').length} failed)
                </span>
              </div>
            </div>
          </div>

          {/* Ledger Management table card */}
          <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            
            {/* Header controls (Search & Filter toolbar) */}
            <div className="p-5 border-b border-cream-200 dark:border-slate-800 bg-cream-50/20 dark:bg-slate-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search donor name, email, transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white transition-all"
                />
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="Success">Success Only</option>
                  <option value="Pending">Pending Only</option>
                  <option value="Failed">Failed Only</option>
                </select>

                {/* Purpose Dropdown */}
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white cursor-pointer"
                >
                  <option value="all">All Purposes</option>
                  <option value="General Fund">General Fund</option>
                  <option value="Annadanam Seva">Annadanam Seva</option>
                  <option value="Temple Renovation">Temple Renovation</option>
                  <option value="Community Education Kits">Education Support</option>
                </select>

                <button
                  onClick={loadData}
                  className="p-2 border border-cream-300 dark:border-slate-800 text-slate-500 hover:text-saffron-600 rounded-xl transition-colors cursor-pointer bg-white dark:bg-slate-900"
                  title="Reload Donations"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={filteredDonations().length === 0}
                  className="px-3 py-2 bg-saffron-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-saffron-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>

              </div>
            </div>

            {/* Donation Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-cream-200 dark:divide-slate-800 text-left text-xs">
                <thead className="bg-cream-50/20 font-extrabold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4">Donor Name</th>
                    <th scope="col" className="px-6 py-4">Contact Info</th>
                    <th scope="col" className="px-6 py-4">Amount</th>
                    <th scope="col" className="px-6 py-4">Purpose</th>
                    <th scope="col" className="px-6 py-4">Transaction Details</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium bg-white dark:bg-slate-900">
                  {filteredDonations().map((item) => (
                    <tr key={item.id} className="hover:bg-cream-50/20 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Donor Name */}
                      <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                        {item.donorName}
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{item.phone}</span>
                          <span className="text-[10px] text-slate-400">{item.email || '-'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-white">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Purpose */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border border-saffron-100 dark:border-saffron-900">
                          {item.purpose}
                        </span>
                      </td>

                      {/* Transaction Details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-[10px] text-slate-500 font-bold">{item.paymentId}</span>
                          <span className="text-[9px] text-slate-400">via {item.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 w-max ${
                          item.status === 'Success'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900'
                            : item.status === 'Pending'
                            ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-900'
                            : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-250 dark:border-red-900'
                        }`}>
                          {item.status === 'Success' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {item.status === 'Pending' && <AlertCircle className="w-3.5 h-3.5" />}
                          {item.status === 'Failed' && <XCircle className="w-3.5 h-3.5" />}
                          {item.status}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleString('en-IN')}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDonations().length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No matching donations found in ledger.
              </div>
            )}

          </div>
        </div>
      ) : activeTab === 'gallery' ? (
        /* GALLERY TAB PANEL */
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-saffron-600" />
                  Gallery Album Management ({gallery.length})
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Create, edit, and delete photo albums displayed in the public gallery section.
                </p>
              </div>
              <button
                onClick={() => openGalleryModal()}
                className="px-4 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm shadow-saffron-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create New Album
              </button>
            </div>

            {gallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map(album => {
                  const images = album.imageUrls && album.imageUrls.length > 0 ? album.imageUrls : (album.imageUrl ? [album.imageUrl] : []);
                  return (
                    <div key={album.id} className="bg-cream-50/20 dark:bg-slate-950/20 border border-cream-250 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div>
                        {/* Cover Image Box */}
                        <div className="aspect-video relative bg-slate-950">
                          <img
                            src={album.coverImageUrl || album.imageUrl || (images[0] || '/placeholder.png')}
                            alt={album.title || album.caption}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest font-mono">
                            {images.length} PHOTOS
                          </span>
                        </div>
                        {/* Album info */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm line-clamp-1">
                            {album.title || album.caption || 'Untitled Album'}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {album.description || album.category || 'No description provided.'}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">
                            Event Date: {album.eventDate ? new Date(album.eventDate).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="p-4 border-t border-cream-200/50 dark:border-slate-800/50 flex items-center justify-between gap-3 text-xs bg-cream-50/10 dark:bg-slate-950/10">
                        <button
                          onClick={() => openGalleryModal(album)}
                          className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-cream-300 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:bg-cream-50 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-saffron-600" />
                          Edit Album
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(album.id)}
                          className="p-2 bg-devored-50 hover:bg-devored-100 text-devored-600 dark:bg-devored-950/20 dark:text-devored-400 rounded-xl cursor-pointer transition-colors"
                          title="Delete Album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs border border-dashed border-cream-300 dark:border-slate-800 rounded-2xl">
                No gallery albums found. Click 'Create New Album' to get started.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* GALLERY MANAGEMENT FORM MODAL */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-cream-200 dark:border-slate-800 overflow-hidden animate-slide-up my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="font-extrabold text-sm uppercase tracking-wider">
                {editingGalleryItem ? 'Edit Gallery Album' : 'Create New Gallery Album'}
              </h2>
              <button 
                onClick={() => { setIsGalleryModalOpen(false); setEditingGalleryItem(null); }} 
                className="text-white hover:text-saffron-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveGallery} className="p-6 space-y-5">
              {/* Feedback messages */}
              {galleryError && (
                <div className="bg-devored-50 border border-devored-200 text-devored-700 p-3.5 rounded-xl text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{galleryError}</span>
                </div>
              )}
              {gallerySuccess && (
                <div className="bg-emerald-50 border border-emerald-250 text-emerald-700 p-3.5 rounded-xl text-xs flex gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{gallerySuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left side text inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
                      Album Title *
                    </label>
                    <input
                      type="text"
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Annual Hanuman Jayanthi Seva"
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
                      Short Description *
                    </label>
                    <textarea
                      value={galleryForm.description}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Write a brief overview of the event/album..."
                      rows="3"
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:text-white resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      value={galleryForm.eventDate}
                      onChange={(e) => setGalleryForm(prev => ({ ...prev, eventDate: e.target.value }))}
                      className="w-full bg-cream-50/50 dark:bg-slate-950 border border-cream-300 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-saffron-500 dark:text-white cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Right side image uploads */}
                <div className="space-y-4">
                  {/* Cover image uploader */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
                      Cover Image *
                    </label>
                    <div className="bg-cream-50/30 dark:bg-slate-950/20 border border-cream-350 dark:border-slate-800 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="admin-cover-input"
                          onChange={handleCoverImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="admin-cover-input"
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-cream-300 dark:border-slate-800 rounded-lg text-[10px] font-extrabold text-slate-700 dark:text-slate-350 hover:bg-cream-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm"
                        >
                          Choose Cover Image
                        </label>
                        <span className="text-[9px] text-slate-400">JPG/PNG, Max 5MB</span>
                      </div>
                      
                      {galleryForm.coverImage && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-cream-300 dark:border-slate-800 max-h-24 bg-slate-950">
                          <img src={galleryForm.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setGalleryForm(prev => ({ ...prev, coverImage: '' }))}
                            className="absolute top-1 right-1 bg-devored-600 hover:bg-devored-700 text-white p-1 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Album images uploader */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 pl-1">
                      Album Images (Multiple)
                    </label>
                    <div className="bg-cream-50/30 dark:bg-slate-950/20 border border-cream-350 dark:border-slate-800 rounded-xl p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="admin-gallery-input"
                          onChange={handleGalleryImagesChange}
                          multiple
                          className="hidden"
                        />
                        <label
                          htmlFor="admin-gallery-input"
                          className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-cream-300 dark:border-slate-800 rounded-lg text-[10px] font-extrabold text-slate-700 dark:text-slate-350 hover:bg-cream-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm"
                        >
                          Choose Photos
                        </label>
                        <span className="text-[9px] text-slate-400">Can select multiple</span>
                      </div>

                      {/* Display previews of existing and new images */}
                      {(galleryForm.existingGalleryImages.length > 0 || galleryForm.newGalleryImages.length > 0) && (
                        <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1 border-t border-cream-200 dark:border-slate-800 pt-2.5">
                          {/* Existing photos (loaded from DB) */}
                          {galleryForm.existingGalleryImages.map((url, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-cream-300 dark:border-slate-800 bg-slate-950 group">
                              <img src={url} alt="Album existing" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => handleRemoveExistingImage(idx)}
                                className="absolute -top-1 -right-1 bg-devored-600 hover:bg-devored-750 text-white p-1 rounded-full shadow-md transition-transform hover:scale-115 cursor-pointer"
                                title="Remove existing image"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}

                          {/* Newly selected local photos */}
                          {galleryForm.newGalleryImages.map((base64, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-saffron-300 dark:border-saffron-950 bg-slate-950 group">
                              <img src={base64} alt="Album new" className="w-full h-full object-cover" />
                              <span className="absolute bottom-0 inset-x-0 bg-saffron-500/80 text-[7px] text-white font-bold text-center py-0.5">NEW</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewImage(idx)}
                                className="absolute -top-1 -right-1 bg-devored-600 hover:bg-devored-750 text-white p-1 rounded-full shadow-md transition-transform hover:scale-115 cursor-pointer"
                                title="Remove new image"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-cream-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setIsGalleryModalOpen(false); setEditingGalleryItem(null); }}
                  className="px-4 py-2 border border-cream-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cream-50 dark:hover:bg-slate-850 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingGallery}
                  className="px-5 py-2 bg-saffron-500 hover:bg-saffron-600 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-saffron-500/10"
                >
                  {isSavingGallery && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSavingGallery ? 'Saving Album...' : (editingGalleryItem ? 'Save Album' : 'Create Album')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
