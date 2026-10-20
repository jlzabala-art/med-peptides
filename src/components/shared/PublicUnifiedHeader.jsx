"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FlaskConical,
  Layers,
  Copy,
  Check,
  ShieldCheck,
  ChevronRight,
  Activity,
  FileText,
  Search
} from '@/lib/icons';
import { Mail, Lock, Sparkles, LogIn, ChevronDown, LayoutDashboard, User, LogOut, FileInput, LayoutList, Home, Sliders, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';
import { useAuth } from '../../context/AuthContext';
import PublicInstitutionalInquiryDrawer from './PublicInstitutionalInquiryDrawer';
import PublicProviderCTA from './public/PublicProviderCTA';
import BrandLogo from '../common/BrandLogo';
import DatasheetQuickSearchModal from './DatasheetQuickSearchModal';
import '../../styles/publicStickyHeader.css';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' }
];

export default function PublicUnifiedHeader({
  // Active catalog track: 'peptides' | 'compounds' | 'protocols'
  track = 'peptides',
  // Active language code
  lang = 'en',
  onLangChange,
  // Custom canonical URL to copy, if any
  copyUrl,
  shortUrl,
  // Brand logo destination and title
  brandHref = '/c/CAT-MU9L9GBN',
  brandTitle = 'Atlas Health Services Clinical & Healthcare Intelligence',
  // Doctor home link & details for prescription view
  doctorHomeHref = null,
  doctorName = null,
  // Current supplier & slug for quick search switcher
  supplierName = null,
  currentSlug = '',
  // Institutional inquiry drawer parameters
  inquiryContextType = 'general', // 'product' | 'protocol' | 'catalog' | 'protocols_directory' | 'general'
  inquiryEntity = null,           // { name, slug, code, strength, category }
  onOpenInquiry,
  // Login redirect path
  loginRedirect,
  // Completely suppress second line (Tier 2) navigation
  hideTier2 = false,
  // Tier 2: Breadcrumbs
  breadcrumb = [],                // [ { label: 'Catalog', href: '/c/CAT-MU9L9GBN' }, { label: 'Tirzepatide' } ]
  // Tier 2: Anchor jumps for page sections
  anchorTabs = [],                // [ { id: 'overview', label: 'Overview', href: '#overview', count?: number } ]
  activeAnchorId: controlledActiveAnchorId = null,
  // Tier 2: Filter tabs (e.g. for /proto goal filters)
  filterTabs = [],                // [ { id: 'all', label: 'All', count: 77, isActive: true, onClick: () => {} } ]
  // Tier 2: Right-hand value incentive callout
  callout = null,                 // { message: '...', ctaLabel: '...', ctaHref: '...', ctaOnClick: () => {} }
  // Optional custom Tier 2 content
  customTier2 = null,
  // Hide contact / inquiry envelope button in Tier 1
  hideContactButton = false,
  // Hide global catalog search button (⌘K) in Tier 1
  hideSearchButton = false,
  // Hide Account Manager multi-portal hub button in Tier 1
  hideAccountManager = false,
  // Hide Atlas AI copilot button in Tier 1 (e.g. when present in floating bottom dock)
  hideAiButton = false,
  // Collection-aware search parameters
  collectionScope = null,
  collectionProducts = null,
  collectionTitle = null,
  onSelectCollectionProduct = null,
  // Doctor-only: enables Import Rx and Prescriptions Switcher buttons
  isDoctorView = false,
  hideImportRx = false,
  hideSwitchRx = false,
  onImportRx = null,
  onSwitchRx = null,
  rxSwitcherCount = 0,
  // White-Label Practice Branding
  clinicLogo = null,
  clinicName = null,
  // Sticky sub-banner (e.g. Doctor View / Patient View Mode indicator)
  banner = null
}) {
  const pathname = usePathname();
  const isPublicProductOrCatalogPage =
    pathname?.startsWith('/p/') ||
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/collection/') ||
    pathname?.startsWith('/catalog') ||
    pathname?.startsWith('/c/') ||
    pathname?.startsWith('/shared/') ||
    pathname?.startsWith('/rx/') ||
    pathname?.startsWith('/proto');
  const effectiveHideAccountManager = hideAccountManager || isPublicProductOrCatalogPage;

  const [isScrolled, setIsScrolled] = useState(false);
  const [internalInquiryOpen, setInternalInquiryOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(controlledActiveAnchorId || anchorTabs[0]?.id || '');
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const tabsContainerRef = useRef(null);
  const authDropdownRef = useRef(null);

  // Global ⌘K / Ctrl+K keyboard shortcut for instant datasheet search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync controlled anchor ID if passed
  useEffect(() => {
    if (controlledActiveAnchorId) {
      const timer = setTimeout(() => setActiveAnchor(controlledActiveAnchorId), 0);
      return () => clearTimeout(timer);
    }
  }, [controlledActiveAnchorId]);

  // Close auth dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setAuthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll listener for sticky compression & scrollspy
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          setIsScrolled(scrollY > 40);

          // Auto-highlight active anchor based on viewport visibility
          if (anchorTabs && anchorTabs.length > 0 && !controlledActiveAnchorId) {
            const anchorIds = anchorTabs.map(t => t.id).filter(Boolean);
            for (let i = anchorIds.length - 1; i >= 0; i--) {
              const el = document.getElementById(anchorIds[i]);
              if (el) {
                const rect = el.getBoundingClientRect();
                // If top of section is within upper viewport area
                if (rect.top <= 160) {
                  setActiveAnchor(anchorIds[i]);
                  break;
                }
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [anchorTabs, controlledActiveAnchorId]);

  // Language selector handler
  const handleLanguageChange = (nextLang) => {
    triggerHaptic('light');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
      } catch (_e) {
        // Ignore localStorage error
      }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.replaceState({}, '', url.toString());
    }
    if (onLangChange) {
      onLangChange(nextLang);
    }
  };

const CANONICAL_BASE_DOMAIN = 'https://www.atlashealth-services.com';

function forceCanonicalDomain(urlOrPath) {
  if (!urlOrPath) return CANONICAL_BASE_DOMAIN;
  const str = String(urlOrPath).trim();
  if (str.startsWith('/')) {
    return `${CANONICAL_BASE_DOMAIN}${str}`;
  }
  try {
    const parsed = new URL(str);
    return `${CANONICAL_BASE_DOMAIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return `${CANONICAL_BASE_DOMAIN}/${str.replace(/^https?:\/\/[^/]+/, '').replace(/^\//, '')}`;
  }
}

  // Copy link (distinct behavior per entity: doctor portals, prescriptions, and product monographs)
  const handleCopyLink = async () => {
    triggerHaptic('selection');
    let effectiveShortUrl = shortUrl ? forceCanonicalDomain(shortUrl) : null;
    let baseTarget = copyUrl ? forceCanonicalDomain(copyUrl) : '';
    if (!baseTarget && typeof window !== 'undefined') {
      baseTarget = forceCanonicalDomain(`${window.location.pathname}${window.location.search}${window.location.hash}`);
    }

    const isDoctor = isDoctorView || baseTarget.includes('/dr/') || baseTarget.includes('/doctor/');
    const isRx = baseTarget.includes('/rx/');

    // Distinct URL resolution per case:
    // 1. Doctor Portals: Always copy the authoritative, semantic /dr/[slug] URL (human-readable, verified OpenGraph profile)
    // 2. Prescriptions: Copy the canonical /rx/[code] or /rx/[code]?view=patient
    // 3. Products/Monographs: Resolve trackable short URL (/d/...) if not already present
    if (isDoctor || isRx) {
      if (!effectiveShortUrl) effectiveShortUrl = baseTarget;
    } else if (!effectiveShortUrl && baseTarget) {
      try {
        const res = await fetch('/api/short-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUrl: baseTarget,
            slug: currentSlug || '',
            assetType: 'variant_datasheet',
            recipient: { type: 'public' }
          })
        });
        const data = await res.json();
        if (data?.shortUrl) {
          effectiveShortUrl = forceCanonicalDomain(data.shortUrl);
        }
      } catch (e) {
        console.warn('Failed to resolve short URL on the fly:', e);
      }
    }

    const targetUrl = forceCanonicalDomain(effectiveShortUrl || baseTarget);
    if (!targetUrl) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = targetUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (isDoctor) {
        toast.success(lang === 'es' ? 'Enlace del portal médico copiado ✓' : 'Doctor practice portal link copied ✓');
      } else if (isRx) {
        toast.success(lang === 'es' ? 'Enlace de la prescripción copiado ✓' : 'Prescription dossier link copied ✓');
      } else if (effectiveShortUrl?.includes('/d/')) {
        toast.success(lang === 'es' ? 'Enlace corto copiado (sin marcas, ideal para WhatsApp) ✓' : 'Short link copied (clean preview for WhatsApp) ✓');
      } else {
        toast.success(lang === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error(lang === 'es' ? 'No se pudo copiar el enlace' : 'Failed to copy link');
    }
  };

  // Open institutional inquiry drawer
  const handleContactClick = () => {
    triggerHaptic('selection');
    if (onOpenInquiry) {
      onOpenInquiry();
    } else {
      setInternalInquiryOpen(true);
    }
  };

  // Smooth scroll to in-page section
  const handleAnchorClick = (e, targetId) => {
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      triggerHaptic('selection');
      setActiveAnchor(targetId);
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Update hash in URL without jump
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
    }
  };

  const { user, activeRole } = useAuth();
  const resolvedRedirect = loginRedirect || pathname || '/c/CAT-MU9L9GBN';
  const isSpanish = lang === 'es';

  const getDashboardPath = () => {
    if (activeRole === 'admin') return '/admin';
    if (activeRole === 'doctor' || activeRole === 'medical_director') return '/doctor';
    if (activeRole === 'wholesaler' || activeRole === 'wholeseller') return '/wholesaler';
    if (activeRole === 'supplier') return '/supplier';
    if (activeRole === 'clinic') return '/clinic';
    if (activeRole === 'pharmacy') return '/pharmacy';
    return '/patient';
  };

  return (
    <>
      <header className={`public-unified-header ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* ── Executive TopBar (Google Cloud Console Standard) ── */}
        <div className="puh-brand-row">
          <div className="puh-brand-row-inner">
            {/* Left: Brand Logo / Title or White-Label Clinic Logo */}
            <div className="puh-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {clinicLogo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={clinicLogo}
                    alt={clinicName || doctorName || 'Clinic Logo'}
                    style={{
                      maxHeight: '34px',
                      maxWidth: '140px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                      {clinicName || doctorName}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.02em' }}>
                      Powered by Atlas Health Platform
                    </span>
                  </div>
                </div>
              ) : (
                <Link href={brandHref || "/c/CAT-MU9L9GBN"} className="puh-brand-link" title={brandTitle || "Atlas Health Services Clinical & Healthcare Intelligence"}>
                  <BrandLogo variant="light" size="compact" />
                </Link>
              )}

              {doctorHomeHref && (
                <Link
                  href={doctorHomeHref}
                  className="puh-doctor-home-btn"
                  title={isSpanish ? `Volver al portal de ${doctorName || 'Médico'}` : `Return to portal of ${doctorName || 'Doctor'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.16)',
                    border: '1px solid rgba(255, 255, 255, 0.30)',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 650,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <ArrowLeft size={13} color="#ffffff" strokeWidth={2.5} />
                  <span>{doctorName ? (/práctica|practice|portal|verified|verificada/i.test(doctorName) || doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`) : (isSpanish ? 'Portal del Médico' : "Doctor's Portal")}</span>
                </Link>
              )}
            </div>

            {/* Right: Actions & Tools */}
            <div className="puh-actions-group">
              {/* Quick Datasheet Search Trigger (Algolia Spotlight Switcher) */}
              {!hideSearchButton && (
                <button
                  type="button"
                  className="puh-btn puh-btn-search"
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsSearchModalOpen(true);
                  }}
                  title={isSpanish ? 'Buscar en el catálogo clínico (⌘K)' : 'Search clinical catalog (⌘K)'}
                >
                  <Search size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Buscar' : 'Search'}</span>
                  <kbd className="puh-kbd-hint">⌘K</kbd>
                </button>
              )}

              {/* Account Manager Multi-Portal Hub (Only shown when not explicitly hidden) */}
              {!effectiveHideAccountManager && (
                <Link
                  href="/account-manager"
                  className="puh-btn puh-btn-ghost hide-on-extra-narrow"
                  title={isSpanish ? 'Consola de Account Manager (/account-manager)' : 'Account Manager Hub (/account-manager)'}
                  style={{ textDecoration: 'none' }}
                >
                  <Sliders size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Account Manager' : 'Account Mgr'}</span>
                </Link>
              )}

              {/* Language Selector */}
              <select
                className="puh-lang-select"
                value={lang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                aria-label="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>

              {/* Copy Canonical Link */}
              <button
                type="button"
                className="puh-btn puh-btn-ghost hide-on-extra-narrow"
                onClick={handleCopyLink}
                title={isSpanish ? 'Copiar enlace al portapapeles' : 'Copy link to clipboard'}
              >
                {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                <span className="puh-btn-label">
                  {copied
                    ? (isSpanish ? 'Copiado' : 'Copied')
                    : (isSpanish ? 'Copiar' : 'Copy')}
                </span>
              </button>

              {/* Doctor-only: Import Prescription button (hidden on /rx/intake itself or if hideImportRx is true) */}
              {isDoctorView && pathname !== '/rx/intake' && !hideImportRx && (
                <button
                  type="button"
                  className="puh-btn puh-btn-import-rx hide-on-extra-narrow"
                  onClick={() => {
                    triggerHaptic('selection');
                    if (onImportRx) onImportRx();
                    else window.location.href = '/rx/intake';
                  }}
                  title={isSpanish ? 'Importar datos (Rx y Analíticas Lab)' : 'Import Data (Rx & Lab Results)'}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                >
                  <FileInput size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Importar Datos' : 'Import Data'}</span>
                </button>
              )}

              {/* Doctor-only: My Prescriptions Switcher / Back button */}
              {isDoctorView && !hideSwitchRx && (
                <button
                  type="button"
                  className="puh-btn puh-btn-rx-switcher"
                  onClick={() => {
                    triggerHaptic('selection');
                    if (onSwitchRx) onSwitchRx();
                    else window.location.href = '/doctor/prescriptions';
                  }}
                  title={isSpanish ? 'Ver todas mis prescripciones' : 'Browse all my prescriptions'}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.22)',
                    color: '#ffffff',
                    fontWeight: 500,
                    position: 'relative'
                  }}
                >
                  <LayoutList size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Mis Prescripciones' : 'My Prescriptions'}</span>
                  {rxSwitcherCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      background: '#ea4335',
                      color: '#fff',
                      borderRadius: '50%',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}>{rxSwitcherCount > 9 ? '9+' : rxSwitcherCount}</span>
                  )}
                </button>
              )}

              {/* Clinical AI Copilot (hidden when in doctor view or when hideAiButton is true) */}
              {!isDoctorView && !hideAiButton && (
                <button
                  type="button"
                  className="puh-btn puh-btn-ai hide-on-extra-narrow hide-on-mobile-header"
                  onClick={() => {
                    triggerHaptic('selection');
                    window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
                  }}
                  title={isSpanish ? 'Abrir Asistente Clínico Atlas AI' : 'Open Atlas Clinical AI Research Copilot'}
                >
                  <Sparkles size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Atlas AI' : 'Atlas AI'}</span>
                </button>
              )}

              {/* Institutional Inquiry Drawer Trigger (if enabled) */}
              {!hideContactButton && (
                <button
                  type="button"
                  className="puh-btn puh-btn-contact hide-on-extra-narrow"
                  onClick={handleContactClick}
                  title={isSpanish ? 'Consulta Médica e Institucional (business@atlas-services.com)' : 'Contact Medical Affairs (business@atlas-services.com)'}
                >
                  <Mail size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Contacto' : 'Contact'}</span>
                </button>
              )}

              {/* GCP-Standard Single Auth Element — morphs by authentication state */}
              {user ? (
                <div className="puh-auth-pill-wrapper" ref={authDropdownRef}>
                  <button
                    type="button"
                    className={`puh-btn puh-btn-console puh-auth-pill${authDropdownOpen ? ' puh-auth-pill--open' : ''}`}
                    onClick={() => setAuthDropdownOpen(v => !v)}
                    aria-haspopup="true"
                    aria-expanded={authDropdownOpen}
                  >
                    <span className="puh-user-status-dot" aria-hidden="true" />
                    <span className="puh-user-avatar">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span className="puh-auth-label">
                      {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || (isSpanish ? 'Cuenta' : 'Account')}
                    </span>
                    <ChevronDown size={11} className={`puh-pill-chevron${authDropdownOpen ? ' puh-pill-chevron--up' : ''}`} />
                  </button>
                  {authDropdownOpen && (
                    <div className="puh-auth-dropdown" role="menu">
                      <div className="puh-auth-dropdown-header">
                        <span className="puh-dropdown-email">{user.email}</span>
                      </div>
                      <Link href={getDashboardPath()} className="puh-auth-dropdown-item" onClick={() => setAuthDropdownOpen(false)} role="menuitem">
                        <LayoutDashboard size={13} />
                        <span>{isSpanish ? 'Mi Consola' : 'Console'}</span>
                      </Link>
                      <Link href="/account" className="puh-auth-dropdown-item" onClick={() => setAuthDropdownOpen(false)} role="menuitem">
                        <User size={13} />
                        <span>{isSpanish ? 'Mi Cuenta' : 'Account'}</span>
                      </Link>
                      <Link href="/account-manager" className="puh-auth-dropdown-item" onClick={() => setAuthDropdownOpen(false)} role="menuitem">
                        <Sliders size={13} />
                        <span>{isSpanish ? 'Consola Account Manager' : 'Account Manager Hub'}</span>
                      </Link>
                      <div className="puh-auth-dropdown-divider" />
                      <button
                        type="button"
                        className="puh-auth-dropdown-item puh-auth-dropdown-item--danger"
                        onClick={async () => {
                          setAuthDropdownOpen(false);
                          try { const { getAuth, signOut } = await import('firebase/auth'); await signOut(getAuth()); } catch (_err) { /* ignore signout error */ }
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
                <Link
                  href={`/login?tab=login${loginRedirect ? `&redirect=${encodeURIComponent(loginRedirect)}` : ''}`}
                  className="puh-btn puh-btn-signin"
                  title={isSpanish ? 'Iniciar sesión o registrarse' : 'Sign in or create account'}
                >
                  <LogIn size={13} className="puh-btn-icon" />
                  <span className="puh-auth-label">{isSpanish ? 'Iniciar Sesión' : 'Sign In'}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── Line 2: Contextual Navigation & Value Incentive Strip ── */}
        {!hideTier2 && (
          <div className="puh-tier2">
            <div className="puh-tier2-inner">
              {customTier2 ? (
                customTier2
              ) : (
                <>
                  {/* Left Side: Breadcrumb, In-Page Anchor Tabs, or Filter Tabs */}
                  <div className="puh-tier2-left" ref={tabsContainerRef}>
                    {/* Breadcrumbs */}
                    {breadcrumb && breadcrumb.length > 0 && (
                      <div className="puh-breadcrumb" aria-label="Breadcrumb">
                        {breadcrumb.map((crumb, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="puh-breadcrumb-sep">/</span>}
                            {crumb.href ? (
                              <Link href={crumb.href} className="puh-breadcrumb-link">
                                {crumb.label}
                              </Link>
                            ) : (
                              <span className="puh-breadcrumb-curr">{crumb.label}</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    {/* Anchor Jump Tabs */}
                    {anchorTabs && anchorTabs.length > 0 && (
                      <div className="puh-anchor-tabs" role="tablist">
                        {anchorTabs.map((tab) => {
                          const isActive = activeAnchor === tab.id;
                          return (
                            <a
                              key={tab.id}
                              href={tab.href || `#${tab.id}`}
                              className={`puh-anchor-tab ${isActive ? 'is-active' : ''}`}
                              onClick={(e) => handleAnchorClick(e, tab.id)}
                              role="tab"
                              aria-selected={isActive}
                            >
                              <span>{tab.label}</span>
                              {typeof tab.count === 'number' && (
                                <span className="puh-tab-count">({tab.count})</span>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Filter Tabs (e.g. Category/Goal filters) */}
                    {filterTabs && filterTabs.length > 0 && (
                      <div className="puh-anchor-tabs" role="tablist">
                        {filterTabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            className={`puh-anchor-tab ${tab.isActive ? 'is-active' : ''}`}
                            onClick={() => {
                              triggerHaptic('selection');
                              if (tab.onClick) tab.onClick();
                            }}
                            role="tab"
                            aria-selected={tab.isActive}
                          >
                            <span>{tab.label}</span>
                            {typeof tab.count === 'number' && (
                              <span className="puh-tab-count">({tab.count})</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Side: Professional Value-Driven Provider Access CTA */}
                  {callout && (
                    <PublicProviderCTA
                      message={callout.message}
                      ctaLabel={callout.ctaLabel}
                      ctaHref={callout.ctaHref}
                      ctaOnClick={callout.ctaOnClick}
                      className="puh-callout-strip"
                    />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* View-mode / announcement sticky sub-banner (Doctor View / Patient View) */}
        {banner && (
          <div className="puh-sticky-banner-slot" style={{ width: '100%' }}>
            {banner}
          </div>
        )}
      </header>

      {/* Institutional Inquiry Drawer (Internal instance if not controlled externally) */}
      {!onOpenInquiry && (
        <PublicInstitutionalInquiryDrawer
          isOpen={internalInquiryOpen}
          onClose={() => setInternalInquiryOpen(false)}
          contextType={inquiryContextType}
          initialEntity={inquiryEntity}
          lang={lang}
        />
      )}

      {/* Quick Datasheet Search Spotlight Modal (Collection-Aware) */}
      <DatasheetQuickSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currentSupplier={supplierName}
        currentSlug={currentSlug}
        lang={lang}
        collectionScope={collectionScope}
        collectionProducts={collectionProducts}
        collectionTitle={collectionTitle}
        onSelectCollectionProduct={onSelectCollectionProduct}
      />
    </>
  );
}
