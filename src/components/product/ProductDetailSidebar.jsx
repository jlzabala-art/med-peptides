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
  hideFloatingTrigger = false
}) {
  const isEs = lang === 'es';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

      {/* Associated Clinical Protocols (if applicable and not already in widgets) */}
      {!isCosmeticProduct && !isCorporateService && Array.isArray(associatedProtocols) && associatedProtocols.length > 0 && (
        <AssociatedProtocolsSidebarWidget
          protocols={associatedProtocols}
          lang={lang}
        />
      )}

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

      {/* 3. MOBILE SLIDE-IN DRAWER (< 1024px) */}
      {isMobileDrawerOpen && (
        <div 
          className="pds-mobile-toc-overlay"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="pds-mobile-toc-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="pds-mobile-toc-drawer-header">
              <div className="pds-mobile-toc-drawer-header-left">
                <List size={16} className="pds-drawer-header-icon" />
                <span className="pds-drawer-header-title">
                  {isEs ? 'ÍNDICE DEL DOCUMENTO' : 'TABLE OF CONTENTS'}
                </span>
              </div>
              <button
                type="button"
                className="pds-drawer-close-btn"
                onClick={() => {
                  triggerHaptic('light');
                  setIsMobileDrawerOpen(false);
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="pds-drawer-content-scrollable">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
