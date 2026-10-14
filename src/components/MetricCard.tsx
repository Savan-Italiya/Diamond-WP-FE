import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = '#38bdf8'
}) => {
  return (
    <div className="glass-panel" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', borderRadius: '50%', background: accentColor, opacity: 0.1, filter: 'blur(20px)' }}></div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Icon size={20} color={accentColor} />
        </div>
      </div>
      <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px', fontFamily: 'var(--font-heading)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
        {subtitle}
      </div>
    </div>
  );
};
