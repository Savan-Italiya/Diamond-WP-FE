import React, { useState } from 'react';
import { LedgerEntry, Party } from '../types';
import { ArrowDownRight, ArrowUpRight, Plus, Download, X, Check, CheckCircle2 } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface KhataLedgerProps {
  parties?: Party[];
}

export const KhataLedger: React.FC<KhataLedgerProps> = ({ parties = [] }) => {
  const [selectedPartyId, setSelectedPartyId] = useState('p-1');
  const [entries, setEntries] = useState<LedgerEntry[]>([
    { id: '1', entry_type: 'DEBIT', amount: 4500000, reference_type: 'SALES_INVOICE #INV-2026-089', reference_id: 'so-1', running_balance: 4500000, created_at: '2026-09-25 14:30' },
    { id: '2', entry_type: 'CREDIT', amount: 1500000, reference_type: 'PAYMENT_RECEIPT (RTGS HDFC)', reference_id: 'rc-1', running_balance: 3000000, created_at: '2026-10-02 11:15' },
    { id: '3', entry_type: 'DEBIT', amount: 1200000, reference_type: 'SALES_INVOICE #INV-2026-094', reference_id: 'so-2', running_balance: 4200000, created_at: '2026-10-08 17:40' },
    { id: '4', entry_type: 'CREDIT', amount: 1000000, reference_type: 'PAYMENT_RECEIPT (ANGADIA / CASH)', reference_id: 'rc-2', running_balance: 3200000, created_at: '2026-10-12 16:00' }
  ]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_mode: 'RTGS',
    reference_no: ''
  });

  const currentPartyName = selectedPartyId === 'p-1' ? 'Mahavir Gems & Jewels (Bipinbhai Mehta)' : 'Zaveri & Sons Mumbai';
  const runningBalance = entries.length > 0 ? entries[entries.length - 1].running_balance : 0;

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount) return;

    const amt = parseFloat(paymentForm.amount);
    const newBal = runningBalance - amt;

    const newEntry: LedgerEntry = {
      id: String(Date.now()),
      entry_type: 'CREDIT',
      amount: amt,
      reference_type: `PAYMENT_RECEIPT (${paymentForm.payment_mode} ${paymentForm.reference_no || 'ACK'})`,
      reference_id: `rc-${Date.now()}`,
      running_balance: newBal,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setEntries([...entries, newEntry]);
    setShowPaymentModal(false);
    setPaymentForm({ amount: '', payment_mode: 'RTGS', reference_no: '' });
    setToast(`Payment receipt of ₹${amt.toLocaleString('en-IN')} successfully credited to Khata`);
    setTimeout(() => setToast(null), 3000);
  };

  const exportStatement = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Date,Reference,Debit,Credit,Balance\n' +
      entries
        .map(
          (e) =>
            `"${e.created_at}","${e.reference_type}",${e.entry_type === 'DEBIT' ? e.amount : 0},${e.entry_type === 'CREDIT' ? e.amount : 0},${e.running_balance}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Khata_Statement_${selectedPartyId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* Top Header & Party Switcher */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '22px',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Multi-Party Double-Entry Ledger (Khata)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {currentPartyName}
            </h2>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '4px 10px', fontSize: '0.8rem' }}
            >
              <option value="p-1">Mahavir Gems (Buyer - BDB)</option>
              <option value="p-5">Zaveri & Sons (Buyer - Opera House)</option>
              <option value="p-2">Dharmanandan Exports (Seller - Surat)</option>
            </select>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            GSTIN: 27AABCM1234F1Z1 • Tower-C, 5th Floor, Bharat Diamond Bourse, BKC
          </p>
        </div>

        {/* Balance & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Running Balance (Payable to Us)
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e11d48', fontFamily: 'var(--font-heading)' }}>
              ₹{runningBalance.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: '#e11d48' }}>Dr</span>
            </div>
          </div>
          <button onClick={exportStatement} className="btn-secondary">
            <Download size={15} /> Export Statement
          </button>
          <button onClick={() => setShowPaymentModal(true)} className="btn-primary">
            <Plus size={16} /> Record Payment Receipt
          </button>
        </div>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Transaction Reference</th>
              <th>Type</th>
              <th>Debit (INR)</th>
              <th>Credit (INR)</th>
              <th>Running Balance</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{e.created_at}</td>
                <td>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{e.reference_type}</span>
                </td>
                <td>
                  {e.entry_type === 'DEBIT' ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#e11d48',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    >
                      <ArrowUpRight size={14} /> DEBIT
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#059669',
                        fontWeight: 700,
                        fontSize: '0.75rem'
                      }}
                    >
                      <ArrowDownRight size={14} /> CREDIT
                    </span>
                  )}
                </td>
                <td>
                  {e.entry_type === 'DEBIT' ? (
                    <span style={{ fontWeight: 700, color: '#e11d48' }}>₹{e.amount.toLocaleString('en-IN')}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>
                  {e.entry_type === 'CREDIT' ? (
                    <span style={{ fontWeight: 700, color: '#059669' }}>₹{e.amount.toLocaleString('en-IN')}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    ₹{e.running_balance.toLocaleString('en-IN')} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dr</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Record Payment Receipt for {currentPartyName}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Amount Received (INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    placeholder="e.g. 1500000"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Payment Mode</label>
                  <select
                    value={paymentForm.payment_mode}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_mode: e.target.value })}
                    className="form-select"
                  >
                    <option value="RTGS">RTGS (HDFC / ICICI / Kotak Bank)</option>
                    <option value="NEFT">NEFT Transfer</option>
                    <option value="ANGADIA">Angadia (Surat-Mumbai Courier Settlement)</option>
                    <option value="CHEQUE">Bank Cheque</option>
                    <option value="UPI">UPI Transfer</option>
                    <option value="CASH">Cash Voucher</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">UTR / Reference / Angadia Slip Number</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC202610149921 / ANG-409"
                    value={paymentForm.reference_no}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference_no: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Credit to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
