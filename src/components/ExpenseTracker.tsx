import React, { useState, useEffect, useCallback } from 'react';
import { DiamondApi } from '../services/api';
import {
  PlusCircle, Trash2, TrendingDown, Wallet, IndianRupee,
  ShoppingBag, Car, Phone, Building2, Coffee, X, CheckCircle2,
  RefreshCw, FileText
} from 'lucide-react';

const CATEGORIES = [
  { key: 'TRAVEL',        label: 'Travel / Transport',  icon: Car,       color: '#0284c7' },
  { key: 'OFFICE',        label: 'Office Supplies',     icon: Building2,  color: '#7c3aed' },
  { key: 'COMM',          label: 'Phone / Internet',    icon: Phone,      color: '#059669' },
  { key: 'ENTERTAINMENT', label: 'Client Hospitality',  icon: Coffee,     color: '#d97706' },
  { key: 'BANK_CHARGES',  label: 'Bank Charges',        icon: IndianRupee,color: '#e11d48' },
  { key: 'PURCHASE',      label: 'Misc Purchase',       icon: ShoppingBag,color: '#0891b2' },
  { key: 'OTHER',         label: 'Other / Misc',        icon: FileText,   color: '#64748b' },
];

const PAYMENT_MODES = ['CASH', 'UPI', 'NEFT', 'IMPS', 'CARD', 'CHEQUE'];

function getCatMeta(key: string) {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

const todayStr = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

export const ExpenseTracker: React.FC<{ onRefresh?: () => void }> = ({ onRefresh }) => {
  const [expenses, setExpenses]     = useState<any[]>([]);
  const [summary, setSummary]       = useState<any>({ by_category: [], grand_total: 0 });
  const [loading, setLoading]       = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [saved, setSaved]           = useState(false);
  const [fromDate, setFromDate]     = useState(firstOfMonth());
  const [toDate, setToDate]         = useState(todayStr());
  const [filterCat, setFilterCat]   = useState('');

  const [form, setForm] = useState({
    category: 'OTHER',
    description: '',
    amount: '',
    paid_to: '',
    payment_mode: 'CASH',
    expense_date: todayStr(),
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    const [exp, summ] = await Promise.all([
      DiamondApi.getExpenses({ from_date: fromDate, to_date: toDate, category: filterCat || undefined }),
      DiamondApi.getExpenseSummary({ from_date: fromDate, to_date: toDate }),
    ]);
    setExpenses(exp);
    setSummary(summ || { by_category: [], grand_total: 0 });
    setLoading(false);
  }, [fromDate, toDate, filterCat]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await DiamondApi.createExpense({
      ...form,
      amount: parseFloat(form.amount),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowForm(false);
      setForm({ category: 'OTHER', description: '', amount: '', paid_to: '', payment_mode: 'CASH', expense_date: todayStr() });
      loadData();
      if (onRefresh) onRefresh();
    }, 1400);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense entry?')) return;
    await DiamondApi.deleteExpense(id);
    loadData();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a',
    background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={20} color="#7c3aed" /> Kharcha (Expense Tracking)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Track all daily business expenses — travel, office, communication, hospitality
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={loadData} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', color: '#64748b' }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
              background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
              transition: 'transform 0.15s', 
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <PlusCircle size={15} /> Add Kharcha
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>From:</label>
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ ...inputStyle, width: 'auto' }} />
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>To:</label>
        <input type="date" value={toDate}   onChange={e => setToDate(e.target.value)}   style={{ ...inputStyle, width: 'auto' }} />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        <div style={{
          padding: '16px', background: '#0f172a', borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(15,23,42,0.15)', gridColumn: 'span 1'
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Total Kharcha
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f472b6' }}>
            ₹{Number(summary.grand_total || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>Selected period</div>
        </div>
        {CATEGORIES.map(cat => {
          const catRow = (summary.by_category || []).find((r: any) => r.category === cat.key);
          const total = Number(catRow?.total || 0);
          if (total === 0 && !filterCat) return null;
          const Icon = cat.icon;
          return (
            <div key={cat.key} style={{ padding: '14px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Icon size={14} color={cat.color} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cat.label}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: cat.color }}>₹{total.toLocaleString('en-IN')}</div>
            </div>
          );
        }).filter(Boolean)}
      </div>

      {/* ── Add Expense Form ── */}
      {showForm && (
        <div style={{
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px',
          padding: '24px', boxShadow: '0 8px 32px rgba(124,58,237,0.1)',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>➕ Add New Expense</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <X size={18} />
            </button>
          </div>

          {saved ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#059669', animation: 'fadeIn 0.3s' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 10px', display: 'block' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>Expense Saved!</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount (₹) *</label>
                <input required type="number" min="1" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 2500" style={{ ...inputStyle, fontWeight: 700 }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description *</label>
                <input required type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Uber to BKC client meeting, lunch at Taj..." style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Paid To</label>
                <input type="text" value={form.paid_to} onChange={e => setForm(f => ({ ...f, paid_to: e.target.value }))} placeholder="Vendor / Person name" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Payment Mode</label>
                <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))} style={inputStyle}>
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date *</label>
                <input required type="date" value={form.expense_date} onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" style={{
                  width: '100%', padding: '11px', background: '#7c3aed', color: '#fff', border: 'none',
                  borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  boxShadow: '0 2px 8px rgba(124,58,237,0.4)', transition: 'transform 0.15s'
                }}>
                  <TrendingDown size={16} /> Save Expense
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Expense Log Table ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
            Expense Register — {expenses.length} entries
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{fromDate} → {toDate}</span>
        </div>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Paid To</th>
                <th>Mode</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp) => {
                const meta = getCatMeta(exp.category);
                const Icon = meta.icon;
                return (
                  <tr key={exp.id} style={{ transition: 'background 0.15s' }}>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>{exp.expense_date}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        background: meta.color + '18', color: meta.color
                      }}>
                        <Icon size={11} /> {meta.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: '#0f172a', maxWidth: '220px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exp.description}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{exp.paid_to || '—'}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>{exp.payment_mode}</span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.95rem' }}>
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius: '4px', transition: 'color 0.15s' }}
                        onMouseOver={e => (e.currentTarget.style.color = '#e11d48')}
                        onMouseOut={e => (e.currentTarget.style.color = '#94a3b8')}
                        title="Delete entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    <Wallet size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                    No expenses found for selected period. Click "Add Kharcha" to begin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
