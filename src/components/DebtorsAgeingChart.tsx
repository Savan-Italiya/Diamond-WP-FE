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
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
            Debtors Ageing Analysis (Opera House & BKC)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Risk distribution of pending market receivables
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Market Debt</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b' }}>
            ₹{(data.total_outstanding / 10000000).toFixed(2)} Cr
          </div>
        </div>
      </div>

      {/* Stacked Multi-Color Progress Bar */}
      <div style={{ width: '100%', height: '14px', borderRadius: '7px', background: '#0a0d14', display: 'flex', overflow: 'hidden', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ width: `${pctUnder30}%`, background: '#10b981' }} title={`< 30 days: ${pctUnder30}%`}></div>
        <div style={{ width: `${pct31to60}%`, background: '#38bdf8' }} title={`31-60 days: ${pct31to60}%`}></div>
        <div style={{ width: `${pct61to90}%`, background: '#f59e0b' }} title={`61-90 days: ${pct61to90}%`}></div>
        <div style={{ width: `${pctOver90}%`, background: '#f43f5e' }} title={`> 90 days: ${pctOver90}%`}></div>
      </div>

      {/* 4 Ageing Metric Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginBottom: '6px' }}>
            <Clock size={14} /> &lt; 30 Days (Current)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{formatInr(sumUnder30)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{data.under_30_days.length} Parties ({pctUnder30}%)</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
            <Clock size={14} /> 31 - 60 Days
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{formatInr(sum31to60)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{data.days_31_to_60.length} Parties ({pct31to60}%)</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>
            <AlertCircle size={14} /> 61 - 90 Days (Warning)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{formatInr(sum61to90)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{data.days_61_to_90.length} Parties ({pct61to90}%)</div>
        </div>

        <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.06)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#fb7185', fontWeight: 600, marginBottom: '6px' }}>
            <ShieldAlert size={14} /> &gt; 90 Days (Severe)
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>{formatInr(sumOver90)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{data.over_90_days.length} Parties ({pctOver90}%)</div>
        </div>
      </div>
    </div>
  );
};
