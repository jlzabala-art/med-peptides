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
  FileText
} from '@/lib/icons';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { triggerHaptic } from '../../utils/haptics';
import { useAuth } from '../../context/AuthContext';
import PublicInstitutionalInquiryDrawer from './PublicInstitutionalInquiryDrawer';
import PublicProviderCTA from './public/PublicProviderCTA';
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
  customTier2 = null
}) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [internalInquiryOpen, setInternalInquiryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState(controlledActiveAnchorId || anchorTabs[0]?.id || '');
  const tabsContainerRef = useRef(null);

  // Sync controlled anchor ID if passed
  useEffect(() => {
    if (controlledActiveAnchorId) {
      setActiveAnchor(controlledActiveAnchorId);
    }
  }, [controlledActiveAnchorId]);

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
      } catch {}
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.replaceState({}, '', url.toString());
    }
    if (onLangChange) {
      onLangChange(nextLang);
    }
  };

  // Copy canonical link
  const handleCopyLink = async () => {
    triggerHaptic('selection');
    const targetUrl = copyUrl || (typeof window !== 'undefined' ? window.location.href : '');
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
      toast.success(lang === 'es' ? 'Enlace copiado al portapapeles' : 'Link copied to clipboard');
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
        {/* ── Line 1: Universal Executive Bar ── */}
        <div className="puh-tier1">
          <div className="puh-tier1-inner">
            {/* Left: Brand + Directory Track Switcher + Status Badge */}
            <div className="puh-brand-group">
              <Link href="/c/CAT-MU9L9GBN" className="puh-brand-link" title="Med-Peptides Clinical Intelligence">
                <span className="puh-brand-title">Med-Peptides</span>
              </Link>
              
              <span className="puh-brand-divider" aria-hidden="true" />

              {/* Segmented Directory Switcher */}
              <nav className="puh-directory-switcher" aria-label="Directory Mode">
                <Link
                  href="/c/CAT-MU9L9GBN"
                  className={`puh-switcher-item ${track === 'peptides' || track === 'compounds' ? 'is-active' : ''}`}
                  title={isSpanish ? 'Explorar Catálogo de Péptidos' : 'Browse Research Peptides Catalog'}
                >
                  <FlaskConical size={13} />
                  <span>{isSpanish ? 'Péptidos' : 'Peptides'}</span>
                </Link>
                <Link
                  href="/proto"
                  className={`puh-switcher-item ${track === 'protocols' ? 'is-active' : ''}`}
                  title={isSpanish ? 'Explorar Directorio de Protocolos Clínicos' : 'Browse Clinical Protocols Directory'}
                >
                  <Layers size={13} />
                  <span>{isSpanish ? 'Protocolos' : 'Protocols'}</span>
                </Link>
              </nav>

              <span className="puh-reference-badge">
                {track === 'protocols'
                  ? (isSpanish ? 'Registro Clínico' : 'Clinical Registry')
                  : (isSpanish ? 'Compendio Clínico' : 'Clinical Reference')}
              </span>
            </div>

            {/* Right: Global Actions (Lang, Contact, Copy, Sign In) */}
            <div className="puh-actions-group">
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

              {/* Institutional Inquiry Drawer Trigger */}
              <button
                type="button"
                className="puh-btn puh-btn-contact"
                onClick={handleContactClick}
                title={isSpanish ? 'Consulta Médica e Institucional (business@med-peptides.com)' : 'Contact Medical Affairs (business@med-peptides.com)'}
              >
                <Mail size={14} />
                <span className="puh-btn-label">{isSpanish ? 'Contacto' : 'Contact'}</span>
              </button>

              {/* Copy Canonical Link */}
              <button
                type="button"
                className="puh-btn puh-btn-ghost"
                onClick={handleCopyLink}
                title={isSpanish ? 'Copiar enlace al portapapeles' : 'Copy link to clipboard'}
              >
                {copied ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                <span className="puh-btn-label">
                  {copied
                    ? (isSpanish ? 'Copiado' : 'Copied')
                    : (isSpanish ? 'Copiar Enlace' : 'Copy Link')}
                </span>
              </button>

              {/* Professional Portal Sign In / Dashboard CTA */}
              {user ? (
                <Link
                  href={getDashboardPath()}
                  className="puh-btn puh-btn-login"
                  title={isSpanish ? 'Acceso a mi Panel Profesional' : 'Access Practitioner Dashboard'}
                >
                  <Lock size={13} />
                  <span className="puh-btn-label">{isSpanish ? 'Mi Portal' : 'My Portal'}</span>
                </Link>
              ) : (
                <Link
                  href={`/login${loginRedirect ? `?redirect=${encodeURIComponent(loginRedirect)}` : ''}`}
                  className="puh-btn puh-btn-login"
                  title={isSpanish ? 'Acceso Profesionales · Ver lotes analíticos, precios mayoristas y pedidos' : 'Practitioner Portal · Access certified CoAs & wholesale pricing'}
                >
                  <Lock size={13} />
                  <span className="puh-btn-label">{isSpanish ? 'Acceso Portal' : 'Sign In'}</span>
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
    </>
  );
}
