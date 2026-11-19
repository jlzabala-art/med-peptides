'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';

/**
 * PeptidesBottomCartDock
 * Floating contextual bottom bar that appears when items are present in cart.
 */
export default function PeptidesBottomCartDock({
  totalCartCount = 0,
  totalCartValueUsd = 0,
  formatPrice = val => `$${val}`,
  currencySymbol = '$',
  shippingCostCurrentCurrency = 0,
  activeShippingCorridor,
  isEs = false,
  setCartItems,
  setIsOrderDrawerOpen
}) {
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!confirmReset) return undefined;
    const t = setTimeout(() => setConfirmReset(false), 4000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  if (totalCartCount <= 0) return null;

  const vialLabel = isEs
    ? (totalCartCount === 1 ? 'Vial' : 'Viales')
    : (totalCartCount === 1 ? 'Vial' : 'Vials');

  return (
    <aside
      className="gcp-fixed-bottom-dock animate-fadeInUp"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 900,
        background: '#ffffff',
        borderTop: '1px solid #dadce0',
        boxShadow: '0 -4px 20px rgba(60, 64, 67, 0.15)',
        paddingTop: '10px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.98)'
      }}
      aria-label="Bottom Cart & Proforma Action Dock"
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '12px'
        }}
      >
        {/* Left: Cart Quantity & Total with Corridor Shipping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: '#e6f4ea',
              color: '#137333',
              border: '1px solid #ceead6',
              fontSize: '0.80rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}
          >
            <ShoppingCart size={13} />
            <span>
              {totalCartCount} {vialLabel}
            </span>
          </span>
          <div>
            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#202124',
                fontFamily: 'monospace',
                lineHeight: 1.1,
                whiteSpace: 'nowrap'
              }}
            >
              {formatPrice(totalCartValueUsd)}
            </div>
            {activeShippingCorridor && (
              <div className="mobile-hide" style={{ fontSize: '0.68rem', color: '#5f6368', whiteSpace: 'nowrap' }}>
                {isEs
                  ? `+${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)} Envío ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEs} (≤2 kg)`
                  : `+${currencySymbol}${shippingCostCurrentCurrency.toFixed(2)} ${activeShippingCorridor.flag} ${activeShippingCorridor.labelEn} Shipping (≤2 kg)`}
              </div>
            )}
          </div>
        </div>

        {/* Right: Accessible Reset (Desktop + Mobile) & Review Proforma CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {confirmReset ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  setCartItems({});
                  setConfirmReset(false);
                }}
                style={{
                  background: '#fce8e6',
                  border: '1px solid #f6aea9',
                  color: '#c5221f',
                  fontSize: '0.72rem',
                  fontWeight: 750,
                  padding: '0 10px',
                  minHeight: '38px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {isEs ? 'Vaciar' : 'Clear'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #dadce0',
                  color: '#5f6368',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  padding: '0 8px',
                  minHeight: '38px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              style={{
                background: '#ffffff',
                border: '1px solid #dadce0',
                color: '#5f6368',
                width: '38px',
                height: '38px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              aria-label={isEs ? 'Vaciar proforma' : 'Clear all cart items'}
              title={isEs ? 'Vaciar proforma' : 'Clear all cart items'}
            >
              <Trash2 size={15} />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOrderDrawerOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1a73e8', // GCP Primary Blue
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 14px',
              fontWeight: 750,
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.35)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              minHeight: '40px'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1557b0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a73e8')}
          >
            <span>{isEs ? `Proforma (${totalCartCount})` : `Proforma (${totalCartCount})`}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
