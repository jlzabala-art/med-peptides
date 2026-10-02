'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  Package,
  LogOut,
  Mail,
  LogIn,
  ChevronDown,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { SHIPPING_DESTINATIONS } from '../../../../../hooks/data/useSharedCatalogState';
import BrandLogo from '../../../../../components/common/BrandLogo';
import '@/styles/publicStickyHeader.css';

/**
 * SharedCatalogTopNav — Sandboxed institutional topbar matching Google Cloud UX standards.
 * Supports:
 *  - Official Atlas Health Services BrandLogo icon & typography
 *  - Neutral, compact destination selector (no upfront freight cost in header)
 *  - Standardized GCP Unified Auth Pill (Single Sign In CTA when unauth, Avatar Dropdown when auth)
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

  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const authDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setAuthDropdownOpen(false);
      }
    }
    if (authDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [authDropdownOpen]);

  const getDashboardPath = () => {
    if (activeRole === 'admin') return '/admin';
    if (activeRole === 'doctor' || activeRole === 'medical_director') return '/doctor';
    if (activeRole === 'wholesaler') return '/wholesaler';
    if (activeRole === 'supplier') return '/supplier';
    if (activeRole === 'clinic') return '/clinic';
    return '/patient';
  };

  const userInitial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  const userShortName = user?.displayName ? user.displayName.split(' ')[0] : (isSpanish ? 'Mi Consola' : 'Console');

  return (
    <header className="institutional-topbar">
      <div className="topbar-inner">
        {/* Brand Logo & Badges */}
        <div className="topbar-brand">
          <Link href="/" className="topbar-brand-title" style={{ textDecoration: 'none', color: '#ffffff', display: 'inline-flex', alignItems: 'center' }} title="Atlas Health Services">
            <BrandLogo variant="light" size="compact" />
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

          {/* GCP-Style Morphing Auth Pill (Single button changes state) */}
          <div className="topbar-row-access">
            {isAuthenticated && user ? (
              <div className="puh-auth-user-wrapper" ref={authDropdownRef}>
                <button
                  type="button"
                  className="puh-btn-auth-user"
                  onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
                  aria-expanded={authDropdownOpen}
                  aria-haspopup="true"
                  title={user?.email || 'User Account'}
                >
                  <span className="puh-user-status-dot" aria-hidden="true" />
                  <span className="puh-user-avatar">{userInitial}</span>
                  <span className="puh-auth-label">{userShortName}</span>
                  <ChevronDown size={11} className={`puh-chevron ${authDropdownOpen ? 'open' : ''}`} />
                </button>

                {authDropdownOpen && (
                  <div className="puh-auth-dropdown" role="menu">
                    <div className="puh-auth-dropdown-header">
                      <span className="puh-dropdown-email">{user?.email}</span>
                    </div>
                    <Link href={getDashboardPath()} className="puh-auth-dropdown-item" onClick={() => setAuthDropdownOpen(false)} role="menuitem">
                      <LayoutDashboard size={13} />
                      <span>{isSpanish ? 'Mi Consola' : 'Console'}</span>
                    </Link>
                    <Link href="/account" className="puh-auth-dropdown-item" onClick={() => setAuthDropdownOpen(false)} role="menuitem">
                      <User size={13} />
                      <span>{isSpanish ? 'Mi Cuenta' : 'Account'}</span>
                    </Link>
                    <div className="puh-auth-dropdown-divider" />
                    <button
                      type="button"
                      className="puh-auth-dropdown-item puh-auth-dropdown-item--danger"
                      onClick={async () => {
                        setAuthDropdownOpen(false);
                        try { await logout(); } catch (e) { console.error('Sign out error:', e); }
                      }}
                      role="menuitem"
                    >
                      <LogOut size={13} />
                      <span>{isSpanish ? 'Cerrar Sesión' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="topbar-auth-inner">
                <Link
                  href="/login?tab=login"
                  className="puh-btn puh-btn-signin"
                  title={isSpanish ? 'Iniciar sesión o registrarse' : 'Sign in or create account'}
                >
                  <LogIn size={13} className="puh-btn-icon" />
                  <span className="puh-auth-label">{isSpanish ? 'Iniciar Sesión' : 'Sign In'}</span>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
