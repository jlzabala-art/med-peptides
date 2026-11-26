'use client';

import React, { useState } from 'react';
import { ChevronDown, ShoppingCart, Check } from 'lucide-react';
import CopyableId from '@/components/ui/CopyableId';

export default function PricingScheduleMobileCard({
  row,
  expandableRender,
  isEs = false,
  getTitle,
  getBrand,
  getSku,
  getMeta,
  getPrice,
  getSecondaryPrice,
  onQuickView,
  onAddQuote,
  getQuoteCount,
  quoteCount = 0,
}) {
  const [expanded, setExpanded] = useState(false);

  const title = getTitle ? getTitle(row) : (row.name || row.product_name || row.title || row.id);
  const brand = getBrand ? getBrand(row) : (row.brand || row.category || '');
  const sku = getSku ? getSku(row) : (row.atlas_product_code || row.sku || row.code || row.id);
  const meta = getMeta ? getMeta(row) : (row.packSize || row.biomarker || row.dosage || '');
  const priceLabel = getPrice ? getPrice(row) : '';
  const secondaryPrice = getSecondaryPrice ? getSecondaryPrice(row) : '';
  const activeQuoteCount = getQuoteCount ? Number(getQuoteCount(row) || 0) : Number(quoteCount || 0);

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '12px 14px',
        marginBottom: '8px',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Top Row: Brand Pill + Clickable Title + Expand Toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          {brand && (
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.64rem',
                fontWeight: 750,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#003666',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '4px',
                padding: '1px 6px',
                marginBottom: '4px',
              }}
            >
              {brand}
            </span>
          )}
          <div>
            {onQuickView ? (
              <button
                type="button"
                onClick={() => onQuickView(row)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  textAlign: 'left',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  fontWeight: 750,
                  lineHeight: 1.3,
                  cursor: 'pointer',
                }}
              >
                {title}
              </button>
            ) : (
              <div style={{ color: '#0f172a', fontSize: '0.88rem', fontWeight: 750, lineHeight: 1.3 }}>
                {title}
              </div>
            )}
          </div>
        </div>

        {expandableRender && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={isEs ? 'Ver detalle clínico' : 'Toggle details'}
            aria-expanded={expanded}
            style={{
              width: '36px',
              height: '36px',
              minWidth: '36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ChevronDown
              size={16}
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
            />
          </button>
        )}
      </div>

      {/* Meta Row: SKU CopyableId + Pack Size / Biomarker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '6px',
          fontSize: '0.73rem',
          color: '#64748b',
        }}
      >
        {sku && <CopyableId value={sku} displayValue={String(sku).length > 16 ? 'ID' : sku} />}
        {meta && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ fontWeight: 600, color: '#334155' }}>{meta}</span>
          </>
        )}
      </div>

      {/* Bottom Row: Price on left + Touch-friendly Quote Action on right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '10px',
          marginTop: '10px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ color: '#003666', fontSize: '0.98rem', fontWeight: 800 }}>
            {priceLabel || '—'}
          </span>
          {secondaryPrice && (
            <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
              {secondaryPrice}
            </span>
          )}
        </div>

        {(onAddQuote || onQuickView) && (
          <button
            type="button"
            onClick={() => (onAddQuote ? onAddQuote(row) : onQuickView(row))}
            className={activeQuoteCount > 0 ? 'gcp-btn-primary' : 'gcp-btn-secondary'}
            style={{
              minHeight: '36px',
              padding: '0 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {activeQuoteCount > 0 ? <Check size={14} /> : <ShoppingCart size={14} />}
            <span>
              {activeQuoteCount > 0
                ? `${isEs ? 'En Cotización' : 'In Quote'} (${activeQuoteCount})`
                : (isEs ? '+ Cotizar' : '+ Quote')}
            </span>
          </button>
        )}
      </div>

      {expanded && expandableRender && (
        <div style={{ marginTop: '10px' }}>
          {expandableRender(row)}
        </div>
      )}
    </div>
  );
}
