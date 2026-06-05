import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#1a73e8', // Default to Google Blue if no color is provided
  bgColor, // Deprecated in favor of the subtle background inside the component
  alert = false,
  onClick,
  className = ''
}) {
  return (
    <div
      className={`admin-metric-card ${className}`}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.4)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow =
            `0 10px 30px ${color}1A, inset 0 1px 1px rgba(255,255,255,0.9)`;
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.borderColor = `${color}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.9)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
        }
      }}
    >
      {/* Decorative top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}80)`,
        opacity: 0.8
      }} />

      <div className="amd-card-icon" style={{
        width: '42px', height: '42px', borderRadius: '12px',
        backgroundColor: `${color}14`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `inset 0 1px 2px rgba(255,255,255,0.5)`,
      }}>
        {Icon && <Icon size={20} strokeWidth={2.5} />}
      </div>

      <div className="amd-card-body" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <h4 style={{
            margin: 0, fontSize: '0.82rem', color: '#64748b',
            fontWeight: 600, letterSpacing: '0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </h4>
          {alert && (
            <span style={{
              fontSize: '0.62rem', fontWeight: 800, color: '#dc2626',
              backgroundColor: '#fee2e2', padding: '0.15rem 0.4rem',
              borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              Alert
            </span>
          )}
        </div>
        <div className="amd-value" style={{ color: '#0f172a', marginTop: '0.2rem' }}>
          {value}
        </div>
        {subtitle && (
          <p style={{
            margin: '0.3rem 0 0', fontSize: '0.72rem', color: '#94a3b8',
            fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
