'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Filter, ShoppingBag, X } from 'lucide-react';
import '@/components/shared/PublicStickyActionBar.css';

/**
 * CatalogStickyActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud UX compliant persistent bottom action bar for the Shared Catalog.
 * Connects:
 *  - Real-time catalog context (Title, Batch Code, Item counts, Active Cart total)
 *  - Permanent Goals & FDA Filter drawer trigger (crucial for mobile & quick access)
 *  - Sandboxed Clinical AI Copilot with real-time remaining quota
 *  - Adaptive primary CTA: "Submit Order (N)" if cart active, or "Inquire Terms"
 */
export default function CatalogStickyActionBar({
  catalogTitle = 'Institutional Catalog',
  catalogCode,
  badgeText = 'INSTITUTIONAL TERMS',
  displayedCount = 0,
  totalCount = 0,
  cartTotalUnits = 0,
  grandTotal = 0,
  currencySymbol = '$',
  currentCurrency = 'USD',
  isCartOpen = false,
  setIsCartOpen = () => {},
  clearCart = () => {},
  activeFiltersCount = 0,
  onOpenFilters = () => {},
  onInquire = () => {},
  onSubmitOrder = () => {},
  lang = 'en',
  t = (k) => k
}) {
  const [quota, setQuota] = useState({ remaining: 5, limit: 5 });

  // 1. Initial IP-based quota lookup
  useEffect(() => {
    let isMounted = true;
    fetch('/api/ai-chat?scope=public_sandbox')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (typeof data.remaining === 'number') {
          setQuota({
            remaining: data.remaining,
            limit: data.limit || 5,
          });
        }
      })
      .catch(() => {});

    // 2. Synchronize when PublicAtlasAIDrawer dispatches updates
    const handleQuotaUpdate = (e) => {
      if (e.detail && typeof e.detail.remaining === 'number') {
        setQuota({
          remaining: e.detail.remaining,
          limit: e.detail.limit || 5,
        });
      }
    };

    window.addEventListener('atlas-quota-updated', handleQuotaUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('atlas-quota-updated', handleQuotaUpdate);
    };
  }, []);

  const handleOpenAI = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
    }
  };

  return (
    <aside className="public-sticky-action-bar" aria-label="Catalog Quick Actions">
      <div className="public-sticky-action-bar__container">
        
        {/* Left: Identity & Cart Status */}
        <div className="public-sticky-action-bar__info">
          <div className="public-sticky-action-bar__meta-row">
            {badgeText && (
              <span className="public-sticky-action-bar__badge public-sticky-action-bar__badge--diagnostic">
                {badgeText}
              </span>
            )}
            <div className="public-sticky-action-bar__title" title={catalogTitle}>
              {catalogTitle}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
            <div className="public-sticky-action-bar__subtitle">
              {displayedCount} {displayedCount === 1 ? 'formulation' : 'formulations'}
              {catalogCode ? ` • ${catalogCode}` : ''}
            </div>

            {/* Active Cart Quick Pill */}
            {cartTotalUnits > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#15803d'
                }}
              >
                <span>🛒 {cartTotalUnits} units • {currencySymbol}{grandTotal.toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0284c7',
                    fontWeight: 800,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.72rem'
                  }}
                >
                  {isCartOpen ? 'Hide' : 'Review'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions Cluster */}
        <div className="public-sticky-action-bar__actions">
          
          {/* Goals & FDA Filters trigger */}
          <button
            type="button"
            onClick={onOpenFilters}
            className="public-sticky-action-bar__sections-btn"
            title={lang === 'es' ? 'Filtrar por Objetivos y Estado FDA' : 'Filter by Goals & FDA Status'}
            aria-label="Goals & FDA Filters"
          >
            <Filter size={15} className="public-sticky-action-bar__sections-icon" />
            <span className="public-sticky-action-bar__sections-label">
              {lang === 'es' ? 'Filtros' : 'Goals & FDA'}
            </span>
            {activeFiltersCount > 0 && (
              <span className="public-sticky-action-bar__sections-pill">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Clinical AI Copilot */}
          <button
            type="button"
            onClick={handleOpenAI}
            className="public-sticky-action-bar__ai-btn"
            title="Open Clinical AI Research Copilot"
            aria-label="Clinical AI Copilot"
          >
            <Sparkles size={15} className="public-sticky-action-bar__sparkle-icon" />
            <span className="public-sticky-action-bar__ai-label-full">Clinical AI</span>
            <span className="public-sticky-action-bar__ai-label-short">AI</span>
            <span className="public-sticky-action-bar__quota-pill">
              {quota.remaining}/{quota.limit}
            </span>
          </button>

          {/* Primary CTA: Adaptive between Cart Checkout vs Institutional Inquiry */}
          {cartTotalUnits > 0 ? (
            <button
              type="button"
              onClick={onSubmitOrder}
              className="public-sticky-action-bar__inquire-btn"
              style={{
                background: '#003666',
                borderColor: '#002244'
              }}
              aria-label={`Submit Order (${cartTotalUnits} units)`}
            >
              <ShoppingBag size={14} style={{ flexShrink: 0 }} />
              <span>{lang === 'es' ? `Pedir (${cartTotalUnits})` : `Submit Order (${cartTotalUnits})`}</span>
              <ArrowRight size={14} style={{ flexShrink: 0 }} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onInquire}
              className="public-sticky-action-bar__inquire-btn"
              aria-label="Inquire Terms"
            >
              <span>{lang === 'es' ? 'Cotizar / Contactar' : 'Inquire Terms'}</span>
              <ArrowRight size={14} style={{ flexShrink: 0 }} />
            </button>
          )}

        </div>

      </div>
    </aside>
  );
}
