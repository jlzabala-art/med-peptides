"use client";

import React from 'react';
import PortfolioCollectionDropdown, { ALL_PORTFOLIOS, PORTFOLIO_GROUPS } from './PortfolioCollectionDropdown';
import { Layers } from '@/lib/icons';

export { PortfolioCollectionDropdown, ALL_PORTFOLIOS, PORTFOLIO_GROUPS };

/**
 * ClinicalPortfolioSuiteSwitcher (Refactored to Google Cloud UX standards)
 * Replaces sprawling horizontal cards with a sleek, categorized GCP-style portfolio dropdown selector.
 * Neutral nomenclature: "Product Portfolios & Catalogs" (encompassing cosmetics, nutraceuticals, lab diagnostics, and peptides).
 */
export default function ClinicalPortfolioSuiteSwitcher({ currentSlug = 'colway' }) {
  const normCurrent = (currentSlug || '').toLowerCase();
  const current = ALL_PORTFOLIOS.find(
    p => p.id === normCurrent || p.slug === normCurrent || (p.aliases && p.aliases.includes(normCurrent))
  ) || ALL_PORTFOLIOS[0];

  return (
    <nav
      aria-label="Atlas Product Portfolios & Catalogs Navigation"
      style={{
        width: '100%',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0.45rem 0',
        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 3vw, 2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Product Portfolios Eyebrow + Active Domain */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#003666',
              letterSpacing: '0.03em',
              textTransform: 'uppercase'
            }}
          >
            <Layers size={13} color="#003666" />
            <span>Product Portfolios</span>
          </div>
          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>•</span>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {current.domain}
          </span>
        </div>

        {/* Right: GCP Dropdown Switcher Button */}
        <div style={{ flexShrink: 0 }}>
          <PortfolioCollectionDropdown currentSlug={currentSlug} />
        </div>
      </div>
    </nav>
  );
}
