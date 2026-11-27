"use client";

import React, { useState } from 'react';
import './ui.css';
import { CheckCircle, Info, AlertTriangle, XCircle, Sparkles, X } from '@/lib/icons';

/**
 * InlineAlert — Unified Google Cloud Console Callout / Banner
 * ─────────────────────────────────────────────────────────────────────────────
 * Variants: 'info' | 'warning' | 'critical' | 'error' | 'success' | 'tip' | 'ai'
 * Modes: compact (single-line / dense clinical callout) vs default (16px padded banner)
 * Features: 3px left severity accent bar, optional right-hand action slot, optional dismiss.
 */
const VARIANTS = {
  info: {
    Icon: Info,
    accent: '#1a73e8',
    border: '#bfdbfe',
    bg: '#f8fafc',
    text: '#334155',
    titleColor: '#003666',
    role: 'status',
  },
  warning: {
    Icon: AlertTriangle,
    accent: '#d97706',
    border: '#fde68a',
    bg: '#fffbeb',
    text: '#92400e',
    titleColor: '#78350f',
    role: 'note',
  },
  critical: {
    Icon: AlertTriangle,
    accent: '#dc2626',
    border: '#fecaca',
    bg: '#fef2f2',
    text: '#991b1b',
    titleColor: '#7f1d1d',
    role: 'alert',
  },
  error: {
    Icon: XCircle,
    accent: '#dc2626',
    border: '#fecaca',
    bg: '#fef2f2',
    text: '#991b1b',
    titleColor: '#7f1d1d',
    role: 'alert',
  },
  success: {
    Icon: CheckCircle,
    accent: '#16a34a',
    border: '#bbf7d0',
    bg: '#f0fdf4',
    text: '#166534',
    titleColor: '#14532d',
    role: 'status',
  },
  tip: {
    Icon: Sparkles,
    accent: '#15803d',
    border: '#bbf7d0',
    bg: '#f0fdf4',
    text: '#166534',
    titleColor: '#14532d',
    role: 'note',
  },
  ai: {
    Icon: Sparkles,
    accent: '#7c3aed',
    border: '#ddd6fe',
    bg: '#faf5ff',
    text: '#4c1d95',
    titleColor: '#4c1d95',
    role: 'status',
  },
};

export default function InlineAlert({
  variant = 'info',
  title,
  children,
  action = null,
  compact = false,
  dismissible = false,
  onDismiss,
  className = '',
  style = {},
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const cfg = VARIANTS[variant] || VARIANTS.info;
  const Icon = cfg.Icon;

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className={`inline-alert fade-in ${className}`.trim()}
      role={cfg.role}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: compact ? '8px' : '12px',
        padding: compact ? '9px 12px' : '12px 14px',
        borderRadius: '8px',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderLeft: `3px solid ${cfg.accent}`,
        color: cfg.text,
        fontSize: compact ? '0.78rem' : '0.84rem',
        lineHeight: 1.5,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: '200px' }}>
        <Icon size={compact ? 16 : 18} color={cfg.accent} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          {title && !compact && (
            <h4 style={{ margin: '0 0 3px 0', color: cfg.titleColor, fontSize: '0.86rem', fontWeight: 700 }}>
              {title}
            </h4>
          )}
          <div>
            {title && compact && <strong style={{ color: cfg.titleColor }}>{title} </strong>}
            {children}
          </div>
        </div>
      </div>

      {action && <div style={{ flexShrink: 0, alignSelf: 'center' }}>{action}</div>}

      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          style={{
            background: 'none',
            border: 'none',
            color: cfg.text,
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '4px',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            opacity: 0.75,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
