import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Info from "lucide-react/dist/esm/icons/info";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import X from "lucide-react/dist/esm/icons/x";
import React, { useState, useEffect } from 'react';






import './ui.css';

const ICONS = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  ai: Sparkles,
};

const COLORS = {
  success: 'var(--color-success)',
  info: 'var(--color-primary)',
  warning: 'var(--color-warning)',
  error: 'var(--color-danger)',
  ai: 'var(--color-accent)',
};

const BG_COLORS = {
  success: 'rgba(16, 185, 129, 0.1)',
  info: 'rgba(59, 130, 246, 0.1)',
  warning: 'rgba(245, 158, 11, 0.1)',
  error: 'rgba(239, 68, 68, 0.1)',
  ai: 'rgba(139, 92, 246, 0.1)',
};

export default function InlineAlert({ 
  variant = 'info', 
  title, 
  children, 
  dismissible = false, 
  onDismiss,
  className = '',
  style = {}
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const Icon = ICONS[variant] || Info;
  const color = COLORS[variant] || COLORS.info;
  const bgColor = BG_COLORS[variant] || BG_COLORS.info;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div 
      className={`inline-alert fade-in ${className}`} 
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: bgColor,
        border: `1px solid ${color}`,
        marginBottom: '16px',
        ...style
      }}
    >
      <Icon size={20} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{ margin: '0 0 4px 0', color: color, fontSize: '14px', fontWeight: 600 }}>
            {title}
          </h4>
        )}
        <div style={{ color: 'var(--color-text-main)', fontSize: '14px', lineHeight: 1.5 }}>
          {children}
        </div>
      </div>

      {dismissible && (
        <button 
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '8px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}