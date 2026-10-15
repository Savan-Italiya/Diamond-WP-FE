import React, { useState } from 'react';
import { MemoBill } from '../types';
import { FileCheck, Clock, ExternalLink, ArrowRightLeft, Plus, X, Check, CheckCircle2 } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface MemoManagerProps {
  memos: MemoBill[];
  onRefresh?: () => void;
}

export const MemoManager: React.FC<MemoManagerProps> = ({ memos: initialMemos, onRefresh }) => {
  const [memos, setMemos] = useState<MemoBill[]>(initialMemos);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<MemoBill | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    party_name: '',
    broker_name: '',
    carat: '',
    asking_price: '',
    return_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  });

  React.useEffect(() => {
    setMemos(initialMemos);
  }, [initialMemos]);

  const handleIssueMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.party_name || !form.carat || !form.asking_price) return;

    const created = await DiamondApi.createMemo({
      memo_number: `MEMO-BKC-${Math.floor(100 + Math.random() * 900)}`,
      party_name: form.party_name,
      broker_name: form.broker_name || 'Direct Deal',
      memo_type: 'MEMO_GIVEN',
      issue_date: new Date().toISOString().split('T')[0],
      return_due_date: form.return_due_date,
      items: [
        {
          id: `item-${Date.now()}`,
          carat: parseFloat(form.carat),
          asking_price: parseFloat(form.asking_price),
          status: 'WITH_PARTY'
        }
      ]
    });

    setMemos([created, ...memos]);
    setShowIssueModal(false);
    setForm({
      party_name: '',
      broker_name: '',
      carat: '',
      asking_price: '',
      return_due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    });
    setSuccessToast(`Memo Challan ${created.memo_number} issued to ${created.party_name}`);
    setTimeout(() => setSuccessToast(null), 3000);
    if (onRefresh) onRefresh();
  };

  const handleReturnItem = async (memo: MemoBill) => {
    await DiamondApi.returnMemoItem({
      memo_item_id: memo.items[0]?.id || memo.id,
      returned_carat: memo.items[0]?.carat || 1.5,
      received_by: 'Pravinbhai Shah'
    });

    setMemos(
      memos.map((m) =>
        m.id === memo.id
          ? {
              ...m,
              status: 'SETTLED',
              items: m.items.map((i) => ({ ...i, status: 'RETURNED' }))
            }
          : m
      )
    );
    setSuccessToast(`Diamonds from Memo ${memo.memo_number} safely returned to vault`);
    setTimeout(() => setSuccessToast(null), 3000);
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
      {successToast && (
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
          <CheckCircle2 size={16} /> {successToast}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
            Memo Challan Management (Jangad / Out-on-Approval)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            High-value physical diamond packets handed over to brokers & buyers before final sales billing
          </p>
        </div>
        <button onClick={() => setShowIssueModal(true)} className="btn-primary">
          <FileCheck size={16} /> Issue New Memo Challan
        </button>
      </div>

      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Memo Number</th>
              <th>Recipient Party & Broker</th>
              <th>Issue Date</th>
              <th>Return Due Date</th>
              <th>Carats on Memo</th>
              <th>Asking Value (INR)</th>
              <th>Challan Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {memos.map((memo) => {
              const totalCarats = memo.items.reduce((acc, i) => acc + Number(i.carat), 0);
              const totalVal = memo.items.reduce((acc, i) => acc + Number(i.asking_price), 0);
              const isSettled = memo.status === 'SETTLED';

              return (
                <tr key={memo.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{memo.memo_number}</span>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{memo.memo_type}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{memo.party_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 500 }}>
                      Broker: {memo.broker_name || 'Direct Deal'}
                    </div>
                  </td>
                  <td>{memo.issue_date}</td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        color: isSettled ? '#059669' : '#e11d48',
                        fontWeight: 600
                      }}
                    >
                      <Clock size={14} /> {memo.return_due_date}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{totalCarats.toFixed(2)} Cts</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{totalVal.toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    {isSettled ? (
                      <span className="badge badge-in-stock">RETURNED & CLOSED</span>
                    ) : (
                      <span className="badge badge-memo">OUT WITH PARTY</span>
                    )}
                  </td>
                  <td>
                    {!isSettled ? (
                      <button
                        onClick={() => handleReturnItem(memo)}
                        className="btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.775rem' }}
                      >
                        <ArrowRightLeft size={13} /> Receive Return
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>Settled</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ISSUE MEMO MODAL */}
      {showIssueModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Issue Out-on-Approval Memo Challan (Jangad)
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIssueMemo}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Recipient Party / Buyer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Gems & Jewels (Bipinbhai)"
                    value={form.party_name}
                    onChange={(e) => setForm({ ...form, party_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Broker Name (If Any)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kothari Broking House / Direct"
                    value={form.broker_name}
                    onChange={(e) => setForm({ ...form, broker_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Carats on Memo</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 2.50"
                      value={form.carat}
                      onChange={(e) => setForm({ ...form, carat: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Asking Price (INR)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 750000"
                      value={form.asking_price}
                      onChange={(e) => setForm({ ...form, asking_price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Return Due Date (Standard 7-Day Bourse Window)</label>
                  <input
                    type="date"
                    required
                    value={form.return_due_date}
                    onChange={(e) => setForm({ ...form, return_due_date: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowIssueModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Issue Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
