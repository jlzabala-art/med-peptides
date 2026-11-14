'use client';

import React from 'react';
import BrandLogo from '@/components/common/BrandLogo';

const TONE_STYLES = {
  neutral: { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' },
  info: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  success: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  warning: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  danger: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

/**
 * FocusedCardLayout
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout centrado sin distracciones para:
 *  - /login, /session-ended, /not-found
 *  - Pantallas de token expirado, enlace inválido o acceso denegado
 */
export default function FocusedCardLayout({
  icon: Icon = null,
  tone = 'neutral', // 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  title = '',
  subtitle = '',
  whiteLabel = false,
  maxWidth = '480px',
  actions = null,
  children,
  footerNote = null,
}) {
  const palette = TONE_STYLES[tone] || TONE_STYLES.neutral;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: 'clamp(1rem, 3vw, 2rem)',
        color: '#0f172a',
      }}
    >
      {!whiteLabel && (
        <div style={{ marginBottom: '1.5rem' }}>
          <BrandLogo />
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth,
          backgroundColor: '#ffffff',
          borderRadius: '18px',
          border: `1px solid ${palette.border}`,
          padding: 'clamp(1.5rem, 3.5vw, 2.25rem)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
          textAlign: 'center',
        }}
      >
        {Icon && (
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: palette.bg,
              color: palette.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.1rem',
            }}
          >
            <Icon size={28} />
          </div>
        )}

        {title && (
          <h1
            style={{
              margin: '0 0 0.5rem',
              fontSize: 'clamp(1.25rem, 2.5vw, 1.55rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0f172a',
            }}
          >
            {title}
          </h1>
        )}

        {subtitle && (
          <p
            style={{
              margin: '0 0 1.25rem',
              fontSize: '0.92rem',
              lineHeight: 1.55,
              color: '#64748b',
            }}
          >
            {subtitle}
          </p>
        )}

        {children}

        {actions && (
          <div
            style={{
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '0.65rem',
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {footerNote && (
        <div style={{ marginTop: '1.25rem', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
          {footerNote}
        </div>
      )}
    </div>
  );
}
