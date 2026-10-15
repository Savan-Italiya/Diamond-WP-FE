import React, { useState } from 'react';
import { Party } from '../types';
import { Users, Plus, Search, Building2, Phone, CreditCard, Landmark, X, Check, CheckCircle2 } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface PartiesDirectoryProps {
  parties: Party[];
  onRefresh?: () => void;
}

export const PartiesDirectory: React.FC<PartiesDirectoryProps> = ({ parties: initialParties, onRefresh }) => {
  const [parties, setParties] = useState<Party[]>(initialParties);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    phone_primary: '',
    gstin: '',
    pan: '',
    party_type: 'BUYER' as 'BUYER' | 'SELLER' | 'BROKER' | 'PROCESSOR',
    credit_limit: '',
    city: 'Mumbai',
    bank_name: '',
    account_no: '',
    ifsc: '',
    upi_id: '',
    default_commission_rate: '1.0'
  });

  React.useEffect(() => {
    setParties(initialParties);
  }, [initialParties]);

  const filteredParties = parties.filter((p) => {
    const matchesType = filterType === 'ALL' || p.party_type === filterType;
    const matchesSearch =
      p.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone_primary && p.phone_primary.includes(searchQuery));
    return matchesType && matchesSearch;
  });

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.owner_name || !form.phone_primary) return;

    const created = await DiamondApi.createParty({
      business_name: form.business_name,
      owner_name: form.owner_name,
      phone_primary: form.phone_primary,
      gstin: form.gstin,
      pan: form.pan,
      party_type: form.party_type,
      credit_limit: parseFloat(form.credit_limit || '0'),
      city: form.city,
      bank_name: form.bank_name,
      account_no: form.account_no,
      ifsc: form.ifsc,
      upi_id: form.upi_id,
      default_commission_rate: parseFloat(form.default_commission_rate || '1.0')
    });

    setParties([created, ...parties]);
    setShowAddModal(false);
    setForm({
      business_name: '',
      owner_name: '',
      phone_primary: '',
      gstin: '',
      pan: '',
      party_type: 'BUYER',
      credit_limit: '',
      city: 'Mumbai',
      bank_name: '',
      account_no: '',
      ifsc: '',
      upi_id: '',
      default_commission_rate: '1.0'
    });
    setToast(`Party "${created.business_name}" registered in directory`);
    setTimeout(() => setToast(null), 3000);
    if (onRefresh) onRefresh();
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      {toast && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-sm)',
            color: '#065f46',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Header and Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Parties & Brokers Directory (Khata Profiles)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Buyers, sellers, diamond brokers, and Surat processing centers with bank & GST details
          </p>
        </div>

        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <Plus size={16} /> Register New Party / Broker
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'BUYER', 'SELLER', 'BROKER', 'PROCESSOR'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                border: filterType === t ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
                background: filterType === t ? '#eff6ff' : '#ffffff',
                color: filterType === t ? '#0284c7' : '#64748b',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {t === 'ALL' ? 'All Parties' : t}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search business, owner, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Parties Table */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Business & Owner</th>
              <th>Type</th>
              <th>Contact Details</th>
              <th>GSTIN / PAN</th>
              <th>Credit Limit</th>
              <th>Current Balance</th>
              <th>Bank / Settlement Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredParties.map((p) => (
              <tr key={p.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.business_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Owner: {p.owner_name} • {p.city || 'Mumbai'}
                  </div>
                </td>
                <td>
                  {p.party_type === 'BUYER' && <span className="badge badge-gia">BUYER</span>}
                  {p.party_type === 'SELLER' && <span className="badge badge-in-stock">SELLER</span>}
                  {p.party_type === 'BROKER' && <span className="badge badge-broker">BROKER ({p.default_commission_rate || 1}%)</span>}
                  {p.party_type === 'PROCESSOR' && <span className="badge badge-process">KARKHANA</span>}
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{p.phone_primary}</div>
                  {p.phone_secondary && (
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>Alt: {p.phone_secondary}</div>
                  )}
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{p.gstin || 'UNREGISTERED'}</div>
                  {p.pan && <div style={{ fontSize: '0.725rem', color: '#64748b' }}>PAN: {p.pan}</div>}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {p.credit_limit ? `₹${(p.credit_limit / 100000).toFixed(1)} Lakhs` : 'No Limit'}
                  </span>
                </td>
                <td>
                  {p.current_balance && p.current_balance > 0 ? (
                    <span style={{ fontWeight: 700, color: '#e11d48' }}>
                      ₹{p.current_balance.toLocaleString('en-IN')} Dr
                    </span>
                  ) : p.current_balance && p.current_balance < 0 ? (
                    <span style={{ fontWeight: 700, color: '#059669' }}>
                      ₹{Math.abs(p.current_balance).toLocaleString('en-IN')} Cr
                    </span>
                  ) : (
                    <span style={{ color: '#64748b', fontWeight: 600 }}>₹0.00</span>
                  )}
                </td>
                <td>
                  {p.bank_name ? (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 600 }}>{p.bank_name}</div>
                      <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                        A/C: {p.account_no} • IFSC: {p.ifsc}
                      </div>
                    </div>
                  ) : p.upi_id ? (
                    <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>UPI: {p.upi_id}</div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Cash / Angadia</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REGISTER NEW PARTY MODAL */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Register New Party / Broker Profile
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateParty}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Firm / Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Navratna Gems Opera House"
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Party Role</label>
                    <select
                      value={form.party_type}
                      onChange={(e) => setForm({ ...form, party_type: e.target.value as any })}
                      className="form-select"
                    >
                      <option value="BUYER">BUYER (Trader/Retailer)</option>
                      <option value="SELLER">SELLER (Manufacturer)</option>
                      <option value="BROKER">BROKER (Dalal)</option>
                      <option value="PROCESSOR">PROCESSOR (Karkhana)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Owner / Proprietor Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kamleshbhai Shah"
                      value={form.owner_name}
                      onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Primary Mobile (WhatsApp)</label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98200 12345"
                      value={form.phone_primary}
                      onChange={(e) => setForm({ ...form, phone_primary: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">GSTIN Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 27AABCN9912K1Z4"
                      value={form.gstin}
                      onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Credit Limit (INR)</label>
                    <input
                      type="number"
                      step="10000"
                      placeholder="e.g. 5000000"
                      value={form.credit_limit}
                      onChange={(e) => setForm({ ...form, credit_limit: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Bank Name & Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, BDB Branch"
                      value={form.bank_name}
                      onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Save Party Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
