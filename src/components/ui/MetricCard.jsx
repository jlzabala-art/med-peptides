import React from 'react';
import BaseCard from './BaseCard';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--primary)',
  alert = false,
  loading = false,
  onClick,
  className = ''
}) {
  const HeaderAction = alert ? (
    <span style={{
      fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-danger, #d93025)',
      backgroundColor: 'var(--color-danger-bg, #fce8e6)', padding: '4px 8px',
      borderRadius: '20px', textTransform: 'uppercase'
    }}>
      Alert
    </span>
  ) : null;

  return (
    <BaseCard 
      className={`metric-card ${className}`} 
      title={title}
      icon={Icon}
      action={HeaderAction}
      hoverable={!!onClick}
      loading={loading}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        borderTop: `4px solid ${color}`
      }}
    >
      <div 
        onClick={onClick}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}
      >
        <div className="metric-card__value" style={{ color: 'var(--text-main)' }}>
          {value}
        </div>
        
        {subtitle && (
          <p style={{
            margin: '0', fontSize: 'var(--text-caption)', color: 'var(--text-secondary)',
            fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </BaseCard>
  );
}
