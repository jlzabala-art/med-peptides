'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Compass,
  Search,
  Tags,
  Layers,
  FileText,
  Copy,
  Check,
  FlaskConical,
  Calculator,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import {
  B2B_NAV_DOMAINS,
  getRelatedRoutes,
  getActiveDomainId
} from '@/constants/b2bNavigationGraph';
import { useActiveClinicalStore } from '@/store/useActiveClinicalStore';
import { useSurfacePolicy } from '@/hooks/useSurfacePolicy';

/**
 * B2BUniversalMenu
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified B2B contextual navigation menu for both Laptop and Mobile:
 *  - Laptop (>= 1024px): Slide-over contextual rail (Cmd/Ctrl+B or edge/header trigger)
 *    with "Related to this screen" pinned at top + 4 collapsible B2B domains.
 *  - Mobile (< 1024px): Thumb-friendly bottom bar (44px+ targets) + swipe-style
 *    Bottom Sheet with Related Screens, Active Rx Context, and B2B domains.
 */
export default function B2BUniversalMenu({
  isSpanish = false,
  controlledOpen = null,
  onControlledOpenChange = null,
  hideMobileBar = false
}) {
  const pathname = usePathname() || '/';
  const { canSeeB2BDrawer } = useSurfacePolicy();
  const [isPatientRoute, setIsPatientRoute] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setIsPatientRoute(params.get('view') === 'patient');
  }, [pathname]);
  const [copiedCatalog, setCopiedCatalog] = useState(null);
  const [mobileSheetMode, setMobileSheetMode] = useState('all'); // 'all' | 'related'
  const [openDomainId, setOpenDomainId] = useState(() => getActiveDomainId(pathname));
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenDomainId(getActiveDomainId(pathname));
  }

  const isOpen = controlledOpen !== null ? controlledOpen : internalOpen;
  const setOpen = (next) => {
    if (onControlledOpenChange) onControlledOpenChange(next);
    else setInternalOpen(next);
  };

  const { activeRxCode, patientName } = useActiveClinicalStore();
  const relatedRoutes = getRelatedRoutes(pathname);
  const isRouteActive = (href) => {
    if (href === '/' || href === '/pricing' || href === '/catalog') return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  const expandedDomain = B2B_NAV_DOMAINS.find((d) => d.id === openDomainId);
  const expandedItemIds = new Set((expandedDomain?.items || []).map((i) => i.id));
  const dedupedRelatedRoutes = relatedRoutes.filter(
    (r) => !expandedItemIds.has(r.id) && !isRouteActive(r.href)
  );

  useEffect(() => {
    if (!canSeeB2BDrawer) return undefined;
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const triggerGlobalSearch = () => {
    setOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true }));
    }
  };

  if (!canSeeB2BDrawer || isPatientRoute) {
    return null;
  }

  return (
    <>
      <style>{`
        .b2b-edge-trigger {
          position: fixed;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9900;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 6px;
          background: #003666;
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.2);
          border-left: none;
          border-radius: 0 8px 8px 0;
          box-shadow: 2px 4px 14px rgba(15, 23, 42, 0.18);
          cursor: pointer;
          font-size: 0.66rem;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .b2b-edge-trigger:hover {
          background: #0f4c81;
          padding-left: 9px;
        }
        .b2b-mobile-bottom-bar {
          display: none;
        }
        @media (max-width: 1023px) {
          .b2b-edge-trigger {
            display: none !important;
          }
          ${!hideMobileBar ? `
          .atlas-hide-when-footer-nav {
            display: none !important;
          }
          ` : ''}
          .b2b-mobile-bottom-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 9920;
            height: 58px;
            background: #ffffff;
            border-top: 1px solid #cbd5e1;
            box-shadow: 0 -4px 18px rgba(15, 23, 42, 0.08);
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            padding: 4px 6px env(safe-area-inset-bottom, 4px);
          }
        }
        .b2b-mobile-tab-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          min-height: 44px;
          border: none;
          background: transparent;
          color: #475569;
          font-size: 0.65rem;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          border-radius: 8px;
        }
        .b2b-mobile-tab-btn.is-active,
        .b2b-mobile-tab-btn:active {
          color: #003666;
          background: #eff6ff;
        }
      `}</style>

      {/* ── Laptop Left-Edge Persistent Trigger (always reachable, 0 layout squeeze) ── */}
      {!isOpen && (
        <button
          type="button"
          className="b2b-edge-trigger no-print"
          onClick={() => {
            setMobileSheetMode('all');
            setOpen(true);
          }}
          title={isSpanish ? 'Abrir Menú B2B y Pantallas Relacionadas (⌘B)' : 'Open B2B Menu & Related Screens (⌘B)'}
          aria-label={isSpanish ? 'Menú B2B' : 'B2B Menu'}
        >
          <Menu size={14} />
          <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>B2B</span>
        </button>
      )}

      {/* ── Mobile Fixed Bottom Navigation Bar (< 1024px) — Rule #74 Page-Aware Bar ── */}
      {!hideMobileBar && (() => {
        const isRx = pathname.startsWith('/rx/');
        const isGuideOrProto = pathname.startsWith('/proto') || pathname.startsWith('/guides');
        const isMonograph = pathname.startsWith('/p/');

        const firstBtnLabel = isRx
          ? (isSpanish ? 'Inicio Rx' : 'Rx Top')
          : isGuideOrProto
            ? (isSpanish ? 'Índice' : 'Contents')
            : isMonograph
              ? (isSpanish ? 'Secciones' : 'Sections')
              : (isSpanish ? 'Filtros' : 'Filters');

        const handleFirstBtnClick = () => {
          if (isRx && typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('atlas-open-page-filters'));
          }
          if (pathname.startsWith('/pricing/') || pathname.startsWith('/catalog') || pathname.startsWith('/collection/')) {
            return;
          }
          setMobileSheetMode('related');
          setOpen(true);
        };

        return (
          <nav
            className="b2b-mobile-bottom-bar no-print"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            aria-label={isSpanish ? 'Navegación B2B móvil' : 'Mobile B2B navigation'}
          >
            <button
              type="button"
              className={`b2b-mobile-tab-btn ${!isRx && isOpen && mobileSheetMode === 'related' ? 'is-active' : ''}`}
              onClick={handleFirstBtnClick}
            >
              {isRx ? <FileText size={17} /> : isGuideOrProto || isMonograph ? <Compass size={17} /> : <SlidersHorizontal size={17} />}
              <span>{firstBtnLabel}</span>
            </button>

            <button
              type="button"
              className="b2b-mobile-tab-btn"
              onClick={triggerGlobalSearch}
            >
              <Search size={17} />
              <span>{isSpanish ? 'Buscar' : 'Search'}</span>
            </button>

            <button
              type="button"
              className="b2b-mobile-tab-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
                }
              }}
            >
              <Sparkles size={17} color="#7c3aed" />
              <span>Atlas AI</span>
            </button>

            <button
              type="button"
              className={`b2b-mobile-tab-btn ${isOpen && mobileSheetMode === 'all' ? 'is-active' : ''}`}
              onClick={() => {
                setMobileSheetMode('all');
                setOpen(true);
              }}
            >
              <Menu size={17} />
              <span>{isSpanish ? 'Menú' : 'Menu'}</span>
            </button>
          </nav>
        );
      })()}

      {/* ── Unified Responsive Drawer (Left Rail on Laptop / Bottom Sheet on Mobile) ── */}
      {isOpen && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10060,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'stretch'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={isSpanish ? 'Menú B2B Contextual' : 'Contextual B2B Menu'}
            style={{
              width: 'min(320px, 92vw)',
              height: '100%',
              background: '#ffffff',
              boxShadow: '8px 0 32px rgba(15, 23, 42, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#003666',
                color: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} />
                <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.02em' }}>
                  {isSpanish ? 'Navegación B2B' : 'B2B Navigation'}
                </span>
                <span className="hide-on-mobile-header" style={{ fontSize: '0.65rem', opacity: 0.75, background: 'rgba(255,255,255,0.16)', padding: '1px 6px', borderRadius: '4px' }}>
                  ⌘B
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={isSpanish ? 'Cerrar menú' : 'Close menu'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body (Rule #7: Search First) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {/* 1. Quick Search (Desktop rail; on mobile Search lives in bottom bar) */}
              <button
                type="button"
                className="hide-on-mobile-header"
                onClick={triggerGlobalSearch}
                style={{
                  width: '100%',
                  minHeight: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                  marginBottom: '10px',
                  borderRadius: '8px',
                  border: '1px solid #dadce0',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={14} color="#5f6368" />
                  <span>{isSpanish ? 'Buscar en todo el portal…' : 'Search entire portal…'}</span>
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  ⌘K
                </span>
              </button>

              {/* 2. Page-Aware Atlas AI + Filters/Sections for Current Page */}
              {(() => {
                const pageConfig = pathname.startsWith('/pricing/pellets')
                  ? {
                      title: isSpanish ? 'Pellets: Secciones y Filtros' : 'Pellets: Sections & Filters',
                      aiSub: isSpanish ? 'Pregunta sobre trócares (3.2 vs 4.5 mm), rangos séricos o cinética' : 'Ask about trocars (3.2 vs 4.5 mm), serum targets, or zero-order kinetics',
                      chips: [
                        { label: isSpanish ? 'Todos' : 'All Formulations', href: '/pricing/pellets' },
                        { label: isSpanish ? 'Mujer / BHRT' : 'Female BHRT', href: '/pricing/pellets?profile=female' },
                        { label: isSpanish ? 'Hombre / TRT' : 'Male TRT', href: '/pricing/pellets?profile=male' },
                        { label: '17β-Estradiol & Bi-Est', href: '/pricing/pellets?category=estrogen' },
                        { label: 'Progesterone (P4)', href: '/pricing/pellets?category=progesterone' },
                        { label: 'Trocar Kits', href: '/pricing/pellets?profile=trocar' },
                      ],
                    }
                  : (pathname.startsWith('/vials') || pathname.startsWith('/pricing/peptides'))
                    ? {
                        title: isSpanish ? 'Péptidos: Especialidades y Filtros' : 'Peptides: Specialties & Filters',
                        aiSub: isSpanish ? 'Pregunta sobre reconstitución, pureza HPLC o protocolos' : 'Ask about reconstitution, HPLC purity, or specialty protocols',
                        chips: [
                          { label: isSpanish ? 'Todos' : 'All Vials', href: '/pricing/peptides' },
                          { label: 'Gynecology', href: '/pricing/peptides?specialty=gynecology' },
                          { label: 'Dermatology', href: '/pricing/peptides?specialty=dermatology' },
                          { label: 'Longevity', href: '/pricing/peptides?specialty=longevity' },
                          { label: 'Metabolic', href: '/pricing/peptides?specialty=metabolic' },
                          { label: 'Urology', href: '/pricing/peptides?specialty=urology' },
                        ],
                      }
                    : (pathname.startsWith('/pricing/pens') || pathname.startsWith('/pricing/dnlab-pens'))
                      ? {
                          title: isSpanish ? 'Plumas U-100: Secciones' : 'U-100 Pens: Sections',
                          aiSub: isSpanish ? 'Pregunta sobre clics U-100 (0.01 mL/clic) y cartuchos' : 'Ask about U-100 click dosing (0.01 mL/click) & cartridges',
                          chips: [
                            { label: isSpanish ? 'Todas las Plumas' : 'All Pens', href: '/pricing/pens' },
                            { label: isSpanish ? 'Calculadora de Clics' : 'Click Calculator', href: '/calculator?format=pen' },
                          ],
                        }
                      : pathname.startsWith('/proto')
                        ? {
                            title: isSpanish ? 'Protocolos: Rutas Clínicas' : 'Protocols: Clinical Routes',
                            aiSub: isSpanish ? 'Pregunta sobre protocolos clínicos y biomarcadores' : 'Ask about clinical protocols, dosing, and biomarkers',
                            chips: [
                              { label: 'All Protocols', href: '/proto' },
                              { label: 'What are Peptides', href: '/what-are-peptides' },
                            ],
                          }
                        : null;

                return (
                  <div className="hide-on-mobile-header" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('open-public-atlas-ai'));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #ddd6fe',
                        background: '#f5f3ff',
                        color: '#5b21b6',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <Sparkles size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <strong style={{ fontSize: '0.78rem' }}>Atlas AI</strong>
                        <span style={{ fontSize: '0.68rem', color: '#6d28d9' }}>
                          {pageConfig?.aiSub || (isSpanish ? 'Asistente clínico contextual de esta página' : 'Contextual clinical AI assistant for this page')}
                        </span>
                      </span>
                    </button>

                    {pageConfig && (
                      <div style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                          {pageConfig.title}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {pageConfig.chips.map((c) => (
                            <Link
                              key={c.href}
                              href={c.href}
                              onClick={() => setOpen(false)}
                              style={{
                                padding: '4px 9px',
                                borderRadius: '9999px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontSize: '0.71rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              {c.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 3. Cross-domain Related Screens (deduplicated against open accordion items) */}
              {dedupedRelatedRoutes.length > 0 && (
                <div
                  style={{
                    marginBottom: '10px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '7px', fontSize: '0.68rem', fontWeight: 800, color: '#003666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Compass size={12} />
                    <span>{isSpanish ? 'Accesos Cruzados' : 'Cross-Domain Shortcuts'}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {dedupedRelatedRoutes.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '6px 10px',
                          minHeight: '36px',
                          borderRadius: '6px',
                          background: '#ffffff',
                          border: '1px solid #dadce0',
                          color: '#3c4043',
                          fontSize: '0.72rem',
                          fontWeight: 650,
                          textDecoration: 'none',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <span>{isSpanish ? item.labelEs : item.labelEn}</span>
                        <ChevronRight size={12} color="#64748b" style={{ flexShrink: 0 }} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Collapsible B2B Domains (omit redundant Catalogs/Pricing list when already inside /pricing/* where ClinicalFormatSwitcher is visible) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {B2B_NAV_DOMAINS.filter((domain) => !(pathname?.startsWith('/pricing') && (domain.id === 'catalogs' || domain.id === 'pricing' || String(domain.titleEn || '').toLowerCase().includes('catalogs & pricing')))).map((domain) => {
                  const expanded = openDomainId === domain.id;
                  return (
                    <div
                      key={domain.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#ffffff'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenDomainId(expanded ? '' : domain.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          minHeight: '44px',
                          border: 'none',
                          background: expanded ? '#f1f5f9' : '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span>{isSpanish ? domain.titleEs : domain.titleEn}</span>
                        {expanded ? <ChevronDown size={15} color="#475569" /> : <ChevronRight size={15} color="#64748b" />}
                      </button>

                      {expanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 6px 8px' }}>
                          {domain.items.map((item) => {
                            const active = isRouteActive(item.href);
                            return (
                              <Link
                                key={item.id}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 10px',
                                  minHeight: '40px',
                                  borderRadius: '6px',
                                  background: active ? '#e8f0fe' : 'transparent',
                                  color: active ? '#1a73e8' : '#334155',
                                  fontSize: '0.78rem',
                                  fontWeight: active ? 750 : 600,
                                  textDecoration: 'none'
                                }}
                              >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                  {item.href?.includes('calculator') ? (
                                    <Calculator size={14} color={active ? '#1a73e8' : '#64748b'} style={{ flexShrink: 0 }} />
                                  ) : item.href?.includes('compounding') || item.href?.includes('proto') ? (
                                    <FlaskConical size={14} color={active ? '#1a73e8' : '#64748b'} style={{ flexShrink: 0 }} />
                                  ) : item.href?.includes('labels') ? (
                                    <Tags size={14} color={active ? '#1a73e8' : '#64748b'} style={{ flexShrink: 0 }} />
                                  ) : (
                                    <Layers size={14} color={active ? '#1a73e8' : '#64748b'} style={{ flexShrink: 0 }} />
                                  )}
                                  <span>{isSpanish ? item.labelEs : item.labelEn}</span>
                                </span>
                                {item.badge && (
                                  <span style={{
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    padding: '1px 5px',
                                    borderRadius: '4px',
                                    background: active ? '#1a73e8' : '#e2e8f0',
                                    color: active ? '#ffffff' : '#475569'
                                  }}>
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Quick Copy Utilities (kept out of primary nav flow) */}
            <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { id: 'peptides', label: isSpanish ? 'Copiar Péptidos' : 'Copy Peptides', url: 'https://www.atlashealth-services.com/pricing/peptides' },
                { id: 'pellets', label: isSpanish ? 'Copiar Pellets' : 'Copy Pellets', url: 'https://www.atlashealth-services.com/pricing/pellets' }
              ].map((cat) => {
                const isCopied = copiedCatalog === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(cat.url).catch(() => {});
                      }
                      setCopiedCatalog(cat.id);
                      setTimeout(() => setCopiedCatalog(null), 1800);
                    }}
                    style={{
                      minHeight: '36px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: isCopied ? '1px solid #137333' : '1px solid #dadce0',
                      background: isCopied ? '#e6f4ea' : '#ffffff',
                      color: isCopied ? '#137333' : '#5f6368',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? (isSpanish ? 'Copiado' : 'Copied') : cat.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
