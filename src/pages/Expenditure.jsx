import React, { useState, useEffect, useRef, useMemo } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import SEO from '../components/SEO';
import {
  PlusCircle, Edit3, Trash2, Search, Filter, Download,
  RefreshCw, IndianRupee, TrendingUp, TrendingDown, Wallet,
  Receipt, X, Check, AlertTriangle, ChevronDown, CalendarDays,
  Tag, CreditCard, UserCircle, FileText, Upload, BarChart3,
  PieChart, Clock, Banknote
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'Event Expenses',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'Decoration',       color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' },
  { value: 'Food',             color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'Transport',        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { value: 'Maintenance',      color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  { value: 'Donation Usage',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: 'Other Expenses',   color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
];

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Card', 'Other'];

const getCategoryName = (val, lang) => {
  if (lang === 'en') return val;
  switch (val) {
    case 'Event Expenses': return 'కార్యక్రమ ఖర్చులు';
    case 'Decoration': return 'అలంకరణ';
    case 'Food': return 'భోజన / అన్నదానం';
    case 'Transport': return 'రవాణా';
    case 'Maintenance': return 'నిర్వహణ';
    case 'Donation Usage': return 'విరాళాల వినియోగం';
    case 'Other Expenses': return 'ఇతర ఖర్చులు';
    default: return val;
  }
};

const getMethodName = (val, lang) => {
  if (lang === 'en') return val;
  switch (val) {
    case 'Cash': return 'నగదు';
    case 'UPI': return 'UPI';
    case 'Bank Transfer': return 'బ్యాంక్ బదిలీ';
    case 'Cheque': return 'చెక్';
    case 'Card': return 'కార్డ్';
    case 'Other': return 'ఇతరములు';
    default: return val;
  }
};

const EMPTY_FORM = {
  title: '', category: 'Event Expenses', amount: '', date: '',
  paymentMethod: 'Cash', paidTo: '', description: '', receipt: '',
};

// ─── Category Badge ──────────────────────────────────────────────────────────
const CategoryBadge = ({ value, language }) => {
  const cat = CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cat.color}`}>
      <Tag className="w-2.5 h-2.5" /> {getCategoryName(value, language)}
    </span>
  );
};

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, t }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full shadow-2xl border border-cream-200 dark:border-slate-700 overflow-hidden animate-slide-up">
      <div className="bg-gradient-to-r from-devored-600 to-devored-700 text-white px-6 py-4 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        <h2 className="font-extrabold text-sm">{title}</h2>
      </div>
      <div className="p-6 space-y-5">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-cream-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-devored-600 hover:bg-devored-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Form Modal ──────────────────────────────────────────────────────────────
const ExpenditureFormModal = ({ initialData, onSave, onClose, currentUser }) => {
  const { language, t } = useLanguage();
  const sanitizeInitial = (data) => {
    if (!data) return null;
    const { id: _id, createdAt: _ca, ...rest } = data;
    return { ...rest, amount: data.amount != null ? String(data.amount) : '' };
  };
  const [form, setForm] = useState(
    sanitizeInitial(initialData) || { ...EMPTY_FORM, date: new Date().toISOString().split('T')[0] }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = language === 'en' ? 'Title is required.' : 'శీర్షిక అవసరం.';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = language === 'en' ? 'Amount must be greater than 0.' : 'మొత్తం 0 కంటే ఎక్కువ ఉండాలి.';
    if (!form.date) errs.date = language === 'en' ? 'Date is required.' : 'తేదీ అవసరం.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrors(er => ({ ...er, receipt: language === 'en' ? 'Only JPG, PNG, WEBP, GIF, PDF allowed.' : 'JPG, PNG, WEBP, GIF, PDF మాత్రమే అనుమతించబడతాయి.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(er => ({ ...er, receipt: language === 'en' ? 'File size must be under 2 MB.' : 'ఫైల్ పరిమాణం 2 MB కంటే తక్కువ ఉండాలి.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set('receipt', reader.result);
      setErrors(er => ({ ...er, receipt: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        ...form,
        amount: parseFloat(form.amount),
        createdBy: currentUser?.name || currentUser?.email || 'Admin',
      });
      onClose();
    } catch (err) {
      setErrors(er => ({ ...er, form: err.message || (language === 'en' ? 'Failed to save.' : 'సేవ్ చేయడంలో విఫలమైంది.') }));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (hasErr) =>
    `w-full text-xs bg-cream-50 dark:bg-slate-800 border ${
      hasErr ? 'border-devored-400 focus:ring-devored-400' : 'border-cream-300 dark:border-slate-700 focus:ring-saffron-500'
    } rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 dark:text-white transition-all`;

  const Field = ({ label, error: err, children }) => (
    <div className="space-y-1">
      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 pl-0.5">
        {label}
      </label>
      {children}
      {err && <p className="text-[10px] text-devored-600 font-semibold pl-1">{err}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-cream-200 dark:border-slate-700 overflow-hidden my-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <h2 className="font-extrabold text-sm uppercase tracking-wider">
              {initialData ? t('editExpense') : t('addExpense')}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errors.form && (
            <div className="bg-devored-50 dark:bg-devored-900/30 border border-devored-200 text-devored-700 dark:text-devored-300 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {errors.form}
            </div>
          )}

          {/* Title */}
          <Field label={`${t('expenseTitle')} *`} error={errors.title}>
            <input
              type="text" value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g., Hanuman Jayanthi Flowers & Puja Items"
              className={inputCls(errors.title)}
            />
          </Field>

          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={`${t('category')} *`}>
              <select
                value={form.category} onChange={e => set('category', e.target.value)}
                className={inputCls(false)}
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{getCategoryName(c.value, language)}</option>
                ))}
              </select>
            </Field>

            <Field label={`${t('amount')} (₹) *`} error={errors.amount}>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="number" min="0.01" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls(errors.amount)} pl-8`}
                />
              </div>
            </Field>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={`${t('date')} *`} error={errors.date}>
              <input
                type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={inputCls(errors.date)}
              />
            </Field>

            <Field label={`${t('paymentMethod')} *`}>
              <select
                value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
                className={inputCls(false)}
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{getMethodName(m, language)}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Paid To */}
          <Field label={t('paidTo')}>
            <input
              type="text" value={form.paidTo} onChange={e => set('paidTo', e.target.value)}
              placeholder="e.g., Sri Sai Floral Vendors / S. Raman"
              className={inputCls(false)}
            />
          </Field>

          {/* Description */}
          <Field label={`${t('description')} / Notes`}>
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional notes about this expense..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Receipt Upload */}
          <Field label={`${t('receipt')} (Image or PDF, max 2 MB)`} error={errors.receipt}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cream-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-saffron-400 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">
                {form.receipt ? (language === 'en' ? '✅ Receipt uploaded — click to replace' : '✅ రసీదు అప్‌లోడ్ అయింది — మార్చడానికి క్లిక్ చేయండి') : (language === 'en' ? 'Click to upload receipt' : 'రసీదు అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి')}
              </span>
              <span className="text-[10px] text-slate-400">JPG, PNG, PDF accepted</span>
              <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
            </div>
            {form.receipt && form.receipt.startsWith('data:image') && (
              <img src={form.receipt} alt="Receipt preview" className="mt-2 w-32 h-20 object-cover rounded-lg border border-cream-200" />
            )}
          </Field>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-cream-100 dark:border-slate-800">
            <button
              type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-cream-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit" disabled={saving}
              className="px-6 py-2.5 saffron-gradient-btn rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {initialData ? t('editExpense') : t('saveExpense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const Expenditure = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [expenditures, setExpenditures] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [exps, dons] = await Promise.all([
        dbService.expenditures.getAll(),
        dbService.donations.getAll(),
      ]);
      setExpenditures(exps);
      setDonations(dons);
    } catch (err) {
      setError(language === 'en' ? 'Failed to load data. Please refresh.' : 'డేటా లోడ్ చేయడంలో విఫలమైంది. దయచేసి రిఫ్రెష్ చేయండి.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ── Financial Metrics ───────────────────────────────────────────────────────
  const totalDonations = useMemo(() => {
    return donations
      .filter(d => d.status === 'Success' || !d.status)
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
  }, [donations]);

  const totalExpenditure = useMemo(() => {
    return expenditures.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenditures]);

  const remainingBalance = totalDonations - totalExpenditure;

  const monthlyExpenditure = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return expenditures
      .filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      })
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenditures]);

  // Category-wise totals
  const categoryTotals = useMemo(() => {
    const map = {};
    expenditures.forEach(e => {
      map[e.category] = (map[e.category] || 0) + (parseFloat(e.amount) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenditures]);

  // ── Filtered Expenditures ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenditures.filter(e => {
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (paymentFilter !== 'all' && e.paymentMethod !== paymentFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = e.title?.toLowerCase().includes(q);
        const matchPaidTo = e.paidTo?.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q);
        const matchCat = e.category?.toLowerCase().includes(q);
        if (!matchTitle && !matchPaidTo && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [expenditures, categoryFilter, paymentFilter, dateFrom, dateTo, search]);

  const filteredTotal = useMemo(() => {
    return filtered.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  }, [filtered]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAdd = async (formData) => {
    const saved = await dbService.expenditures.add(formData);
    setExpenditures(prev => [saved, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const handleEdit = async (formData) => {
    const updated = await dbService.expenditures.update(editTarget.id, formData);
    setExpenditures(prev => prev.map(e => e.id === editTarget.id ? { ...e, ...updated } : e));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dbService.expenditures.delete(deleteTarget.id);
    setExpenditures(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ── Export CSV ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Amount (₹)', 'Date', 'Payment Method', 'Paid To', 'Description', 'Created By'];
    const rows = filtered.map(e => [
      e.title, e.category, e.amount,
      new Date(e.date).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN'),
      e.paymentMethod, e.paidTo || '-', e.description || '-', e.createdBy || '-'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `expenditures_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Format currency ─────────────────────────────────────────────────────────
  const fmt = (n) => new Intl.NumberFormat(language === 'en' ? 'en-IN' : 'te-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-saffron-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-saffron-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-xs text-slate-500 font-semibold animate-pulse">
        {language === 'en' ? 'Loading Expenditure Records...' : 'ఖర్చుల రికార్డులు లోడ్ అవుతున్నాయి...'}
      </p>
    </div>
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <SEO title={t('expenditure')} description="Admin expenditure management for Sri Anjaneya Youth Zarugumalli — track and manage all association expenses." path="/expenditure" />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-saffron-600" />
            {t('expenditureTitle')}
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            {t('expenditureSubtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-cream-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-saffron-600 hover:border-saffron-400 transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="saffron-gradient-btn rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {t('addExpense')}
            </button>
          )}
          {user?.role !== 'admin' && (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide">
              {language === 'en' ? 'View Only' : 'వీక్షణ మాత్రమే'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-devored-50 dark:bg-devored-900/20 border border-devored-200 text-devored-700 dark:text-devored-400 p-4 rounded-2xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Summary Dashboard ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donations */}
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5 hover-lift hover-glow-gold transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('totalIncome')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmt(totalDonations)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">
            {donations.filter(d => d.status === 'Success').length} {language === 'en' ? 'successful transactions' : 'విజయవంతమైన లావాదేవీలు'}
          </div>
        </div>

        {/* Total Expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5 hover-lift hover-glow-saffron transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('totalExpense')}</span>
            <TrendingDown className="w-4 h-4 text-devored-500" />
          </div>
          <div className="text-xl font-black text-devored-600 dark:text-devored-400">{fmt(totalExpenditure)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">
            {expenditures.length} {language === 'en' ? 'expense records' : 'ఖర్చు రికార్డులు'}
          </div>
        </div>

        {/* Remaining Balance */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-1.5 hover-lift hover-glow-gold transition-all duration-300 ${remainingBalance >= 0 ? 'border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-400' : 'border-devored-200 dark:border-devored-900/40 hover:border-devored-400'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t('netBalance')}</span>
            <Wallet className={`w-4 h-4 ${remainingBalance >= 0 ? 'text-emerald-500' : 'text-devored-500'}`} />
          </div>
          <div className={`text-xl font-black ${remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-devored-600 dark:text-devored-400'}`}>
            {fmt(remainingBalance)}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            {totalDonations > 0 ? (language === 'en' ? `${((totalExpenditure / totalDonations) * 100).toFixed(1)}% of donations used` : `విరాళాలలో ${((totalExpenditure / totalDonations) * 100).toFixed(1)}% వినియోగించబడింది`) : (language === 'en' ? 'No donations yet' : 'విరాళాలు లేవు')}
          </div>
        </div>

        {/* Monthly Expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5 hover-lift hover-glow-saffron transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === 'en' ? 'This Month' : 'ఈ నెల'}
            </span>
            <Clock className="w-4 h-4 text-saffron-500" />
          </div>
          <div className="text-xl font-black text-saffron-600 dark:text-saffron-400">{fmt(monthlyExpenditure)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{new Date().toLocaleString(language === 'en' ? 'en-IN' : 'te-IN', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* ── Category Breakdown ────────────────────────────────────────────────── */}
      {categoryTotals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl p-6">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4 text-saffron-500" />
            {language === 'en' ? 'Category-wise Expenditure' : 'వర్గాల వారీగా ఖర్చులు'}
          </h2>
          <div className="space-y-3">
            {categoryTotals.map(([cat, amount]) => {
              const pct = totalExpenditure > 0 ? (amount / totalExpenditure) * 100 : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryBadge value={cat} language={language} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-500 font-semibold">{pct.toFixed(1)}%</span>
                      <span className="font-black text-slate-800 dark:text-white w-24 text-right">{fmt(amount)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-cream-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-saffron-500 to-devored-500 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Filters & Search ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-cream-50/50 dark:bg-slate-950/20 border-b border-cream-200 dark:border-slate-800 px-6 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-saffron-600" />
              {language === 'en' ? 'Expenditure Records' : 'ఖర్చు రికార్డులు'}
              <span className="ml-1 px-2 py-0.5 rounded-full bg-saffron-100 dark:bg-saffron-950/40 text-saffron-700 dark:text-saffron-400 text-[10px] font-black">
                {filtered.length}
              </span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold border border-cream-300 dark:border-slate-700 rounded-xl hover:border-saffron-400 hover:text-saffron-600 transition-all cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <Download className="w-3.5 h-3.5" /> {t('downloadReport')} (CSV)
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder={t('searchExpense')} value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white"
              />
            </div>

            {/* Category filter */}
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white">
              <option value="all">{t('allCategories')}</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{getCategoryName(c.value, language)}</option>)}
            </select>

            {/* Payment method filter */}
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white">
              <option value="all">{t('allMethods')}</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{getMethodName(m, language)}</option>)}
            </select>

            {/* Date from / to */}
            <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="flex-1 text-[10px] bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white"
                title="From date" />
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="flex-1 text-[10px] bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-2 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white"
                title="To date" />
            </div>
          </div>

          {/* Active filters summary + total */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {(search || categoryFilter !== 'all' || paymentFilter !== 'all' || dateFrom || dateTo) && (
                <button
                  onClick={() => { setSearch(''); setCategoryFilter('all'); setPaymentFilter('all'); setDateFrom(''); setDateTo(''); }}
                  className="text-[10px] text-devored-600 hover:underline font-bold cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> {language === 'en' ? 'Clear all filters' : 'ఫిల్టర్లు క్లియర్ చేయి'}
                </button>
              )}
            </div>
            <div className="text-[11px] font-black text-slate-800 dark:text-white">
              {language === 'en' ? 'Showing total:' : 'మొత్తం చూపుతున్నది:'} <span className="text-saffron-600 dark:text-saffron-400">{fmt(filteredTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Records Table ──────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
            <Receipt className="w-12 h-12 opacity-30" />
            <div className="text-center">
              <p className="font-bold text-sm text-slate-500 dark:text-slate-400">{t('noExpensesFound')}</p>
              <p className="text-xs mt-1">{expenditures.length === 0 ? (language === 'en' ? 'Click "Add Expense" to create your first record.' : 'మొదటి రికార్డును నమోదు చేయడానికి "ఖర్చును నమోదు చేయి" పై క్లిక్ చేయండి.') : (language === 'en' ? 'Try adjusting your filters.' : 'ఫిల్టర్‌లను మార్చి ప్రయత్నించండి.')}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cream-100 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-cream-50/30 dark:bg-slate-950/20 text-slate-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">{t('expenseTitle')}</th>
                  <th className="px-5 py-4">{t('category')}</th>
                  <th className="px-5 py-4">{t('amount')}</th>
                  <th className="px-5 py-4">{t('date')}</th>
                  <th className="px-5 py-4">{t('paymentMethod')}</th>
                  <th className="px-5 py-4">{t('paidTo')}</th>
                  <th className="px-5 py-4">{t('receipt')}</th>
                  {user?.role === 'admin' && (
                    <th className="px-5 py-4 text-right">{t('actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-50 dark:divide-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300">
                {filtered.map(exp => (
                  <tr key={exp.id} className="hover:bg-cream-50/30 dark:hover:bg-slate-800/40 transition-colors group">
                    {/* Title */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-black text-slate-800 dark:text-white text-xs">{exp.title}</p>
                        {exp.description && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">{exp.description}</p>
                        )}
                        <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">by {exp.createdBy || 'Admin'}</p>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="px-5 py-4">
                      <CategoryBadge value={exp.category} language={language} />
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="font-black text-slate-800 dark:text-white text-sm">{fmt(exp.amount)}</span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <CalendarDays className="w-3 h-3 text-saffron-500" />
                        {new Date(exp.date).toLocaleDateString(language === 'en' ? 'en-IN' : 'te-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    {/* Payment Method */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {getMethodName(exp.paymentMethod, language)}
                      </span>
                    </td>
                    {/* Paid To */}
                    <td className="px-5 py-4">
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">{exp.paidTo || '—'}</span>
                    </td>
                    {/* Receipt */}
                    <td className="px-5 py-4">
                      {exp.receipt ? (
                        <a
                          href={exp.receipt} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-saffron-600 hover:underline font-bold"
                        >
                          <FileText className="w-3.5 h-3.5" /> {language === 'en' ? 'View' : 'చూడండి'}
                        </a>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    {/* Actions — admin only */}
                    {user?.role === 'admin' && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditTarget(exp); setShowForm(true); }}
                            className="p-1.5 rounded-lg bg-saffron-50 dark:bg-saffron-950/30 text-saffron-600 hover:bg-saffron-100 transition-colors cursor-pointer"
                            title={t('edit')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 rounded-lg bg-devored-50 dark:bg-devored-900/30 text-devored-600 hover:bg-devored-100 transition-colors cursor-pointer"
                            title={t('delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals — admin only ───────────────────────────────────────────────── */}
      {showForm && user?.role === 'admin' && (
        <ExpenditureFormModal
          initialData={editTarget}
          onSave={editTarget ? handleEdit : handleAdd}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          currentUser={user}
        />
      )}
      {deleteTarget && user?.role === 'admin' && (
        <ConfirmModal
          title={language === 'en' ? 'Delete Expenditure Record' : 'ఖర్చు రికార్డును తొలగించండి'}
          message={language === 'en' ? `Are you sure you want to permanently delete "${deleteTarget.title}" (${fmt(deleteTarget.amount)})? This action cannot be undone.` : `మీరు ఖచ్చితంగా "${deleteTarget.title}" (${fmt(deleteTarget.amount)}) ను శాశ్వతంగా తొలగించాలనుకుంటున్నారా?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          t={t}
        />
      )}
    </div>
  );
};

export default Expenditure;
