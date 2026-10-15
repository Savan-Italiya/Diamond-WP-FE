import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MetricCard } from './components/MetricCard';
import { DebtorsAgeingChart } from './components/DebtorsAgeingChart';
import { DiamondTable } from './components/DiamondTable';
import { MemoManager } from './components/MemoManager';
import { KhataLedger } from './components/KhataLedger';
import { FollowUpDialer } from './components/FollowUpDialer';
import { PartiesDirectory } from './components/PartiesDirectory';
import { SalesDeals } from './components/SalesDeals';
import { ProcessingWorkshop } from './components/ProcessingWorkshop';
import { AuditLogs } from './components/AuditLogs';
import { DiamondApi } from './services/api';
import {
  StockSummary,
  DiamondLot,
  SingleDiamond,
  DebtorsAgeing,
  FollowUpItem,
  MemoBill,
  Party,
  SalesOrder,
  PurchaseOrder,
  BrokerageItem,
  RepairSlip,
  SystemAuditRecord,
  WhatsAppTemplate,
  User
} from './types';
import { Gem, IndianRupee, FileText, PhoneCall, RefreshCw, Plus, Users, ShoppingBag } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core Data States
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [lots, setLots] = useState<DiamondLot[]>([]);
  const [solitaires, setSolitaires] = useState<SingleDiamond[]>([]);
  const [ageing, setAgeing] = useState<DebtorsAgeing | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [memos, setMemos] = useState<MemoBill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [brokerage, setBrokerage] = useState<BrokerageItem[]>([]);
  const [repairSlips, setRepairSlips] = useState<RepairSlip[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditRecord[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Auto-authenticate with seed credentials if no active token
      if (!localStorage.getItem('diamond_erp_jwt_token')) {
        await DiamondApi.login('admin@bkc-diamonds.com', 'Admin@Mumbai2026');
      }

      const user = DiamondApi.getCurrentUser();
      setCurrentUser(user);

      const [
        sumData,
        lotsData,
        solData,
        ageData,
        fuData,
        memoData,
        partyData,
        salesData,
        purData,
        brokData,
        repairData,
        auditData,
        tplData
      ] = await Promise.all([
        DiamondApi.getStockSummary(),
        DiamondApi.getLots(),
        DiamondApi.getSingleDiamonds(),
        DiamondApi.getDebtorsAgeing(),
        DiamondApi.getDailyFollowUps(),
        DiamondApi.getMemos(),
        DiamondApi.getParties(),
        DiamondApi.getSalesOrders(),
        DiamondApi.getPurchases(),
        DiamondApi.getBrokerageLedgers(),
        DiamondApi.getRepairSlips(),
        DiamondApi.getAuditLogs(),
        DiamondApi.getWhatsAppTemplates()
      ]);

      setSummary(sumData);
      setLots(lotsData);
      setSolitaires(solData);
      setAgeing(ageData);
      setFollowUps(fuData);
      setMemos(memoData);
      setParties(partyData);
      setSales(salesData);
      setPurchases(purData);
      setBrokerage(brokData);
      setRepairSlips(repairData);
      setAuditLogs(auditData);
      setTemplates(tplData);
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Top Navbar */}
      <Navbar currentUser={currentUser} />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content View */}
        <main
          style={{
            flex: 1,
            padding: '28px 36px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxWidth: '1600px'
          }}
        >
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {activeTab === 'dashboard' && 'Executive Diamond Trading Dashboard'}
                {activeTab === 'inventory' && 'Diamond Lots & Certified Single Inventory'}
                {activeTab === 'memo' && 'Memo Approvals (Jangad Challans)'}
                {activeTab === 'parties' && 'Parties & Brokers Directory (Khata Profiles)'}
                {activeTab === 'sales' && 'Sales, Purchases & Broker Deals'}
                {activeTab === 'ledger' && 'Multi-Party Khata & Balance Reconciliation'}
                {activeTab === 'followups' && 'Payment Follow-ups & 1-Tap Dialer Desk'}
                {activeTab === 'processing' && 'Karkhana & Surat Processing Workshops'}
                {activeTab === 'audit' && 'System Audit Trail & Compliance'}
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Bharat Diamond Bourse (BKC) & Opera House Financial Engine
              </p>
            </div>

            <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
            </button>
          </div>

          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Executive Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                <MetricCard
                  title="Stock Valuation (Safe Vault)"
                  value={summary ? `₹${(summary.lots.total_valuation_inr / 10000000).toFixed(2)} Cr` : '₹28.45 Cr'}
                  subtitle={summary ? `${summary.aggregated_carats.toFixed(2)} Total Carats in Safe` : '955.05 Cts'}
                  icon={Gem}
                  accentColor="#0284c7"
                />

                <MetricCard
                  title="Market Receivables (Debtors)"
                  value={ageing ? `₹${(ageing.total_outstanding / 10000000).toFixed(2)} Cr` : '₹2.94 Cr'}
                  subtitle="Receivables from market buyers"
                  icon={IndianRupee}
                  accentColor="#d97706"
                />

                <MetricCard
                  title="Active Memo Challans"
                  value={memos ? `${memos.filter((m) => m.status === 'OPEN').length} Packets` : '12 Packets'}
                  subtitle="Given out-on-approval to brokers"
                  icon={FileText}
                  accentColor="#7c3aed"
                />

                <MetricCard
                  title="Today's Payment Follow-ups"
                  value={followUps ? `${followUps.length} Overdue` : '2 Overdue'}
                  subtitle="With WhatsApp triggers ready"
                  icon={PhoneCall}
                  accentColor="#e11d48"
                />
              </div>

              {/* Debtors Ageing Analysis Chart */}
              {ageing && <DebtorsAgeingChart data={ageing} />}

              {/* Quick Diamond Inventory Table */}
              <DiamondTable lots={lots} solitaires={solitaires} onRefresh={loadData} />
            </>
          )}

          {/* VIEW: INVENTORY */}
          {activeTab === 'inventory' && <DiamondTable lots={lots} solitaires={solitaires} onRefresh={loadData} />}

          {/* VIEW: MEMO */}
          {activeTab === 'memo' && <MemoManager memos={memos} onRefresh={loadData} />}

          {/* VIEW: PARTIES */}
          {activeTab === 'parties' && <PartiesDirectory parties={parties} onRefresh={loadData} />}

          {/* VIEW: SALES & DEALS */}
          {activeTab === 'sales' && (
            <SalesDeals
              salesOrders={sales}
              purchases={purchases}
              brokerageItems={brokerage}
              parties={parties}
              onRefresh={loadData}
            />
          )}

          {/* VIEW: LEDGER */}
          {activeTab === 'ledger' && <KhataLedger parties={parties} />}

          {/* VIEW: FOLLOW-UPS */}
          {activeTab === 'followups' && <FollowUpDialer queue={followUps} onRefresh={loadData} />}

          {/* VIEW: PROCESSING / WORKSHOP */}
          {activeTab === 'processing' && (
            <ProcessingWorkshop repairSlips={repairSlips} parties={parties} onRefresh={loadData} />
          )}

          {/* VIEW: SYSTEM AUDIT */}
          {activeTab === 'audit' && <AuditLogs logs={auditLogs} templates={templates} />}
        </main>
      </div>
    </div>
  );
};

export default App;
