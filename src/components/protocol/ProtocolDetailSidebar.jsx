"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  List, 
  Menu, 
  X, 
  ChevronRight, 
  ArrowUp,
  Printer,
  Copy,
  Check,
  QrCode,
  Sparkles,
  ClipboardList
} from '@/lib/icons';
import { triggerHaptic } from '@/utils/haptics';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import SimilarProtocolsSidebarWidget from '@/components/product/SimilarProtocolsSidebarWidget';
import ProtocolTopicalAdjunctsSidebarWidget from '@/components/protocol/ProtocolTopicalAdjunctsSidebarWidget';
import '@/components/product/PublicDatasheetTableOfContents.css';

/**
 * ProtocolDetailSidebar
 * ─────────────────────────────────────────────────────────────────────────────
 * Dedicated Google Cloud Console-inspired Sticky Navigation & Action Sidebar
 * for Public Protocol Pages (/proto/[slug]).
 * 
 * Features:
 * 1. Protocol TOC ScrollSpy with IntersectionObserver.
 * 2. Quick Clinical Protocol Actions (Print/Export Blueprint, Mobile QR, Lab Requisition).
 * 3. Similar Protocols by Therapeutic Goal & Grade.
 * 4. Topical Cosmeceutical Adjuncts (Colway Hair System, etc.).
 * 5. Scannable QR & Quick Copy URL.
 * 6. Responsive Desktop Sticky (<aside>) + Mobile Drawer (< 1024px).
 */
export default function ProtocolDetailSidebar({
  sections = [],
  lang = 'en',
  title = null,
  protocol = {},
  slug = '',
  similarProtocols = [],
  topicalAdjuncts = [],
  onOpenQrModal = null,
  onCopyLabRequisition = null,
  hideFloatingTrigger = false,
  publicUrl = null
}) {
  const isEs = lang === 'es';
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const resolvedUrl = publicUrl || (typeof window !== 'undefined' ? window.location.href : `https://med-peptides.com/proto/${slug}`);

  const availableSections = useMemo(() => {
    return sections.filter(sec => sec && sec.id);
  }, [sections]);

  // Support external trigger
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

  const handleCopyLink = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(resolvedUrl);
        triggerHaptic('copy');
        setCopiedUrl(true);
        toast.success(isEs ? 'Enlace del protocolo copiado ✓' : 'Protocol URL copied ✓');
        setTimeout(() => setCopiedUrl(false), 2000);
      }
    } catch {
      toast.error('Could not copy URL');
    }
  };

  const handlePrintBlueprint = () => {
    triggerHaptic('selection');
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const activeIndex = availableSections.findIndex(s => s.id === activeId);
  const currentProgress = activeIndex >= 0 ? activeIndex + 1 : 1;
  const activeLabel = availableSections.find(s => s.id === activeId)?.label || '';

  // Broadcast progress
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

  if (!availableSections.length) return null;

  const sidebarContent = (
    <div className="pds-toc-card">
      {/* Header */}
      <div className="pds-toc-header">
        <div className="pds-toc-header-left">
          <List size={15} className="pds-toc-header-icon" />
          <span className="pds-toc-header-title">
            {title || (isEs ? 'SECCIONES DEL PROTOCOLO' : 'PROTOCOL NAVIGATION')}
          </span>
        </div>
        <span className="pds-toc-progress-pill">
          {currentProgress}/{availableSections.length}
        </span>
      </div>

      {/* Navigation List */}
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

      {/* ── CARD 1: QUICK PROTOCOL ACTIONS ── */}
      <div style={{
        marginTop: '1rem',
        padding: '0.85rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.70rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isEs ? 'ACCIONES CLÍNICAS' : 'CLINICAL ACTIONS'}
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#003666', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1px 5px', borderRadius: '3px' }}>
            DOC
          </span>
        </div>

        <button
          type="button"
          onClick={handlePrintBlueprint}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 10px',
            background: 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,54,102,0.15)'
          }}
        >
          <Printer size={13} />
          <span>{isEs ? 'Imprimir / Exportar Blueprint' : 'Print / Export Blueprint'}</span>
        </button>

        {onOpenQrModal && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onOpenQrModal();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#ffffff',
              color: '#003666',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <QrCode size={13} color="#0284c7" />
            <span>{isEs ? 'Abrir Código QR Móvil' : 'Open Mobile QR Dialog'}</span>
          </button>
        )}

        {onCopyLabRequisition && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              onCopyLabRequisition();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ClipboardList size={13} color="#64748b" />
            <span>{isEs ? 'Copiar Petición de Lab' : 'Copy Lab Order'}</span>
          </button>
        )}
      </div>

      {/* ── CARD 2: TOPICAL ADJUNCTS (Colway Hair System, etc.) ── */}
      {Array.isArray(topicalAdjuncts) && topicalAdjuncts.length > 0 && (
        <ProtocolTopicalAdjunctsSidebarWidget
          adjuncts={topicalAdjuncts}
          lang={lang}
        />
      )}

      {/* ── CARD 3: SIMILAR PROTOCOLS ── */}
      {Array.isArray(similarProtocols) && similarProtocols.length > 0 && (
        <SimilarProtocolsSidebarWidget
          protocols={similarProtocols}
          lang={lang}
          currentSlug={slug}
        />
      )}

      {/* ── CARD 4: MICRO QR PROTOCOL VERIFICATION ── */}
      <div style={{
        marginTop: '1rem',
        padding: '0.85rem',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <QrCode size={14} color="#003666" />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              {isEs ? 'ACCESO MÓVIL' : 'MOBILE ACCESS'}
            </span>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '3px' }}>
            VERIFICADO
          </span>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '6px',
          background: '#ffffff',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <QRCodeSVG 
            value={resolvedUrl}
            size={90}
            level="M"
            includeMargin={false}
          />
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            marginTop: '8px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: copiedUrl ? '#f0fdf4' : '#f8fafc',
            color: copiedUrl ? '#16a34a' : '#334155',
            border: copiedUrl ? '1px solid #86efac' : '1px solid #cbd5e1',
            cursor: 'pointer'
          }}
        >
          {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
          <span>{copiedUrl ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Enlace' : 'Copy Direct Link')}</span>
        </button>
      </div>

      {/* Back to top */}
      <div className="pds-toc-footer">
        <button
          type="button"
          className="pds-toc-top-btn"
          onClick={scrollToTop}
          title={isEs ? 'Volver al inicio del protocolo' : 'Back to top'}
        >
          <ArrowUp size={13} />
          <span>{isEs ? 'Inicio del protocolo' : 'Back to top'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Laptop / Desktop Sticky Sidebar (>= 1024px) */}
      <aside className="pds-sidebar-toc" aria-label="Protocol Navigation Sidebar">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Trigger (< 1024px) */}
      {!hideFloatingTrigger && (
        <div className="pds-mobile-toc-fab-container">
          <button
            type="button"
            className="pds-mobile-toc-fab"
            onClick={() => {
              triggerHaptic('light');
              setIsMobileDrawerOpen(true);
            }}
            aria-label={isEs ? 'Abrir índice del protocolo' : 'Open protocol navigation'}
            aria-expanded={isMobileDrawerOpen}
          >
            <Menu size={16} className="pds-fab-icon" />
            <span className="pds-fab-label">{isEs ? 'Secciones' : 'Sections'}</span>
            <span className="pds-fab-badge">{currentProgress}/{availableSections.length}</span>
          </button>
        </div>
      )}

      {/* Mobile Drawer Slide-In (< 1024px) */}
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
                  {isEs ? 'SECCIONES DEL PROTOCOLO' : 'PROTOCOL SECTIONS'}
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
