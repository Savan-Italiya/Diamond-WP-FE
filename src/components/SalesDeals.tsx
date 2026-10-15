import React, { useState } from 'react';
import { SalesOrder, PurchaseOrder, BrokerageItem, Party } from '../types';
import { BadgeDollarSign, Plus, FileText, ShoppingCart, Percent, X, Check, CheckCircle2 } from 'lucide-react';
import { DiamondApi } from '../services/api';

interface SalesDealsProps {
  salesOrders: SalesOrder[];
  purchases: PurchaseOrder[];
  brokerageItems: BrokerageItem[];
  parties: Party[];
  onRefresh?: () => void;
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
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(initialPurchases);
  const [brokerage, setBrokerage] = useState<BrokerageItem[]>(initialBrokerage);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [saleForm, setSaleForm] = useState({
    buyer_id: parties[0]?.id || 'p-1',
    buyer_name: parties[0]?.business_name || 'Mahavir Gems & Jewels',
    broker_name: 'Kothari Broking House',
    total_carat: '',
    gross_amount: '',
    discount_pct: '0',
    payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  React.useEffect(() => {
    setSales(initialSales);
  }, [initialSales]);

  React.useEffect(() => {
    setPurchases(initialPurchases);
  }, [initialPurchases]);

  React.useEffect(() => {
    setBrokerage(initialBrokerage);
  }, [initialBrokerage]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.total_carat || !saleForm.gross_amount) return;

    const gross = parseFloat(saleForm.gross_amount);
    const disc = parseFloat(saleForm.discount_pct || '0');
    const net = gross - (gross * disc) / 100;

    const created = await DiamondApi.createSalesOrder({
      buyer_id: saleForm.buyer_id,
      buyer_name: saleForm.buyer_name,
      broker_name: saleForm.broker_name,
      total_carat: parseFloat(saleForm.total_carat),
      gross_amount: gross,
      discount_pct: disc,
      net_amount: net,
      payment_due_date: saleForm.payment_due_date
    });

    setSales([created, ...sales]);
    setShowNewSaleModal(false);
    setSaleForm({
      buyer_id: parties[0]?.id || 'p-1',
      buyer_name: parties[0]?.business_name || 'Mahavir Gems & Jewels',
      broker_name: 'Kothari Broking House',
      total_carat: '',
      gross_amount: '',
      discount_pct: '0',
      payment_due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    });
    setToast(`Sales Invoice ${created.invoice_number} created for ₹${net.toLocaleString('en-IN')}`);
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

      {/* Top Header & Actions */}
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
            Sales, Purchases & Broker Deals
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Tax invoices, rough purchases from Surat/Antwerp, and broker commissions
          </p>
        </div>

        <button onClick={() => setShowNewSaleModal(true)} className="btn-primary">
          <Plus size={16} /> Generate Sales Invoice
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'sales' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
            background: activeTab === 'sales' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'sales' ? '#0284c7' : '#64748b',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FileText size={16} /> Sales Invoices ({sales.length})
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'purchases' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
            background: activeTab === 'purchases' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'purchases' ? '#0284c7' : '#64748b',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShoppingCart size={16} /> Purchase Bills ({purchases.length})
        </button>

        <button
          onClick={() => setActiveTab('brokerage')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: activeTab === 'brokerage' ? '1px solid #bfdbfe' : '1px solid var(--border-subtle)',
            background: activeTab === 'brokerage' ? '#eff6ff' : '#ffffff',
            color: activeTab === 'brokerage' ? '#0284c7' : '#64748b',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Percent size={16} /> Brokerage Ledger ({brokerage.length})
        </button>
      </div>

      {/* VIEW: SALES INVOICES */}
      {activeTab === 'sales' && (
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Buyer Party</th>
                <th>Broker</th>
                <th>Total Carats</th>
                <th>Gross (INR)</th>
                <th>Discount</th>
                <th>Net Bill Amount</th>
                <th>Payment Due Date</th>
                <th>Deal Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{s.invoice_number}</span>
                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>{s.created_at || '2026-10-14'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.buyer_name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                      {s.broker_name || 'Direct'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{Number(s.total_carat).toFixed(2)} Cts</span>
                  </td>
                  <td>₹{Number(s.gross_amount).toLocaleString('en-IN')}</td>
                  <td>
                    <span style={{ color: '#64748b' }}>{Number(s.discount_pct).toFixed(1)}%</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>
                      ₹{Number(s.net_amount).toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#e11d48', fontWeight: 600 }}>{s.payment_due_date}</span>
                  </td>
                  <td>
                    <span className="badge badge-in-stock">{s.deal_status}</span>
                  </td>
                </tr>
              ))}
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
                  <td>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>{p.bill_number}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{p.seller_name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
                      {p.broker_name || 'Direct'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{p.total_amount.toLocaleString('en-IN')}
                    </span>
                  </td>
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
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{b.broker_name}</div>
                  </td>
                  <td>
                    <span className="badge badge-broker">{b.transaction_type}</span>
                  </td>
                  <td>{b.commission_pct}%</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      ₹{b.total_brokerage_amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    {b.payment_status === 'PAID' ? (
                      <span className="badge badge-in-stock">PAID</span>
                    ) : (
                      <span className="badge badge-overdue">PAYABLE</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CREATE SALE */}
      {showNewSaleModal && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Generate Diamond Sales Invoice (BDB / Opera House)
              </h3>
              <button
                onClick={() => setShowNewSaleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSale}>
              <div className="modal-body">
                <div>
                  <label className="form-label">Buyer Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Gems & Jewels"
                    value={saleForm.buyer_name}
                    onChange={(e) => setSaleForm({ ...saleForm, buyer_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Broker Name (If Brokered Deal)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kothari Broking House"
                    value={saleForm.broker_name}
                    onChange={(e) => setSaleForm({ ...saleForm, broker_name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Total Carats</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 15.50"
                      value={saleForm.total_carat}
                      onChange={(e) => setSaleForm({ ...saleForm, total_carat: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Gross Amount (INR)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 4500000"
                      value={saleForm.gross_amount}
                      onChange={(e) => setSaleForm({ ...saleForm, gross_amount: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="form-label">Discount Percentage</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={saleForm.discount_pct}
                      onChange={(e) => setSaleForm({ ...saleForm, discount_pct: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Payment Due Date</label>
                    <input
                      type="date"
                      required
                      value={saleForm.payment_due_date}
                      onChange={(e) => setSaleForm({ ...saleForm, payment_due_date: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowNewSaleModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Check size={16} /> Confirm & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
