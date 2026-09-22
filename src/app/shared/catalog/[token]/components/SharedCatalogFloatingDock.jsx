'use client';

import React from 'react';
import { Send } from 'lucide-react';

/**
 * SharedCatalogFloatingDock — Fixed bottom action bar with:
 *  - Account manager info (if applicable)
 *  - Order estimate badge with review/reset controls
 *  - Copy order & Submit order buttons
 */
export default function SharedCatalogFloatingDock({
  catalogMeta,
  cartTotalUnits,
  grandTotal,
  currencySymbol,
  currentCurrency,
  activeShipping,
  isCartOpen,
  setIsCartOpen,
  clearCart,
  handleCopyOrderSummary,
  copiedToast,
  handleOpenWhatsAppCheckout,
}) {
  return (
    <div
      className="dock-wrapper"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 0',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        zIndex: 50
      }}
    >
      <div
        className="dock-content"
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {catalogMeta.accountManagerName && catalogMeta.accountManagerName !== 'Atlas Commercial Desk' && (
          <div className="mobile-hide" style={{ fontSize: '0.825rem', color: '#475569' }}>
            <strong>{catalogMeta.accountManagerName}</strong>
            {catalogMeta.accountManagerEmail &&
              catalogMeta.accountManagerEmail !== 'orders@atlas-solutions.com' &&
              catalogMeta.accountManagerEmail !== 'commercial@atlashealth.com' &&
              catalogMeta.accountManagerEmail !== 'jose@mediluxeme.com' && (
                <span> • {catalogMeta.accountManagerEmail}</span>
              )}
          </div>
        )}

        {cartTotalUnits > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d' }}>
              🛒 Order Estimate: {cartTotalUnits} units • {currencySymbol}{grandTotal.toFixed(2)} {currentCurrency} (Incl. {activeShipping.flag} Freight)
            </span>
            <button
              type="button"
              onClick={() => setIsCartOpen(!isCartOpen)}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isCartOpen ? 'Hide' : 'Review'}
            </button>
            <button
              type="button"
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', padding: '0 4px' }}
            >
              Reset
            </button>
          </div>
        )}

        <div className="dock-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <button
            onClick={handleOpenWhatsAppCheckout}
            disabled={cartTotalUnits === 0}
            title={cartTotalUnits === 0 ? 'Add formulations to order before submitting' : 'Submit formal order'}
            style={{
              backgroundColor: cartTotalUnits === 0 ? '#94a3b8' : '#003666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: cartTotalUnits === 0 ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: cartTotalUnits === 0 ? 'none' : '0 2px 8px rgba(0, 54, 102, 0.25)',
              opacity: cartTotalUnits === 0 ? 0.6 : 1,
              transition: 'all 0.18s ease'
            }}
            onMouseEnter={(e) => { if (cartTotalUnits > 0) e.currentTarget.style.backgroundColor = '#002244'; }}
            onMouseLeave={(e) => { if (cartTotalUnits > 0) e.currentTarget.style.backgroundColor = '#003666'; }}
          >
            <Send size={15} color="#ffffff" />
            <span>{cartTotalUnits > 0 ? `Submit Order (${cartTotalUnits})` : 'Submit Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
