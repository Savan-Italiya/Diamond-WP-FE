import React, { useState } from 'react';
import { FollowUpItem } from '../types';
import { Phone, MessageSquare, Mic, Calendar, CheckCircle2, UserCheck, AlertCircle, Play, Square } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface FollowUpDialerProps {
  queue: FollowUpItem[];
  onRefresh?: () => void;
}

export const FollowUpDialer: React.FC<FollowUpDialerProps> = ({ queue: initialQueue, onRefresh }) => {
  const [queue, setQueue] = useState<FollowUpItem[]>(initialQueue);
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);
  const [clientResponse, setClientResponse] = useState('');
  const [promiseDate, setPromiseDate] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [loggedStatus, setLoggedStatus] = useState<string | null>(null);

  React.useEffect(() => {
    setQueue(initialQueue);
  }, [initialQueue]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudio('voice_note_followup_' + Date.now() + '.mp3 (0:14s)');
    } else {
      setIsRecording(true);
      setRecordedAudio(null);
    }
  };

  const handleLogFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    await DiamondApi.logFollowUp({
      party_id: selectedItem.party_id,
      client_response: clientResponse,
      next_follow_up_date: promiseDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      audio_note_url: recordedAudio ? 'https://storage.diamond-bkc.in/notes/' + recordedAudio : undefined
    });

    if (promiseDate) {
      await DiamondApi.updatePromiseDate({
        schedule_id: selectedItem.schedule_id,
        promised_date: promiseDate
      });
    }

    setLoggedStatus(`Follow-up logged for ${selectedItem.business_name}: "${clientResponse}"`);
    setTimeout(() => {
      setSelectedItem(null);
      setClientResponse('');
      setPromiseDate('');
      setRecordedAudio(null);
      setLoggedStatus(null);
      if (onRefresh) onRefresh();
    }, 2200);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: selectedItem ? '1fr 380px' : '1fr',
        gap: '20px',
        alignItems: 'start'
      }}
    >
      {/* Follow-up Queue Table */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Daily Payment Follow-up Desk (Opera House & BKC)
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Automated reminders for payment due dates with 1-Tap dialing and direct WhatsApp Bourse triggers
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
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.business_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Contact: {item.owner_name} ({item.phone_primary})
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: '#0284c7' }}>{item.invoice_number}</span>
                  </td>
                  <td>
                    <span style={{ color: '#e11d48', fontWeight: 600 }}>{item.due_date}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#e11d48', fontSize: '0.95rem' }}>
                      ₹{item.amount_due.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-overdue">{item.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <a href={item.one_tap_dial_url} className="btn-dial" title="1-Tap Dial Phone">
                        <Phone size={14} /> Call
                      </a>
                      <a
                        href={item.whatsapp_app_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-whatsapp"
                        title="Send WhatsApp Reminder"
                      >
                        <MessageSquare size={14} /> WhatsApp
                      </a>
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        Log Note
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Follow-up Note & Audio Drawer */}
      {selectedItem && (
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              Log Follow-up Call
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{selectedItem.business_name}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Person: {selectedItem.owner_name}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e11d48', marginTop: '4px' }}>
              Pending: ₹{selectedItem.amount_due.toLocaleString('en-IN')}
            </div>
          </div>

          {loggedStatus ? (
            <div
              style={{
                padding: '14px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 'var(--radius-sm)',
                color: '#065f46',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              <CheckCircle2 size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
              {loggedStatus}
            </div>
          ) : (
            <form onSubmit={handleLogFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Client Call Response</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Promised RTGS of 50 Lakhs by Friday after checking Hong Kong show proceeds..."
                  value={clientResponse}
                  onChange={(e) => setClientResponse(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div>
                <label className="form-label">Promised Payment Date</label>
                <input
                  type="date"
                  value={promiseDate}
                  onChange={(e) => setPromiseDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Voice Note / Audio Clip</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={toggleRecording}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isRecording ? '#e11d48' : '#cbd5e1',
                      background: isRecording ? '#fee2e2' : '#ffffff',
                      color: isRecording ? '#e11d48' : '#334155',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {isRecording ? <Square size={14} /> : <Mic size={14} />}
                    {isRecording ? 'Stop Recording' : 'Record Audio Note'}
                  </button>
                  {recordedAudio && (
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      ✓ {recordedAudio}
                    </span>
                  )}
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <CheckCircle2 size={16} /> Save Follow-up Record
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
