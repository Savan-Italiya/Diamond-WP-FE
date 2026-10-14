import React, { useState } from 'react';
import { FollowUpItem } from '../types';
import { Phone, MessageSquare, Mic, Calendar, CheckCircle2, UserCheck } from 'lucide-react';

interface FollowUpDialerProps {
  queue: FollowUpItem[];
}

export const FollowUpDialer: React.FC<FollowUpDialerProps> = ({ queue }) => {
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);
  const [clientResponse, setClientResponse] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [loggedStatus, setLoggedStatus] = useState<string | null>(null);

  const handleLogFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setLoggedStatus(`Follow-up logged for ${selectedItem.business_name}: "${clientResponse}"`);
    setTimeout(() => {
      setSelectedItem(null);
      setClientResponse('');
      setPromiseDate('');
      setLoggedStatus(null);
    }, 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 380px' : '1fr', gap: '20px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Daily Payment Follow-up Queue (Opera House & BKC)
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Automated reminders for payment due dates with WhatsApp direct trigger and 1-tap dialer
            </p>
          </div>
          <span className="badge badge-overdue" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
            {queue.length} Overdue Accounts
          </span>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Party / Bourse Trader</th>
                <th>Invoice #</th>
                <th>Due Date</th>
                <th>Amount Overdue</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.schedule_id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.business_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {item.owner_name} • {item.phone_primary}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#38bdf8', fontWeight: 500 }}>{item.invoice_number}</span>
                  </td>
                  <td>
                    <span style={{ color: '#f43f5e', fontWeight: 600 }}>{item.due_date}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                      ₹{Number(item.amount_due).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-overdue">{item.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* One Tap Dialing */}
                      <a href={item.one_tap_dial_url} className="btn-dial" title="One-Tap Phone Call">
                        <Phone size={14} /> Call
                      </a>

                      {/* WhatsApp Deep-Link Trigger */}
                      <a
                        href={item.whatsapp_web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp"
                        title="Send WhatsApp Follow-up Alert"
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>

                      {/* Log Note / Voice Note */}
                      <button
                        onClick={() => setSelectedItem(item)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: 'none',
                          color: '#f8fafc',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <Mic size={14} color="#f59e0b" /> Note
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Follow-up Note Form */}
      {selectedItem && (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, textTransform: 'uppercase' }}>
                Post-Call Follow-up Log
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
                {selectedItem.business_name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', fontSize: '0.85rem' }}>
            <div>Invoice: <strong style={{ color: '#38bdf8' }}>{selectedItem.invoice_number}</strong></div>
            <div style={{ marginTop: '4px' }}>Due: <strong style={{ color: '#f43f5e' }}>₹{Number(selectedItem.amount_due).toLocaleString('en-IN')}</strong></div>
          </div>

          <form onSubmit={handleLogFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                Client Response / Discussion Outcome:
              </label>
              <textarea
                required
                rows={4}
                value={clientResponse}
                onChange={(e) => setClientResponse(e.target.value)}
                placeholder="e.g. Spoke with Bipinbhai. Promised RTGS of Rs. 10 Lakhs this Friday..."
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#f8fafc',
                  fontSize: '0.85rem',
                  resize: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
                Next Follow-up / Promised Date:
              </label>
              <input
                type="date"
                value={promiseDate}
                onChange={(e) => setPromiseDate(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0d14',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#f8fafc',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }}>
              <CheckCircle2 size={16} /> Save Follow-up & Promise Date
            </button>
          </form>

          {loggedStatus && (
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
              {loggedStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
