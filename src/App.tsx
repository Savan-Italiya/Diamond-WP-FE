import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { DebtorsAgeingChart } from './components/DebtorsAgeingChart';
import { DiamondTable } from './components/DiamondTable';
import { MemoManager } from './components/MemoManager';
import { KhataLedger } from './components/KhataLedger';
import { FollowUpDialer } from './components/FollowUpDialer';
import { DiamondApi } from './services/api';
import { StockSummary, DiamondLot, SingleDiamond, DebtorsAgeing, FollowUpItem, MemoBill } from './types';
import { Gem, IndianRupee, FileText, PhoneCall, RefreshCw, Hammer } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [lots, setLots] = useState<DiamondLot[]>([]);
  const [solitaires, setSolitaires] = useState<SingleDiamond[]>([]);
  const [ageing, setAgeing] = useState<DebtorsAgeing | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [memos, setMemos] = useState<MemoBill[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumData, lotsData, solData, ageData, fuData, memoData] = await Promise.all([
        DiamondApi.getStockSummary(),
        DiamondApi.getLots(),
        DiamondApi.getSingleDiamonds(),
        DiamondApi.getDebtorsAgeing(),
        DiamondApi.getDailyFollowUps(),
        DiamondApi.getMemos()
      ]);

      setSummary(sumData);
      setLots(lotsData);
      setSolitaires(solData);
      setAgeing(ageData);
      setFollowUps(fuData);
      setMemos(memoData);
    } catch (err) {
      console.error('Error fetching ERP data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                {activeTab === 'dashboard' && 'Executive Diamond Trading Dashboard'}
                {activeTab === 'inventory' && 'Diamond Lots & Certified Single Inventory'}
                {activeTab === 'memo' && 'Memo Approvals (Jangad / Challans)'}
                {activeTab === 'ledger' && 'Multi-Party Khata & Balance Reconciliation'}
                {activeTab === 'followups' && 'Payment Follow-ups & 1-Tap Dialer Desk'}
                {activeTab === 'processing' && 'Karkhana & Surat Repair Workshops'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Mumbai BKC Bharat Diamond Bourse & Opera House Market Hub
              </p>
            </div>

            <button
              onClick={loadData}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
          </div>

          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <MetricCard
                  title="Stock Valuation (Carat Hub)"
                  value={summary ? `₹${(summary.lots.total_valuation_inr / 10000000).toFixed(2)} Cr` : '₹28.45 Cr'}
                  subtitle={summary ? `${summary.aggregated_carats.toFixed(2)} Total Carats in Safe` : '955.05 Cts'}
                  icon={Gem}
                  accentColor="#38bdf8"
                />

                <MetricCard
                  title="Total Outstanding Debtors"
                  value={ageing ? `₹${(ageing.total_outstanding / 10000000).toFixed(2)} Cr` : '₹2.94 Cr'}
                  subtitle="Receivables from market buyers"
                  icon={IndianRupee}
                  accentColor="#f59e0b"
                />

                <MetricCard
                  title="Active Memo Challans"
                  value={memos ? `${memos.length} Packets` : '12 Packets'}
                  subtitle="Given out-on-approval to brokers"
                  icon={FileText}
                  accentColor="#8b5cf6"
                />

                <MetricCard
                  title="Today's Payment Follow-ups"
                  value={followUps ? `${followUps.length} Overdue` : '2 Overdue'}
                  subtitle="With WhatsApp triggers ready"
                  icon={PhoneCall}
                  accentColor="#f43f5e"
                />
              </div>

              {/* Debtors Ageing Analysis Chart */}
              {ageing && <DebtorsAgeingChart data={ageing} />}

              {/* Quick Diamond Inventory Table */}
              <DiamondTable lots={lots} solitaires={solitaires} />
            </>
          )}

          {/* VIEW: INVENTORY */}
          {activeTab === 'inventory' && <DiamondTable lots={lots} solitaires={solitaires} />}

          {/* VIEW: MEMO */}
          {activeTab === 'memo' && <MemoManager memos={memos} />}

          {/* VIEW: LEDGER */}
          {activeTab === 'ledger' && <KhataLedger />}

          {/* VIEW: FOLLOW-UPS */}
          {activeTab === 'followups' && <FollowUpDialer queue={followUps} />}

          {/* VIEW: PROCESSING / WORKSHOP */}
          {activeTab === 'processing' && (
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <Hammer size={28} color="#f59e0b" />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', marginBottom: '8px' }}>
                Karkhana & Surat Processing Hub Active
              </h3>
              <p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 20px auto', fontSize: '0.9rem' }}>
                Manage laser-sawing, cleavage repair, and re-polishing slips with automatic carat loss calculations.
              </p>
              <div style={{ display: 'inline-flex', gap: '12px' }}>
                <span className="badge badge-gia">3 Slips at Surat Workshop</span>
                <span className="badge badge-in-stock">1.85 Cts Returned Today</span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
