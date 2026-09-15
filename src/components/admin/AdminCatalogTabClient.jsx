'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Download, Plus, FileText, ChevronDown, BookOpen, Loader, Globe } from '@/lib/icons';
import { useDrawer } from '@/context/DrawerContext';
import { toast } from 'react-hot-toast';
import notifier from '@/services/NotificationService';
import { EXPORT_CATALOGUES } from '@/config/exportCatalogues';
import UnifiedExportDrawer from './catalog/UnifiedExportDrawer';
import CatalogExportStatusDock from './catalog/CatalogExportStatusDock';
import MasterCatalogTable from './MasterCatalogTable';
import CatalogExportPopover from './catalog/popovers/CatalogExportPopover';

/* ─────────────────────────────────────────────────────────────────
   Catalog Export Dropdown — Shared by Desktop & Mobile
───────────────────────────────────────────────────────────────── */
function CatalogExportDropdown({
  onExportJSON,
  onExportCSV,
  onGeneratePDF,
  onGenerateWebShare,
  onOpenExportHub,
  markupPercent,
  setMarkupPercent,
  actionLoading,
  isMobile = false,
  filteredProductIds = [],
}) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto' }}>
      <button
        type="button"
        onClick={() => setExportOpen(prev => !prev)}
        disabled={Boolean(actionLoading)}
        aria-busy={Boolean(actionLoading)}
        aria-expanded={exportOpen}
        className="gcp-btn-secondary"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          minHeight: isMobile ? '44px' : '38px',
          padding: isMobile ? '0.5rem 0.65rem' : '0.45rem 0.75rem',
          whiteSpace: 'nowrap',
          opacity: actionLoading ? 0.75 : 1,
          cursor: actionLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          width: isMobile ? '100%' : 'auto',
          borderRadius: isMobile ? '10px' : '6px',
        }}
        title="Export Catalog & Price Lists"
      >
        {actionLoading ? (
          <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Download size={15} />
        )}
        <span className={isMobile ? '' : 'btn-label'}>
          {actionLoading ? 'Exporting…' : 'Export'}
        </span>
        <ChevronDown size={13} style={{ opacity: 0.6 }} />
      </button>

      {/* CatalogExportPopover now renders as a StandardDrawer (portal-based).
          No anchorRef or isMobile needed — StandardDrawer handles both. */}
      <CatalogExportPopover
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExportJSON={onExportJSON}
        onExportCSV={onExportCSV}
        onOpenExportHub={onOpenExportHub}
        onGeneratePDF={onGeneratePDF}
        onGenerateWebShare={onGenerateWebShare}
        markupPercent={markupPercent}
        setMarkupPercent={setMarkupPercent}
        actionLoading={actionLoading}
        filteredProductIds={filteredProductIds}
      />
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
    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
      <button
        type="button"
        onClick={props.onNewProduct}
        className="gcp-btn-primary"
        style={{
          flex: 2,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.35rem',
          padding: '0.5rem 0.6rem',
          minHeight: '44px',
          whiteSpace: 'nowrap',
          fontSize: '0.84rem',
          fontWeight: 700,
          borderRadius: '10px',
        }}
      >
        <Plus size={16} />
        <span>New Product</span>
      </button>
      <button
        type="button"
        onClick={props.onImportPriceList}
        className="gcp-btn-secondary"
        title="Import Price List"
        style={{ 
          flex: 1,
          padding: '0.5rem 0.4rem', 
          minHeight: '44px', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.3rem',
          fontSize: '0.84rem',
          fontWeight: 700,
          borderRadius: '10px',
          whiteSpace: 'nowrap'
        }}
      >
        <FileText size={15} />
        <span>Import</span>
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <CatalogExportDropdown {...props} isMobile={true} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────────── */
export default function AdminCatalogTabClient({ initialProducts, globalMetrics, readOnly = false }) {
  const { openDrawer } = useDrawer();
  const [actionLoading, setActionLoading] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
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

    const variantCount = extraParams.variantCount || (
      loadingKey.includes('lotusland') ? 104 :
      loadingKey.includes('larimedical') ? 8 :
      loadingKey.includes('europeptides') ? 54 : null
    );

    setExportStatus({
      id: loadingKey,
      type: 'pdf',
      title: `${supplierLabel} Catalog (PDF)`,
      variantCount,
      markupPercent,
      state: 'loading',
      stepMessage: `Compiling ${variantCount ? `${variantCount} variants` : 'items'} & generating high-resolution PDF pages…`,
      resultUrl: null,
      errorMessage: null
    });

    toast.loading(`📄 Generating ${supplierLabel} PDF (${variantCount ? `${variantCount} variants, ` : ''}Cost +${markupPercent}% EXW)…`, { id: 'catalog-export-toast' });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    try {
      const productIds = extraParams.productIds !== undefined
        ? extraParams.productIds
        : (initialProducts || []).map(p => p.id).filter(Boolean);

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
          currency:          extraParams.currency || 'USD',
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
      let rawPdfBase64 = null;
      let downloadFilename = null;
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
              if (data.type === 'done') {
                finalUrl = data.meta?.url || null;
                rawPdfBase64 = data.pdfBase64 || null;
                downloadFilename = data.filename || null;
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

      if (rawPdfBase64 || finalUrl) {
        const fullUrl = finalUrl || '#';
        const finalFilename = downloadFilename || `${supplierLabel}_Catalog_${new Date().toISOString().slice(0, 10)}.pdf`;

        // Direct local file dump to the user's computer
        if (rawPdfBase64) {
          try {
            const byteCharacters = atob(rawPdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
          } catch (dumpErr) {
            console.warn('Base64 direct blob dump failed, falling back to URL download:', dumpErr);
            if (finalUrl) {
              const a = document.createElement('a');
              a.href = finalUrl;
              a.download = finalFilename;
              a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              a.remove();
            }
          }
        } else if (finalUrl) {
          try {
            const a = document.createElement('a');
            a.href = finalUrl;
            a.download = finalFilename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            a.remove();
          } catch (e) {
            console.warn('Direct popup blocked, user can open via dock button', e);
          }
        }
        toast.success(`✅ ${supplierLabel} PDF Catalog (+${markupPercent}%) ready!`, { id: 'catalog-export-toast' });
        setExportStatus({
          id: loadingKey,
          type: 'pdf',
          title: `${supplierLabel} Catalog (PDF)`,
          variantCount,
          markupPercent,
          state: 'success',
          stepMessage: 'PDF document generated and ready to download.',
          resultUrl: fullUrl,
          errorMessage: null
        });
        return { url: fullUrl };
      } else {
        throw new Error('PDF generation failed to return a valid URL.');
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`[handleSupplierPDF ${supplierLabel}]`, err);
      const errMsg = err.name === 'AbortError'
        ? 'PDF generation timed out. Please try again.'
        : `PDF generation failed: ${err.message}`;
      toast.error(`❌ ${errMsg}`, { id: 'catalog-export-toast' });
      setExportStatus({
        id: loadingKey,
        type: 'pdf',
        title: `${supplierLabel} Catalog (PDF)`,
        variantCount,
        markupPercent,
        state: 'error',
        stepMessage: null,
        resultUrl: null,
        errorMessage: errMsg
      });
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [initialProducts, actionLoading, markupPercent]);

  /**
   * Helper to generate a preconfigured supplier Web Share with Margin over Cost and EXW terms
   */
  const handleSupplierWebShare = useCallback(async (supplierId, supplierLabel, loadingKey, extraParams = {}) => {
    if (actionLoading) return;
    setActionLoading(loadingKey);

    const variantCount = extraParams.variantCount || (
      loadingKey.includes('lotusland') ? 104 :
      loadingKey.includes('larimedical') ? 8 :
      loadingKey.includes('europeptides') ? 54 : null
    );

    setExportStatus({
      id: loadingKey,
      type: 'web',
      title: `${supplierLabel} Web Share`,
      variantCount,
      markupPercent,
      state: 'loading',
      stepMessage: 'Creating secure 30-day interactive client link…',
      resultUrl: null,
      errorMessage: null
    });

    toast.loading(`🔗 Creating ${supplierLabel} Web Share link (${variantCount ? `${variantCount} variants, ` : ''}Cost +${markupPercent}% EXW)…`, { id: 'catalog-export-toast' });

    try {
      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          priceSource: 'cost',
          priceMarkupPercent: markupPercent,
          currency: extraParams.currency || 'USD',
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
        try {
          window.open(data.shareableUrl, '_blank', 'noopener,noreferrer');
        } catch (e) {
          console.warn('Direct popup blocked, user can open via dock button', e);
        }
        toast.success(`✅ ${supplierLabel} Web Share link (+${markupPercent}%) created!`, { id: 'catalog-export-toast' });
        setExportStatus({
          id: loadingKey,
          type: 'web',
          title: `${supplierLabel} Web Share`,
          variantCount,
          markupPercent,
          state: 'success',
          stepMessage: 'Interactive Web Share link is active.',
          resultUrl: data.shareableUrl,
          errorMessage: null
        });
        return { shareableUrl: data.shareableUrl };
      } else {
        throw new Error('Failed to obtain shareable link.');
      }
    } catch (err) {
      console.error(`[handleSupplierWebShare ${supplierLabel}]`, err);
      const errMsg = `Web Share generation failed: ${err.message}`;
      toast.error(`❌ ${errMsg}`, { id: 'catalog-export-toast' });
      setExportStatus({
        id: loadingKey,
        type: 'web',
        title: `${supplierLabel} Web Share`,
        variantCount,
        markupPercent,
        state: 'error',
        stepMessage: null,
        resultUrl: null,
        errorMessage: errMsg
      });
      throw err;
    } finally {
      setActionLoading(null);
    }
  }, [actionLoading, markupPercent]);

  const sharedActions = {
    onExportJSON:        handleExportJSON,
    onExportCSV:         handleExportCSV,
    onImportPriceList:   handleImportPriceList,
    onNewProduct:        handleNewProduct,
    onGeneratePDF:       handleSupplierPDF,
    onGenerateWebShare:  handleSupplierWebShare,
    onLotuslandPDF:      () => handleSupplierPDF('lotusland', 'Lotusland / RegenPept', 'lotusland-pdf', {
      catalogueFilter: 'RegenPept',
      productIds: []
    }),
    onLotuslandWeb:      () => handleSupplierWebShare('supplier-lotusland', 'Lotusland / RegenPept', 'lotusland-web', {
      catalogueFilter: 'RegenPept',
      category: 'all'
    }),
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
      />

      {/* Real-time Operation Status Dock (Mobile & Laptop) */}
      <CatalogExportStatusDock
        status={exportStatus}
        onDismiss={() => setExportStatus(null)}
      />
    </>
  );
}
