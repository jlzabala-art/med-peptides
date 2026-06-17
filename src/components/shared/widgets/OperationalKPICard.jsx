import React, { useState } from 'react';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

/**
 * Operational Action Card
 * A severity-based KPI card with hover actions.
 * 
 * @param {string} title
 * @param {string|number} value
 * @param {LucideIcon} icon
 * @param {string} severity - 'critical' | 'warning' | 'success' | 'info' | 'neutral'
 * @param {string} trend - Optional trend text (e.g. '+12%')
 * @param {string} actionLabel - Text for the hover action button
 * @param {function} onClick - Click handler for the card/action
 * @param {boolean} darkTheme - Whether to adapt to dark background contexts
 * @param {ReactNode} children - Optional children, like sparklines
 */
export default function OperationalKPICard({
  title,
  value,
  icon: Icon,
  severity = 'neutral',
  trend,
  actionLabel = 'View details',
  onClick,
  darkTheme = false,
  children
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Define severity color palettes
  // darkTheme palettes assume rendering on a dark (#0f172a) background.
  const getThemeColors = () => {
    if (darkTheme) {
      switch (severity) {
        case 'critical':
          return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.4)', text: '#fca5a5', icon: '#ef4444', hoverBg: 'rgba(239, 68, 68, 0.2)' };
        case 'warning':
          return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.4)', text: '#fcd34d', icon: '#f59e0b', hoverBg: 'rgba(245, 158, 11, 0.2)' };
        case 'success':
          return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.4)', text: '#6ee7b7', icon: '#10b981', hoverBg: 'rgba(16, 185, 129, 0.2)' };
        case 'info':
          return { bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.4)', text: '#7dd3fc', icon: '#38bdf8', hoverBg: 'rgba(56, 189, 248, 0.2)' };
        case 'neutral':
        default:
          return { bg: 'transparent', border: 'transparent', text: '#fff', icon: '#94a3b8', hoverBg: 'rgba(255, 255, 255, 0.05)' };
      }
    } else {
      switch (severity) {
        case 'critical':
          return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '#dc2626', hoverBg: '#fee2e2' };
        case 'warning':
          return { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', icon: '#eab308', hoverBg: '#fef9c3' };
        case 'success':
          return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '#16a34a', hoverBg: '#dcfce7' };
        case 'info':
          return { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', icon: '#3b82f6', hoverBg: '#dbeafe' };
        case 'neutral':
        default:
          return { bg: '#fff', border: '#e2e8f0', text: '#0f172a', icon: '#64748b', hoverBg: '#f8fafc' };
      }
    }
  };

  const colors = getThemeColors();
  const isActionable = Boolean(onClick);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isActionable ? onClick : undefined}
      style={{
        background: isHovered && isActionable ? colors.hoverBg : colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: '140px',
        cursor: isActionable ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: (isHovered && !darkTheme && isActionable) ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
        flex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', zIndex: 1 }}>
        {Icon && <Icon size={16} color={colors.icon} />}
        <span style={{ 
          fontSize: '13px', 
          color: darkTheme ? '#94a3b8' : '#64748b', 
          fontWeight: 600, 
          textTransform: 'uppercase', 
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap' 
        }}>
          {title}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', zIndex: 1 }}>
        <div style={{ fontSize: '24px', fontWeight: 800, color: colors.text }}>
          {value}
        </div>
        {trend && (
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: trend.startsWith('-') || trend === 'Healthy' ? (darkTheme ? '#6ee7b7' : '#10b981') : (trend === 'Action Required' || (trend.startsWith('+') && severity==='critical') ? (darkTheme ? '#fca5a5' : '#ef4444') : colors.icon)
          }}>
            {trend}
          </div>
        )}
      </div>

      {children && (
        <div style={{ position: 'absolute', right: 0, bottom: 0, top: 0, opacity: 0.5, pointerEvents: 'none', zIndex: 0 }}>
          {children}
        </div>
      )}

      {/* Action Overlay inside the card on hover */}
      {isActionable && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: colors.icon,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.2s ease-out',
          zIndex: 2
        }} />
      )}
      
      {isActionable && isHovered && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: colors.icon,
          fontSize: '12px',
          fontWeight: 600,
          animation: 'fadeIn 0.2s ease-in',
          zIndex: 2
        }}>
          {actionLabel} <ArrowRight size={14} />
        </div>
      )}
    </div>
  );
}
