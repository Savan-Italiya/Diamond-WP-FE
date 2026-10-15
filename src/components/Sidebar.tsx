import {
  LayoutDashboard,
  Diamond,
  FileText,
  Users,
  BadgeDollarSign,
  BookOpen,
  PhoneCall,
  Hammer,
  ShieldCheck,
  TrendingUp,
  LogOut,
  Building2,
  Wallet
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const navSections = [
    {
      title: 'Diamond Trading Desk',
      items: [
        { id: 'dashboard', label: 'Bourse Dashboard', icon: LayoutDashboard },
        { id: 'inventory', label: 'Inventory (Lots & Single)', icon: Diamond },
        { id: 'memo', label: 'Memo Approvals (Jangad)', icon: FileText },
        { id: 'sales', label: 'Sales, Deals & Invoices', icon: BadgeDollarSign }
      ]
    },
    {
      title: 'Financial & Ledger',
      items: [
        { id: 'ledger',   label: 'Multi-Party Khata Ledgers',   icon: BookOpen },
        { id: 'parties',  label: 'Parties & Brokers Directory',  icon: Users },
        { id: 'followups',label: 'Payment Follow-ups & Dialer',  icon: PhoneCall },
        { id: 'expenses', label: 'Kharcha / Expense Tracker',    icon: Wallet },
      ]
    },
    {
      title: 'Firm & Team (Multi-User)',
      items: [
        { id: 'organization', label: 'Organization & Staff', icon: Building2 }
      ]
    },
    {
      title: 'Surat Workshop & Security',
      items: [
        { id: 'processing', label: 'Karkhana Repair Slips', icon: Hammer },
        { id: 'audit', label: 'System Audit & Compliance', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <aside
      style={{
        width: '260px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderRight: '1px solid var(--border-subtle)',
        background: '#ffffff',
        minHeight: 'calc(100vh - 67px)'
      }}
    >
      {navSections.map((sec, sIdx) => (
        <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '0.675rem',
              textTransform: 'uppercase',
              color: '#94a3b8',
              fontWeight: 700,
              paddingLeft: '12px',
              marginBottom: '6px',
              letterSpacing: '0.06em'
            }}
          >
            {sec.title}
          </div>

          {sec.items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '11px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: isActive ? '#eff6ff' : 'transparent',
                  color: isActive ? '#0284c7' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  borderLeft: isActive ? '3px solid #0284c7' : '3px solid transparent'
                }}
              >
                <Icon size={17} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}

      {/* Market Rate Ticker Card */}
      <div
        style={{
          marginTop: 'auto',
          padding: '14px',
          background: '#f8fafc',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }}>BKC Market Rate (Avg)</span>
          <TrendingUp size={14} color="#059669" />
        </div>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
          ₹32,400 <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>/ Ct</span>
        </div>
        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '3px' }}>
          ▲ +1.4% this week (Surat/BDB)
        </div>
      </div>

      {/* Prominent Sidebar Sign Out Button */}
      {onLogout && (
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '12px 16px',
            background: '#fff1f2',
            border: '1.5px solid #fda4af',
            borderRadius: '10px',
            color: '#e11d48',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(225,29,72,0.08)'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#ffe4e6';
            (e.currentTarget as HTMLElement).style.borderColor = '#e11d48';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#fff1f2';
            (e.currentTarget as HTMLElement).style.borderColor = '#fda4af';
          }}
          title="Sign Out / Logout"
        >
          <LogOut size={17} />
          <span>Sign Out / Log Out</span>
        </button>
      )}
    </aside>
  );
};
