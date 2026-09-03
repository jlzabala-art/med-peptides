'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, Plus, FileText, ChevronDown, BookOpen, Loader, Globe } from '@/lib/icons';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/hooks/useToast';
import { EXPORT_CATALOGUES } from '@/config/exportCatalogues';
import UnifiedExportDrawer from './catalog/UnifiedExportDrawer';
import MasterCatalogTable from './MasterCatalogTable';

/* ─────────────────────────────────────────────────────────────────
   Catalog Export Dropdown — Shared by Desktop & Mobile
───────────────────────────────────────────────────────────────── */
function CatalogExportDropdown({
  onExportJSON,
  onExportCSV,
  onLotuslandPDF,
  onLotuslandWeb,
  onLarimedicalPDF,
  onLarimedicalWeb,
  onEuropeptidesPDF,
  onEuropeptidesWeb,
  onOpenExportHub,
  markupPercent,
  setMarkupPercent,
  actionLoading,
  isMobile = false,
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click (supporting touch pointerdown for mobile with safety delay)
  useEffect(() => {
    if (!exportOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleClick);
    }, 40);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleClick);
    };
  }, [exportOpen]);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setExportOpen(prev => !prev)}
        className="gcp-btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          minHeight: '38px',
          padding: isMobile ? '0.45rem 0.65rem' : '0.45rem 0.75rem',
          whiteSpace: 'nowrap',
        }}
        title="Export Catalog & Price Lists"
      >
        <Download size={15} />
        <span className={isMobile ? '' : 'btn-label'}>Export</span>
        <ChevronDown size={13} style={{ opacity: 0.6 }} />
      </button>

      {exportOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          right: 0,
          minWidth: '290px',
          maxWidth: 'min(340px, calc(100vw - 20px))',
          maxHeight: '75vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: '#ffffff',
          border: '1px solid var(--color-border, #e2e8f0)',
          borderRadius: '10px',
          boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
          zIndex: 9999,
        }}>
          {/* Export Hub */}
          <div style={{ padding: '0.45rem 0.85rem', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Export Hub
          </div>
          <button
            onClick={() => { onOpenExportHub?.(); setExportOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.6rem 1rem', border: 'none', background: '#f0f9ff',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', textAlign: 'left',
              borderBottom: '1px solid #e0f2fe'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
            onMouseLeave={e => e.currentTarget.style.background = '#f0f9ff'}
          >
            🚀 Open Unified Export Hub…
          </button>

          <div style={{ padding: '0.45rem 0.85rem 0.2rem 0.85rem', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Export Raw Data
          </div>
          <button
            onClick={() => { onExportJSON(); setExportOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.55rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, color: '#1e293b', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span>💾</span> JSON (Full Products & Variants)
          </button>
          <button
            onClick={() => { onExportCSV(); setExportOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.55rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 500, color: '#1e293b', textAlign: 'left' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span>📊</span> CSV (Spreadsheet Format)
          </button>

          {/* Quick Margin / Markup Selector — Two Rows for comfortable ergonomics */}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
          <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>
                📊 Margin on Cost:
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369a1', backgroundColor: '#e0f2fe', padding: '2px 7px', borderRadius: '4px' }}>
                +{markupPercent}%
              </span>
            </div>

            {/* Row 1: Low-range benchmarks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '6px' }}>
              {[0, 15, 20].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMarkupPercent(pct); }}
                  style={{
                    padding: '6px 0',
                    fontSize: '0.74rem',
                    fontWeight: markupPercent === pct ? 800 : 600,
                    borderRadius: '5px',
                    border: markupPercent === pct ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: markupPercent === pct ? '#0284c7' : '#ffffff',
                    color: markupPercent === pct ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                  title={pct === 0 ? 'Exact Cost (0% Margin)' : `+${pct}% Margin`}
                >
                  {pct === 0 ? '0% Cost' : `+${pct}%`}
                </button>
              ))}
            </div>

            {/* Row 2: Mid/High-range benchmarks + Custom input */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 52px', gap: '6px', alignItems: 'center' }}>
              {[25, 30, 40].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMarkupPercent(pct); }}
                  style={{
                    padding: '6px 0',
                    fontSize: '0.74rem',
                    fontWeight: markupPercent === pct ? 800 : 600,
                    borderRadius: '5px',
                    border: markupPercent === pct ? '1.5px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: markupPercent === pct ? '#0284c7' : '#ffffff',
                    color: markupPercent === pct ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                  title={`+${pct}% Margin`}
                >
                  +{pct}%
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={markupPercent}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setMarkupPercent(Math.max(0, parseInt(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '5px 2px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    borderRadius: '5px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff'
                  }}
                  title="Custom Margin %"
                />
              </div>
            </div>
          </div>

          {/* Lotusland */}
          <div style={{ padding: '0.45rem 0.85rem 0.2rem 0.85rem', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Lotusland ({markupPercent === 0 ? 'Cost EXW (0%)' : `EXW +${markupPercent}%`})
          </div>
          <button
            onClick={() => { onLotuslandPDF(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#0369a1', textAlign: 'left',
              opacity: actionLoading === 'lotusland-pdf' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#f0f9ff'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'lotusland-pdf'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <span>📑</span>}
            {actionLoading === 'lotusland-pdf' ? 'Generating PDF…' : `Lotusland / RegenPept Catalog (PDF)`}
          </button>
          <button
            onClick={() => { onLotuslandWeb(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#0284c7', textAlign: 'left',
              opacity: actionLoading === 'lotusland-web' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#f0f9ff'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'lotusland-web'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <Globe size={14} color="#0284c7" />}
            {actionLoading === 'lotusland-web' ? 'Creating Web Share…' : `Lotusland Web Share`}
          </button>

          {/* LARIMEDICAL */}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
          <div style={{ padding: '0.45rem 0.85rem 0.2rem 0.85rem', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🇪🇸 LARIMEDICAL ({markupPercent === 0 ? 'Cost (0%)' : `+${markupPercent}%`})
          </div>
          <button
            onClick={() => { onLarimedicalPDF(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#047857', textAlign: 'left',
              opacity: actionLoading === 'larimedical-pdf' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#ecfdf5'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'larimedical-pdf'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <span>📑</span>}
            {actionLoading === 'larimedical-pdf' ? 'Generating PDF…' : `LARIMEDICAL Catalog (PDF)`}
          </button>
          <button
            onClick={() => { onLarimedicalWeb(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#0f766e', textAlign: 'left',
              opacity: actionLoading === 'larimedical-web' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#f0fdfa'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'larimedical-web'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <Globe size={14} color="#0d9488" />}
            {actionLoading === 'larimedical-web' ? 'Creating Web Share…' : `LARIMEDICAL Web Share`}
          </button>

          {/* EuroPeptides */}
          <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }} />
          <div style={{ padding: '0.45rem 0.85rem 0.2rem 0.85rem', fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            EuroPeptides (EXW +{markupPercent}%)
          </div>
          <button
            onClick={() => { onEuropeptidesPDF(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#1e40af', textAlign: 'left',
              opacity: actionLoading === 'europeptides-pdf' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#eff6ff'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'europeptides-pdf'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <span>📑</span>}
            {actionLoading === 'europeptides-pdf' ? 'Generating PDF…' : `EuroPeptides Catalog (PDF)`}
          </button>
          <button
            onClick={() => { onEuropeptidesWeb(); setExportOpen(false); }}
            disabled={Boolean(actionLoading)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
              padding: '0.45rem 1rem', border: 'none', background: 'none',
              cursor: actionLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.84rem', fontWeight: 600, color: '#0369a1', textAlign: 'left',
              opacity: actionLoading === 'europeptides-web' ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#e0f2fe'; }}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {actionLoading === 'europeptides-web'
              ? <Loader size={14} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : <Globe size={14} color="#0284c7" />}
            {actionLoading === 'europeptides-web' ? 'Creating Web Share…' : `EuroPeptides Web Share`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Desktop Actions — Import, Export Dropdown, New Product
───────────────────────────────────────────────────────────────── */
function DesktopCatalogActions(props) {
  return (
    <div className="catalog-header-actions-desktop" style={{ gap: '0.5rem', alignItems: 'center' }}>
      <button
        onClick={props.onImportPriceList}
        className="gcp-btn-secondary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
      >
        <FileText size={15} />
        <span className="btn-label">Import</span>
      </button>

      <CatalogExportDropdown {...props} isMobile={false} />

      <button
        onClick={props.onNewProduct}
        className="gcp-btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
      >
        <Plus size={16} />
        <span className="btn-label">New Product</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Mobile Actions — Compact toolbar with Export Dropdown
───────────────────────────────────────────────────────────────── */
function MobileCatalogActions(props) {
  return (
    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', width: '100%' }}>
      <button
        onClick={props.onNewProduct}
        className="gcp-btn-primary"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          padding: '0.45rem 0.65rem',
          minHeight: '38px',
          whiteSpace: 'nowrap'
        }}
      >
        <Plus size={16} />
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>New Product</span>
      </button>
      <button
        onClick={props.onImportPriceList}
        className="gcp-btn-secondary"
        title="Import Price List"
        style={{ padding: '0.45rem', minHeight: '38px', minWidth: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <FileText size={16} />
      </button>
      <CatalogExportDropdown {...props} isMobile={true} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export default function AdminCatalogTabClient({ initialProducts, globalMetrics, readOnly = false }) {
  const { openDrawer } = useDrawer();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState(null);
  const [markupPercent, setMarkupPercent] = useState(20);
  const [isExportHubOpen, setIsExportHubOpen] = useState(false);

  // Action handlers
  const handleExportJSON  = () => window.dispatchEvent(new CustomEvent('catalog-export', { detail: { format: 'json' } }));
  const handleExportCSV   = () => window.dispatchEvent(new CustomEvent('catalog-export', { detail: { format: 'csv' } }));
  const handleImportPriceList = () => openDrawer('import-price-list');
  const handleNewProduct = () => window.dispatchEvent(new CustomEvent('catalog-new-product'));
  const handleOpenExportHub = () => setIsExportHubOpen(true);

  /**
   * Helper to generate a preconfigured supplier PDF with Margin over Cost and EXW terms
   * Generates a supplier-specific PDF catalog
   */
  const handleSupplierPDF = useCallback(async (supplierFilter, supplierLabel, loadingKey, extraParams = {}) => {
    if (actionLoading) return;
    setActionLoading(loadingKey);
    toast?.info?.(`📄 Generating ${supplierLabel} PDF Catalog (Cost +${markupPercent}% EXW)…`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35_000);

    try {
      const productIds = (initialProducts || []).map(p => p.id).filter(Boolean);

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          productIds,
          docType:           'catalog',
          priceTier:         'cost',
          priceMarkupPercent: markupPercent,
          supplierFilter:    supplierFilter,
          isExWorks:         true,
          incoterm:          'EXW',
          supplierMasking:   'anonymous',
          showSupplier:      false,
          showKitPrice:      true,
          kitSize:           10,
          coverPage:         true,
          currency:          'USD',
          groupBy:           'category',
          sortBy:            'name',
          showDosage:        true,
          showPresentation:  true,
          showPurity:        true,
          watermark:         'none',
          language:          'en',
          ...extraParams,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let finalUrl = null;
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const data = JSON.parse(line);
              if (data.type === 'done' && data.meta?.url) {
                finalUrl = data.meta.url;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn('Failed to parse NDJSON line:', line, e);
            }
          }
        }
        if (done) break;
      }

      if (finalUrl) {
        window.open(finalUrl, '_blank');
        toast?.success?.(`✅ ${supplierLabel} PDF Catalog (+${markupPercent}%) opened in new tab.`);
      } else {
        throw new Error('PDF generation failed to return a valid URL.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[handleSupplierPDF ${supplierLabel}]`, err);
      if (err.name === 'AbortError') {
        toast?.error?.('⏱️ PDF generation timed out. Please try again.');
      } else {
        toast?.error?.(`❌ PDF generation failed: ${err.message}`);
      }
    } finally {
      setActionLoading(null);
    }
  }, [initialProducts, actionLoading, markupPercent, toast]);

  /**
   * Helper to generate a preconfigured supplier Web Share with Margin over Cost and EXW terms
   */
  const handleSupplierWebShare = useCallback(async (supplierId, supplierLabel, loadingKey, extraParams = {}) => {
    if (actionLoading) return;
    setActionLoading(loadingKey);
    toast?.info?.(`🔗 Creating ${supplierLabel} Web Share link (Cost +${markupPercent}% EXW)…`);

    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          priceSource: 'cost',
          priceMarkupPercent: markupPercent,
          currency: 'USD',
          recipientName: `${supplierLabel} Healthcare Providers`,
          recipientType: 'clinic',
          validityDays: 30,
          ...extraParams,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.shareableUrl) {
        window.open(data.shareableUrl, '_blank');
        toast?.success?.(`✅ ${supplierLabel} Web Share (+${markupPercent}%) opened in new tab!`);
      } else {
        throw new Error('Failed to obtain shareable link.');
      }
    } catch (err) {
      console.error(`[handleSupplierWebShare ${supplierLabel}]`, err);
      toast?.error?.(`❌ Web Share generation failed: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, markupPercent, toast]);

  const sharedActions = {
    onExportJSON:        handleExportJSON,
    onExportCSV:         handleExportCSV,
    onImportPriceList:   handleImportPriceList,
    onNewProduct:        handleNewProduct,
    onLotuslandPDF:      () => handleSupplierPDF('lotusland', 'Lotusland / RegenPept', 'lotusland-pdf', { catalogueFilter: 'RegenPept' }),
    onLotuslandWeb:      () => handleSupplierWebShare('supplier-lotusland', 'Lotusland / RegenPept', 'lotusland-web', { catalogueFilter: 'RegenPept' }),
    onLarimedicalPDF:    () => handleSupplierPDF('supplier-larimedical', 'LARIMEDICAL (Sterilia)', 'larimedical-pdf', { currency: 'EUR' }),
    onLarimedicalWeb:    () => handleSupplierWebShare('supplier-larimedical', 'LARIMEDICAL (Sterilia)', 'larimedical-web', { currency: 'EUR' }),
    onEuropeptidesPDF:   () => handleSupplierPDF('europeptides', 'EuroPeptides', 'europeptides-pdf'),
    onEuropeptidesWeb:   () => handleSupplierWebShare('supplier-europeptides', 'EuroPeptides', 'europeptides-web'),
    onOpenExportHub:     handleOpenExportHub,
    markupPercent,
    setMarkupPercent,
    actionLoading,
  };

  return (
    <>
      {/* Responsive CSS */}
      <style>{`
        .catalog-header-actions-desktop { display: flex; }
        .catalog-header-actions-mobile  { display: none; }
        @media (max-width: 768px) {
          .catalog-header-actions-desktop { display: none; }
          .catalog-header-actions-mobile  { display: flex; }
          .btn-label { display: none; }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto', paddingBottom: '3rem', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <MasterCatalogTable
          initialProducts={initialProducts}
          globalMetrics={globalMetrics}
          readOnly={readOnly}
          headerActions={<DesktopCatalogActions {...sharedActions} />}
          mobileHeaderActions={<MobileCatalogActions {...sharedActions} />}
        />
      </div>

      {/* Unified Multi-Catalogue Export Drawer */}
      <UnifiedExportDrawer
        isOpen={isExportHubOpen}
        onClose={() => setIsExportHubOpen(false)}
        initialCatalogueId="regenpept"
        onGeneratePDF={handleSupplierPDF}
        onGenerateWebShare={handleSupplierWebShare}
        actionLoading={actionLoading}
        toast={toast}
      />
    </>
  );
}
