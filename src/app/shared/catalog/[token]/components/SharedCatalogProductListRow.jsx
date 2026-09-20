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
              href={`/p/${encodeURIComponent(prod.slug || prod.id)}?supplier=supplier-lotusland`}
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
            >
              <span>{isExpanded ? (t ? t('product.collapse', 'Close') : 'Close') : (t ? t('product.select', 'Select') : 'Select')}</span>
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
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
            t={t}
          />
        </div>
      )}
    </div>
  );
}
