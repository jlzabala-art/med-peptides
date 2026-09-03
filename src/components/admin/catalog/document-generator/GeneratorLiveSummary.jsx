'use client';
import React from 'react';
import { DOC_TYPES, PRICE_SOURCES } from '@/hooks/admin/useDocumentGeneratorState';

export default function GeneratorLiveSummary({
  docType,
  variantCount,
  currency,
  includePrices,
  priceSource,
  isExWorks,
  adjustmentType,
  adjustmentValue,
  hasOverrides,
  groupBy,
  isMobile,
}) {
  const typeLabel = DOC_TYPES.find(t => t.value === docType)?.label || 'Document';
  const sourceLabel = PRICE_SOURCES.find(s => s.value === priceSource)?.short || 'Price';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      fontSize: '0.76rem',
      color: '#475569',
      lineHeight: 1.4,
    }}>
      <span style={{ fontWeight: 700, color: '#003666', background: '#e0f2fe', padding: '2px 6px', borderRadius: 4 }}>
        {typeLabel}
      </span>
      <span>·</span>
      <span style={{ fontWeight: 600, color: '#1e293b' }}>
        {variantCount} variant{variantCount !== 1 ? 's' : ''}
      </span>

      {includePrices && (
        <>
          <span>·</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{currency}</span>
          <span>·</span>
          <span>{sourceLabel}{isExWorks ? ' (EXW)' : ''}</span>
          {adjustmentType === 'markup' && (
            <span style={{ color: '#16a34a', fontWeight: 600 }}>+{adjustmentValue}% markup</span>
          )}
          {adjustmentType === 'margin' && (
            <span style={{ color: '#0284c7', fontWeight: 600 }}>{adjustmentValue}% margin</span>
          )}
          {hasOverrides && (
            <span style={{ color: '#b45309', fontWeight: 600 }}>(custom prices)</span>
          )}
        </>
      )}

      {!isMobile && (
        <>
          <span>·</span>
          <span style={{ color: '#64748b' }}>by {groupBy}</span>
        </>
      )}
    </div>
  );
}
