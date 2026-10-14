import React from 'react';
import { LayoutDashboard, Diamond, FileText, BookOpen, PhoneCall, Hammer } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Bourse Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Diamond Inventory (Lots & Single)', icon: Diamond },
    { id: 'memo', label: 'Memo Approvals (Challan)', icon: FileText },
    { id: 'ledger', label: 'Party Khata Ledgers', icon: BookOpen },
    { id: 'followups', label: 'Payment Follow-ups & Dialer', icon: PhoneCall },
    { id: 'processing', label: 'Karkhana / Repair Workshops', icon: Hammer }
  ];

  return (
    <aside style={{ width: '260px', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', borderRight: '1px solid rgba(255, 255, 255, 0.08)', background: '#0a0d14' }}>
      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, paddingLeft: '12px', marginBottom: '8px', letterSpacing: '0.05em' }}>
        Trading & Operations
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: 'none',
              background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.15), rgba(56, 189, 248, 0.02))' : 'transparent',
              color: isActive ? '#38bdf8' : '#94a3b8',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent'
            }}
          >
            <Icon size={18} color={isActive ? '#38bdf8' : '#94a3b8'} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', padding: '16px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', marginBottom: '4px' }}>BKC Market Rate (Avg)</div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>₹32,400 <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 400 }}>/ Carat</span></div>
        <div style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '4px' }}>▲ +1.4% this week in Surat</div>
      </div>
    </aside>
  );
};
