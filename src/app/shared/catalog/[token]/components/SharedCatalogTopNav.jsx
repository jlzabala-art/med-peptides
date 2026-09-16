'use client';

import React from 'react';
import {
  Building2,
  Lock,
  ShieldCheck,
  Package,
  LogOut,
} from 'lucide-react';
import { SHIPPING_DESTINATIONS } from '../../../../../hooks/data/useSharedCatalogState';
import { SUPPORTED_LANGS } from '../catalogI18n';

/**
 * SharedCatalogTopNav — Sandboxed institutional topbar.
 * Isolated: no links to rest of application, no admin navigation.
 * Supports: shipping selector, currency toggle, cart pill, language toggle, sign-in / apply.
 */
export default function SharedCatalogTopNav({
  // Auth
  isAuthenticated,
  user,
  logout,
  activeRole,
  // Shipping
  selectedShipping,
  setSelectedShipping,
  currentCurrency,
  setCurrentCurrency,
  currencySymbol,
  activeShipping,
  // Cart
  cartTotalUnits,
  grandTotal,
  isCartOpen,
  setIsCartOpen,
  t,
  // Language
  lang,
  handleLangToggle,
  // Registration modal
  setRegisterSubmitted,
  setRegisterError,
  setIsRegisterModalOpen,
}) {
  return (
    <header className="institutional-topbar">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <img
            src="/atlas-health-logo.png"
            alt="Atlas Health"
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="topbar-brand-title">
            <span>ATLAS HEALTH</span>
            <span style={{ fontWeight: 400, color: '#94a3b8' }}>•</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }} className="mobile-hide">Clinical Formulations</span>
          </div>
          <span className="portal-verified-badge">
            <ShieldCheck size={12} />
            <span>Verified Portal</span>
          </span>
        </div>

        <div className="topbar-actions">
          {/* Line 1: Logistics Controls (Destination, Currency, Cart) */}
          <div className="topbar-row-logistics">
            {/* Destination Selector */}
            <div className="topbar-destination">
              <span>✈️</span>
              <select
                value={selectedShipping}
                onChange={(e) => setSelectedShipping(e.target.value)}
                style={{
                  background: 'transparent',
                  color: '#0f172a',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  width: '100%',
                  whiteSpace: 'nowrap'
                }}
                title={activeShipping.label}
              >
                {SHIPPING_DESTINATIONS.map(d => {
                  const cost = currentCurrency === 'EUR' ? d.costEUR : currentCurrency === 'AED' ? (d.costAED || Math.round(d.costUSD * 3.6725)) : d.costUSD;
                  return (
                    <option key={d.id} value={d.id}>
                      {d.flag} {d.code} (+{currencySymbol}{cost})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Currency Toggle */}
            <div className="topbar-currency-toggle">
              <button
                type="button"
                onClick={() => setCurrentCurrency('USD')}
                className={`currency-btn ${currentCurrency === 'USD' ? 'active' : 'inactive'}`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrentCurrency('EUR')}
                className={`currency-btn ${currentCurrency === 'EUR' ? 'active' : 'inactive'}`}
              >
                € EUR
              </button>
              <button
                type="button"
                onClick={() => setCurrentCurrency('AED')}
                className={`currency-btn ${currentCurrency === 'AED' ? 'active' : 'inactive'}`}
              >
                AED
              </button>
            </div>

            {/* Top Cart Pill (if active) */}
            {cartTotalUnits > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="topbar-cart-pill"
                title={t('order.title', 'Review Order')}
              >
                <Package size={14} />
                <span>{cartTotalUnits} Vials</span>
                <span>•</span>
                <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
              </button>
            )}
          </div>

          {/* Language toggle EN / ES */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => handleLangToggle(l)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  transition: 'all 0.15s ease',
                  backgroundColor: lang === l ? '#003666' : 'transparent',
                  color:           lang === l ? '#ffffff' : '#64748b',
                  borderColor:     lang === l ? '#003666' : '#cbd5e1',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                {l === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}
              </button>
            ))}
          </div>

          {/* Line 2: Clinical Provider Access & Registration / Sign Out */}
          <div className="topbar-row-access">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await logout();
                  } catch (e) {
                    console.error('Sign out error:', e);
                  }
                }}
                className="topbar-signin-btn"
                title={`Sign Out (${user?.email || 'Provider'})`}
              >
                <LogOut size={13} color="#b91c1c" />
                <span>Sign Out</span>
              </button>
            ) : (
              <a
                href="/login"
                className="topbar-signin-btn"
                title="Provider Authentication"
              >
                <Lock size={13} color="#003666" />
                <span>Sign In</span>
              </a>
            )}

            {isAuthenticated ? (
              <a
                href={
                  activeRole === 'admin' ? '/admin' :
                  activeRole === 'doctor' || activeRole === 'medical_director' ? '/doctor' :
                  activeRole === 'wholesaler' ? '/wholesaler' :
                  activeRole === 'supplier' ? '/supplier' :
                  activeRole === 'clinic' ? '/clinic' : '/patient'
                }
                className="topbar-apply-btn"
                style={{ textDecoration: 'none' }}
              >
                <Building2 size={13} />
                <span className="access-label-full">Open My Portal</span>
                <span className="access-label-compact">My Portal</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => { setRegisterSubmitted(false); setRegisterError(''); setIsRegisterModalOpen(true); }}
                className="topbar-apply-btn"
              >
                <Building2 size={13} />
                <span className="access-label-full">Apply for Portal Access</span>
                <span className="access-label-compact">Portal Access</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
