'use client';

import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import ProductPresentationIcon from '@/components/ui/ProductPresentationIcon';
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
  isPeptideCatalog = true,
  t,
}) {
  const startingPrice = (prod.minPrice > 0 ? prod.minPrice : (prod.variants[0]?.price || 0)) * fxMultiplier;

  const isProductCosmetic = React.useMemo(() => {
    const slug = String(prod?.slug || prod?.id || '').toLowerCase();
    const cat = String(prod?.category || prod?.categoryId || '').toLowerCase();
    const type = String(prod?.productType || prod?.type || '').toLowerCase();
    const name = String(prod?.canonicalName || prod?.name || prod?.title || '').toLowerCase();
    const brand = String(prod?.brand || prod?.supplierId || '').toLowerCase();

    // Colvita is a nutricosmetic/dietary supplement capsule, not topical cosmetic
    if (slug.includes('colvita') || name.includes('colvita')) return false;

    return (
      Boolean(prod?.is_cosmetic) ||
      Boolean(prod?.isCosmetic) ||
      slug.startsWith('colway-') ||
      brand.includes('colway') ||
      cat === 'cosmetics' || cat === 'cosmetic' || cat.includes('skincare') || cat.includes('trichology') ||
      type === 'cosmetic' || type === 'cosmetics' ||
      name.includes('shampoo') || name.includes('conditioner') ||
      name.includes('blue diamond') || name.includes('peeling') ||
      name.includes('lip care') || name.includes('wash gel')
    );
  }, [prod]);

  const isProductDiagnostic = React.useMemo(() => {
    const slug = String(prod?.slug || prod?.id || '').toLowerCase();
    const cat = String(prod?.category || '').toLowerCase();
    const name = String(prod?.canonicalName || prod?.name || '').toLowerCase();
    return (
      slug.includes('eterna') || slug.includes('bloodo') ||
      slug.includes('diagnostic') || cat.includes('diagnostic') ||
      name.includes('epigenetic age') || name.includes('diagnostic test')
    );
  }, [prod]);

  const isProductPeptide = React.useMemo(() => {
    if (isProductCosmetic || isProductDiagnostic) return false;
    const slug = String(prod?.slug || prod?.id || '').toLowerCase();
    const type = String(prod?.productType || prod?.type || '').toLowerCase();
    if (slug.includes('bacteriostatic') || slug.includes('bac-water') || type === 'solvent') return false;
    if (slug.includes('colvita')) return false;
    return true;
  }, [isProductCosmetic, isProductDiagnostic, prod]);

  const fdaStatus = React.useMemo(() => isProductPeptide ? getFdaPeptideStatus(prod) : null, [prod, isProductPeptide]);

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
        {/* Main Info: GCP Presentation Icon + Title + Purity + Subtitle */}
        <div className="catalog-row-main">
          <ProductPresentationIcon
            product={prod}
            variant={prod.variants?.[0]}
            size="md"
          />

          <div className="catalog-row-info">
            <div className="catalog-row-title-line">
              <span className="catalog-row-title">
                {String(prod.canonicalName || prod.name || '')
                  .replace(/\s*\([^)]*(?:body protection compound|thymosin beta|nicotinamide)[^)]*\)/gi, '')
                  .replace(/\s+(?:Blend|Stack)$/i, '')
                  .trim()}
              </span>

              {isProductPeptide && fdaStatus && (
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

              {isProductCosmetic && (
                <span
                  className="catalog-row-fda-badge"
                  title="Formally registered on the EU Cosmetic Products Notification Portal (EC No 1223/2009)"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1.5px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '0.74rem', lineHeight: 1 }}>✓</span>
                  <span className="fda-badge-text">EU CPNP</span>
                </span>
              )}

              {isProductDiagnostic && (
                <span
                  className="catalog-row-fda-badge"
                  title="Validated Clinical Epigenetic Biomarker & Laboratory Diagnostic Panel"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '1.5px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  <span style={{ fontSize: '0.74rem', lineHeight: 1 }}>🧬</span>
                  <span className="fda-badge-text">CLIA / CAP</span>
                </span>
              )}

              {isProductPeptide && prod.purity && (
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
              title={isProductPeptide ? "Official Clinical Monograph" : isProductDiagnostic ? "Validated Diagnostic Biomarker Sheet" : "Product Dossier & Formulation Details"}
            >
              <FileText size={13} />
              <span className="monograph-btn-label">
                {isProductPeptide ? (t ? t('product.monograph', 'Monograph') : 'Monograph') : isProductDiagnostic ? 'Diagnostic' : 'Product Sheet'}
              </span>
            </a>

            <button
              type="button"
              onClick={onToggleExpand}
              className="catalog-row-expand-btn"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse formulation details' : 'Expand formulation details and formats'}
              title={isExpanded ? (t ? t('product.collapse', 'Collapse') : 'Collapse') : (t ? t('product.expand', 'Expand Formats') : 'Expand Formats')}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Panel (Google Cloud Console Drawer Flow) */}
      {isExpanded && (
        <div style={{ padding: '6px 16px 16px 16px', borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
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
