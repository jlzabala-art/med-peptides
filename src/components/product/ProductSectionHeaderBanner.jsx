"use client";

import React from 'react';
import { ArrowLeft, ChevronRight, Layers, Sparkles } from '@/lib/icons';

/**
 * ProductSectionHeaderBanner
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console-compliant top banner displayed when viewing an individual
 * section of a product datasheet.
 */
export default function ProductSectionHeaderBanner({
  productName = '',
  category = '',
  activeSection = '',
  sections = [],
  onSelectSection = null,
  lang = 'en'
}) {
  const isEs = lang === 'es';

  const currentSection = sections.find(s => s.id === activeSection) || null;
  const currentIndex = sections.findIndex(s => s.id === activeSection);
  const totalCount = sections.length;
  const IconComponent = currentSection?.icon || Layers;

  return (
    <div style={{
      marginBottom: '1.25rem',
      padding: '12px 16px',
      background: 'var(--surface-alt, #f8fafc)',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
    }}>
      {/* Left: Back to Overview CTA + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onSelectSection && onSelectSection('overview')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: '#003666',
            color: '#ffffff',
            border: '1px solid #003666',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: '0 2px 4px rgba(0,54,102,0.15)'
          }}
          title={isEs ? 'Volver al resumen general del producto' : 'Return to product overview'}
        >
          <ArrowLeft size={14} />
          <span>{isEs ? '← Volver a Overview' : '← Back to Overview'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748b' }}>
          <span style={{ fontWeight: 600, color: '#334155' }}>
            {category || (isEs ? 'Producto' : 'Product')}
          </span>
          <ChevronRight size={13} style={{ opacity: 0.5 }} />
          <span style={{ fontWeight: 600, color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {productName}
          </span>
          {currentSection && (
            <>
              <ChevronRight size={13} style={{ opacity: 0.5 }} />
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 800,
                color: '#003666',
                background: '#e0f2fe',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                <IconComponent size={13} />
                <span>{currentSection.label}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Progress indicator & Quick switcher */}
      {currentIndex >= 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#64748b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '3px 8px',
            borderRadius: '9999px'
          }}>
            {isEs ? `Sección ${currentIndex + 1} de ${totalCount}` : `Section ${currentIndex + 1} of ${totalCount}`}
          </span>
        </div>
      )}
    </div>
  );
}
