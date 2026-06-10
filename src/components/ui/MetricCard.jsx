import React from 'react';
import { Card, CardContent } from './Card';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'var(--color-primary, #1a73e8)',
  alert = false,
  onClick,
  className = ''
}) {
  return (
    <Card 
      className={`admin-metric-card ${className}`} 
      onClick={onClick} 
      hover={!!onClick}
      style={{ height: '100%' }}
      noPadding
    >
      {/* Decorative top accent line */}
      <div style={{
        height: '4px',
        background: `linear-gradient(90deg, ${color}, ${color}80)`,
        borderTopLeftRadius: 'var(--radius-lg, 12px)',
        borderTopRightRadius: 'var(--radius-lg, 12px)'
      }} />

      <CardContent style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Top: Icon + Title/Alert Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="amd-card-icon" style={{
              width: '40px', height: '40px', borderRadius: '10px',
              backgroundColor: `${color}14`, color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {Icon && <Icon size={20} strokeWidth={2.5} />}
            </div>
            <h4 style={{
              margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)',
              fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {title}
            </h4>
          </div>
          {alert && (
            <span style={{
              fontSize: '11px', fontWeight: 800, color: 'var(--color-danger, #d93025)',
              backgroundColor: 'var(--color-danger-bg, #fce8e6)', padding: '4px 8px',
              borderRadius: '20px', letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              Alert
            </span>
          )}
        </div>

        {/* Middle: Large Value */}
        <div className="amd-value" style={{ 
          color: 'var(--color-text-primary)', 
          fontSize: '36px', 
          fontWeight: 700,
          lineHeight: 1
        }}>
          {value}
        </div>

        {/* Bottom: Subtitle */}
        {subtitle && (
          <p style={{
            margin: '0', fontSize: '12px', color: 'var(--color-text-secondary)',
            fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
