import React, { useState, useEffect } from 'react';
import { SalesOrder, PurchaseOrder, BrokerageItem, Party } from '../types';
import {
  BadgeDollarSign, Plus, FileText, ShoppingCart, Percent, X, Check, CheckCircle2,
  CreditCard, Calendar, AlertTriangle, IndianRupee, Clock, RefreshCw
} from 'lucide-react';
import { DiamondApi } from '../services/api';

interface SalesDealsProps {
  salesOrders: SalesOrder[];
  purchases: PurchaseOrder[];
  brokerageItems: BrokerageItem[];
  parties: Party[];
  onRefresh?: () => void;
}

type PaymentMode = 'RTGS' | 'NEFT' | 'IMPS' | 'CHEQUE' | 'CASH' | 'ANGADIA' | 'UPI';

function getDueDateStatus(dueDateStr: string, dealStatus: string) {
  if (dealStatus === 'PAID') return 'paid';
  if (dealStatus === 'PARTIAL') return 'partial';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'duetoday';
  if (diffDays <= 7) return 'dueSoon';
  return 'ok';
}

function DueBadge({ status, dueDate }: { status: string; dueDate: string }) {
  const styles: Record<string, React.CSSProperties> = {
    paid: { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' },
    partial: { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
    overdue: { background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' },
    duetoday: { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' },
    dueSoon: { background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' },
    ok: { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
  };
  const labels: Record<string, string> = {
    paid: '✓ PAID',
    partial: '◑ PARTIAL',
    overdue: `⚠ OVERDUE`,
    duetoday: '🔔 DUE TODAY',
    dueSoon: `Due ${dueDate}`,
    ok: dueDate
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '6px', fontSize: '0.775rem', fontWeight: 700,
      ...styles[status]
    }}>
      {labels[status]}
    </span>
  );
}

export const SalesDeals: React.FC<SalesDealsProps> = ({
  salesOrders: initialSales,
  purchases: initialPurchases,
  brokerageItems: initialBrokerage,
  parties,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'purchases' | 'brokerage'>('sales');
  const [sales, setSales] = useState<SalesOrder[]>(initialSales);
  const [purchases] = useState<PurchaseOrder[]>(initialPurchases);
  const [brokerage] = useState<BrokerageItem[]>(initialBrokerage);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showPartialModal, setShowPartialModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New sale form
  const [saleForm, setSaleForm] = useState({
    buyer_id: parties[0]?.id || 'p-1',
    buyer_name: parties[0]?.business_name || 'Mahavir Gems & Jewels',
    broker_name: 'Kothari Broking House',
    total_carat: '',
    gross_amount: '',
    discount_pct: '0',
    payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  // Partial payment form
  const [partialForm, setPartialForm] = useState({
    amount_received: '',
    payment_mode: 'RTGS' as PaymentMode,
    payment_reference: '',
    next_promise_date: '',
    remarks: ''
  });

  // Reschedule form
  const [rescheduleForm, setRescheduleForm] = useState({
    new_promised_date: '',
    reason: ''
  });

  useEffect(() => { setSales(initialSales); }, [initialSales]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const gross = parseFloat(saleForm.gross_amount);
    const disc = parseFloat(saleForm.discount_pct || '0');
    const net = gross - (gross * disc) / 100;
    const carat = parseFloat(saleForm.total_carat) || 1;
    const ratePerCarat = carat > 0 ? gross / carat : gross;
    const invNumber = `INV-2026-${Date.now().toString().slice(-5)}`;

    const buyerId = saleForm.buyer_id || (parties.length > 0 ? parties[0].id : null);
    if (!buyerId) {
      showToast('Please select or create a Buyer Party first.', 'error');
      return;
    }

    try {
      const created = await DiamondApi.createSalesOrder({
        buyer_id: buyerId,
        invoice_number: invNumber,
        discount_pct: disc,
        payment_due_date: saleForm.payment_due_date,
        items: [
          {
            carat: carat,
            rate_per_carat: ratePerCarat
          }
        ]
      });

      setSales([created, ...sales]);
      setShowNewSaleModal(false);
      setSaleForm({
        buyer_id: parties[0]?.id || '',
        buyer_name: parties[0]?.business_name || '',
        broker_name: 'Kothari Broking House',
        total_carat: '',
        gross_amount: '',
        discount_pct: '0',
        payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      });
      showToast(`Invoice ${created.invoice_number} created for ₹${net.toLocaleString('en-IN')}`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to create sales invoice', 'error');
    }
  };

  const handleMarkPaid = async (order: SalesOrder) => {
    setProcessingId(order.id);
    try {
      const result = await DiamondApi.markInvoicePaid(order.id);
      setSales(sales.map((s) => s.id === order.id ? { ...s, deal_status: 'PAID' } : s));
      showToast(`✓ Invoice ${order.invoice_number} marked as PAID — ₹${Number(order.net_amount).toLocaleString('en-IN')} credited`);
      if (onRefresh) onRefresh();
    } catch {
      showToast('Failed to mark payment. Please try again.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePartialPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const result = await DiamondApi.recordPartialPayment({
        sales_order_id: selectedOrder.id,
        amount_received: parseFloat(partialForm.amount_received),
        payment_mode: partialForm.payment_mode,
        payment_reference: partialForm.payment_reference,
        next_promise_date: partialForm.next_promise_date || undefined,
        remarks: partialForm.remarks
      });
      setSales(sales.map((s) => s.id === selectedOrder.id ? { ...s, deal_status: result.deal_status || 'PARTIAL' } : s));
      setShowPartialModal(false);
      setPartialForm({ amount_received: '', payment_mode: 'RTGS', payment_reference: '', next_promise_date: '', remarks: '' });
      const msg = partialForm.next_promise_date
        ? `₹${parseFloat(partialForm.amount_received).toLocaleString('en-IN')} received. Next follow-up set for ${partialForm.next_promise_date}.`
        : `₹${parseFloat(partialForm.amount_received).toLocaleString('en-IN')} partial payment recorded.`;
      showToast(msg);
      if (onRefresh) onRefresh();
    } catch {
      showToast('Failed to record payment. Please try again.', 'error');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !rescheduleForm.new_promised_date) return;
    try {
      await DiamondApi.reschedulePayment({
        sales_order_id: selectedOrder.id,
        new_promised_date: rescheduleForm.new_promised_date,
        reason: rescheduleForm.reason
      });
      setShowRescheduleModal(false);
      setRescheduleForm({ new_promised_date: '', reason: '' });
      showToast(`🔔 Payment rescheduled to ${rescheduleForm.new_promised_date}. Follow-up reminder created.`);
      if (onRefresh) onRefresh();
    } catch {
      showToast('Failed to reschedule. Please try again.', 'error');
    }
  };

  const openPartialModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    setPartialForm({ amount_received: '', payment_mode: 'RTGS', payment_reference: '', next_promise_date: '', remarks: '' });
    setShowPartialModal(true);
  };

  const openRescheduleModal = (order: SalesOrder) => {
    setSelectedOrder(order);
    setRescheduleForm({
      new_promised_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      reason: ''
    });
    setShowRescheduleModal(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#f8fafc'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.775rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          marginBottom: '16px', padding: '12px 16px',
          background: toast.type === 'error' ? '#fff1f2' : '#ecfdf5',
          border: `1px solid ${toast.type === 'error' ? '#fecdd3' : '#a7f3d0'}`,
          borderRadius: '8px',
          color: toast.type === 'error' ? '#e11d48' : '#065f46',
          fontSize: '0.875rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle2 size={16} /> {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>Sales, Purchases & Broker Deals</h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>Tax invoices, rough purchases from Surat/Antwerp, and broker commissions</p>
        </div>
        <button onClick={() => setShowNewSaleModal(true)} className="btn-primary">
          <Plus size={16} /> Generate Sales Invoice
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {(['sales', 'purchases', 'brokerage'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
              border: activeTab === tab ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
              background: activeTab === tab ? '#eff6ff' : '#ffffff',
              color: activeTab === tab ? '#0284c7' : '#64748b',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {tab === 'sales' && <><FileText size={16} /> Sales Invoices ({sales.length})</>}
            {tab === 'purchases' && <><ShoppingCart size={16} /> Purchase Bills ({purchases.length})</>}
            {tab === 'brokerage' && <><Percent size={16} /> Brokerage Ledger ({brokerage.length})</>}
          </button>
        ))}
      </div>

      {/* VIEW: SALES INVOICES */}
      {activeTab === 'sales' && (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Buyer Party</th>
                <th>Broker</th>
                <th>Carats</th>
                <th>Net Amount (INR)</th>
                <th>Payment Due</th>
                <th>Status</th>
                <th>Payment Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => {
                const status = getDueDateStatus(s.payment_due_date, s.deal_status);
                const isProcessing = processingId === s.id;
                const isPaid = s.deal_status === 'PAID';

                return (
                  <tr key={s.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>{s.invoice_number}</span>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{s.created_at}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.buyer_name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>{s.broker_name || 'Direct'}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{Number(s.total_carat).toFixed(2)} Cts</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                        ₹{Number(s.net_amount).toLocaleString('en-IN')}
                      </span>
                      {Number(s.gross_amount) !== Number(s.net_amount) && (
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          Gross: ₹{Number(s.gross_amount).toLocaleString('en-IN')} ({Number(s.discount_pct).toFixed(1)}% off)
                        </div>
                      )}
                    </td>
                    <td>
                      <DueBadge status={status} dueDate={s.payment_due_date} />
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: '6px', fontSize: '0.775rem', fontWeight: 700,
                        background: isPaid ? '#ecfdf5' : s.deal_status === 'PARTIAL' ? '#eff6ff' : '#f8fafc',
                        color: isPaid ? '#059669' : s.deal_status === 'PARTIAL' ? '#2563eb' : '#64748b',
                        border: `1px solid ${isPaid ? '#a7f3d0' : s.deal_status === 'PARTIAL' ? '#bfdbfe' : '#e2e8f0'}`
                      }}>
                        {s.deal_status || 'UNPAID'}
                      </span>
                    </td>
                    <td>
                      {isPaid ? (
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Settled
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {/* Mark Complete button — highlighted on due date */}
                          <button
                            onClick={() => handleMarkPaid(s)}
                            disabled={isProcessing}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', cursor: isProcessing ? 'not-allowed' : 'pointer',
                              fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                              background: (status === 'duetoday' || status === 'overdue') ? '#059669' : '#f0fdf4',
                              color: (status === 'duetoday' || status === 'overdue') ? '#ffffff' : '#059669',
                              border: `1px solid ${(status === 'duetoday' || status === 'overdue') ? '#059669' : '#a7f3d0'}`,
                              boxShadow: (status === 'duetoday' || status === 'overdue') ? '0 2px 8px rgba(5,150,105,0.35)' : 'none',
                              animation: status === 'duetoday' ? 'pulse 2s infinite' : 'none'
                            }}
                            title="Mark invoice as fully paid"
                          >
                            {isProcessing ? <RefreshCw size={12} /> : <Check size={12} />}
                            {isProcessing ? '...' : 'Mark PAID'}
                          </button>

                          {/* Partial Payment */}
                          <button
                            onClick={() => openPartialModal(s)}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                              background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe'
                            }}
                            title="Record partial payment"
                          >
                            <IndianRupee size={11} /> Partial
                          </button>

                          {/* Reschedule */}
                          <button
                            onClick={() => openRescheduleModal(s)}
                            style={{
                              padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                              fontSize: '0.775rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px',
                              background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a'
                            }}
                            title="Reschedule promised payment date"
                          >
                            <Calendar size={11} /> Reschedule
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: PURCHASES */}
      {activeTab === 'purchases' && (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Purchase Bill #</th>
                <th>Seller (Surat / Antwerp)</th>
                <th>Broker</th>
                <th>Total Bill Amount</th>
                <th>Payment Terms</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td><span style={{ fontWeight: 700, color: '#0284c7' }}>{p.bill_number}</span></td>
                  <td><div style={{ fontWeight: 700, color: '#0f172a' }}>{p.seller_name}</div></td>
                  <td><span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>{p.broker_name || 'Direct'}</span></td>
                  <td><span style={{ fontWeight: 700 }}>₹{p.total_amount.toLocaleString('en-IN')}</span></td>
                  <td>{p.payment_terms_days} Days Credit</td>
                  <td>{p.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW: BROKERAGE */}
      {activeTab === 'brokerage' && (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Broker Name</th>
                <th>Deal Type</th>
                <th>Commission %</th>
                <th>Brokerage Amount (INR)</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {brokerage.map((b) => (
                <tr key={b.id}>
                  <td><div style={{ fontWeight: 700 }}>{b.broker_name}</div></td>
                  <td><span className="badge badge-broker">{b.transaction_type}</span></td>
                  <td>{b.commission_pct}%</td>
                  <td><span style={{ fontWeight: 700 }}>₹{b.total_brokerage_amount.toLocaleString('en-IN')}</span></td>
                  <td>
                    {b.payment_status === 'PAID'
                      ? <span className="badge badge-in-stock">PAID</span>
                      : <span className="badge badge-overdue">PAYABLE</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== MODAL: CREATE SALE ===================== */}
      {showNewSaleModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Generate Diamond Sales Invoice
              </h3>
              <button onClick={() => setShowNewSaleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSale}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Select Buyer Party</label>
                  {parties.length > 0 ? (
                    <select
                      value={saleForm.buyer_id}
                      onChange={(e) => {
                        const sel = parties.find((p) => p.id === e.target.value);
                        setSaleForm({
                          ...saleForm,
                          buyer_id: e.target.value,
                          buyer_name: sel?.business_name || ''
                        });
                      }}
                      style={inputStyle}
                      required
                    >
                      <option value="">-- Choose Registered Buyer --</option>
                      {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.business_name} ({p.owner_name}{p.city ? ` • ${p.city}` : ''})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={saleForm.buyer_name}
                      onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })}
                      style={inputStyle}
                      placeholder="e.g. Mahavir Gems & Jewels"
                    />
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Broker Name (If Brokered)</label>
                  <input type="text" value={saleForm.broker_name} onChange={(e) => setSaleForm({ ...saleForm, broker_name: e.target.value })} style={inputStyle} placeholder="e.g. Kothari Broking House" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Total Carats</label>
                    <input type="number" step="0.01" required value={saleForm.total_carat} onChange={(e) => setSaleForm({ ...saleForm, total_carat: e.target.value })} style={inputStyle} placeholder="e.g. 15.50" />
                  </div>
                  <div>
                    <label style={labelStyle}>Gross Amount (₹)</label>
                    <input type="number" required value={saleForm.gross_amount} onChange={(e) => setSaleForm({ ...saleForm, gross_amount: e.target.value })} style={inputStyle} placeholder="e.g. 4500000" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Discount %</label>
                    <input type="number" step="0.1" value={saleForm.discount_pct} onChange={(e) => setSaleForm({ ...saleForm, discount_pct: e.target.value })} style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <label style={labelStyle}>Payment Due Date</label>
                    <input type="date" required value={saleForm.payment_due_date} onChange={(e) => setSaleForm({ ...saleForm, payment_due_date: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                {saleForm.gross_amount && (
                  <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#064e3b' }}>
                      <strong>Net Payable:</strong> ₹{(parseFloat(saleForm.gross_amount || '0') * (1 - parseFloat(saleForm.discount_pct || '0') / 100)).toLocaleString('en-IN')}
                      {' '}&nbsp;• <strong>Due on:</strong> {saleForm.payment_due_date}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewSaleModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary"><Check size={16} /> Confirm & Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: PARTIAL PAYMENT ===================== */}
      {showPartialModal && selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  <CreditCard size={18} style={{ display: 'inline', marginRight: '8px', color: '#2563eb' }} />
                  Record Partial Payment
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Invoice: <strong>{selectedOrder.invoice_number}</strong> — ₹{Number(selectedOrder.net_amount).toLocaleString('en-IN')} total
                </p>
              </div>
              <button onClick={() => setShowPartialModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePartialPayment}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Amount Received (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={partialForm.amount_received}
                    onChange={(e) => setPartialForm({ ...partialForm, amount_received: e.target.value })}
                    style={{ ...inputStyle, fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}
                    placeholder="e.g. 2500000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Payment Mode</label>
                  <select
                    value={partialForm.payment_mode}
                    onChange={(e) => setPartialForm({ ...partialForm, payment_mode: e.target.value as PaymentMode })}
                    style={inputStyle}
                  >
                    <option value="RTGS">RTGS</option>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                    <option value="UPI">UPI</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CASH">Cash</option>
                    <option value="ANGADIA">Angadia</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Transaction Reference / UTR</label>
                  <input
                    type="text"
                    value={partialForm.payment_reference}
                    onChange={(e) => setPartialForm({ ...partialForm, payment_reference: e.target.value })}
                    style={inputStyle}
                    placeholder="e.g. HDFC123456789 or UTR No."
                  />
                </div>
                <div>
                  <label style={labelStyle}>Next Payment Promise Date (Optional)</label>
                  <input
                    type="date"
                    value={partialForm.next_promise_date}
                    onChange={(e) => setPartialForm({ ...partialForm, next_promise_date: e.target.value })}
                    style={inputStyle}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    🔔 Setting a date will automatically create a follow-up reminder for that date.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Remarks / Notes</label>
                  <textarea
                    rows={2}
                    value={partialForm.remarks}
                    onChange={(e) => setPartialForm({ ...partialForm, remarks: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="e.g. Balance after Antwerp show proceeds..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowPartialModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={16} /> Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: RESCHEDULE PAYMENT ===================== */}
      {showRescheduleModal && selectedOrder && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  <Calendar size={18} style={{ display: 'inline', marginRight: '8px', color: '#b45309' }} />
                  Reschedule Payment Date
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Invoice: <strong>{selectedOrder.invoice_number}</strong> — Original due: {selectedOrder.payment_due_date}
                </p>
              </div>
              <button onClick={() => setShowRescheduleModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', background: '#fef9c3', borderRadius: '8px', border: '1px solid #fef08a', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={16} style={{ color: '#b45309', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', lineHeight: 1.5 }}>
                    A follow-up reminder will be automatically created for the new promised date. You will receive a notification on that day.
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>New Promised Payment Date</label>
                  <input
                    type="date"
                    required
                    value={rescheduleForm.new_promised_date}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, new_promised_date: e.target.value })}
                    style={{ ...inputStyle, fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Reason for Rescheduling</label>
                  <textarea
                    rows={3}
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    placeholder="e.g. Client promised after Hong Kong show. Will release RTGS on 25th Oct."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRescheduleModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#b45309', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> Confirm Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
