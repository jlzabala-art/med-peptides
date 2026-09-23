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
import './PublicDatasheetTableOfContents.css';

/**
 * PublicDatasheetTableOfContents
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console & Cloud Documentation inspired Table of Contents.
 * 
 * - LAPTOP / DESKTOP (>= 1024px):
 *   Sticky sidebar navigation on the right with real-time IntersectionObserver
 *   ScrollSpy, active progress indicator, and smooth offset scrolling.
 * 
 * - MOBILE (< 1024px):
 *   Floating / Sticky TOC Trigger button (Hamburger / List) that opens a
 *   touch-optimized slide-in drawer with step badges and auto-scroll on select.
 */
export default function PublicDatasheetTableOfContents({
  sections = [],
  lang = 'en',
  title = null
}) {
  const isEs = lang === 'es';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Filter sections that actually exist in the current DOM
  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

  // Real-time ScrollSpy via IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined' || !availableSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entries
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top coordinate to pick the topmost visible section
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

  // Smooth scroll handler with header offset
  const scrollToSection = (e, targetId) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!targetId) return;

    triggerHaptic('light');

    const el = document.getElementById(targetId);
    if (el) {
      setActiveId(targetId);
      setIsMobileDrawerOpen(false);

      // Smooth scroll
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update URL hash safely without jumping
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

  // Find active index for reading progress indicator
  const activeIndex = availableSections.findIndex(s => s.id === activeId);
  const currentProgress = activeIndex >= 0 ? activeIndex + 1 : 1;
  const activeLabel = availableSections.find(s => s.id === activeId)?.label || '';

  if (!availableSections.length) return null;

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          1. LAPTOP / DESKTOP STICKY SIDEBAR (>= 1024px)
          ══════════════════════════════════════════════════════════════ */}
      <aside className="pds-sidebar-toc" aria-label="Table of Contents">
        <div className="pds-toc-card">
          {/* Card Header */}
          <div className="pds-toc-header">
            <div className="pds-toc-header-left">
              <List size={15} className="pds-toc-header-icon" />
              <span className="pds-toc-header-title">
                {title || (isEs ? 'EN ESTA PÁGINA' : 'ON THIS PAGE')}
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
      </aside>

      {/* ══════════════════════════════════════════════════════════════
          2. MOBILE FLOATING TRIGGER BUTTON (< 1024px)
          ══════════════════════════════════════════════════════════════ */}
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
          <span className="pds-fab-label">
            {isEs ? 'Índice' : 'Sections'}
          </span>
          <span className="pds-fab-badge">
            {currentProgress}/{availableSections.length}
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          3. MOBILE SLIDE-IN DRAWER / BOTTOM SHEET (< 1024px)
          ══════════════════════════════════════════════════════════════ */}
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
            {/* Drawer Header */}
            <div className="pds-drawer-header">
              <div className="pds-drawer-title-group">
                <List size={18} className="pds-drawer-icon" />
                <div>
                  <h4 className="pds-drawer-title">
                    {title || (isEs ? 'Índice del Documento' : 'Document Outline')}
                  </h4>
                  <span className="pds-drawer-subtitle">
                    {isEs ? 'Navegación rápida por apartados' : 'Jump directly to any section'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="pds-drawer-close-btn"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-label={isEs ? 'Cerrar índice' : 'Close index'}
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

            {/* Drawer Section List */}
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
            </div>

            {/* Drawer Footer Actions */}
            <div className="pds-drawer-footer">
              <button
                type="button"
                className="pds-drawer-top-action"
                onClick={scrollToTop}
              >
                <ArrowUp size={14} />
                <span>{isEs ? 'Volver al Inicio del Documento' : 'Back to Top of Page'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
