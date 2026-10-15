import React from 'react';
import { Gem, ShieldCheck, Activity, User, Bell, LogOut } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser?: UserType | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* Brand & Market Location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Gem size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              BKC Diamond Bourse
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#b45309',
                background: '#fef3c7',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #fde68a',
                letterSpacing: '0.04em'
              }}
            >
              OPERA HOUSE ERP
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
            Bharat Diamond Bourse (G-Block) • Surat Karkhana Hub • Financial Ledger
          </p>
        </div>
      </div>

      {/* Cluster Health & Live Trader Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Service health indicators */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span> PG-16 Live
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, color: '#0284c7' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#38bdf8' }}></span> Redis Safe
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: 600, color: '#d97706' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b' }}></span> Kafka Bus
          </span>
        </div>

        {/* User profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '8px', borderLeft: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
              border: '1px solid #fcd34d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#92400e',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            PS
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
              {currentUser?.name || 'Pravinbhai Shah'}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 500 }}>
              Super Admin • BKC Desk
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
