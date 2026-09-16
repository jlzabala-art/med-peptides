'use client';

import React from 'react';
import { Package, CheckCircle2, ClipboardList } from 'lucide-react';
import { resolveVariantClinicalImage } from '@/utils/clinicalImageResolver';
import { sortVariantsAscending } from '@/utils/variantSorter';

/**
 * SharedCatalogProductCard — Renders a single product card with all its variants,
 * pricing boxes, kit/unit counters, and optional clinical protocol badges.
 */
export default function SharedCatalogProductCard({
  prod,
  includePrices,
  fxMultiplier,
  currentCurrency,
  currencySymbol,
  packagingMode,
  cart,
  updateQuantity,
  showProtocolsUnderProducts,
  protocols,
  setSelectedPublicProtocol,
}) {
  const startingPrice = (prod.minPrice > 0 ? prod.minPrice : (prod.variants[0]?.price || 0)) * fxMultiplier;

  function getRelatedProtocols(product, allProtocols) {
    if (!allProtocols || allProtocols.length === 0 || !product) return [];
    const prodNameLower = (product.canonicalName || product.name || '').toLowerCase().trim();
    const prodSlugLower = (product.slug || product.id || '').toLowerCase().trim();
    const cleanTokens = prodNameLower
      .replace(/[^a-z0-9\s-]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2 && !['vial', 'mg', 'peptide', 'blend', 'spray', 'capsule', 'pen', 'solution'].includes(t));

    return allProtocols.filter(proto => {
      const compounds = Array.isArray(proto.compounds) ? proto.compounds : [];
      const hasMatchingCompound = compounds.some(c => {
        const cName = (typeof c === 'string' ? c : (c?.name || c?.drugName || '')).toLowerCase();
        if (!cName) return false;
        if (cName.includes(prodNameLower) || prodNameLower.includes(cName)) return true;
        return cleanTokens.some(tok => cName.includes(tok));
      });
      if (hasMatchingCompound) return true;
      const titleLower = (proto.title || '').toLowerCase();
      if (titleLower.includes(prodNameLower) || (prodSlugLower && titleLower.includes(prodSlugLower))) return true;
      if (cleanTokens.length > 0 && cleanTokens.some(tok => titleLower.includes(tok))) return true;
      return false;
    });
  }

  return (
    <div className="product-card" style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease',
    }}>
      {/* Product Master Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', flex: '1 1 300px' }}>
          <img
            src={resolveVariantClinicalImage(prod.variants[0], prod)}
            alt={prod.canonicalName}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '10px',
              objectFit: 'cover',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {prod.canonicalName}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                padding: '3px 8px',
                borderRadius: '5px',
                border: '1px solid #bbf7d0'
              }}>
                {prod.purity}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#f8fafc',
                color: '#64748b',
                padding: '3px 8px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0'
              }}>
                {prod.category}
              </span>
            </div>
            {prod.description && (
              <p className="product-desc-clamp">{prod.description}</p>
            )}
          </div>
        </div>

        {includePrices && prod.variants.length > 0 && (
          <div className="mobile-hide" style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '8px 14px',
            textAlign: 'right',
            minWidth: '130px'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Starting From
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#003666' }}>
              {currencySymbol}{startingPrice.toFixed(2)} <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>{currentCurrency}</span>
            </div>
          </div>
        )}
      </div>

      {/* Variant Presentations Section */}
      <div style={{ backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '10px', padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={14} color="#0284c7" /> Available Formats & Dosages ({prod.variants.length})
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
            Verified Analytical Grade
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sortVariantsAscending(prod.variants).map((v, vIdx) => {
            const displayPrice = (v.price > 0 ? v.price : 0) * fxMultiplier;
            const tier10Rate = (v.tier10UnitPrice && v.tier10UnitPrice > 0 ? v.tier10UnitPrice : (v.price > 0 ? v.price * 0.9 : 0)) * fxMultiplier;
            const kitDisplayPrice = (v.kitPrice && v.kitPrice > 0 ? v.kitPrice : tier10Rate * 10) * fxMultiplier;

            const formatLower = (v.presentation || '').toLowerCase();
            const unitPlural = formatLower.includes('pen') ? 'Pens'
              : formatLower.includes('spray') ? 'Sprays'
              : (formatLower.includes('capsule') || formatLower.includes('bottle')) ? 'Bottles'
              : (formatLower.includes('serum') || formatLower.includes('topical')) ? 'Units'
              : 'Vials';

            const savingsPct = displayPrice > 0 && tier10Rate > 0 && tier10Rate < displayPrice
              ? Math.round((1 - (tier10Rate / displayPrice)) * 100)
              : 0;

            const stockRaw = (v.stockType || v.availability || prod.stockType || 'on_demand').toLowerCase();
            const isOutOfStock = stockRaw.includes('out') || stockRaw.includes('agotado');
            const isDemand = stockRaw.includes('demand') || stockRaw.includes('pedido') || !stockRaw;

            const showUnits = packagingMode === 'all' || packagingMode === 'units';
            const showKits = (packagingMode === 'all' || packagingMode === 'kits') && kitDisplayPrice > 0;
            const kitsInCart = Math.floor((cart[v.id]?.quantity || 0) / 10);

            return (
              <div
                key={v.id || vIdx}
                className="variant-card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  gap: '12px',
                }}
              >
                <div className="variant-info-col">
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '6px',
                    backgroundColor: '#eff6ff', color: '#0284c7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.75rem', flexShrink: 0,
                  }}>
                    #{vIdx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', lineHeight: 1.2 }}>
                      {v.dosage || v.name || 'Standard Presentation'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                      <span style={{ textTransform: 'capitalize' }}>Format: {v.presentation || 'Vial'}</span>
                      <span>•</span>
                      {isOutOfStock ? (
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>🔴 Out of Stock</span>
                      ) : isDemand ? (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>🟡 On Demand (3–7 Days)</span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>🟢 In Stock</span>
                      )}
                    </div>
                  </div>
                </div>

                {includePrices && (
                  <div className="variant-pricing-actions">
                    {/* Single Unit (1-9) Box */}
                    {showUnits && (
                      <div className="single-unit-box">
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Single (1–9)</div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#003666' }}>
                            {currencySymbol}{displayPrice.toFixed(2)} <span style={{ fontSize: '0.68rem', color: '#64748b' }}>{currentCurrency}</span>
                          </div>
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '1px', marginLeft: '2px' }}>
                          <button
                            type="button"
                            onClick={() => updateQuantity(v, prod, -1)}
                            disabled={!cart[v.id]?.quantity}
                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: cart[v.id]?.quantity ? 'pointer' : 'default', fontWeight: 800, fontSize: '1rem', color: cart[v.id]?.quantity ? '#0f172a' : '#cbd5e1' }}
                            title="Decrease 1 Unit"
                          >
                            -
                          </button>
                          <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 800, fontSize: '0.85rem', color: cart[v.id]?.quantity ? '#003666' : '#64748b' }}>
                            {cart[v.id]?.quantity || 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(v, prod, 1)}
                            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#003666', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                            title="Add 1 Unit"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 10-Unit Pack */}
                    {showKits && (
                      <div className="kit-pack-box">
                        <div>
                          <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📦 Pack ×10 {unitPlural}</span>
                            {savingsPct > 0 && (
                              <span style={{ backgroundColor: '#16a34a', color: '#ffffff', fontSize: '0.6rem', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>
                                -{savingsPct}%
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#15803d', marginTop: '1px' }}>
                            {currencySymbol}{kitDisplayPrice.toFixed(2)} <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#166534' }}>/ pack</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#166534', fontWeight: 600 }}>
                            ({currencySymbol}{tier10Rate.toFixed(2)} / unit)
                          </div>
                        </div>

                        <div>
                          {kitsInCart >= 1 ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #86efac', padding: '1px' }}>
                              <button
                                type="button"
                                onClick={() => updateQuantity(v, prod, -10)}
                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#166534', fontSize: '1rem' }}
                                title="Remove 1 Kit (-10)"
                              >
                                -
                              </button>
                              <span style={{ minWidth: '48px', textAlign: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#15803d' }}>
                                {kitsInCart} Kit{kitsInCart > 1 ? 's' : ''}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(v, prod, 10)}
                                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' }}
                                title="Add 1 Kit (+10)"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateQuantity(v, prod, 10)}
                              className="add-kit-btn"
                              style={{ minHeight: '34px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '6px' }}
                            >
                              + Add Kit (10)
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Order Status Indicator */}
                {(cart[v.id]?.quantity || 0) > 0 && (
                  <div style={{ width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '5px 10px', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 700 }}>
                      <CheckCircle2 size={13} color="#16a34a" />
                      <span>In Order: <strong>{cart[v.id].quantity} {unitPlural}</strong></span>
                      {Math.floor(cart[v.id].quantity / 10) > 0 && (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                          {Math.floor(cart[v.id].quantity / 10)} Kit{Math.floor(cart[v.id].quantity / 10) > 1 ? 's' : ''} (10 pk)
                          {cart[v.id].quantity % 10 > 0 ? ` + ${cart[v.id].quantity % 10} Single Vial(s)` : ''}
                        </span>
                      )}
                    </div>
                    <span style={{ color: '#15803d', fontWeight: 800 }}>
                      Item Subtotal: {currencySymbol}{(cart[v.id].quantity * (cart[v.id].quantity >= 10 && v.tier10UnitPrice ? v.tier10UnitPrice : v.price) * fxMultiplier).toFixed(2)} {currentCurrency}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Clinical Protocols Badges */}
      {showProtocolsUnderProducts && (() => {
        const related = getRelatedProtocols(prod, protocols);
        if (!related || related.length === 0) return null;
        return (
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <ClipboardList size={13} color="#0284c7" />
              <span>Clinical Protocols:</span>
            </div>
            {related.map(proto => (
              <button
                key={proto.id}
                type="button"
                onClick={() => setSelectedPublicProtocol(proto)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s ease' }}
                title={`Open clinical protocol dossier: ${proto.title}`}
              >
                <span>{proto.title}</span>
                {proto.duration && (
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '10px', fontWeight: 800 }}>
                    {proto.duration}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>↗</span>
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
}
