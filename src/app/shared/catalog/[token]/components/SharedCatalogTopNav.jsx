'use client';

import React from 'react';
import {
  Building2,
  Lock,
  ShieldCheck,
  Package,
  LogOut,
  Mail,
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
  setIsInquiryDrawerOpen,
}) {
  return (
    <header className="institutional-topbar">
      <div className="topbar-inner">
        {/* Brand & Badge Group */}
        <div className="pds-brand-group">
          <span className="pds-brand-title">Med-Peptides</span>
          <span className="pds-brand-divider" aria-hidden="true" />
          <span className="pds-badge-pill">
            {lang === 'es' ? 'CATÁLOGO OFICIAL' : 'OFFICIAL CATALOG'}
          </span>
          <span className="portal-verified-badge">
            <ShieldCheck size={12} />
            <span>{lang === 'es' ? 'Portal Verificado' : 'Verified Portal'}</span>
          </span>
        </div>

        {/* Compact Single-Row Action Controls */}
        <div className="topbar-actions">
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
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                whiteSpace: 'nowrap'
              }}
              title={activeShipping?.label}
              aria-label="Shipping Destination"
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

          {/* Compact Currency Dropdown */}
          <select
            value={currentCurrency}
            onChange={(e) => setCurrentCurrency(e.target.value)}
            className="pds-lang-select"
            style={{ minWidth: '65px', background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '6px', padding: '3px 6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            aria-label="Currency"
          >
            <option value="USD" style={{ background: '#002544', color: '#ffffff' }}>$ USD</option>
            <option value="EUR" style={{ background: '#002544', color: '#ffffff' }}>€ EUR</option>
            <option value="AED" style={{ background: '#002544', color: '#ffffff' }}>AED</option>
          </select>

          {/* Harmonized Language Dropdown */}
          <select
            value={lang}
            onChange={(e) => handleLangToggle(e.target.value)}
            className="pds-lang-select"
            style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.25)', borderRadius: '6px', padding: '3px 6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            aria-label="Language"
          >
            <option value="en" style={{ background: '#002544', color: '#ffffff' }}>🇺🇸 EN</option>
            <option value="es" style={{ background: '#002544', color: '#ffffff' }}>🇪🇸 ES</option>
          </select>

          {/* Institutional Inquiry Button */}
          {setIsInquiryDrawerOpen && (
            <button
              type="button"
              className="pds-btn pds-btn-contact"
              onClick={() => setIsInquiryDrawerOpen(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.10)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
              title={lang === 'es' ? 'Consulta Institucional (business@med-peptides.com)' : 'Contact Medical Affairs (business@med-peptides.com)'}
            >
              <Mail size={13} />
              <span className="access-label-full">{lang === 'es' ? 'Contacto' : 'Contact'}</span>
            </button>
          )}

          {/* Cart Pill (Active only when items selected) */}
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

          {/* Clinical Provider Auth / Portal Access */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                <span className="access-label-full">{lang === 'es' ? 'Mi Portal' : 'My Portal'}</span>
                <span className="access-label-compact">Portal</span>
              </a>
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
                style={{ padding: '4px 8px' }}
                title={`Sign Out (${user?.email || 'Provider'})`}
              >
                <LogOut size={13} color="#f87171" />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <a
                href="/login"
                className="topbar-signin-btn"
                title="Provider Authentication"
              >
                <Lock size={13} color="#ffffff" />
                <span>{lang === 'es' ? 'Acceder' : 'Sign In'}</span>
              </a>
              <button
                type="button"
                onClick={() => { setRegisterSubmitted(false); setRegisterError(''); setIsRegisterModalOpen(true); }}
                className="topbar-apply-btn"
              >
                <Building2 size={13} />
                <span className="access-label-full">{lang === 'es' ? 'Solicitar Acceso' : 'Apply'}</span>
                <span className="access-label-compact">{lang === 'es' ? 'Acceso' : 'Apply'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
