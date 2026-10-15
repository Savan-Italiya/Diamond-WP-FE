import React, { useState, useEffect } from 'react';
import { DiamondApi } from '../services/api';
import {
  TrendingUp, Phone, IndianRupee, Users, BarChart2,
  Star, AlertTriangle, CheckCircle2, RefreshCw
} from 'lucide-react';

// ─────────────────── Mini bar chart (pure CSS) ───────────────────
function BarChart({ data, colorFn, labelKey, valueKey, unit = '₹', format }: {
  data: any[];
  colorFn: (i: number) => string;
  labelKey: string;
  valueKey: string;
  unit?: string;
  format?: (v: number) => string;
}) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.8rem' }}>No data available yet</div>
  );

  const maxVal = Math.max(...data.map(d => Number(d[valueKey]) || 0), 1);
  const fmt = format || ((v: number) => unit === '₹' ? `₹${(v / 100000).toFixed(1)}L` : `${v}`);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {data.map((row, i) => {
        const val = Number(row[valueKey]) || 0;
        const pct = (val / maxVal) * 100;
        const color = colorFn(i);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '120px', fontSize: '0.75rem', color: '#475569', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }} title={row[labelKey]}>
              {row[labelKey]}
            </div>
            <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '4px', height: '20px', overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: '4px',
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px'
              }}>
                {pct > 25 && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>
                    {fmt(val)}
                  </span>
                )}
              </div>
            </div>
            {pct <= 25 && (
              <div style={{ width: '60px', fontSize: '0.72rem', fontWeight: 700, color, flexShrink: 0 }}>{fmt(val)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────── Mini area sparkline (SVG) ───────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const W = 280, H = 60;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / max) * H * 0.85 - 4
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${W},${H} L0,${H} Z`;

  return (
    <svg width={W} height={H} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={path} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}
    </svg>
  );
}

// ─────────────────── Reliability badge ───────────────────
function ReliabilityBadge({ count }: { count: number }) {
  if (count === 0) return <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#dcfce7', color: '#059669', fontWeight: 700, fontSize: '0.72rem' }}>✓ Excellent</span>;
  if (count <= 2)  return <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: '0.72rem' }}>⚠ Good</span>;
  if (count <= 5)  return <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#fff1f2', color: '#e11d48', fontWeight: 700, fontSize: '0.72rem' }}>🔴 Follow-up Heavy</span>;
  return <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#fdf2f8', color: '#9333ea', fontWeight: 700, fontSize: '0.72rem' }}>⚡ High Risk</span>;
}

const gradients = [
  '#0284c7', '#7c3aed', '#059669', '#d97706', '#e11d48',
  '#0891b2', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
];

export const DashboardCharts: React.FC<{
  followUpsCount: number;
  collectionsThisMonth?: number;
}> = ({ followUpsCount, collectionsThisMonth }) => {
  const [stats, setStats]     = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const s = await DiamondApi.getDashboardStats();
    setStats(s);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const monthlyAmounts: number[] = (stats?.monthly_trend || []).map((r: any) => Number(r.collected) || 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Top KPI Strip ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {/* Collections */}
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '14px', boxShadow: '0 4px 20px rgba(15,23,42,0.2)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IndianRupee size={12} /> Collection This Month
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>
            ₹{((stats?.collected_this_month ?? collectionsThisMonth ?? 0) / 100000).toFixed(1)}L
          </div>
          {monthlyAmounts.length > 1 && (
            <div style={{ marginTop: '10px' }}>
              <Sparkline data={monthlyAmounts} color="#34d399" />
            </div>
          )}
        </div>

        {/* Pending Follow-ups */}
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderRadius: '14px', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#ddd6fe', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={12} /> Pending Follow-ups
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            {stats?.pending_follow_ups ?? followUpsCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#c4b5fd', marginTop: '6px' }}>
            accounts need follow-up call today
          </div>
        </div>

        {/* Calls Done Today */}
        <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '14px', boxShadow: '0 4px 20px rgba(5,150,105,0.3)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Phone size={12} /> Calls Done Today
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            {stats?.calls_done_today ?? 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#6ee7b7', marginTop: '6px' }}>
            follow-up calls logged today
          </div>
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Top Buyers by Volume */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={16} color="#0284c7" /> Top Buyers (90 Days)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>By net deal value</div>
            </div>
            <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
          <BarChart
            data={stats?.top_buyers || []}
            labelKey="name"
            valueKey="total_amount"
            colorFn={(i) => gradients[i % gradients.length]}
            unit="₹"
            format={(v) => `₹${(v / 100000).toFixed(1)}L`}
          />
        </div>

        {/* Buyer Reliability (Follow-up count) */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} color="#d97706" /> Buyer Reliability Score
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Fewer follow-ups = better payer</div>
          </div>
          {(stats?.follow_up_counts || []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.8rem' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(stats?.follow_up_counts || []).map((row: any, i: number) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '8px',
                  background: i % 2 === 0 ? '#f8fafc' : '#fff',
                  border: '1px solid #f1f5f9',
                  transition: 'background 0.15s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: gradients[i % gradients.length] + '20',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 700, color: gradients[i % gradients.length]
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{row.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{row.follow_up_count} follow-up calls</div>
                    </div>
                  </div>
                  <ReliabilityBadge count={Number(row.follow_up_count)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Monthly Collection Trend ── */}
      {(stats?.monthly_trend || []).length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={16} color="#7c3aed" /> Monthly Collection Trend (Last 6 Months)
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '100px' }}>
            {(stats.monthly_trend || []).map((row: any, i: number) => {
              const maxV = Math.max(...(stats.monthly_trend || []).map((r: any) => Number(r.collected)), 1);
              const pct = (Number(row.collected) / maxV) * 100;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'default' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#475569' }}>
                    ₹{(Number(row.collected) / 100000).toFixed(0)}L
                  </div>
                  <div style={{
                    width: '100%', height: `${Math.max(pct, 6)}%`, maxHeight: '80px', minHeight: '6px',
                    background: `linear-gradient(180deg, ${gradients[i % gradients.length]}, ${gradients[i % gradients.length]}99)`,
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.6s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: `0 2px 8px ${gradients[i % gradients.length]}33`
                  }} />
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                    {row.month?.substring(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Stats: Deals by Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: 'Overdue', icon: AlertTriangle, color: '#e11d48', val: followUpsCount },
          { label: 'On Promise', icon: Phone, color: '#d97706', val: stats?.pending_follow_ups ?? 0 },
          { label: 'Calls Done', icon: CheckCircle2, color: '#059669', val: stats?.calls_done_today ?? 0 },
          { label: 'Top Buyers', icon: Users, color: '#7c3aed', val: (stats?.top_buyers || []).length },
        ].map(({ label, icon: Icon, color, val }) => (
          <div key={label} style={{
            padding: '16px', background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            transition: 'transform 0.15s, box-shadow 0.15s',
            cursor: 'default'
          }}
            onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px ${color}22`; }}
            onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textAlign: 'center' }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
