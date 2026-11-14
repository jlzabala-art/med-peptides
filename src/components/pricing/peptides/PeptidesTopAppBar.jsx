'use client';

import React from 'react';
import Link from 'next/link';
import {
  Menu,
  Sparkles,
  ChevronDown,
  MoreVertical,
  Eye,
  Share2,
  Mail,
  Check,
  LogIn,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import BrandLogo from '@/components/common/BrandLogo';
import GcpUserBadge from '@/components/shared/GcpUserBadge';

/**
 * PeptidesTopAppBar
 * Fixed top navigation bar for Desktop & Mobile, with Currency & Language pickers,
 * Atlas AI trigger, and GCP-style profile badge.
 */
export default function PeptidesTopAppBar({
  setIsNavDrawerOpen,
  lang = 'en',
  handleLanguageChange,
  isAtlasAiOpen = false,
  setIsAtlasAiOpen,
  currency = 'USD',
  handleCurrencyChange,
  authUser = null,
  authRole = null,
  avatarBgColor = '#1a73e8',
  effectiveInitials = 'U',
  effectiveDisplayName = 'User',
  effectiveRoleLabel = 'Guest',
  handleLogout,
  isCurrencySheetOpen = false,
  setIsCurrencySheetOpen,
  isMobileMoreMenuOpen = false,
  setIsMobileMoreMenuOpen,
  setIsPdfPreviewOpen,
  handleShareSchedule,
  copied = false,
  setInquiryProductContext,
  setIsInquiryDrawerOpen
}) {
  const isEs = lang === 'es';

  return (
    <>
      <header className="screen-nav-bar peptides-screen-nav-bar">
        <div className="nav-container peptides-nav-container">
          <div className="nav-left peptides-nav-left">
            {/* Mobile hamburger menu trigger (visible ≤1024px) */}
            <button
              type="button"
              className="mobile-nav-drawer-trigger"
              onClick={() => setIsNavDrawerOpen && setIsNavDrawerOpen(true)}
              aria-label="Open navigation menu"
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                borderRadius: '6px',
                width: '36px',
                height: '36px',
                color: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Menu size={18} color="#ffffff" />
            </button>
            <Link
              href="/"
              className="nav-brand"
              style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              title="Atlas Health Services"
            >
              <BrandLogo variant="light" size="compact" />
            </Link>
            <span
              className="nav-divider mobile-hide"
              style={{ color: 'rgba(255, 255, 255, 0.35)', margin: '0 4px', fontSize: '0.80rem' }}
            >
              &gt;
            </span>
            <span
              className="nav-section mobile-hide"
              style={{ color: '#cbd5e1', fontSize: '0.80rem', fontWeight: 500 }}
            >
              {isEs ? 'Tarifas Oficiales' : 'Price Schedules'}
            </span>
            <span
              className="nav-divider mobile-hide"
              style={{ color: 'rgba(255, 255, 255, 0.35)', margin: '0 4px', fontSize: '0.80rem' }}
            >
              &gt;
            </span>
            <span
              className="nav-current mobile-hide"
              style={{ color: '#ffffff', fontSize: '0.80rem', fontWeight: 750 }}
            >
              {isEs ? 'Viales de Péptidos Liofilizados' : 'Lyophilized Peptide Vials'}
            </span>
          </div>

          <div className="nav-actions peptides-nav-actions">
            {/* Desktop & Laptop Actions Bar (Google Cloud Console Dark Bar) */}
            <div className="peptides-nav-utility-group desktop-only-utilities">
              {/* Language selector: EN standard, ES selectable */}
              <div className="language-selector" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div
                  className="pill-group"
                  style={{
                    display: 'inline-flex',
                    background: 'rgba(255, 255, 255, 0.12)',
                    borderRadius: '6px',
                    padding: '2px',
                    border: '1px solid rgba(255, 255, 255, 0.22)'
                  }}
                >
                  {[
                    { code: 'en', label: 'EN' },
                    { code: 'es', label: 'ES' }
                  ].map(item => {
                    const isCurrent = (lang || 'en') === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleLanguageChange && handleLanguageChange(item.code)}
                        className={`pill-btn ${isCurrent ? 'pill-active active' : ''}`}
                        style={{
                          border: 'none',
                          background: isCurrent ? '#0284c7' : 'transparent',
                          color: isCurrent ? '#ffffff' : '#cbd5e1',
                          fontWeight: isCurrent ? 800 : 500,
                          fontSize: '0.73rem',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atlas Clinical AI Launcher in Header */}
              {setIsAtlasAiOpen && (
                <button
                  type="button"
                  onClick={() => setIsAtlasAiOpen(true)}
                  className="peptides-nav-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 750,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                  title="Open Atlas Clinical AI Assistant (Dosing Math, Synergies & Reconstitution)"
                >
                  <Sparkles size={13} color="#38bdf8" />
                  <span>Atlas AI</span>
                </button>
              )}
            </div>

            {/* Desktop Currency selector with prominent display */}
            <div
              className="currency-selector peptides-currency-bar desktop-only-currency"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap'
                }}
              >
                {isEs ? 'Divisa:' : 'Currency:'}
              </span>
              <div
                className="pill-group peptides-currency-pills"
                style={{
                  display: 'inline-flex',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  padding: '2px',
                  border: '1px solid rgba(255, 255, 255, 0.20)'
                }}
              >
                {[
                  { code: 'USD', symbol: '$' },
                  { code: 'EUR', symbol: '€' },
                  { code: 'AED', symbol: 'د.إ' }
                ].map(item => {
                  const isCurrent = currency === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleCurrencyChange && handleCurrencyChange(item.code)}
                      className={`pill-btn ${isCurrent ? 'pill-active active' : ''}`}
                      style={{
                        border: 'none',
                        background: isCurrent ? '#0284c7' : 'transparent',
                        color: isCurrent ? '#ffffff' : '#cbd5e1',
                        fontWeight: isCurrent ? 800 : 500,
                        fontSize: '0.73rem',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        boxShadow: isCurrent ? '0 1px 3px rgba(2,132,199,0.4)' : 'none',
                        transition: 'all 0.15s ease',
                        letterSpacing: '-0.01em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        flex: 1,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isCurrent && (
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            display: 'inline-block',
                            flexShrink: 0
                          }}
                        />
                      )}
                      <span>
                        {item.code} ({item.symbol})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Auth / Profile Access */}
            <div className="desktop-only-currency" style={{ marginLeft: '6px' }}>
              <GcpUserBadge variant="dark" lang={lang} loginRedirect="/pricing/peptides" />
            </div>

            {/* Mobile-Only Compact 1-Row Action Group */}
            <div className="mobile-only-header-actions" style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsCurrencySheetOpen && setIsCurrencySheetOpen(true)}
                aria-label="Select currency"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#f1f3f4',
                  color: '#202124',
                  border: '1px solid #dadce0',
                  borderRadius: '6px',
                  padding: '0 8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '32px',
                  minWidth: '68px',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em'
                }}
              >
                <span>{currency === 'AED' ? 'د.إ AED' : currency === 'EUR' ? '€ EUR' : '$ USD'}</span>
                <ChevronDown size={11} color="#5f6368" />
              </button>

              <button
                type="button"
                onClick={() => setIsAtlasAiOpen && setIsAtlasAiOpen(true)}
                aria-label="Open Atlas AI"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isAtlasAiOpen ? '#e0f2fe' : 'rgba(26, 115, 232, 0.08)',
                  color: '#1a73e8',
                  border: '1px solid rgba(26, 115, 232, 0.25)',
                  padding: '0 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  height: '32px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Sparkles size={13} />
                <span>AI</span>
              </button>

              {/* Mobile "More" Menu Trigger (⋮) */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsMobileMoreMenuOpen && setIsMobileMoreMenuOpen(!isMobileMoreMenuOpen)}
                  aria-label="More actions"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isMobileMoreMenuOpen ? '#e8f0fe' : '#f8fafc',
                    border: '1px solid #dadce0',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    color: '#202124',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <MoreVertical size={16} color="#202124" />
                </button>

                {isMobileMoreMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '38px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                      border: '1px solid #dadce0',
                      padding: '6px',
                      minWidth: '170px',
                      zIndex: 150,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'fadeIn 0.12s ease'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        if (setIsPdfPreviewOpen) setIsPdfPreviewOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Eye size={14} color="#0284c7" />
                      <span>{isEs ? 'Exportar PDF' : 'Export PDF'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        if (handleShareSchedule) handleShareSchedule();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Share2 size={14} color="#16a34a" />
                      <span>{copied ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Compartir' : 'Share')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMoreMenuOpen(false);
                        if (setInquiryProductContext) setInquiryProductContext(null);
                        if (setIsInquiryDrawerOpen) setIsInquiryDrawerOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: '#1e293b',
                        fontSize: '0.80rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <Mail size={14} color="#ea580c" />
                      <span>{isEs ? 'Consultar B2B' : 'B2B Inquiry'}</span>
                    </button>

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 650 }}>{isEs ? 'Idioma' : 'Language'}</span>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <button
                          type="button"
                          onClick={() => handleLanguageChange && handleLanguageChange('en')}
                          style={{
                            border: 'none',
                            background: lang === 'en' ? '#0284c7' : '#f1f5f9',
                            color: lang === 'en' ? '#ffffff' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          onClick={() => handleLanguageChange && handleLanguageChange('es')}
                          style={{
                            border: 'none',
                            background: lang === 'es' ? '#0284c7' : '#f1f5f9',
                            color: lang === 'es' ? '#ffffff' : '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 750,
                            cursor: 'pointer'
                          }}
                        >
                          ES
                        </button>
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />

                    {authUser ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: '#f8fafc', borderRadius: '6px' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: avatarBgColor,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.68rem',
                              fontWeight: 750,
                              flexShrink: 0
                            }}
                          >
                            {effectiveInitials}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 750, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {effectiveDisplayName}
                            </div>
                            <div style={{ fontSize: '0.58rem', color: '#5f6368', textTransform: 'uppercase', fontWeight: 700 }}>
                              {effectiveRoleLabel}
                            </div>
                          </div>
                        </div>

                        {authRole === 'admin' && (
                          <Link
                            href="/admin"
                            onClick={() => setIsMobileMoreMenuOpen(false)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: '#1e293b',
                              textDecoration: 'none'
                            }}
                          >
                            <ShieldCheck size={14} color="#1a73e8" />
                            <span>{isEs ? 'Panel Admin' : 'Admin Console'}</span>
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileMoreMenuOpen(false);
                            if (handleLogout) handleLogout();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'transparent',
                            color: '#dc2626',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={14} color="#dc2626" />
                          <span>{isEs ? 'Cerrar Sesión' : 'Sign Out'}</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href={`/login?redirect=${encodeURIComponent('/pricing/peptides')}`}
                        onClick={() => setIsMobileMoreMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: '#1a73e8',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'none'
                        }}
                      >
                        <LogIn size={14} color="#1a73e8" />
                        <span>{isEs ? 'Iniciar Sesión' : 'Sign In'}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GCP Currency Bottom Sheet (mobile) */}
      {isCurrencySheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={isEs ? 'Selecciona Divisa' : 'Select Currency'}
          onClick={() => setIsCurrencySheetOpen && setIsCurrencySheetOpen(false)}
          onKeyDown={e => {
            if (e.key === 'Escape' && setIsCurrencySheetOpen) {
              setIsCurrencySheetOpen(false);
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1150,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'flex-end'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#1e293b',
              borderRadius: '16px 16px 0 0',
              padding: '8px 20px 32px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.22s ease'
            }}
          >
            <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2, margin: '0 auto 20px' }} />
            <p style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '12px', textTransform: 'uppercase' }}>
              {isEs ? 'Selecciona Divisa' : 'Select Currency'}
            </p>
            {[
              { code: 'USD', symbol: '$', label: isEs ? 'Dólar Estadounidense' : 'US Dollar' },
              { code: 'EUR', symbol: '€', label: isEs ? 'Euro' : 'Euro' },
              { code: 'AED', symbol: 'د.إ', label: isEs ? 'Dírham EAU' : 'UAE Dirham' }
            ].map(c => {
              const isActive = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    if (handleCurrencyChange) handleCurrencyChange(c.code);
                    if (setIsCurrencySheetOpen) setIsCurrencySheetOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    background: isActive ? 'rgba(26, 115, 232, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    border: isActive ? '1px solid #1a73e8' : '1px solid transparent',
                    color: isActive ? '#60a5fa' : '#e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    gap: '12px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '28px' }}>{c.symbol}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.code}</span>
                  <span style={{ color: '#64748b', fontSize: '0.80rem', marginLeft: '4px' }}>{c.label}</span>
                  {isActive && (
                    <Check size={16} style={{ marginLeft: 'auto', color: '#1a73e8', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
