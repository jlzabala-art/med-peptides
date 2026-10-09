"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  List, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowUp 
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import BloodoSuiteNav from './BloodoSuiteNav';
import AssociatedProtocolsSidebarWidget from './AssociatedProtocolsSidebarWidget';
import CosmeticsSidebarWidget from './CosmeticsSidebarWidget';
import PeptideVialWidget from './widgets/PeptideVialWidget';
import DiagnosticTestWidget from './widgets/DiagnosticTestWidget';
import SolventReconWidget from './widgets/SolventReconWidget';
import CorporateServiceWidget from './widgets/CorporateServiceWidget';
import SupplementSidebarWidget from './widgets/SupplementSidebarWidget';
import FdaApprovedPeptidesNetworkWidget from './FdaApprovedPeptidesNetworkWidget';
import { isFdaApprovedPeptide } from '@/data/fdaPeptidesRegistry';
import { QRCodeSVG } from 'qrcode.react';
import './PublicDatasheetTableOfContents.css';

/**
 * ProductDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Specialized, highly flexible Google Cloud Console-compliant sidebar for product datasheets.
 * Automatically delegates to appropriate specialized widgets based on product category:
 *  - Lyophilized Peptides & Viales -> PeptideVialWidget (PDF Monograph, COA, HPLC >99%, Active Batch)
 *  - Diagnostic Kits -> DiagnosticTestWidget (CE-IVDR, LifeLab1, DBS Protocol) + BloodoSuiteNav
 *  - Cosmeceuticals & Hair -> CosmeticsSidebarWidget (Colway 2-Step Routine, CPNP 1223/2009)
 *  - Sterile Solvents -> SolventReconWidget (28-day rule, Benzyl alcohol 0.9%, Endotoxins)
 *  - Corporate Services -> CorporateServiceWidget (Law 14/2013, 20-day UGE-CE, Schengen)
 *  - Oral Supplements -> SupplementSidebarWidget (HPMC delayed release, EU GMP, Vegan)
 */
export default function ProductDetailSidebar({
  sections = [],
  lang = 'en',
  product = {},
  slug = '',
  effectiveBatchCode = null,
  associatedProtocols = [],
  onOpenPreviewModal = null,
  onOpenCoaModal = null,
  onOpenInquiry = null,
  isDiagnosticKit = false,
  isBloodoDiagnostic = false,
  isCosmeticProduct = false,
  isSolventProduct = false,
  isCorporateService = false,
  isSupplementProduct = false,
  hideFloatingTrigger = true
}) {
  const isEs = lang === 'es';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Check if current peptide is FDA Approved (e.g. Tirzepatide, Semaglutide, etc.)
  const isCurrentFdaApproved = useMemo(() => {
    return isFdaApprovedPeptide(product || slug);
  }, [product, slug]);

  // Filter sections that actually exist in the current DOM
  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

  // Support external trigger (e.g. from PublicStickyActionBar)
  useEffect(() => {
    const handleExternalOpen = () => {
      triggerHaptic('light');
      setIsMobileDrawerOpen(true);
    };
    window.addEventListener('open-datasheet-toc', handleExternalOpen);
    return () => window.removeEventListener('open-datasheet-toc', handleExternalOpen);
  }, []);

  // Real-time ScrollSpy via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !availableSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topEntry = visibleEntries[0];
          if (topEntry?.target?.id) {
            setActiveId(topEntry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5]
      }
    );

    availableSections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [availableSections]);

  const scrollToSection = (e, targetId) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!targetId) return;

    triggerHaptic('light');

    const el = document.getElementById(targetId);
    if (el) {
      setActiveId(targetId);
      setIsMobileDrawerOpen(false);
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', `#${targetId}`);
      }
    }
  };

  const scrollToTop = () => {
    triggerHaptic('light');
    setIsMobileDrawerOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeIndex = availableSections.findIndex(s => s.id === activeId);
  const currentProgress = activeIndex >= 0 ? activeIndex + 1 : 1;
  const activeLabel = availableSections.find(s => s.id === activeId)?.label || '';

  // Broadcast TOC progress to bottom sticky action bar
  useEffect(() => {
    if (typeof window !== 'undefined' && availableSections.length > 0) {
      window.dispatchEvent(new CustomEvent('datasheet-toc-progress', {
        detail: {
          currentProgress,
          totalSections: availableSections.length,
          activeId,
          activeLabel
        }
      }));
    }
  }, [currentProgress, availableSections.length, activeId, activeLabel]);

  // Determine specific contextual widget
  const renderContextualWidget = () => {
    if (isCosmeticProduct) {
      return (
        <CosmeticsSidebarWidget
          currentSlug={slug || product?.slug || ''}
          lang={lang}
          onInquireRoutine={onOpenInquiry}
        />
      );
    }

    if (isDiagnosticKit || isBloodoDiagnostic) {
      return (
        <>
          <BloodoSuiteNav
            currentSlug={slug || product?.slug || ''}
            lang={lang}
            variant="drawer"
          />
          <DiagnosticTestWidget
            product={product}
            slug={slug}
            lang={lang}
            onOpenInquiry={onOpenInquiry}
          />
        </>
      );
    }

    if (isSolventProduct) {
      return (
        <SolventReconWidget
          product={product}
          slug={slug}
          lang={lang}
          onOpenInquiry={onOpenInquiry}
        />
      );
    }

    if (isCorporateService) {
      return (
        <CorporateServiceWidget
          product={product}
          slug={slug}
          lang={lang}
          onOpenInquiry={onOpenInquiry}
        />
      );
    }

    if (isSupplementProduct) {
      return (
        <SupplementSidebarWidget
          product={product}
          slug={slug}
          effectiveBatchCode={effectiveBatchCode}
          lang={lang}
          onOpenPreviewModal={onOpenPreviewModal}
          onOpenCoaModal={onOpenCoaModal}
          onOpenInquiry={onOpenInquiry}
        />
      );
    }

    // Default: Lyophilized Peptide Vial
    return (
      <PeptideVialWidget
        product={product}
        slug={slug}
        effectiveBatchCode={effectiveBatchCode}
        lang={lang}
        onOpenPreviewModal={onOpenPreviewModal}
        onOpenCoaModal={onOpenCoaModal}
      />
    );
  };

  if (!availableSections.length) return null;

  const sidebarContent = (
    <div className="pds-toc-card">
      {/* Card Header */}
      <div className="pds-toc-header">
        <div className="pds-toc-header-left">
          <List size={15} className="pds-toc-header-icon" />
          <span className="pds-toc-header-title">
            {isEs ? 'EN ESTA PÁGINA' : 'ON THIS PAGE'}
          </span>
        </div>
        <span className="pds-toc-progress-pill">
          {currentProgress}/{availableSections.length}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="pds-toc-nav" role="navigation">
        <ul className="pds-toc-list">
          {availableSections.map((sec, idx) => {
            const isActive = activeId === sec.id;
            const IconComponent = sec.icon;

            return (
              <li key={sec.id} className="pds-toc-item">
                <a
                  href={`#${sec.id}`}
                  className={`pds-toc-link ${isActive ? 'is-active' : ''}`}
                  onClick={(e) => scrollToSection(e, sec.id)}
                  title={sec.label}
                >
                  <span className="pds-toc-step-number">{idx + 1}</span>
                  {IconComponent && (
                    <IconComponent size={14} className="pds-toc-item-icon" />
                  )}
                  <span className="pds-toc-item-text">{sec.label}</span>
                  {isActive && <ChevronRight size={13} className="pds-toc-active-arrow" />}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── Dynamic Category-Specific Specialized Widget ── */}
      {renderContextualWidget()}

      {/* ── Associated Clinical Protocols (FIRST — clinical context before network) ── */}
      {!isCosmeticProduct && !isCorporateService && Array.isArray(associatedProtocols) && associatedProtocols.length > 0 && (
        <AssociatedProtocolsSidebarWidget
          protocols={associatedProtocols}
          lang={lang}
        />
      )}

      {/* ── FDA-Approved Peptides Cross-Reference Network ── */}
      {isCurrentFdaApproved && (
        <FdaApprovedPeptidesNetworkWidget
          currentSlug={slug}
          currentProduct={product}
          lang={lang}
        />
      )}

      {/* ── QR Code — Direct monograph link for print / clinical handout ── */}
      {slug && (() => {
        const pageUrl = `https://med-peptides.com/p/${slug}`;
        return (
          <div style={{
            margin: '12px 0 4px',
            padding: '12px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase' }}>
                {isEs ? '📲 Monografía Digital' : '📲 Digital Monograph'}
              </span>
            </div>
            <a
              href={pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={isEs ? 'Abrir ficha técnica digital' : 'Open digital datasheet'}
              style={{ display: 'block', lineHeight: 0, borderRadius: '6px', overflow: 'hidden' }}
            >
              <QRCodeSVG
                value={pageUrl}
                size={120}
                bgColor="#ffffff"
                fgColor="#003666"
                level="M"
                style={{ display: 'block' }}
              />
            </a>
            <p style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: 'center', margin: 0, lineHeight: 1.3 }}>
              med-peptides.com/p/{slug}
            </p>
          </div>
        );
      })()}

      {/* Quick Back to Top Action */}
      <div className="pds-toc-footer">
        <button
          type="button"
          className="pds-toc-top-btn"
          onClick={scrollToTop}
          title={isEs ? 'Volver al inicio del documento' : 'Scroll to top'}
        >
          <ArrowUp size={13} />
          <span>{isEs ? 'Inicio del documento' : 'Back to top'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. LAPTOP / DESKTOP STICKY SIDEBAR (>= 1024px) */}
      <aside className="pds-sidebar-toc" aria-label="Product Navigation Sidebar">
        {sidebarContent}
      </aside>

      {/* 2. MOBILE FLOATING TRIGGER BUTTON (< 1024px) */}
      {!hideFloatingTrigger && (
        <div className="pds-mobile-toc-fab-container">
          <button
            type="button"
            className="pds-mobile-toc-fab"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileDrawerOpen(true);
            }}
            aria-label={isEs ? 'Abrir índice de contenido' : 'Open table of contents'}
            aria-expanded={isMobileDrawerOpen}
          >
            <Menu size={16} className="pds-fab-icon" />
            <span className="pds-fab-label">{isEs ? 'Índice' : 'Contents'}</span>
            <span className="pds-fab-badge">{currentProgress}/{availableSections.length}</span>
          </button>
        </div>
      )}

      {/* 3. MOBILE SLIDE-IN DRAWER / BOTTOM SHEET (< 1024px) ── Google Cloud Console UX Standard */}
      {isMobileDrawerOpen && (
        <div 
          className="pds-mobile-toc-backdrop"
          onClick={() => setIsMobileDrawerOpen(false)}
          role="presentation"
        >
          <div 
            className="pds-mobile-toc-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={isEs ? 'Índice de contenido' : 'Table of contents'}
          >
            {/* Google Cloud UX Mobile Drag Handle */}
            <div className="pds-drawer-drag-handle" />

            <div className="pds-drawer-header">
              <div className="pds-drawer-title-group">
                <div className="pds-drawer-icon-box">
                  <List size={18} className="pds-drawer-icon" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 className="pds-drawer-title">
                      {isEs ? 'Índice del Documento' : 'Table of Contents'}
                    </h4>
                    <span className="pds-toc-progress-pill">
                      {currentProgress}/{availableSections.length}
                    </span>
                  </div>
                  <span className="pds-drawer-subtitle">
                    {isEs ? 'Navegación rápida por apartados' : 'Jump directly to any section'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="pds-drawer-close-btn"
                onClick={() => {
                  triggerHaptic('light');
                  setIsMobileDrawerOpen(false);
                }}
                aria-label={isEs ? 'Cerrar' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Currently Viewing Banner */}
            {activeLabel && (
              <div className="pds-drawer-current-banner">
                <span className="pds-current-label">
                  {isEs ? 'Sección activa actual:' : 'Currently reading:'}
                </span>
                <strong className="pds-current-title">{activeLabel}</strong>
              </div>
            )}

            <div className="pds-drawer-body">
              <ul className="pds-drawer-list">
                {availableSections.map((sec, idx) => {
                  const isActive = activeId === sec.id;
                  const IconComponent = sec.icon;

                  return (
                    <li key={sec.id} className="pds-drawer-item">
                      <button
                        type="button"
                        className={`pds-drawer-btn ${isActive ? 'is-active' : ''}`}
                        onClick={(e) => scrollToSection(e, sec.id)}
                      >
                        <div className="pds-drawer-btn-left">
                          <span className={`pds-drawer-step ${isActive ? 'is-active' : ''}`}>
                            {idx + 1}
                          </span>
                          {IconComponent && (
                            <IconComponent size={16} className="pds-drawer-item-icon" />
                          )}
                          <span className="pds-drawer-item-text">{sec.label}</span>
                        </div>
                        {isActive ? (
                          <span className="pds-drawer-active-tag">
                            {isEs ? 'Actual' : 'Active'}
                          </span>
                        ) : (
                          <ChevronRight size={15} className="pds-drawer-arrow" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Product Type Specific Widget */}
              {renderContextualWidget()}

              {/* Associated Clinical Protocols */}
              {!isCosmeticProduct && !isCorporateService && Array.isArray(associatedProtocols) && associatedProtocols.length > 0 && (
                <AssociatedProtocolsSidebarWidget
                  protocols={associatedProtocols}
                  lang={lang}
                />
              )}

              {/* FDA-Approved Peptides Cross-Reference Network */}
              {isCurrentFdaApproved && (
                <FdaApprovedPeptidesNetworkWidget
                  currentSlug={slug}
                  currentProduct={product}
                  lang={lang}
                />
              )}

              {/* Digital Monograph Link */}
              {slug && (
                <div style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', color: '#64748b', textTransform: 'uppercase' }}>
                    {isEs ? '📲 Monografía Digital' : '📲 Digital Monograph'}
                  </span>
                  <a
                    href={`https://med-peptides.com/p/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', lineHeight: 0, borderRadius: '6px', overflow: 'hidden' }}
                  >
                    <QRCodeSVG
                      value={`https://med-peptides.com/p/${slug}`}
                      size={110}
                      bgColor="#ffffff"
                      fgColor="#003666"
                      level="M"
                    />
                  </a>
                  <p style={{ fontSize: '0.62rem', color: '#94a3b8', textAlign: 'center', margin: 0 }}>
                    med-peptides.com/p/{slug}
                  </p>
                </div>
              )}
            </div>

            <div className="pds-drawer-footer">
              <button
                type="button"
                className="pds-drawer-top-action"
                onClick={scrollToTop}
              >
                <ArrowUp size={14} />
                <span>{isEs ? 'Volver al Inicio del Documento' : 'Back to Top of Document'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
