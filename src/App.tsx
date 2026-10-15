import React, { useState, useEffect, useCallback } from 'react';
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
import { OrganizationTeam } from './components/OrganizationTeam';
import { LoginPage } from './components/LoginPage';
import { DashboardCharts } from './components/DashboardCharts';
import { ExpenseTracker } from './components/ExpenseTracker';
import { DiamondApi } from './services/api';
import {
  StockSummary, DiamondLot, SingleDiamond, DebtorsAgeing,
  FollowUpItem, MemoBill, Party, SalesOrder, PurchaseOrder,
  BrokerageItem, RepairSlip, SystemAuditRecord, WhatsAppTemplate, User,
  Organization, OrganizationMember, SmsLog
} from './types';
import {
  Gem, IndianRupee, FileText, PhoneCall, RefreshCw,
  TrendingUp, AlertCircle, CheckCircle2, X, Building2, UserCheck
} from 'lucide-react';

interface Toast { id: number; msg: string; type: 'error' | 'success' | 'info'; }

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Core data
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
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [myOnlyHisab, setMyOnlyHisab] = useState(false);
  const [salesStats, setSalesStats] = useState<{
    today_count: number; today_amount: number;
    month_count: number; month_amount: number; total_pending: number;
  } | null>(null);

  const addToast = (msg: string, type: Toast['type'] = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  useEffect(() => {
    const token = localStorage.getItem('diamond_erp_jwt_token');
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser(DiamondApi.getCurrentUser());
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const errors: string[] = [];

    async function safe<T>(fn: () => Promise<T>, label: string, fallback: T): Promise<T> {
      try { return await fn(); }
      catch (e: any) {
        const msg = e?.response?.data?.message || e?.message || `${label} failed`;
        errors.push(msg);
        return fallback;
      }
    }

    const [
      sumData, lotsData, solData, ageData, fuData,
      memoData, partyData, salesData, purData, brokData,
      repairData, auditData, tplData, statsData,
      orgData, membersData, smsData
    ] = await Promise.all([
      safe(() => DiamondApi.getStockSummary(), 'Stock summary', null),
      safe(() => DiamondApi.getLots(), 'Lots', []),
      safe(() => DiamondApi.getSingleDiamonds(), 'Diamonds', []),
      safe(() => DiamondApi.getDebtorsAgeing(), 'Debtors ageing', null),
      safe(() => DiamondApi.getDailyFollowUps(), 'Follow-ups', []),
      safe(() => DiamondApi.getMemos(), 'Memos', []),
      safe(() => DiamondApi.getParties(), 'Parties', []),
      safe(() => DiamondApi.getSalesOrders(), 'Sales', []),
      safe(() => DiamondApi.getPurchases(), 'Purchases', []),
      safe(() => DiamondApi.getBrokerageLedgers(), 'Brokerage', []),
      safe(() => DiamondApi.getRepairSlips(), 'Repair slips', []),
      safe(() => DiamondApi.getAuditLogs(), 'Audit logs', []),
      safe(() => DiamondApi.getWhatsAppTemplates(), 'Templates', []),
      safe(() => DiamondApi.getMySalesStats(), 'Sales stats', null),
      safe(() => DiamondApi.getMyOrganization(), 'Organization', null),
      safe(() => DiamondApi.getOrganizationMembers(), 'Members', []),
      safe(() => DiamondApi.getSmsLogs(), 'SMS logs', [])
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
    setSalesStats(statsData);
    setOrganization(orgData);
    setMembers(membersData);
    setSmsLogs(smsData);

    setLoading(false);

    if (errors.length > 0) {
      // Show a combined backend error (backend may not be started)
      addToast(`Backend: ${errors[0]}${errors.length > 1 ? ` (+${errors.length - 1} more)` : ''}`, 'error');
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentUser(DiamondApi.getCurrentUser());
  };

  const handleLogout = () => {
    DiamondApi.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLots([]); setSolitaires([]); setSales([]); setParties([]);
    setMemos([]); setFollowUps([]); setRepairSlips([]); setAuditLogs([]);
    setSummary(null); setAgeing(null); setSalesStats(null);
    setActiveTab('dashboard');
  };

  if (!isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const pageTitles: Record<string, string> = {
    dashboard:    'Executive Diamond Trading Dashboard',
    inventory:    'Diamond Lots & Certified Single Inventory',
    memo:         'Memo Approvals (Jangad Challans)',
    parties:      'Parties & Brokers Directory',
    sales:        'Sales Invoices, Purchases & Broker Deals',
    ledger:       'Multi-Party Khata & Balance Reconciliation',
    followups:    'Payment Follow-ups & 1-Tap Dialer',
    expenses:     'Kharcha — Daily Business Expense Tracker',
    organization: 'Organization & Staff (Multi-User Desk)',
    processing:   'Karkhana & Surat Processing Workshops',
    audit:        'System Audit Trail & Compliance'
  };

  // Derive summary values from real data if API didn't return it
  const totalStockVal = summary?.lots.total_valuation_inr
    ?? lots.reduce((s, l) => s + l.current_carat * l.cost_per_carat, 0);
  const totalCarats = summary?.aggregated_carats
    ?? (lots.reduce((s, l) => s + Number(l.current_carat), 0) + solitaires.reduce((s, d) => s + Number(d.carat), 0));
  const totalOutstanding = ageing?.total_outstanding
    ?? sales.filter((s) => !['PAID', 'SETTLED'].includes(s.deal_status)).reduce((s, o) => s + Number(o.net_amount), 0);
  const openMemos = memos.filter((m) => m.status === 'OPEN').length;
  const overdueFollowUps = followUps.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: '72px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px 14px',
            background: t.type === 'error' ? '#fff1f2' : t.type === 'success' ? '#ecfdf5' : '#eff6ff',
            border: `1px solid ${t.type === 'error' ? '#fecdd3' : t.type === 'success' ? '#a7f3d0' : '#bfdbfe'}`,
            borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '0.825rem', fontWeight: 600,
            color: t.type === 'error' ? '#be123c' : t.type === 'success' ? '#065f46' : '#1e40af'
          }}>
            {t.type === 'error' ? <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> : <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />}
            <span style={{ flex: 1 }}>{t.msg}</span>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', opacity: 0.6 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        pendingFollowUpsCount={overdueFollowUps}
        onNotificationClick={() => setActiveTab('followups')}
      />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {pageTitles[activeTab] || 'Diamond ERP'}
              </h2>
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Bharat Diamond Bourse (BKC) & Opera House Financial Engine
              </p>
            </div>
            <button onClick={loadData} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <>
              {/* 4 Metric Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
                <MetricCard
                  title="Stock Valuation (Safe Vault)"
                  value={`₹${(totalStockVal / 10000000).toFixed(2)} Cr`}
                  subtitle={`${totalCarats.toFixed(2)} Total Carats in Safe`}
                  icon={Gem}
                  accentColor="#0284c7"
                />
                <MetricCard
                  title="Market Receivables (Debtors)"
                  value={`₹${(totalOutstanding / 10000000).toFixed(2)} Cr`}
                  subtitle="Pending payments from buyers"
                  icon={IndianRupee}
                  accentColor="#d97706"
                />
                <MetricCard
                  title="Active Memo Challans"
                  value={`${openMemos} Packets`}
                  subtitle="Given out-on-approval to brokers"
                  icon={FileText}
                  accentColor="#7c3aed"
                />
                <MetricCard
                  title="Payment Follow-ups Due"
                  value={`${overdueFollowUps} Overdue`}
                  subtitle="With call & WhatsApp triggers"
                  icon={PhoneCall}
                  accentColor="#e11d48"
                />
              </div>

              {/* ── My Sales Stats Bar ── */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px',
                padding: '20px 24px', background: '#0f172a', borderRadius: '14px',
                boxShadow: '0 4px 24px rgba(15,23,42,0.15)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Today's Sales
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                    {salesStats ? salesStats.today_count : sales.filter((s) => s.created_at === new Date().toISOString().split('T')[0]).length}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>invoices</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#22d3ee', marginTop: '2px' }}>
                    ₹{((salesStats?.today_amount ?? 0) / 100000).toFixed(1)}L
                  </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #1e293b', borderRight: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    This Month's Sales
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
                    {salesStats?.month_count ?? sales.length}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>invoices</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#6ee7b7', marginTop: '2px' }}>
                    ₹{((salesStats?.month_amount ?? sales.reduce((s, o) => s + Number(o.net_amount), 0)) / 10000000).toFixed(2)} Cr
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Total Pending Collection
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }}>
                    {sales.filter((s) => !['PAID', 'SETTLED'].includes(s.deal_status)).length}
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginLeft: '6px' }}>invoices</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fca5a5', marginTop: '2px' }}>
                    ₹{(totalOutstanding / 10000000).toFixed(2)} Cr outstanding
                  </div>
                </div>
              </div>

              {ageing && <DebtorsAgeingChart data={ageing} />}

              {/* ── Advanced Dashboard Charts ── */}
              <DashboardCharts
                followUpsCount={overdueFollowUps}
                collectionsThisMonth={salesStats?.month_amount}
              />

              {/* Empty state if no data */}
              {lots.length === 0 && solitaires.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <Gem size={48} style={{ margin: '0 auto 16px', display: 'block', color: '#e2e8f0' }} />
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>No inventory data yet</div>
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Make sure the backend server is running at <code>http://localhost:5000</code>, then click <strong>Refresh Data</strong>.
                  </p>
                </div>
              ) : (
                <DiamondTable lots={lots} solitaires={solitaires} onRefresh={loadData} />
              )}
            </>
          )}

          {activeTab === 'inventory' && (
            lots.length === 0 && solitaires.length === 0
              ? <EmptyState icon={<Gem size={48} />} label="No inventory found" hint="Add your first lot using the button above." />
              : <DiamondTable lots={lots} solitaires={solitaires} onRefresh={loadData} />
          )}

          {activeTab === 'memo' && (
            memos.length === 0
              ? <EmptyState icon={<FileText size={48} />} label="No memo challans" hint="Create your first memo challan to track goods sent out for approval." />
              : <MemoManager memos={memos} onRefresh={loadData} />
          )}

          {activeTab === 'parties' && (
            <PartiesDirectory parties={parties} onRefresh={loadData} />
          )}

          {activeTab === 'sales' && (
            <SalesDeals salesOrders={sales} purchases={purchases} brokerageItems={brokerage} parties={parties} onRefresh={loadData} />
          )}

          {activeTab === 'ledger' && <KhataLedger parties={parties} />}

          {activeTab === 'followups' && (
            <FollowUpDialer queue={followUps} onRefresh={loadData} />
          )}

          {activeTab === 'expenses' && (
            <ExpenseTracker onRefresh={loadData} />
          )}

          {activeTab === 'organization' && (
            <OrganizationTeam
              organization={organization}
              members={members}
              smsLogs={smsLogs}
              onRefresh={loadData}
            />
          )}

          {activeTab === 'processing' && (
            <ProcessingWorkshop repairSlips={repairSlips} parties={parties} onRefresh={loadData} />
          )}

          {activeTab === 'audit' && <AuditLogs logs={auditLogs} templates={templates} />}
        </main>
      </div>
    </div>
  );
};

// ── Reusable empty-state ──
const EmptyState: React.FC<{ icon: React.ReactNode; label: string; hint: string }> = ({ icon, label, hint }) => (
  <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
    <div style={{ color: '#e2e8f0', margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginBottom: '8px' }}>{label}</div>
    <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto' }}>{hint}</p>
  </div>
);

export default App;
