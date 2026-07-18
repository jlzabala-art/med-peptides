"use client";

/**
 * EmptyState — Golden Rule #20
 * ─────────────────────────────────────────────────────────────────────────────
 * Standard empty-state placeholder for all panels (Admin, Doctor, Patient,
 * Wholeseller). Replaces ad-hoc <p>No data</p> patterns everywhere.
 *
 * Props:
 *   icon      — Lucide icon component (required)
 *   title     — Main heading string (required)
 *   subtitle  — Supporting text (optional)
 *   action    — { label: string, onClick: fn, icon?: LucideIcon } — optional CTA button
 *   compact   — boolean — smaller variant for inline table empty rows
 */

import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  action,
  compact = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '0.5rem' : '1rem',
        padding: compact ? '2rem 1rem' : '4rem 2rem',
        textAlign: 'center',
        color: 'var(--color-text-secondary, #64748b)',
      }}
    >
      {Icon && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: compact ? 40 : 56,
            height: compact ? 40 : 56,
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-subtle, rgba(0,54,102,0.08))',
            color: 'var(--color-primary, #003666)',
            flexShrink: 0,
          }}
        >
          <Icon size={compact ? 20 : 28} strokeWidth={1.5} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxWidth: 380 }}>
        <p
          style={{
            margin: 0,
            fontSize: compact ? '0.9rem' : '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary, #1e293b)',
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: compact ? '0.8rem' : '0.875rem',
              color: 'var(--color-text-secondary, #64748b)',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            marginTop: compact ? 0 : '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: compact ? '0.4rem 0.9rem' : '0.6rem 1.25rem',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'var(--color-primary, #003666)',
            color: 'white',
            border: 'none',
            fontSize: compact ? '0.8rem' : '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {action.icon && <action.icon size={14} />}
          {action.label}
        </button>
      )}
    </div>
  );
}
