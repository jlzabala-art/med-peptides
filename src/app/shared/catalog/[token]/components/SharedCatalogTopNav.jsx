'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Package,
  LogOut,
  Mail,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { SHIPPING_DESTINATIONS } from '../../../../../hooks/data/useSharedCatalogState';

/**
 * SharedCatalogTopNav — Sandboxed institutional topbar matching Google Cloud UX standards.
 * Supports:
 *  - Neutral, compact destination selector (no upfront freight cost in header)
 *  - Standardized Sign In & Sign Up buttons identical to PublicDatasheetView / PublicUnifiedHeader
 *  - Currency & Language dropdowns
 *  - Contact & Cart indicators
 */
export default function SharedCatalogTopNav({
  isAuthenticated,
  user,
  logout,
  activeRole,
  selectedShipping,
  setSelectedShipping,
  currentCurrency,
  setCurrentCurrency,
  currencySymbol,
  activeShipping,
  cartTotalUnits = 0,
  grandTotal = 0,
  isCartOpen = false,
  setIsCartOpen = () => {},
  t = (k, f) => f || k,
  lang = 'en',
  handleLangToggle = () => {},
  setRegisterSubmitted,
  setRegisterError,
  setIsRegisterModalOpen,
  setIsInquiryDrawerOpen,
}) {
  const isSpanish = lang === 'es';

  const getDashboardPath = () => {
    if (activeRole === 'admin') return '/admin';
    if (activeRole === 'doctor' || activeRole === 'medical_director') return '/doctor';
    if (activeRole === 'wholesaler') return '/wholesaler';
    if (activeRole === 'supplier') return '/supplier';
    if (activeRole === 'clinic') return '/clinic';
    return '/patient';
  };

  return (
    <header className="institutional-topbar">
      <div className="topbar-inner">
        {/* Brand & Badge Group */}
        <div className="topbar-brand">
          <Link href="/" className="topbar-brand-title" style={{ textDecoration: 'none', color: '#ffffff' }}>
            Med-Peptides
          </Link>
          <span className="topbar-brand-divider" aria-hidden="true" />
          <span className="topbar-badge-pill">
            {isSpanish ? 'CATÁLOGO CLÍNICO' : 'CLINICAL CATALOG'}
          </span>
          <span className="portal-verified-badge">
            <ShieldCheck size={12} />
            <span>{isSpanish ? 'Portal Verificado' : 'Verified Portal'}</span>
          </span>
        </div>

        {/* Action Controls */}
        <div className="topbar-actions">
          
          {/* Destination Selector: Sleek, compact indication without upfront cost */}
          <div className="topbar-destination-compact" title={`Destination: ${activeShipping?.label || 'Direct Freight'}`}>
            <span style={{ fontSize: '0.85rem' }}>🌐</span>
            <select
              value={selectedShipping}
              onChange={(e) => setSelectedShipping(e.target.value)}
              className="topbar-dest-compact-select"
              aria-label="Shipping Destination"
            >
              {SHIPPING_DESTINATIONS.map(d => (
                <option key={d.id} value={d.id}>
                  {d.flag} {d.code}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Tools: Currency & Language */}
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
                title={isSpanish ? 'Consulta Institucional' : 'Contact Medical Affairs'}
              >
                <Mail size={13} />
                <span className="contact-label-text">{isSpanish ? 'Contacto' : 'Contact'}</span>
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
                <span className="cart-pill-total">•</span>
                <span className="cart-pill-total">{currencySymbol}{grandTotal.toFixed(2)}</span>
              </button>
            )}
          </div>

          {/* Google Cloud Standard Auth CTAs (Sign In & Sign Up) */}
          <div className="topbar-row-access">
            {isAuthenticated ? (
              <div className="topbar-auth-inner">
                <Link
                  href={getDashboardPath()}
                  className="puh-btn puh-btn-console"
                  title={isSpanish ? 'Acceso a mi Panel Profesional' : 'Access Practitioner Dashboard'}
                >
                  <span className="puh-user-status-dot" aria-hidden="true" />
                  <span className="puh-user-avatar">
                    {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="puh-auth-label">{isSpanish ? 'Mi Consola' : 'Console'}</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (e) {
                      console.error('Sign out error:', e);
                    }
                  }}
                  className="puh-btn puh-btn-ghost"
                  style={{ padding: '0 8px', height: '32px' }}
                  title={`Sign Out (${user?.email || 'Provider'})`}
                >
                  <LogOut size={13} color="#f87171" />
                </button>
              </div>
            ) : (
              <div className="topbar-auth-inner">
                <Link
                  href="/login?tab=login"
                  className="puh-btn puh-btn-signin"
                  title={isSpanish ? 'Iniciar sesión' : 'Sign In'}
                >
                  <LogIn size={13} className="puh-btn-icon" />
                  <span className="puh-auth-label">{isSpanish ? 'Iniciar Sesión' : 'Sign In'}</span>
                </Link>
                <Link
                  href="/login?tab=register"
                  className="puh-btn puh-btn-signup"
                  title={isSpanish ? 'Registrarse en la plataforma médica' : 'Register for clinical practitioner portal'}
                >
                  <UserPlus size={13} className="puh-btn-icon" />
                  <span className="puh-auth-label">{isSpanish ? 'Registrarse' : 'Sign Up'}</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
