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
        <div className="topbar-brand">
          <span className="topbar-brand-title">Med-Peptides</span>
          <span className="topbar-brand-divider" aria-hidden="true" />
          <span className="topbar-badge-pill">
            {lang === 'es' ? 'CATÁLOGO CLÍNICO' : 'CLINICAL CATALOG'}
          </span>
          <span className="portal-verified-badge">
            <ShieldCheck size={12} />
            <span>{lang === 'es' ? 'Portal Verificado' : 'Verified Portal'}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="topbar-actions">
          {/* Destination Selector */}
          <div className="topbar-destination">
            <span className="dest-flag-icon">✈️</span>
            <select
              value={selectedShipping}
              onChange={(e) => setSelectedShipping(e.target.value)}
              className="topbar-dest-select"
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

          {/* Quick Tools: Currency, Language, Inquiry Contact & Cart */}
          <div className="topbar-quick-tools">
            <select
              value={currentCurrency}
              onChange={(e) => setCurrentCurrency(e.target.value)}
              className="topbar-select topbar-select-currency"
              aria-label="Currency"
            >
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="AED">AED</option>
            </select>

            <select
              value={lang}
              onChange={(e) => handleLangToggle(e.target.value)}
              className="topbar-select topbar-select-lang"
              aria-label="Language"
            >
              <option value="en">🇺🇸 EN</option>
              <option value="es">🇪🇸 ES</option>
            </select>

            {setIsInquiryDrawerOpen && (
              <button
                type="button"
                className="topbar-contact-btn"
                onClick={() => setIsInquiryDrawerOpen(true)}
                title={lang === 'es' ? 'Consulta Institucional (business@med-peptides.com)' : 'Contact Medical Affairs (business@med-peptides.com)'}
              >
                <Mail size={13} />
                <span className="contact-label-text">{lang === 'es' ? 'Contacto' : 'Contact'}</span>
              </button>
            )}

            {cartTotalUnits > 0 && (
              <button
                type="button"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="topbar-cart-pill"
                title={t('order.title', 'Review Order')}
              >
                <Package size={13} />
                <span>{cartTotalUnits}</span>
                <span>•</span>
                <span>{currencySymbol}{grandTotal.toFixed(2)}</span>
              </button>
            )}
          </div>

          {/* Clinical Provider Auth / Portal Access */}
          <div className="topbar-row-access">
            {isAuthenticated ? (
              <div className="topbar-auth-inner">
                <a
                  href={
                    activeRole === 'admin' ? '/admin' :
                    activeRole === 'doctor' || activeRole === 'medical_director' ? '/doctor' :
                    activeRole === 'wholesaler' ? '/wholesaler' :
                    activeRole === 'supplier' ? '/supplier' :
                    activeRole === 'clinic' ? '/clinic' : '/patient'
                  }
                  className="topbar-apply-btn"
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
                  title={`Sign Out (${user?.email || 'Provider'})`}
                >
                  <LogOut size={13} color="#f87171" />
                </button>
              </div>
            ) : (
              <div className="topbar-auth-inner">
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
      </div>
    </header>
  );
}
