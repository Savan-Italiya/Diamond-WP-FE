import React from 'react';
import { LedgerEntry } from '../types';
import { ArrowDownRight, ArrowUpRight, Plus, Download } from 'lucide-react';

export const KhataLedger: React.FC = () => {
  const sampleEntries: LedgerEntry[] = [
    { id: '1', entry_type: 'DEBIT', amount: 4500000, reference_type: 'SALES_INVOICE #INV-2026-089', reference_id: 'so-1', running_balance: 4500000, created_at: '2026-09-25 14:30' },
    { id: '2', entry_type: 'CREDIT', amount: 1500000, reference_type: 'PAYMENT_RECEIPT (RTGS HDFC)', reference_id: 'rc-1', running_balance: 3000000, created_at: '2026-10-02 11:15' },
    { id: '3', entry_type: 'DEBIT', amount: 1200000, reference_type: 'SALES_INVOICE #INV-2026-094', reference_id: 'so-2', running_balance: 4200000, created_at: '2026-10-08 17:40' },
    { id: '4', entry_type: 'CREDIT', amount: 1000000, reference_type: 'PAYMENT_RECEIPT (ANGDIA / CASH)', reference_id: 'rc-2', running_balance: 3200000, created_at: '2026-10-12 16:00' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
            Multi-Party Double-Entry Ledger (Khata)
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '4px 0 0 0', color: '#f8fafc' }}>
            Mahavir Gems & Jewels (Bipinbhai Mehta)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            GSTIN: 27AABCM1234F1Z1 • Tower-C, 5th Floor, BDB, BKC, Mumbai
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Running Balance (Payable to Us)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f43f5e' }}>
              ₹32,00,000 <span style={{ fontSize: '0.8rem', color: '#fb7185' }}>Dr</span>
            </div>
          </div>
          <button className="btn-primary">
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
            {sampleEntries.map((e) => (
              <tr key={e.id}>
                <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{e.created_at}</td>
                <td>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{e.reference_type}</span>
                </td>
                <td>
                  {e.entry_type === 'DEBIT' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fb7185', fontWeight: 600, fontSize: '0.8rem' }}>
                      <ArrowUpRight size={14} /> DEBIT
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#34d399', fontWeight: 600, fontSize: '0.8rem' }}>
                      <ArrowDownRight size={14} /> CREDIT
                    </span>
                  )}
                </td>
                <td>
                  {e.entry_type === 'DEBIT' ? (
                    <span style={{ color: '#fb7185', fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {e.entry_type === 'CREDIT' ? (
                    <span style={{ color: '#34d399', fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                    ₹{e.running_balance.toLocaleString('en-IN')} Dr
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
