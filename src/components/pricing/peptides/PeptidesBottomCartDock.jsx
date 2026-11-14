'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

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
        padding: '10px 0',
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

        {/* Right: Reset & Review Proforma CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {confirmReset ? (
            <div className="mobile-hide" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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
                  fontWeight: 700,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Confirmar vaciar' : 'Confirm reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#5f6368',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="mobile-hide"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#5f6368',
                fontSize: '0.74rem',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              title={isEs ? 'Vaciar proforma' : 'Clear all cart items'}
            >
              {isEs ? 'Vaciar' : 'Reset'}
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
              padding: '9px 18px',
              fontWeight: 750,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(26, 115, 232, 0.35)',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              minHeight: '40px'
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1557b0')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a73e8')}
          >
            <span>{isEs ? `Revisar Proforma (${totalCartCount})` : `Review Proforma (${totalCartCount})`}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
