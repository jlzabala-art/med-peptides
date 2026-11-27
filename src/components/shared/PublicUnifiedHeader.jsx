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
import { Mail, Lock, Sparkles, LogIn, ChevronDown, LayoutDashboard, LayoutGrid, User, LogOut, FileInput, LayoutList, Home, Sliders, ArrowLeft, HelpCircle, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';
import { useAuth } from '../../context/AuthContext';
import { useSurfacePolicy } from '../../hooks/useSurfacePolicy';
import { usePublicWorkspace } from '../../context/PublicWorkspaceContext';
import { useAtlasContext } from '../../context/AtlasContextProvider';
import PublicInstitutionalInquiryDrawer from './PublicInstitutionalInquiryDrawer';
import PublicProviderCTA from './public/PublicProviderCTA';
import AtlasAppSwitcher from './public/AtlasAppSwitcher';
import ActiveClinicalPill from './ActiveClinicalPill';
import B2BUniversalMenu from './B2BUniversalMenu';
import BrandLogo from '../common/BrandLogo';
import DatasheetQuickSearchModal from './DatasheetQuickSearchModal';
import GcpUserBadge from './GcpUserBadge';
import PublicLocaleModal from './PublicLocaleModal';
import '../../styles/publicStickyHeader.css';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' }
];

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', symbol: '€', label: '€ EUR' },
  { code: 'USD', symbol: '$', label: '$ USD' },
  { code: 'AED', symbol: 'د.إ', label: 'AED' }
];

export default function PublicUnifiedHeader({
  // Active catalog track: 'peptides' | 'compounds' | 'protocols'
  track = 'peptides',
  // Active language code
  lang = 'en',
  onLangChange,
  // Active currency code ('EUR' | 'USD' | 'AED')
  currency = null,
  onCurrencyChange = null,
  hideCurrencySelector = false,
  // Custom canonical URL to copy, if any
  copyUrl,
  shortUrl,
  // Brand logo destination and title
  brandHref = '/',
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
  // Hide canonical copy button in Tier 1
  hideCopyButton = false,
  // Hide global catalog search button (⌘K) in Tier 1
  hideSearchButton = false,
  hideAppSwitcher = false,
  // Hide Account Manager multi-portal hub button in Tier 1
  hideAccountManager = false,
  // Hide Atlas AI copilot button in Tier 1 (e.g. when present in floating bottom dock)
  hideAiButton = false,
  onOpenAi = null,
  // Optional extra action buttons rendered consistently before Contact / User Badge
  extraActions = null,
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
  whiteLabel = false,
  partnerName = '',
  clinicLogo = null,
  clinicName = null,
  // Sticky sub-banner (e.g. Doctor View / Patient View Mode indicator)
  banner = null,
  // Mobile Atlas App Bar contextual title & subtitle (Rule #74; auto-derived from breadcrumb if omitted)
  mobileTitle = null,
  mobileSubtitle = null,
  // 100% pure public mode: hides internal user/admin portal badge for clean shareable clinical guides
  purePublic = false
}) {
  const pathname = usePathname();
  const surfacePolicy = useSurfacePolicy();
  const isPublicProductOrCatalogPage =
    pathname?.startsWith('/p/') ||
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/collection/') ||
    pathname?.startsWith('/catalog') ||
    pathname?.startsWith('/c/') ||
    pathname?.startsWith('/shared/') ||
    pathname?.startsWith('/rx/') ||
    pathname?.startsWith('/proto') ||
    pathname?.startsWith('/compounding') ||
    pathname?.startsWith('/guides');
  const effectiveHideAccountManager = hideAccountManager || isPublicProductOrCatalogPage || purePublic;

  // Rule #69: Atlas AI lives in ONE place (the universal Bottom Sticky Bar), never duplicated in the top header.
  const effectiveHideAiButton = true;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const [internalInquiryOpen, setInternalInquiryOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLocaleModalOpen, setIsLocaleModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(controlledActiveAnchorId || anchorTabs[0]?.id || '');
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);
  const tabsContainerRef = useRef(null);
  const authDropdownRef = useRef(null);
  const appSwitcherRef = useRef(null);
  const workspace = usePublicWorkspace();
  const { screenContext } = useAtlasContext();
  const { user, activeRole } = useAuth();
  const isSpanish = lang === 'es';

  // Future-proof context guards (prevent duplicate or irrelevant header actions)
  const isPricingOrCatalogRoute =
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/shared/catalog') ||
    pathname?.startsWith('/quotation') ||
    pathname?.startsWith('/c/') ||
    pathname?.startsWith('/collection') ||
    pathname?.startsWith('/vials') ||
    pathname?.startsWith('/b2b');
  const effectiveHideCurrencySelector = hideCurrencySelector || (!onCurrencyChange && !isPricingOrCatalogRoute);
  const effectiveHideCopyButton = hideCopyButton || Boolean(pathname?.startsWith('/rx/intake'));
  const effectiveHideContactButton = hideContactButton || Boolean(screenContext?.bottomBar?.primaryAction);
  const isAuthorizedDoctorRole = ['doctor', 'medical_director', 'admin'].includes(activeRole);
  const isClinicalNonQuoteRoute = Boolean(pathname?.startsWith('/rx') || pathname?.startsWith('/verify'));

  // Auto-derived fallback Breadcrumb when page doesn't pass explicit breadcrumb or anchorTabs
  const effectiveBreadcrumb = (() => {
    if (breadcrumb && breadcrumb.length > 0) return breadcrumb;
    if (anchorTabs && anchorTabs.length > 0) return null;
    if (!pathname || pathname === '/') return null;

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return null;

    const sectionLabels = {
      p: isSpanish ? 'Catálogo' : 'Catalog',
      raw: isSpanish ? 'APIs Farmacéuticos' : 'Raw APIs',
      proto: isSpanish ? 'Protocolos' : 'Protocols',
      c: isSpanish ? 'Colecciones' : 'Collections',
      collection: isSpanish ? 'Colecciones' : 'Collections',
      lab: isSpanish ? 'Resultados Lab' : 'Lab Dossier',
      rx: isSpanish ? 'Prescripción' : 'E-Rx',
      dr: isSpanish ? 'Médicos' : 'Physicians',
      verify: isSpanish ? 'Verificación' : 'Batch Verify',
      pricing: isSpanish ? 'Tarifas B2B' : 'Price Schedules',
      calculator: isSpanish ? 'Calculadora' : 'Calculator',
      compounding: isSpanish ? 'Formulación' : 'Compounding',
    };

    const rootHrefMap = {
      p: '/collection/peptides',
      raw: '/collection/apis',
      proto: '/proto',
      c: '/collection/peptides',
      collection: '/collection/peptides',
      pricing: '/pricing',
    };

    const first = segments[0];
    const items = [{ label: isSpanish ? 'Inicio' : 'Home', href: '/' }];
    const sectionLabel = sectionLabels[first] || first.charAt(0).toUpperCase() + first.slice(1);
    if (segments.length === 1) {
      items.push({ label: sectionLabel });
    } else {
      items.push({ label: sectionLabel, href: rootHrefMap[first] || undefined });
      const rawLast = decodeURIComponent(segments[segments.length - 1]);
      const formattedLast = screenContext?.contextAnchor?.name || rawLast.replace(/-/g, ' ');
      items.push({ label: formattedLast });
    }
    return items;
  })();

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

  // Close auth & app switcher dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(e.target)) {
        setAuthDropdownOpen(false);
      }
      if (appSwitcherRef.current && !appSwitcherRef.current.contains(e.target)) {
        setAppSwitcherOpen(false);
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

          // Rule #74: Smart hide-on-scroll down / reveal-on-scroll up for mobile App Bar
          const delta = scrollY - (lastScrollYRef.current || 0);
          if (scrollY <= 64) {
            setIsHeaderHidden(false);
          } else if (delta > 8 && scrollY > 110) {
            setIsHeaderHidden(true);
          } else if (delta < -6) {
            setIsHeaderHidden(false);
          }
          lastScrollYRef.current = scrollY;

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

  const effectiveLang = workspace?.lang || lang || 'en';
  const effectiveCurrency = currency || workspace?.currency || internalCurrency || 'USD';

  // Language selector handler
  const handleLanguageChange = (nextLang) => {
    triggerHaptic('light');
    if (workspace?.setLang) {
      workspace.setLang(nextLang);
    }
    if (onLangChange) {
      onLangChange(nextLang);
    }
  };

  // Currency selector state & handler (EUR / USD / AED)
  const [internalCurrency, setInternalCurrency] = useState(currency || workspace?.currency || 'USD');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const sp = new URLSearchParams(window.location.search);
      const urlCur = (sp.get('cur') || sp.get('currency') || '').toUpperCase();
      const storedCur = (localStorage.getItem('atlas_portal_currency') || '').toUpperCase();
      const resolved = SUPPORTED_CURRENCIES.some(c => c.code === urlCur)
        ? urlCur
        : SUPPORTED_CURRENCIES.some(c => c.code === storedCur)
          ? storedCur
          : (currency || workspace?.currency || 'USD');
      setInternalCurrency(resolved);
    } catch (_e) {}
  }, [currency, workspace?.currency]);

  const handleCurrencyChange = (nextCurrency) => {
    triggerHaptic('light');
    setInternalCurrency(nextCurrency);
    if (workspace?.setCurrency) {
      workspace.setCurrency(nextCurrency);
    }
    if (onCurrencyChange) {
      onCurrencyChange(nextCurrency);
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

  const resolvedRedirect = loginRedirect || pathname || '/c/CAT-MU9L9GBN';

  const getDashboardPath = () => {
    if (activeRole === 'admin') return '/admin';
    if (activeRole === 'doctor' || activeRole === 'medical_director') return '/doctor';
    if (activeRole === 'wholesaler' || activeRole === 'wholeseller') return '/wholesaler';
    if (activeRole === 'supplier') return '/supplier';
    if (activeRole === 'clinic') return '/clinic';
    if (activeRole === 'pharmacy') return '/pharmacy';
    return '/patient';
  };

  // Rule #74: Derive contextual mobile App Bar title, subtitle, and back link automatically
  const lastCrumb = Array.isArray(effectiveBreadcrumb) && effectiveBreadcrumb.length > 0
    ? effectiveBreadcrumb[effectiveBreadcrumb.length - 1]
    : null;
  const parentCrumb = Array.isArray(effectiveBreadcrumb) && effectiveBreadcrumb.length > 1
    ? effectiveBreadcrumb[effectiveBreadcrumb.length - 2]
    : null;
  const resolvedMobileBackHref = doctorHomeHref || parentCrumb?.href || null;
  const resolvedMobileTitle = mobileTitle || lastCrumb?.label || clinicName || partnerName || 'Atlas Health';
  const resolvedMobileSubtitle =
    mobileSubtitle ||
    (doctorName
      ? (doctorName.startsWith('Dr') ? doctorName : `Dr. ${doctorName}`)
      : (parentCrumb?.label || (isSpanish ? 'Atlas Health Services' : 'Atlas Health Services')));

  return (
    <>
      <header className={`public-unified-header ${isScrolled ? 'is-scrolled' : ''} ${isHeaderHidden ? 'is-hidden-mobile' : ''}`}>
        {/* ── Executive TopBar (Google Cloud Console Standard / Rule #74 Atlas Mobile App Bar) ── */}
        <div className="puh-brand-row">
          <div className="puh-brand-row-inner">
            {/* Left: Back (mobile detail) or App Switcher + Brand Logo + Contextual Mobile Title */}
            <div className="puh-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              {resolvedMobileBackHref && (
                <Link
                  href={resolvedMobileBackHref}
                  className="puh-mobile-back-btn"
                  aria-label={isSpanish ? 'Volver' : 'Back'}
                  title={isSpanish ? 'Volver' : 'Back'}
                >
                  <ArrowLeft size={19} color="#ffffff" strokeWidth={2.2} />
                </Link>
              )}
              {surfacePolicy.canSeeAppSwitcher && !whiteLabel && !hideAppSwitcher && (
                <div className="puh-desktop-only-switcher">
                  <AtlasAppSwitcher
                  isSpanish={isSpanish}
                  portalHref={getDashboardPath()}
                  variant="dark"
                  extraFooter={(closeMenu) =>
                    (!isClinicalNonQuoteRoute && workspace?.rfqItems?.length > 0) ? (
                      <button
                        type="button"
                        onClick={() => {
                          closeMenu();
                          workspace?.setIsQuoteDrawerOpen?.(true);
                        }}
                        style={{
                          marginTop: '4px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          color: '#003666',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        <span>{isSpanish ? 'Cotización Activa' : 'Active Quote Cart'}</span>
                        <span style={{ background: '#003666', color: '#ffffff', borderRadius: '999px', padding: '1px 7px', fontSize: '0.72rem' }}>
                          {workspace.rfqItems.length}
                        </span>
                      </button>
                    ) : null
                  }
                />
                </div>
              )}

              {!purePublic && !whiteLabel && (
                <div className="puh-desktop-only-pill">
                  <ActiveClinicalPill isSpanish={isSpanish} />
                </div>
              )}

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
                    {!whiteLabel && (
                      <span style={{ fontSize: '0.62rem', color: 'rgba(255, 255, 255, 0.7)', letterSpacing: '0.02em' }}>
                        Powered by Atlas Health Platform
                      </span>
                    )}
                  </div>
                </div>
              ) : whiteLabel && partnerName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {partnerName}
                  </span>
                </div>
              ) : surfacePolicy.canNavigateBrandHome ? (
                <Link href={brandHref || "/c/CAT-MU9L9GBN"} className="puh-brand-link" title={brandTitle || "Atlas Health Services Clinical & Healthcare Intelligence"}>
                  <BrandLogo variant="light" size="compact" />
                </Link>
              ) : (
                <div className="puh-brand-link" title={brandTitle || "Atlas Health Services Clinical & Healthcare Intelligence"}>
                  <BrandLogo variant="light" size="compact" />
                </div>
              )}

              {/* Rule #74: Single-row Mobile Contextual Title + 1-line Subtitle (replaces 2nd-row breadcrumb on ≤768px) */}
              <div className="puh-mobile-context-title">
                <span className="puh-mobile-title-main">{resolvedMobileTitle}</span>
                {resolvedMobileSubtitle && resolvedMobileSubtitle !== resolvedMobileTitle && (
                  <span className="puh-mobile-title-sub">{resolvedMobileSubtitle}</span>
                )}
              </div>

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
              {surfacePolicy.canSeeGlobalSearch && !hideSearchButton && (
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



              {/* Google Cloud Console Standard Mobile Locale Trigger (Opens Bottom Sheet) */}
              <button
                type="button"
                className="puh-locale-trigger"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsLocaleModalOpen(true);
                }}
                title={isSpanish ? 'Preferencias regionales (idioma y divisa)' : 'Regional preferences (language and currency)'}
                aria-label={isSpanish ? 'Cambiar idioma y divisa' : 'Change language and currency'}
              >
                <Globe size={14} />
                <span className="puh-locale-lang-code">{lang.toUpperCase()}</span>
                {!effectiveHideCurrencySelector && (
                  <>
                    <span className="puh-locale-sep">·</span>
                    <span className="puh-locale-cur-symbol">
                      {SUPPORTED_CURRENCIES.find((c) => c.code === effectiveCurrency)?.symbol || effectiveCurrency}
                    </span>
                  </>
                )}
              </button>

              {/* Currency Selector (Segmented Pills Google Cloud UX Standard: EUR / USD / AED) */}
              {!effectiveHideCurrencySelector && (
                <div
                  className="puh-currency-pills"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: '6px',
                    padding: '2px',
                    gap: '1px'
                  }}
                  role="group"
                  aria-label={isSpanish ? 'Selector de divisa' : 'Currency selector'}
                >
                  {SUPPORTED_CURRENCIES.map((c) => {
                    const isCurrent = effectiveCurrency === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleCurrencyChange(c.code)}
                        style={{
                          border: 'none',
                          background: isCurrent ? '#0284c7' : 'transparent',
                          color: isCurrent ? '#ffffff' : 'rgba(255,255,255,0.7)',
                          fontWeight: isCurrent ? 800 : 500,
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          whiteSpace: 'nowrap'
                        }}
                        title={`${isSpanish ? 'Mostrar precios en' : 'Display prices in'} ${c.code}`}
                      >
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Language Selector (Segmented Pills Google Cloud UX Standard) */}
              <div className="puh-lang-pills" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '6px', padding: '2px' }}>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleLanguageChange(l.code)}
                    style={{
                      border: 'none',
                      background: effectiveLang === l.code ? '#0284c7' : 'transparent',
                      color: effectiveLang === l.code ? '#ffffff' : 'rgba(255,255,255,0.7)',
                      fontWeight: effectiveLang === l.code ? 800 : 500,
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={l.code === 'es' ? 'Español' : 'English'}
                  >
                    {l.label}
                  </button>
                ))}
              </div>

              {/* Copy Canonical Link */}
              {!effectiveHideCopyButton && (
              <button
                type="button"
                className="puh-btn puh-btn-ghost hide-on-mobile-header"
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
              )}

              {/* Doctor-only: Import Prescription button (role-guarded & hidden on /rx/intake) */}
              {isDoctorView && isAuthorizedDoctorRole && pathname !== '/rx/intake' && !hideImportRx && (
                <button
                  type="button"
                  className="puh-btn puh-btn-import-rx hide-on-mobile-header"
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
              {isDoctorView && isAuthorizedDoctorRole && !hideSwitchRx && (
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

              {/* Extra page-specific actions (e.g. Share, Export, Print) */}
              {extraActions}

              {/* Unified Atlas AI Copilot Trigger */}
              {!effectiveHideAiButton && (
                <button
                  type="button"
                  className="puh-btn puh-btn-ai"
                  onClick={() => {
                    triggerHaptic('selection');
                    if (onOpenAi) {
                      onOpenAi();
                    } else if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
                      window.dispatchEvent(new CustomEvent('open-atlas-ai'));
                    }
                  }}
                  title={isSpanish ? 'Preguntar a Atlas AI' : 'Ask Atlas AI'}
                >
                  <Sparkles size={14} />
                  <span className="puh-btn-label">Atlas AI</span>
                </button>
              )}

              {/* Institutional Inquiry Drawer Trigger (auto-hidden when bottom dock already has a primary CTA) */}
              {!effectiveHideContactButton && (
                <button
                  type="button"
                  className="puh-btn puh-btn-contact hide-on-mobile-header"
                  onClick={handleContactClick}
                  title={isSpanish ? 'Consulta Médica e Institucional (info@atlashealth-services.com)' : 'Contact Medical Affairs (info@atlashealth-services.com)'}
                >
                  <Mail size={14} />
                  <span className="puh-btn-label">{isSpanish ? 'Contacto' : 'Contact'}</span>
                </button>
              )}

              <button
                type="button"
                className="puh-btn puh-btn-ghost hide-on-mobile-header"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-atlas-help-drawer'));
                  }
                }}
                title={isSpanish ? 'Ayuda inteligente Atlas AI (?)' : 'Atlas AI Contextual Help (?)'}
                aria-label={isSpanish ? 'Ayuda' : 'Help'}
                style={{ padding: '0 8px', minWidth: '32px' }}
              >
                <HelpCircle size={15} />
              </button>

              {/* Google Cloud Console UX Standard User Badge — ALWAYS visible on every screen */}
              <GcpUserBadge
                variant="dark"
                lang={effectiveLang}
                onLangChange={handleLanguageChange}
                currency={effectiveCurrency}
                onCurrencyChange={handleCurrencyChange}
                hideCurrencySelector={effectiveHideCurrencySelector}
                loginRedirect={resolvedRedirect}
              />
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
                    {effectiveBreadcrumb && effectiveBreadcrumb.length > 0 && (
                      <div className="puh-breadcrumb" aria-label="Breadcrumb">
                        {effectiveBreadcrumb.map((crumb, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="puh-breadcrumb-sep">/</span>}
                            {crumb.href && surfacePolicy.canSeeGlobalBreadcrumbs ? (
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
      </header>

      {/* Rule #74: Non-sticky banner slot below header so banners never steal viewport height on scroll */}
      {banner && (
        <div className="puh-nonsticky-banner-slot" style={{ width: '100%' }}>
          {banner}
        </div>
      )}

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

      {/* Google Cloud Console Standard Mobile Regional Settings Bottom Sheet */}
      <PublicLocaleModal
        isOpen={isLocaleModalOpen}
        onClose={() => setIsLocaleModalOpen(false)}
        lang={lang}
        onLangChange={handleLanguageChange}
        currency={effectiveCurrency}
        onCurrencyChange={handleCurrencyChange}
        hideCurrency={effectiveHideCurrencySelector}
      />

      {surfacePolicy.canSeeB2BDrawer && !purePublic && !whiteLabel && (
        <B2BUniversalMenu isSpanish={isSpanish} />
      )}
    </>
  );
}
