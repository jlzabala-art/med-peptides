"use client";

import React from 'react';
import { HelpCircle } from '@/lib/icons';

/**
 * PageHeader - Unified header for all panels (Admin, Doctor, Patient, Wholeseller)
 * Displays page icon, title, description/statistics, and action buttons.
 * Supports sticky behavior and auto-accents based on the panel context.
 */
export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
  panel = 'admin', // admin | doctor | patient | wholeseller
  iconBg,
  iconColor,
  helpTopic
}) {
  // Determine default accent colors based on panel
  let defaultIconColor = 'var(--color-primary, #003666)';
  let defaultIconBg = 'var(--color-primary-subtle, rgba(0, 54, 102, 0.08))';

  if (panel === 'doctor') {
    defaultIconColor = 'var(--color-primary, #0d9488)';
    defaultIconBg = 'rgba(13, 148, 136, 0.08)';
  } else if (panel === 'patient') {
    defaultIconColor = 'var(--color-primary, #7c3aed)';
    defaultIconBg = 'rgba(124, 58, 237, 0.08)';
  } else if (panel === 'wholeseller') {
    defaultIconColor = 'var(--color-primary, #c2410c)';
    defaultIconBg = 'rgba(194, 65, 12, 0.08)';
  }

  const finalIconColor = iconColor || defaultIconColor;
  const finalIconBg = iconBg || defaultIconBg;

  return (
    <div
      className={`page-header panel-${panel}`}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1rem 0',
        borderBottom: '1px solid var(--color-border, #e2e8f0)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: 'var(--color-bg-app, #f8fafc)'
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
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: finalIconBg,
              color: finalIconColor,
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
              color: 'var(--color-text-primary, #1e293b)',
              lineHeight: 1.2
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <div
              style={{
                color: 'var(--color-text-secondary, #64748b)',
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
      {(helpTopic || actions) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          {helpTopic && (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-atlas-copilot', {
                  detail: {
                    query: `Quiero aprender a usar este módulo (${helpTopic}). ¿Me das un resumen de qué puedo hacer y mejores prácticas?`,
                    context: { module: helpTopic }
                  }
                }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border, #e2e8f0)',
                color: 'var(--text-muted, #64748b)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover, #f1f5f9)';
                e.currentTarget.style.color = finalIconColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted, #64748b)';
              }}
              title="Help & Context"
            >
              <HelpCircle size={18} />
            </button>
          )}
          {actions}
        </div>
      )}
      
    </div>
  );
}
