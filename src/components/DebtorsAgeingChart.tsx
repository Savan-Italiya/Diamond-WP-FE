import React from 'react';
import { DebtorsAgeing } from '../types';
import { AlertCircle, Clock, ShieldAlert } from 'lucide-react';

interface DebtorsAgeingProps {
  data: DebtorsAgeing;
}

export const DebtorsAgeingChart: React.FC<DebtorsAgeingProps> = ({ data }) => {
  const sumUnder30 = data.under_30_days.reduce((acc, i) => acc + Number(i.amount_due), 0);
  const sum31to60 = data.days_31_to_60.reduce((acc, i) => acc + Number(i.amount_due), 0);
  const sum61to90 = data.days_61_to_90.reduce((acc, i) => acc + Number(i.amount_due), 0);
  const sumOver90 = data.over_90_days.reduce((acc, i) => acc + Number(i.amount_due), 0);
  const total = data.total_outstanding || 1;

  const pctUnder30 = Math.round((sumUnder30 / total) * 100);
  const pct31to60 = Math.round((sum31to60 / total) * 100);
  const pct61to90 = Math.round((sum61to90 / total) * 100);
  const pctOver90 = Math.round((sumOver90 / total) * 100);

  const formatInr = (val: number) => `₹${(val / 100000).toFixed(2)} Lakhs`;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Debtors Ageing Analysis (Opera House & BKC Markets)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Risk distribution of pending market receivables across payment tranches
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.725rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Market Receivables
          </span>
          <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-heading)' }}>
            ₹{(data.total_outstanding / 10000000).toFixed(2)} Cr
          </div>
        </div>
      </div>

      {/* Stacked Multi-Color Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '14px',
          borderRadius: '7px',
          background: '#f1f5f9',
          display: 'flex',
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ width: `${pctUnder30}%`, background: '#10b981' }} title={`< 30 days: ${pctUnder30}%`}></div>
        <div style={{ width: `${pct31to60}%`, background: '#0284c7' }} title={`31-60 days: ${pct31to60}%`}></div>
        <div style={{ width: `${pct61to90}%`, background: '#f59e0b' }} title={`61-90 days: ${pct61to90}%`}></div>
        <div style={{ width: `${pctOver90}%`, background: '#e11d48' }} title={`> 90 days: ${pctOver90}%`}></div>
      </div>

      {/* 4 Ageing Metric Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#065f46', fontWeight: 600, marginBottom: '6px' }}>
            <Clock size={14} /> &lt; 30 Days (Current)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatInr(sumUnder30)}</div>
          <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '4px', fontWeight: 500 }}>
            {data.under_30_days.length} Parties ({pctUnder30}%)
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#eff6ff',
            border: '1px solid #bfdbfe'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600, marginBottom: '6px' }}>
            <Clock size={14} /> 31 - 60 Days (Follow)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatInr(sum31to60)}</div>
          <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '4px', fontWeight: 500 }}>
            {data.days_31_to_60.length} Parties ({pct31to60}%)
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#fffbeb',
            border: '1px solid #fde68a'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginBottom: '6px' }}>
            <AlertCircle size={14} /> 61 - 90 Days (Attention)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatInr(sum61to90)}</div>
          <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '4px', fontWeight: 500 }}>
            {data.days_61_to_90.length} Parties ({pct61to90}%)
          </div>
        </div>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            background: '#fef2f2',
            border: '1px solid #fecaca'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#b91c1c', fontWeight: 600, marginBottom: '6px' }}>
            <ShieldAlert size={14} /> &gt; 90 Days (High Risk)
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{formatInr(sumOver90)}</div>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '4px', fontWeight: 500 }}>
            {data.over_90_days.length} Parties ({pctOver90}%)
          </div>
        </div>
      </div>
    </div>
  );
};
