"use client";

import React from 'react';
import { Layers, ChevronRight } from '@/lib/icons';

/**
 * ProductOverviewQuickNav
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant bottom action strip for Overview pages.
 * Displays quick-jump buttons to explore all other sections of the datasheet.
 */
export default function ProductOverviewQuickNav({
  sections = [],
  activeSection = 'overview',
  onSelectSection = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  // Exclude overview from the destination links
  const targetSections = sections.filter(s => s && s.id && s.id !== 'overview');

  if (!targetSections.length || !onSelectSection) return null;

  return (
    <div style={{
      marginTop: '1.5rem',
      marginBottom: '1rem',
      padding: '16px 20px',
      background: 'var(--surface-alt, #f8fafc)',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={17} color="#003666" />
          <strong style={{ fontSize: '0.85rem', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'Explorar Secciones Técnicas de la Ficha:' : 'Explore Technical Monograph Sections:'}
          </strong>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          {isEs ? 'Acceso directo con un solo clic' : 'Single-click direct section navigation'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {targetSections.map((sec, idx) => {
          const IconComp = sec.icon;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onSelectSection(sec.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#003666',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#003666';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#003666';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.color = '#003666';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              {IconComp && <IconComp size={14} />}
              <span>{sec.label}</span>
              <ChevronRight size={13} style={{ opacity: 0.6 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
