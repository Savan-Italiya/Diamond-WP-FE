import React, { useState, useEffect, useCallback } from 'react';
import { FollowUpItem } from '../types';
import {
  Phone, MessageSquare, Mic, Calendar, CheckCircle2,
  AlertCircle, Square, Bell, BellRing, X, Clock,
  IndianRupee, RefreshCw, Mail, History, ChevronDown, ChevronUp,
  PhoneOff, PhoneMissed, ThumbsUp, AlertTriangle, Zap
} from 'lucide-react';
import { DiamondApi } from '../services/api';

interface FollowUpDialerProps {
  queue: FollowUpItem[];
  onRefresh?: () => void;
}

interface Notification {
  id: string;
  type: 'overdue' | 'duetoday' | 'promised' | 'partial';
  title: string;
  message: string;
  invoiceNumber?: string;
  amount?: number;
  phone?: string;
  dialUrl?: string;
  timestamp: string;
  dismissed: boolean;
}

interface FollowUpLog {
  id: string;
  call_date: string;
  client_response: string;
  caller_name?: string;
  business_name?: string;
  next_follow_up_date?: string;
  created_at: string;
}

const RESOLUTIONS = [
  { key: 'PAID',        label: '✅ Payment Received',  color: '#059669', bg: '#ecfdf5', icon: CheckCircle2 },
  { key: 'PROMISED',    label: '📅 Promise Given',      color: '#0284c7', bg: '#eff6ff', icon: Calendar },
  { key: 'RESCHEDULED', label: '🔄 Rescheduled',        color: '#7c3aed', bg: '#f5f3ff', icon: Clock },
  { key: 'NO_ANSWER',   label: '📵 No Answer',          color: '#d97706', bg: '#fef3c7', icon: PhoneMissed },
  { key: 'DISPUTED',    label: '⚠️ Disputed / Issue',   color: '#e11d48', bg: '#fff1f2', icon: AlertTriangle },
];

function buildNotifications(queue: FollowUpItem[]): Notification[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return queue.map((item) => {
    const due = new Date(item.due_date);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - due.getTime()) / 86400000);
    let type: Notification['type'] = 'overdue';
    let title = '';
    let message = '';
    if (diffDays === 0) {
      type = 'duetoday';
      title = `🔔 Payment Due TODAY — ${item.business_name}`;
      message = `₹${item.amount_due.toLocaleString('en-IN')} for Invoice ${item.invoice_number} is due today. Call now for RTGS release.`;
    } else if (diffDays > 0) {
      type = 'overdue';
      title = `⚠ OVERDUE ${diffDays}d — ${item.business_name}`;
      message = `₹${item.amount_due.toLocaleString('en-IN')} for Invoice ${item.invoice_number} is overdue by ${diffDays} day${diffDays > 1 ? 's' : ''}.`;
    } else {
      type = 'promised';
      title = `📅 Upcoming — ${item.business_name}`;
      message = `₹${item.amount_due.toLocaleString('en-IN')} for Invoice ${item.invoice_number} is due on ${item.due_date}.`;
    }
    return { id: item.schedule_id, type, title, message, invoiceNumber: item.invoice_number, amount: item.amount_due, phone: item.phone_primary, dialUrl: item.one_tap_dial_url, timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), dismissed: false };
  });
}

export const FollowUpDialer: React.FC<FollowUpDialerProps> = ({ queue: initialQueue, onRefresh }) => {
  const [queue, setQueue]                   = useState<FollowUpItem[]>(initialQueue);
  const [selectedItem, setSelectedItem]     = useState<FollowUpItem | null>(null);
  const [clientResponse, setClientResponse] = useState('');
  const [promiseDate, setPromiseDate]       = useState('');
  const [isRecording, setIsRecording]       = useState(false);
  const [recordedAudio, setRecordedAudio]   = useState<string | null>(null);
  const [loggedStatus, setLoggedStatus]     = useState<string | null>(null);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [partialAmount, setPartialAmount]   = useState('');
  const [showPartialEntry, setShowPartialEntry] = useState(false);
  const [resolution, setResolution]         = useState('PROMISED');
  const [showDoneForm, setShowDoneForm]     = useState(false);

  // History panel
  const [logs, setLogs]                 = useState<FollowUpLog[]>([]);
  const [showHistory, setShowHistory]   = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    setQueue(initialQueue);
    const notifs = buildNotifications(initialQueue);
    setNotifications(notifs);
    if (notifs.filter(n => n.type === 'overdue' || n.type === 'duetoday').length > 0) setShowNotifPanel(true);
  }, [initialQueue]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    const data = await DiamondApi.getFollowUpHistory();
    setLogs(data);
    setHistoryLoading(false);
  }, []);

  const toggleHistory = () => {
    if (!showHistory) loadHistory();
    setShowHistory(h => !h);
  };

  const dismissNotif = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dismissed: true } : n));

  const openItem = (item: FollowUpItem) => {
    setSelectedItem(item);
    setShowPartialEntry(false);
    setLoggedStatus(null);
    setClientResponse('');
    setPromiseDate('');
    setRecordedAudio(null);
    setResolution('PROMISED');
    setShowDoneForm(false);
  };

  const activeNotifs  = notifications.filter(n => !n.dismissed);
  const overdueCount  = activeNotifs.filter(n => n.type === 'overdue' || n.type === 'duetoday').length;

  const handleSendSms = async (item: FollowUpItem) => {
    try {
      const msg = `Payment Reminder: ₹${item.amount_due.toLocaleString('en-IN')} for Invoice #${item.invoice_number} is pending from ${item.business_name}. Please clear via RTGS/NEFT. — BKC Desk`;
      await DiamondApi.sendSmsNotification({ party_id: item.party_id, phone: item.phone_primary, message: msg, reference_type: 'PAYMENT_REMINDER', reference_id: item.schedule_id });
      alert(`✓ SMS dispatched to ${item.phone_primary}!`);
      if (onRefresh) onRefresh();
    } catch (err: any) { alert(err?.response?.data?.message || err?.message || 'SMS failed'); }
  };

  const handleMarkDone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await DiamondApi.markCallDone(selectedItem.schedule_id, {
        resolution,
        note: clientResponse,
        next_date: promiseDate || undefined,
      });
      const resLabel = RESOLUTIONS.find(r => r.key === resolution)?.label || resolution;
      setLoggedStatus(`Call marked as "${resLabel}" for ${selectedItem.business_name}`);
      setTimeout(() => {
        setSelectedItem(null);
        setLoggedStatus(null);
        setShowDoneForm(false);
        if (onRefresh) onRefresh();
      }, 2000);
    } catch (err: any) { alert(err?.message || 'Failed'); }
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
      await DiamondApi.updatePromiseDate({ schedule_id: selectedItem.schedule_id, promised_date: promiseDate });
    }
    setLoggedStatus(`Follow-up logged for ${selectedItem.business_name}`);
    setTimeout(() => {
      setSelectedItem(null);
      setClientResponse('');
      setPromiseDate('');
      setRecordedAudio(null);
      setLoggedStatus(null);
      setShowPartialEntry(false);
      setPartialAmount('');
      if (onRefresh) onRefresh();
    }, 2000);
  };

  const handleQuickPartialPayment = async () => {
    if (!selectedItem || !partialAmount) return;
    await DiamondApi.recordPartialPayment({ sales_order_id: selectedItem.schedule_id, amount_received: parseFloat(partialAmount), payment_mode: 'RTGS' });
    setShowPartialEntry(false);
    setPartialAmount('');
    setLoggedStatus(`Partial ₹${parseFloat(partialAmount).toLocaleString('en-IN')} recorded for ${selectedItem.business_name}`);
    setTimeout(() => { setSelectedItem(null); setLoggedStatus(null); if (onRefresh) onRefresh(); }, 2000);
  };

  const notifColors: Record<string, { bg: string; border: string; accent: string; iconBg: string }> = {
    overdue: { bg: '#fff1f2', border: '#fecdd3', accent: '#e11d48', iconBg: '#fee2e2' },
    duetoday: { bg: '#fef3c7', border: '#fde68a', accent: '#b45309', iconBg: '#fef9c3' },
    promised: { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', iconBg: '#dbeafe' },
    partial:  { bg: '#f0fdf4', border: '#a7f3d0', accent: '#059669', iconBg: '#d1fae5' }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.875rem', color: '#0f172a',
    outline: 'none', boxSizing: 'border-box', background: '#f8fafc'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ─── NOTIFICATION PANEL ─── */}
      {activeNotifs.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-card)', animation: 'slideDown 0.2s ease-out' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', cursor: 'pointer', background: overdueCount > 0 ? '#fff1f2' : '#fef3c7', borderBottom: showNotifPanel ? `1px solid ${overdueCount > 0 ? '#fecdd3' : '#fde68a'}` : 'none' }}
            onClick={() => setShowNotifPanel(!showNotifPanel)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: overdueCount > 0 ? '#fee2e2' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BellRing size={17} color={overdueCount > 0 ? '#e11d48' : '#b45309'} style={{ animation: 'pulse 1.5s infinite' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: overdueCount > 0 ? '#e11d48' : '#b45309' }}>
                  {overdueCount > 0 ? `${overdueCount} Overdue / Due-Today Alerts` : `${activeNotifs.length} Upcoming Reminders`}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Click to {showNotifPanel ? 'collapse' : 'expand'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '20px', fontSize: '0.775rem', fontWeight: 800, background: overdueCount > 0 ? '#e11d48' : '#b45309', color: '#fff' }}>
                {activeNotifs.length} ALERT{activeNotifs.length > 1 ? 'S' : ''}
              </span>
              {showNotifPanel ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
            </div>
          </div>
          {showNotifPanel && (
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeNotifs.map((n) => {
                const colors = notifColors[n.type] || notifColors.promised;
                return (
                  <div key={n.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', borderRadius: '10px', background: colors.bg, border: `1px solid ${colors.border}`, transition: 'transform 0.15s', cursor: 'default' }}
                    onMouseOver={e => (e.currentTarget.style.transform = 'translateX(2px)')}
                    onMouseOut={e => (e.currentTarget.style.transform = 'translateX(0)')}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0, background: colors.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {n.type === 'overdue'  && <AlertCircle size={18} color={colors.accent} />}
                      {n.type === 'duetoday' && <BellRing size={18} color={colors.accent} />}
                      {n.type === 'promised' && <Clock size={18} color={colors.accent} />}
                      {n.type === 'partial'  && <IndianRupee size={18} color={colors.accent} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: colors.accent, marginBottom: '3px' }}>{n.title}</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>{n.message}</div>
                      {n.dialUrl && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <a href={n.dialUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 12px', borderRadius: '6px', textDecoration: 'none', background: colors.accent, color: '#fff', fontWeight: 700, fontSize: '0.775rem' }}>
                            <Phone size={12} /> Call Now
                          </a>
                        </div>
                      )}
                    </div>
                    <button onClick={() => dismissNotif(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', flexShrink: 0 }} title="Dismiss">
                      <X size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MAIN LAYOUT: Table + Drawer ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 420px' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Queue Table ── */}
        <div className="glass-panel" style={{ padding: '24px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Daily Payment Follow-up Desk</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Overdue & due-today accounts — 1-Tap dial, WhatsApp & SMS triggers</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={onRefresh} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: '#64748b' }}>
                <RefreshCw size={14} />
              </button>
              <span className="badge badge-overdue" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>{queue.length} Overdue</span>
            </div>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Party / Trader</th>
                  <th>Invoice #</th>
                  <th>Due Date</th>
                  <th>Amount Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => {
                  const today = new Date(); today.setHours(0, 0, 0, 0);
                  const due = new Date(item.due_date); due.setHours(0, 0, 0, 0);
                  const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000);
                  const isSelected = selectedItem?.schedule_id === item.schedule_id;
                  return (
                    <tr key={item.schedule_id} style={{
                      background: isSelected ? '#f8fafc' : 'transparent',
                      borderLeft: isSelected ? '3px solid #7c3aed' : '3px solid transparent',
                      transition: 'background 0.15s, border-left 0.2s'
                    }}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.business_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.owner_name} • {item.phone_primary}</div>
                      </td>
                      <td><span style={{ fontWeight: 600, color: '#0284c7' }}>{item.invoice_number}</span></td>
                      <td>
                        <span style={{ color: '#e11d48', fontWeight: 600 }}>{item.due_date}</span>
                        {daysOverdue > 0 && <div style={{ fontSize: '0.72rem', color: '#e11d48', fontWeight: 600 }}>{daysOverdue}d overdue</div>}
                        {daysOverdue === 0 && <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>DUE TODAY</div>}
                      </td>
                      <td><span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.95rem' }}>₹{item.amount_due.toLocaleString('en-IN')}</span></td>
                      <td><span className="badge badge-overdue">{item.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <a href={item.one_tap_dial_url} className="btn-dial" title="1-Tap Call" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.775rem' }}>
                            <Phone size={12} /> Call
                          </a>
                          <a href={item.whatsapp_app_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', textDecoration: 'none', background: '#25d366', color: '#fff', fontWeight: 700, fontSize: '0.775rem' }}>
                            <MessageSquare size={12} /> WA
                          </a>
                          <button onClick={() => handleSendSms(item)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', fontSize: '0.775rem', fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', cursor: 'pointer' }}>
                            <Mail size={12} /> SMS
                          </button>
                          <button onClick={() => openItem(item)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '6px', fontSize: '0.775rem', fontWeight: 700, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', cursor: 'pointer', transition: 'transform 0.1s' }}
                            onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                            onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}>
                            <Zap size={12} /> Mark Done
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      <CheckCircle2 size={36} style={{ margin: '0 auto 8px', display: 'block', color: '#a7f3d0' }} />
                      <div style={{ fontWeight: 600, color: '#059669', fontSize: '1rem' }}>All clear! ✓</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>No overdue accounts today.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── History Toggle ── */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            <button
              onClick={toggleHistory}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#475569', transition: 'background 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
              onMouseOut={e => (e.currentTarget.style.background = 'none')}
            >
              <History size={14} />
              {showHistory ? 'Hide' : 'Show'} Call Log Timeline
              {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showHistory && (
              <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '0', position: 'relative', animation: 'slideDown 0.2s ease-out' }}>
                {historyLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.82rem' }}>Loading call history…</div>
                ) : logs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.82rem' }}>No call logs yet.</div>
                ) : (
                  <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    {/* Vertical timeline line */}
                    <div style={{ position: 'absolute', left: '8px', top: '6px', bottom: '6px', width: '2px', background: 'linear-gradient(180deg, #7c3aed, #0284c7, #059669)', borderRadius: '2px' }} />

                    {logs.map((log, i) => {
                      const resTag = log.client_response?.match(/^\[([A-Z_]+)\]/)?.[1];
                      const resInfo = RESOLUTIONS.find(r => r.key === resTag);
                      return (
                        <div key={log.id} style={{ position: 'relative', marginBottom: i < logs.length - 1 ? '12px' : 0 }}>
                          {/* Dot on timeline */}
                          <div style={{ position: 'absolute', left: '-20px', top: '10px', width: '10px', height: '10px', borderRadius: '50%', background: resInfo?.color || '#7c3aed', border: '2px solid #fff', boxShadow: `0 0 0 2px ${resInfo?.color || '#7c3aed'}33` }} />
                          <div style={{ padding: '10px 14px', background: resInfo?.bg || '#f8fafc', border: `1px solid ${resInfo?.color || '#e2e8f0'}33`, borderRadius: '8px', transition: 'transform 0.15s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {resInfo && <span style={{ padding: '1px 8px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, background: resInfo.color, color: '#fff' }}>{resInfo.label}</span>}
                                {log.business_name && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{log.business_name}</span>}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>{log.call_date}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                              {log.client_response?.replace(/^\[[A-Z_]+\]\s*/, '') || '(no note)'}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                              {log.caller_name && <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>By: {log.caller_name}</span>}
                              {log.next_follow_up_date && <span style={{ fontSize: '0.7rem', color: '#7c3aed', fontWeight: 600 }}>Next: {log.next_follow_up_date}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Mark Done / Note Drawer ── */}
        {selectedItem && (
          <div className="glass-panel" style={{
            padding: '24px', background: '#fff', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)',
            animation: 'slideInRight 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {showDoneForm ? '✅ Mark Call Done' : '📋 Log Follow-up Note'}
              </h3>
              <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>

            {/* Party summary */}
            <div style={{ padding: '12px', background: '#fff1f2', borderRadius: '10px', border: '1px solid #fecdd3', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{selectedItem.business_name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Contact: {selectedItem.owner_name}</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                <a href={selectedItem.one_tap_dial_url} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '6px', textDecoration: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '0.775rem' }}>
                  <Phone size={12} /> {selectedItem.phone_primary}
                </a>
                <span style={{ fontWeight: 800, color: '#e11d48', fontSize: '0.95rem' }}>₹{selectedItem.amount_due.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tab toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', marginBottom: '16px', gap: '3px' }}>
              <button onClick={() => setShowDoneForm(false)} style={{ flex: 1, padding: '7px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', background: !showDoneForm ? '#fff' : 'transparent', color: !showDoneForm ? '#7c3aed' : '#64748b', boxShadow: !showDoneForm ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
                Log Note
              </button>
              <button onClick={() => setShowDoneForm(true)} style={{ flex: 1, padding: '7px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', background: showDoneForm ? '#7c3aed' : 'transparent', color: showDoneForm ? '#fff' : '#64748b', boxShadow: showDoneForm ? '0 1px 4px rgba(124,58,237,0.3)' : 'none', transition: 'all 0.2s' }}>
                Mark Done
              </button>
            </div>

            {loggedStatus ? (
              <div style={{ padding: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#065f46', fontWeight: 600, textAlign: 'center', fontSize: '0.875rem', animation: 'fadeIn 0.3s' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 10px', display: 'block' }} />
                {loggedStatus}
              </div>
            ) : showDoneForm ? (
              /* ── MARK DONE FORM ── */
              <form onSubmit={handleMarkDone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Call Outcome</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {RESOLUTIONS.map(r => (
                      <label key={r.key} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                        borderRadius: '8px', cursor: 'pointer',
                        background: resolution === r.key ? r.bg : '#f8fafc',
                        border: `1px solid ${resolution === r.key ? r.color + '66' : '#e2e8f0'}`,
                        transition: 'all 0.15s'
                      }}>
                        <input type="radio" name="resolution" value={r.key} checked={resolution === r.key} onChange={() => setResolution(r.key)} style={{ accentColor: r.color }} />
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: resolution === r.key ? r.color : '#475569' }}>{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(resolution === 'PROMISED' || resolution === 'RESCHEDULED') && (
                  <div style={{ animation: 'slideDown 0.15s ease-out' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Promise Date <span style={{ color: '#e11d48' }}>*</span>
                    </label>
                    <input type="date" value={promiseDate} onChange={e => setPromiseDate(e.target.value)} style={{ ...inputStyle }} required />
                    {promiseDate && <p style={{ fontSize: '0.73rem', color: '#7c3aed', margin: '4px 0 0 0', fontWeight: 600 }}>🔔 Auto-reminder will be set for {promiseDate}</p>}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Call Note</label>
                  <textarea rows={2} value={clientResponse} onChange={e => setClientResponse(e.target.value)} placeholder="What did they say?" className="form-textarea" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" style={{ padding: '11px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(124,58,237,0.35)', transition: 'transform 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  <ThumbsUp size={15} /> Save Call Outcome
                </button>
              </form>
            ) : (
              /* ── LOG NOTE FORM ── */
              <form onSubmit={handleLogFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Quick partial payment toggle */}
                <button type="button" onClick={() => setShowPartialEntry(!showPartialEntry)} style={{ padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', background: showPartialEntry ? '#eff6ff' : '#f8fafc', border: `1px solid ${showPartialEntry ? '#bfdbfe' : '#e2e8f0'}`, color: showPartialEntry ? '#2563eb' : '#475569' }}>
                  <IndianRupee size={14} />
                  {showPartialEntry ? 'Cancel Payment Entry' : '+ Record Partial Payment'}
                </button>

                {showPartialEntry && (
                  <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe', animation: 'slideDown 0.15s ease-out' }}>
                    <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>Amount Received (₹)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="number" min="1" value={partialAmount} onChange={e => setPartialAmount(e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} placeholder="e.g. 1500000" />
                      <button type="button" onClick={handleQuickPartialPayment} disabled={!partialAmount} style={{ padding: '10px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: partialAmount ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>Save</button>
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Client Response</label>
                  <textarea required rows={3} placeholder="e.g. Promised RTGS of 50L by Friday..." value={clientResponse} onChange={e => setClientResponse(e.target.value)} className="form-textarea" style={{ width: '100%', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Next Follow-up Date <span style={{ color: '#b45309', fontWeight: 500, textTransform: 'none', marginLeft: '4px' }}>(sets reminder)</span>
                  </label>
                  <input type="date" value={promiseDate} onChange={e => setPromiseDate(e.target.value)} style={{ ...inputStyle }} />
                  {promiseDate && <p style={{ fontSize: '0.73rem', color: '#b45309', margin: '4px 0 0 0', fontWeight: 600 }}>🔔 Reminder will be created for {promiseDate}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Voice Note</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button type="button" onClick={() => { if (isRecording) { setIsRecording(false); setRecordedAudio('voice_note_' + Date.now() + '.mp3 (0:14s)'); } else { setIsRecording(true); setRecordedAudio(null); } }} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid', borderColor: isRecording ? '#e11d48' : '#cbd5e1', background: isRecording ? '#fee2e2' : '#fff', color: isRecording ? '#e11d48' : '#334155', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', animation: isRecording ? 'pulse 1s infinite' : 'none' }}>
                      {isRecording ? <Square size={13} /> : <Mic size={13} />}
                      {isRecording ? '⏹ Stop Recording' : '🎙 Record Note'}
                    </button>
                    {recordedAudio && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>✓ {recordedAudio}</span>}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                  <CheckCircle2 size={16} /> Save Follow-up Record
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
