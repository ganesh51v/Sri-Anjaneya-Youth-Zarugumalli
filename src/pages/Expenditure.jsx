import React, { useState, useEffect, useRef, useMemo } from 'react';
import { dbService } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
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

const EMPTY_FORM = {
  title: '', category: 'Event Expenses', amount: '', date: '',
  paymentMethod: 'Cash', paidTo: '', description: '', receipt: '',
};

// ─── Category Badge ──────────────────────────────────────────────────────────
const CategoryBadge = ({ value }) => {
  const cat = CATEGORIES.find(c => c.value === value) || CATEGORIES[CATEGORIES.length - 1];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cat.color}`}>
      <Tag className="w-2.5 h-2.5" /> {value}
    </span>
  );
};

// ─── Confirm Delete Modal ────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
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
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-devored-600 hover:bg-devored-700 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── Form Modal ──────────────────────────────────────────────────────────────
const ExpenditureFormModal = ({ initialData, onSave, onClose, currentUser }) => {
  // Bug fix: ensure amount is always a string for the <input type="number"> element,
  // and strip internal Firestore fields (id, createdAt) from the edit form state.
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
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Amount must be greater than 0.';
    if (!form.date) errs.date = 'Date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, receipt: 'Only image or PDF files are allowed.' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, receipt: 'File size must be under 2 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      set('receipt', reader.result);
      setErrors(prev => { const { receipt: _, ...rest } = prev; return rest; });
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
        createdBy: currentUser?.name || 'Admin',
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save expenditure.' });
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">{label}</label>
      {children}
      {error && <p className="text-[10px] text-devored-600 mt-0.5 font-semibold">{error}</p>}
    </div>
  );

  const inputCls = (err) => `w-full bg-cream-50/50 dark:bg-slate-800 border ${err ? 'border-devored-400' : 'border-cream-300 dark:border-slate-700'} rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent transition-all dark:text-white placeholder:text-slate-400`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-cream-200 dark:border-slate-700 overflow-hidden animate-slide-up my-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-500 via-saffron-600 to-devored-600 text-white px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5" />
            <h2 className="font-extrabold text-base">{initialData ? 'Edit Expenditure' : 'Add New Expenditure'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errors.submit && (
            <div className="bg-devored-50 dark:bg-devored-900/30 border border-devored-200 text-devored-700 dark:text-devored-400 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <Field label="Expense Title *" error={errors.title}>
              <input
                type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Ganesh Chaturthi Decoration"
                className={inputCls(errors.title)}
              />
            </Field>

            {/* Category */}
            <Field label="Category *">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls(false)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
              </select>
            </Field>

            {/* Amount */}
            <Field label="Amount (₹) *" error={errors.amount}>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
                  placeholder="0.00"
                  className={`${inputCls(errors.amount)} pl-9`}
                />
              </div>
            </Field>

            {/* Date */}
            <Field label="Date *" error={errors.date}>
              <input
                type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className={inputCls(errors.date)}
              />
            </Field>

            {/* Payment Method */}
            <Field label="Payment Method">
              <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)} className={inputCls(false)}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>

            {/* Paid To */}
            <Field label="Paid To">
              <input
                type="text" value={form.paidTo} onChange={e => set('paidTo', e.target.value)}
                placeholder="e.g. Sri Rama Tent House"
                className={inputCls(false)}
              />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description / Notes">
            <textarea
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional notes about this expense..."
              rows={3}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>

          {/* Receipt Upload */}
          <Field label="Receipt / Bill (Image or PDF, max 2 MB)" error={errors.receipt}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cream-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-saffron-400 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-400" />
              <span className="text-xs text-slate-500 font-semibold">
                {form.receipt ? '✅ Receipt uploaded — click to replace' : 'Click to upload receipt'}
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
              Cancel
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
              {initialData ? 'Update Expenditure' : 'Save Expenditure'}
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
      setError('Failed to load expenditure data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalDonations = useMemo(() =>
    donations.filter(d => d.status === 'Success').reduce((sum, d) => sum + parseFloat(d.amount || 0), 0),
    [donations]
  );

  const totalExpenditure = useMemo(() =>
    expenditures.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [expenditures]
  );

  const remainingBalance = totalDonations - totalExpenditure;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenditure = useMemo(() =>
    expenditures.filter(e => {
      // Parse YYYY-MM-DD as local date to avoid UTC-to-IST timezone shift
      const parts = (e.date || '').split('-');
      if (parts.length < 3) return false;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed
      return month === currentMonth && year === currentYear;
    }).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [expenditures, currentMonth, currentYear]
  );

  const categoryTotals = useMemo(() => {
    const map = {};
    expenditures.forEach(e => {
      map[e.category] = (map[e.category] || 0) + parseFloat(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenditures]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return expenditures.filter(e => {
      const matchSearch = !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.paidTo?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'all' || e.category === categoryFilter;
      const matchPay = paymentFilter === 'all' || e.paymentMethod === paymentFilter;
      const matchFrom = !dateFrom || new Date(e.date) >= new Date(dateFrom);
      const matchTo = !dateTo || new Date(e.date) <= new Date(dateTo);
      return matchSearch && matchCat && matchPay && matchFrom && matchTo;
    });
  }, [expenditures, search, categoryFilter, paymentFilter, dateFrom, dateTo]);

  const filteredTotal = useMemo(() =>
    filtered.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0),
    [filtered]
  );

  // ── CRUD handlers ───────────────────────────────────────────────────────────
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
      new Date(e.date).toLocaleDateString('en-IN'),
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
  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-saffron-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-saffron-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-xs text-slate-500 font-semibold animate-pulse">Loading Expenditure Records...</p>
    </div>
  );

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <SEO title="Expenditure Management" description="Admin expenditure management for Sri Anjaneya Youth Zarugumalli — track and manage all association expenses." path="/expenditure" />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
            <Banknote className="w-6 h-6 text-saffron-600" />
            Expenditure Management
          </h1>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Track & manage all association expenses
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
          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="saffron-gradient-btn rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
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
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Donations</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmt(totalDonations)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{donations.filter(d => d.status === 'Success').length} successful transactions</div>
        </div>

        {/* Total Expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Expenditure</span>
            <TrendingDown className="w-4 h-4 text-devored-500" />
          </div>
          <div className="text-xl font-black text-devored-600 dark:text-devored-400">{fmt(totalExpenditure)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{expenditures.length} expense records</div>
        </div>

        {/* Remaining Balance */}
        <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-1.5 ${remainingBalance >= 0 ? 'border-emerald-200 dark:border-emerald-900/40' : 'border-devored-200 dark:border-devored-900/40'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Remaining Balance</span>
            <Wallet className={`w-4 h-4 ${remainingBalance >= 0 ? 'text-emerald-500' : 'text-devored-500'}`} />
          </div>
          <div className={`text-xl font-black ${remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-devored-600 dark:text-devored-400'}`}>
            {fmt(remainingBalance)}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            {totalDonations > 0 ? `${((totalExpenditure / totalDonations) * 100).toFixed(1)}% of donations used` : 'No donations yet'}
          </div>
        </div>

        {/* Monthly Expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-2xl p-5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">This Month</span>
            <Clock className="w-4 h-4 text-saffron-500" />
          </div>
          <div className="text-xl font-black text-saffron-600 dark:text-saffron-400">{fmt(monthlyExpenditure)}</div>
          <div className="text-[10px] text-slate-400 font-semibold">{new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* ── Category Breakdown ────────────────────────────────────────────────── */}
      {categoryTotals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-cream-200 dark:border-slate-800 rounded-3xl p-6">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4 text-saffron-500" />
            Category-wise Expenditure
          </h2>
          <div className="space-y-3">
            {categoryTotals.map(([cat, amount]) => {
              const pct = totalExpenditure > 0 ? (amount / totalExpenditure) * 100 : 0;
              const catStyle = CATEGORIES.find(c => c.value === cat);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CategoryBadge value={cat} />
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
              Expenditure Records
              <span className="ml-1 px-2 py-0.5 rounded-full bg-saffron-100 dark:bg-saffron-950/40 text-saffron-700 dark:text-saffron-400 text-[10px] font-black">
                {filtered.length}
              </span>
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-[10px] font-bold border border-cream-300 dark:border-slate-700 rounded-xl hover:border-saffron-400 hover:text-saffron-600 transition-all cursor-pointer text-slate-600 dark:text-slate-400"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text" placeholder="Search title, paid to..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white"
              />
            </div>

            {/* Category filter */}
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white">
              <option value="all">All Categories</option>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
            </select>

            {/* Payment method filter */}
            <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
              className="text-xs bg-white dark:bg-slate-800 border border-cream-300 dark:border-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-saffron-500 dark:text-white">
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
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
                  <X className="w-3 h-3" /> Clear all filters
                </button>
              )}
            </div>
            <div className="text-[11px] font-black text-slate-800 dark:text-white">
              Showing total: <span className="text-saffron-600 dark:text-saffron-400">{fmt(filteredTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── Records Table ──────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
            <Receipt className="w-12 h-12 opacity-30" />
            <div className="text-center">
              <p className="font-bold text-sm text-slate-500 dark:text-slate-400">No expenditure records found</p>
              <p className="text-xs mt-1">{expenditures.length === 0 ? 'Click "Add Expense" to create your first record.' : 'Try adjusting your filters.'}</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-cream-100 dark:divide-slate-800 text-left text-xs">
              <thead className="bg-cream-50/30 dark:bg-slate-950/20 text-slate-400 font-black uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">Expense Details</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Paid To</th>
                  <th className="px-5 py-4">Receipt</th>
                  <th className="px-5 py-4 text-right">Actions</th>
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
                      <CategoryBadge value={exp.category} />
                    </td>
                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="font-black text-slate-800 dark:text-white text-sm">{fmt(exp.amount)}</span>
                    </td>
                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <CalendarDays className="w-3 h-3 text-saffron-500" />
                        {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    {/* Payment Method */}
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <CreditCard className="w-3 h-3 text-slate-400" />
                        {exp.paymentMethod}
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
                          <FileText className="w-3.5 h-3.5" /> View
                        </a>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[10px]">—</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTarget(exp); setShowForm(true); }}
                          className="p-1.5 rounded-lg bg-saffron-50 dark:bg-saffron-950/30 text-saffron-600 hover:bg-saffron-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 rounded-lg bg-devored-50 dark:bg-devored-900/30 text-devored-600 hover:bg-devored-100 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showForm && (
        <ExpenditureFormModal
          initialData={editTarget}
          onSave={editTarget ? handleEdit : handleAdd}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          currentUser={user}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Delete Expenditure Record"
          message={`Are you sure you want to permanently delete "${deleteTarget.title}" (${fmt(deleteTarget.amount)})? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Expenditure;
