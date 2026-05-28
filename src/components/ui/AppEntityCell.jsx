import React from 'react';

export default function AppEntityCell({ title, subtitle, icon, badges }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-12)' }}>
      {icon && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '40px', 
          height: '40px', 
          borderRadius: 'var(--radius-sm)', 
          backgroundColor: 'var(--color-bg-hover)',
          color: 'var(--color-text-secondary)',
          flexShrink: 0
        }}>
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.2' }}>
          {title}
        </span>
        {subtitle && (
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
            {subtitle}
          </span>
        )}
        {badges && badges.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
            {badges.map((badge, idx) => (
              <span key={idx} style={{ 
                fontSize: '11px', 
                backgroundColor: 'var(--color-bg-hover)', 
                color: 'var(--color-text-secondary)', 
                padding: '2px 6px', 
                borderRadius: '4px',
                fontWeight: 500
              }}>
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
