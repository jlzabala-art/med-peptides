import React from 'react';
import { ArrowUpRight, ArrowDownRight } from '@/lib/icons';

export default function MetricCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  color = 'var(--primary)',
  alert = false,
  loading = false,
  trend, // 'up', 'down', or undefined
  trendValue, // text next to trend arrow
  onClick,
  className = ''
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      className={`metric-card ${className} ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: isHovered && onClick ? 'var(--primary, #0f172a)' : 'var(--border)',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.75rem',
        minWidth: 0,
        boxSizing: 'border-box',
        position: 'relative',
        transition: 'all 0.2s ease',
        /* minHeight is set via CSS: 130px on desktop, 82px on mobile (responsive-admin.css override) */
        ...(onClick ? { cursor: 'pointer' } : {}),
        ...(isHovered && onClick ? { transform: 'translateY(-2px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' } : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {alert && (
        <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--color-danger, #d93025)', border: '2px solid var(--surface)' }} />
      )}
      
      {/* Top Row: Icon + Trend */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
        {Icon ? (
          <div style={{ position: 'relative', width: '44px', height: '44px' }}>
            {/* Background with opacity */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '10px',
              backgroundColor: color,
              opacity: 0.1,
            }} />
            {/* Icon */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              zIndex: 1
            }}>
              <Icon size={20} />
            </div>
          </div>
        ) : <div />}

        {/* Trend Arrow */}
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            color: trend === 'up' ? 'var(--color-success, #16a34a)' : 'var(--color-danger, #dc2626)',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '16px',
            backgroundColor: trend === 'up' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)'
          }}>
            <span>{trendValue}</span>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        )}
      </div>

      {/* Bottom Row: Content */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0, marginTop: 'auto' }}>
        {loading ? (
          <>
            <div className="skeleton" style={{ height: '32px', width: '60%', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '4px', borderRadius: '4px' }} />
            {subtitle && <div className="skeleton" style={{ height: '14px', width: '90%', borderRadius: '4px' }} />}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.5rem', width: '100%' }}>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700, 
                color: 'var(--text-main)', 
                lineHeight: 1.2,
                letterSpacing: '-0.02em'
              }}>
                {value}
              </div>
              {badge && (
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(var(--color-primary-rgb, 0, 54, 102), 0.08)',
                  color: color || 'var(--color-primary, #003666)',
                  border: '1px solid rgba(0, 54, 102, 0.12)',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.01em'
                }}>
                  {badge}
                </div>
              )}
            </div>
            
            <div style={{
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              fontWeight: 600,
              marginTop: '4px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {title}
            </div>
            
            {subtitle && (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                marginTop: '4px',
                lineHeight: 1.4,
                // Removed whiteSpace: nowrap to allow wrapping naturally
              }}>
                {subtitle}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
