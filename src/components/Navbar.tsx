import React from 'react';
import { Gem, ShieldCheck, Activity, User, Bell } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }}>
          <Gem size={24} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            BKC Diamond Bourse <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>OPERA HOUSE ERP</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>High-Volume Financial & Stock Settlement Engine</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Service health indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 14px', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#34d399' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span> PG-16
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#38bdf8' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span> Redis
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#fbbf24' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }}></span> Kafka
          </span>
        </div>

        {/* User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 600, fontSize: '0.9rem' }}>
            PS
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>Pravinbhai Shah</div>
            <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>Managing Trader</div>
          </div>
        </div>
      </div>
    </header>
  );
};
