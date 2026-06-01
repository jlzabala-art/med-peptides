import React from 'react';

/**
 * AdminPageHeader - Unified header for all admin portal sections.
 * Displays page icon, title, description/statistics, and action buttons.
 */
export default function AdminPageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  iconBg = 'var(--color-primary-light)',
  iconColor = 'var(--color-primary)'
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {Icon && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: iconBg,
              color: iconColor,
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <Icon size={24} />
          </div>
        )}
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              lineHeight: 1.2
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <div
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: '0.85rem',
                marginTop: '0.35rem',
                fontWeight: 500
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          {actions}
        </div>
      )}
    </div>
  );
}
