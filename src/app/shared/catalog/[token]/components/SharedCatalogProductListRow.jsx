'use client';

import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import SharedCatalogProductCard from './SharedCatalogProductCard';

export default function SharedCatalogProductListRow({
  prod,
  isExpanded,
  onToggleExpand,
  includePrices,
  fxMultiplier,
  currentCurrency,
  currencySymbol,
  packagingMode,
  cart,
  updateQuantity,
  protocols,
  setSelectedPublicProtocol,
  catalogMeta,
  t,
}) {
  const startingPrice = (prod.minPrice > 0 ? prod.minPrice : (prod.variants[0]?.price || 0)) * fxMultiplier;

  return (
    <div className={`catalog-list-item ${isExpanded ? 'is-expanded' : ''}`} style={{
      backgroundColor: '#ffffff',
      border: isExpanded ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '8px',
      overflow: 'hidden',
      transition: 'all 0.15s ease',
      boxShadow: isExpanded ? '0 4px 14px rgba(2, 132, 199, 0.08)' : '0 1px 2px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Compact Header Row */}
      <div
        onClick={onToggleExpand}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'pointer',
          flexWrap: 'wrap',
          gap: '10px',
          background: isExpanded ? '#f8fafc' : '#ffffff',
          transition: 'background 0.12s ease'
        }}
      >
        {/* Left: Expand btn + Image + Name + Purity + Category */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px', minWidth: '240px' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            style={{
              background: isExpanded ? '#e0f2fe' : '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isExpanded ? '#0284c7' : '#475569',
              flexShrink: 0
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          <img
            src={resolveVariantClinicalImage(prod.variants[0], prod)}
            alt={prod.canonicalName}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: '1px solid #e2e8f0',
              flexShrink: 0
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {prod.canonicalName}
              </span>
              {prod.purity && (
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0'
                }}>
                  {prod.purity}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {prod.variants?.length || 1} {prod.variants?.length === 1 ? 'Format' : 'Formats & Dosages'}
            </span>
          </div>
        </div>

        {/* Right: Price + Monograph + Select Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {includePrices && (
            <div style={{ textAlign: 'right', paddingRight: '4px' }}>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                From
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#003666' }}>
                {currencySymbol}{startingPrice.toFixed(2)}
              </span>
            </div>
          )}

          <a
            href={`/p/${encodeURIComponent(prod.slug || prod.id)}?supplier=supplier-lotusland`}
            target="_blank"
            rel="noopener noreferrer"
            className="pds-catalog-monograph-btn"
            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
            title="Monograph"
          >
            <FileText size={12} />
            <span className="mobile-hide">Monograph</span>
          </a>

          <button
            type="button"
            onClick={onToggleExpand}
            style={{
              background: isExpanded ? '#003666' : '#f1f5f9',
              color: isExpanded ? '#ffffff' : '#003666',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isExpanded ? 'Collapse' : 'Select'}</span>
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Expanded Details Panel */}
      {isExpanded && (
        <div style={{ padding: '0 12px 14px 12px', borderTop: '1px solid #e2e8f0', background: '#fafbfc' }}>
          <SharedCatalogProductCard
            prod={prod}
            includePrices={includePrices}
            fxMultiplier={fxMultiplier}
            currentCurrency={currentCurrency}
            currencySymbol={currencySymbol}
            packagingMode={packagingMode}
            cart={cart}
            updateQuantity={updateQuantity}
            showProtocolsUnderProducts={false}
            protocols={protocols}
            setSelectedPublicProtocol={setSelectedPublicProtocol}
            catalogMeta={catalogMeta}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
