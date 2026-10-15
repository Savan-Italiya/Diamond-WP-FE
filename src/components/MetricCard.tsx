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
  accentColor = '#0284c7'
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: '20px 22px',
        position: 'relative',
        overflow: 'hidden',
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: `${accentColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${accentColor}25`
          }}
        >
          <Icon size={19} color={accentColor} />
        </div>
      </div>
      <div
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '4px',
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-0.02em'
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 500 }}>
        {subtitle}
      </div>
    </div>
  );
};
