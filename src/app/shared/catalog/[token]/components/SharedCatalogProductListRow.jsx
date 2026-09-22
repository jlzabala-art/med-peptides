'use client';

import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import { getFdaPeptideStatus } from '@/data/fdaPeptidesRegistry';
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

  const fdaStatus = React.useMemo(() => getFdaPeptideStatus(prod), [prod]);

  const resolvedSupplier = React.useMemo(() => {
    const rawProdSupp = prod?.supplierId || prod?.variants?.[0]?.supplierId || prod?.supplier || prod?.variants?.[0]?.supplier;
    const rawCatSupp = catalogMeta?.supplierId || catalogMeta?.catalogueFilter || catalogMeta?.supplierFilter;
    const suppCandidate = rawCatSupp || rawProdSupp || '';
    const norm = String(suppCandidate).toLowerCase();
    if (norm.includes('magenta')) return 'supplier-magenta';
    if (norm.includes('lotusland') || norm.includes('atlas')) return 'supplier-lotusland';
    if (rawCatSupp && rawCatSupp !== 'all') return rawCatSupp;
    if (rawProdSupp) return rawProdSupp;
    return 'supplier-lotusland';
  }, [prod, catalogMeta]);

  return (
    <div className={`catalog-list-item ${isExpanded ? 'is-expanded' : ''}`}>
      {/* Product Row Header — Balanced GCP Mobile & Desktop Layout */}
      <div
        onClick={onToggleExpand}
        className="catalog-list-row-header"
      >
        {/* Main Info: Image + Title + Purity + Subtitle */}
        <div className="catalog-row-main">
          <img
            src={resolveVariantClinicalImage(prod.variants[0], prod)}
            alt={prod.canonicalName}
            className="catalog-row-img"
          />

          <div className="catalog-row-info">
            <div className="catalog-row-title-line">
              <span className="catalog-row-title">
                {prod.canonicalName}
              </span>

              {fdaStatus && (
                <span
                  className="catalog-row-fda-badge"
                  title={`${fdaStatus.badgeLabel} (${fdaStatus.rulingDate || 'FDA'}): ${fdaStatus.summary || ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1.5px 6px',
                    borderRadius: '4px',
                    backgroundColor: fdaStatus.colorScheme?.bg || '#f8fafc',
                    color: fdaStatus.colorScheme?.text || '#475569',
                    border: `1px solid ${fdaStatus.colorScheme?.border || '#cbd5e1'}`,
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '0.74rem', lineHeight: 1 }}>{fdaStatus.colorScheme?.icon}</span>
                  <span className="fda-badge-text">{fdaStatus.shortBadge}</span>
                </span>
              )}

              {prod.purity && (
                <span className="catalog-row-purity">
                  {prod.purity}
                </span>
              )}
            </div>
            <span className="catalog-row-subtitle">
              {prod.variants?.length || 1} {prod.variants?.length === 1 ? 'Format' : 'Formats & Dosages'}
            </span>
          </div>
        </div>

        {/* Commercial Value & Actions Zone */}
        <div className="catalog-row-action-zone" onClick={(e) => e.stopPropagation()}>
          {includePrices && (
            <div className="catalog-row-price-block">
              <span className="catalog-price-label">From</span>
              <span className="catalog-price-amount">
                {currencySymbol}{startingPrice.toFixed(2)}
              </span>
            </div>
          )}

          <div className="catalog-row-buttons">
            <a
              href={`/p/${encodeURIComponent(prod.slug || prod.id)}?supplier=${resolvedSupplier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-row-monograph-btn"
              title="Official Monograph"
            >
              <FileText size={13} />
              <span className="monograph-btn-label">Monograph</span>
            </a>

            <button
              type="button"
              onClick={onToggleExpand}
              className="catalog-row-expand-btn"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse peptide details' : 'Expand peptide details and dosages'}
              title={isExpanded ? (t ? t('product.collapse', 'Collapse') : 'Collapse') : (t ? t('product.expand', 'Expand Formats') : 'Expand Formats')}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
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
            hideMasterImage={true}
            t={t}
          />
        </div>
      )}
    </div>
  );
}
