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
  ClipboardList,
  Download,
  RefreshCw
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
  const [pdfStatus, setPdfStatus] = useState('idle'); // 'idle' | 'generating' | 'downloading' | 'success'

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

  const handlePrintBlueprint = async () => {
    triggerHaptic('selection');
    if (pdfStatus !== 'idle') return;

    setPdfStatus('generating');
    toast.loading(isEs ? 'Generando Blueprint en servidor...' : 'Generating Blueprint on server...', { id: 'pdf-toast' });

    try {
      const res = await fetch('/api/protocol/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          slug,
          lang
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setPdfStatus('downloading');
      toast.loading(isEs ? 'Descargando Blueprint PDF...' : 'Downloading Blueprint PDF...', { id: 'pdf-toast' });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Protocol-Blueprint-${slug || 'protocol'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setPdfStatus('success');
      toast.success(isEs ? '¡Blueprint descargado correctamente!' : 'Blueprint PDF downloaded successfully!', { id: 'pdf-toast' });

      setTimeout(() => {
        setPdfStatus('idle');
      }, 2500);
    } catch (err) {
      console.warn('Server PDF generation failed, falling back to browser print:', err);
      toast.error(isEs ? 'Apertura de impresión directa...' : 'Opening direct print window...', { id: 'pdf-toast' });
      setPdfStatus('idle');
      if (typeof window !== 'undefined') {
        window.print();
      }
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
          disabled={pdfStatus !== 'idle'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 10px',
            background: pdfStatus === 'success'
              ? 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)'
              : pdfStatus !== 'idle'
              ? 'linear-gradient(135deg, #334155 0%, #475569 100%)'
              : 'linear-gradient(135deg, #003666 0%, #0284c7 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: pdfStatus !== 'idle' ? 'wait' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,54,102,0.15)',
            transition: 'all 0.2s ease',
            opacity: pdfStatus !== 'idle' && pdfStatus !== 'success' ? 0.9 : 1
          }}
          title={isEs ? 'Generar y descargar PDF clínico oficial' : 'Generate and download official clinical PDF'}
        >
          {pdfStatus === 'generating' && (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>{isEs ? 'Generando Blueprint...' : 'Generating Blueprint...'}</span>
            </>
          )}
          {pdfStatus === 'downloading' && (
            <>
              <Download size={13} className="animate-bounce" />
              <span>{isEs ? 'Descargando PDF...' : 'Downloading PDF...'}</span>
            </>
          )}
          {pdfStatus === 'success' && (
            <>
              <Check size={13} />
              <span>{isEs ? '¡Blueprint Descargado ✓!' : 'Blueprint Downloaded ✓!'}</span>
            </>
          )}
          {pdfStatus === 'idle' && (
            <>
              <Printer size={13} />
              <span>{isEs ? 'Imprimir / Exportar Blueprint' : 'Print / Export Blueprint'}</span>
            </>
          )}
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

      {/* Quick Link Copy (Minimalist, without duplicate QR) */}
      <div style={{ marginTop: '0.85rem' }}>
        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: copiedUrl ? '#f0fdf4' : '#ffffff',
            color: copiedUrl ? '#16a34a' : '#475569',
            border: copiedUrl ? '1px solid #86efac' : '1px solid #cbd5e1',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          {copiedUrl ? <Check size={13} /> : <Copy size={13} />}
          <span>{copiedUrl ? (isEs ? 'Enlace Copiado ✓' : 'Link Copied ✓') : (isEs ? 'Copiar Enlace Directo' : 'Copy Direct Link')}</span>
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
