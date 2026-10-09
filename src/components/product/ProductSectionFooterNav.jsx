"use client";

import React from 'react';
import { ArrowLeft, ArrowRight, Layers } from '@/lib/icons';

/**
 * ProductSectionFooterNav
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant bottom navigation strip for individual sections.
 */
export default function ProductSectionFooterNav({
  activeSection = '',
  sections = [],
  onSelectSection = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  if (!onSelectSection || !sections.length) return null;

  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex >= 0 && currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  return (
    <div style={{
      marginTop: '2rem',
      marginBottom: '1.5rem',
      padding: '14px 18px',
      background: 'var(--surface-alt, #f8fafc)',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      {/* Left: Previous section or Back to Overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onSelectSection('overview')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={13} />
          <span>{isEs ? 'Inicio (Overview)' : 'Top (Overview)'}</span>
        </button>

        {prevSection && prevSection.id !== 'overview' && (
          <button
            type="button"
            onClick={() => onSelectSection(prevSection.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#003666',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={13} />
            <span>{isEs ? `Anterior: ${prevSection.label}` : `Prev: ${prevSection.label}`}</span>
          </button>
        )}
      </div>

      {/* Right: Next section */}
      {nextSection && (
        <button
          type="button"
          onClick={() => onSelectSection(nextSection.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '6px',
            background: '#003666',
            color: '#ffffff',
            border: '1px solid #003666',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,54,102,0.15)'
          }}
        >
          <span>{isEs ? `Siguiente: ${nextSection.label}` : `Next: ${nextSection.label}`}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
