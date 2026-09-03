'use client';
import React, { useState, useEffect } from 'react';
import StandardDrawer from '@/components/ui/StandardDrawer';
import EmptyState from '@/components/ui/EmptyState';
import notifier from '@/services/NotificationService';
import { useDocumentGeneratorState } from '@/hooks/admin/useDocumentGeneratorState';

// Modular Subcomponents
import QuickPresetsBar from './document-generator/QuickPresetsBar';
import DocumentTypeSelector from './document-generator/DocumentTypeSelector';
import PricingConfigSection from './document-generator/PricingConfigSection';
import VariantPriceEditorModal from './document-generator/VariantPriceEditorModal';
import QuotationDetailsSection from './document-generator/QuotationDetailsSection';
import ContentConfigSection from './document-generator/ContentConfigSection';
import PresentationOptionsSection from './document-generator/PresentationOptionsSection';
import GeneratorLiveSummary from './document-generator/GeneratorLiveSummary';
import DocumentPreviewView from './document-generator/DocumentPreviewView';
import DocumentShareModal from './document-generator/DocumentShareModal';
import { exportCatalogToCsv } from '@/utils/exportCatalogToExcel';

import { FileText, Sparkles, Download, Share2, ExternalLink, ArrowLeft, PlusCircle, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function PriceListPdfDrawer({
  isOpen,
  onClose,
  onClearSelection,
  selectedProducts = [],
  initialConfig = null,
}) {
  const [view, setView] = useState('config'); // 'config' | 'preview'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharingWebCatalog, setIsSharingWebCatalog] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [pdfData, setPdfData] = useState(null); // { url, filename, pages, variants }
  const [granularEditorOpen, setGranularEditorOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Reset view on drawer open
  useEffect(() => {
    if (isOpen) {
      setView('config');
      setIsGenerating(false);
      setGenerationError('');
      setPdfData(null);
    }
  }, [isOpen]);

  // Hook for unified state, metrics & pricing engine
  const gen = useDocumentGeneratorState(selectedProducts, initialConfig);

  // Generation Handler
  const handleGeneratePreview = async () => {
    setView('preview');
    setIsGenerating(true);
    setGenerationError('');
    setPdfData(null);

    const ts = Date.now();
    const refNumber = `PDF-${ts}`;
    const selectedClient = gen.clients.find(c => c.id === gen.clientId);
    const resolvedName = selectedClient?.name || gen.recipientName;

    const payload = {
      productIds: gen.productIds,
      variantIds: gen.variantIds,
      docType: gen.docType,
      priceTier: gen.priceSource,
      isExWorks: gen.isExWorks,
      incoterm: gen.incoterm,
      bestSourcingOnly: gen.bestSourcingOnly,
      includePrices: gen.includePrices,
      currency: gen.currency,
      groupBy: gen.groupBy,
      sortBy: gen.sortBy,
      pdfLanguage: gen.pdfLanguage,
      watermark: gen.watermark,
      coverPage: gen.coverPage,
      onlyInStock: gen.onlyInStock,
      includeBibliography: gen.includeBibliography,
      supplierMasking: gen.supplierMasking,
      showPricePerMg: gen.showPricePerMg,
      showWarehouse: gen.showWarehouse,
      kitSize: gen.kitSize,
      // Hybrid product type scope filter (Fase 2)
      productTypeFilter: gen.productTypeFilter || 'all',
      supplierFilter: gen.supplierFilter || null,
      catalogueFilter: gen.catalogueFilter || null,
      categoryFilter: gen.categoryFilter || null,

      // Column visibility toggles
      showSupplier: gen.columns.supplier,
      showDosage: gen.columns.dosage,
      showPresentation: gen.columns.format,
      showPurity: gen.columns.purity,
      showReconstitution: gen.columns.reconstitution,
      showGauge: gen.columns.gauge,
      showPackSize: gen.columns.packSize,
      showSampleType: gen.columns.sampleType,
      showBiomarkers: gen.columns.biomarkers,
      showDescription: gen.columns.description,
      showKitPrice: gen.priceDisplayMode === 'kit' || gen.columns.kitPrice,

      // Recipient & CRM tracking fields
      recipientType: gen.recipientType || 'custom',
      recipientId: gen.recipientId || gen.clientId || null,
      recipientName: gen.recipientName || resolvedName || null,
      recipientEmail: gen.recipientEmail || null,
      accountManagerId: gen.accountManagerId || null,
      accountManagerName: gen.accountManagerName || null,
      accountManagerEmail: gen.accountManagerEmail || null,
      accountManagerPhone: gen.accountManagerPhone || null,
      followUpNotes: gen.followUpNotes || null,
      clientId: gen.docType === 'quotation' ? (gen.clientId || null) : null,
      validUntil: gen.validUntil || null,
      commercialNotes: gen.commercialNotes || null,

      // Custom price overrides (ephemeral)
      priceOverrides: Object.keys(gen.overrides).length > 0 ? gen.overrides : null,
    };

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Generation failed (HTTP ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalResult = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.type === 'done' || data.step === 'done') {
              finalResult = data;
            }
            if (data.type === 'error') {
              throw new Error(data.message || 'Generation error');
            }
          } catch {
            // Ignore parse errors on incomplete chunks
          }
        }
      }

      if (finalResult) {
        const url = finalResult.meta?.url || (finalResult.pdfBase64 ? `data:application/pdf;base64,${finalResult.pdfBase64}` : null);
        const filename = finalResult.filename || `REGENPEPT_${gen.docType.toUpperCase()}_${refNumber}.pdf`;
        setPdfData({
          url,
          filename,
          pages: finalResult.meta?.pages || 1,
          variants: finalResult.meta?.variants || gen.canonicalMetrics.variantCount,
        });
        setIsGenerating(false);
        notifier.success(`PDF generated: ${finalResult.meta?.pages || 1} page${finalResult.meta?.pages !== 1 ? 's' : ''}, ${finalResult.meta?.variants || gen.canonicalMetrics.variantCount} items`);
      } else {
        throw new Error('Did not receive complete PDF stream.');
      }
    } catch (err) {
      console.error('[PriceListPdfDrawer]', err);
      setIsGenerating(false);
      setGenerationError(err.message || 'An error occurred during generation.');
      notifier.error(`Generation failed: ${err.message}`);
    }
  };

  const handleClose = () => {
    setView('config');
    setIsGenerating(false);
    setGenerationError('');
    setPdfData(null);
    onClose?.();
  };

  // ─── Empty state (no products selected) ───────────────────────────────────
  if (isOpen && selectedProducts.length === 0) {
    return (
      <StandardDrawer
        isOpen={isOpen}
        onClose={handleClose}
        width={isMobile ? '100%' : '520px'}
        title="Generate Document"
        subtitle="No products selected"
        footer={<button onClick={handleClose} style={{ padding: '9px 18px', background: '#003666', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Close</button>}
      >
        <EmptyState
          icon={FileText}
          title="No products selected"
          subtitle="Please select at least one product or variant from the catalog table before creating a document."
          action={{ label: 'Close drawer', onClick: handleClose }}
        />
      </StandardDrawer>
    );
  }

  const handleShareWebCatalog = async () => {
    if (isSharingWebCatalog) return;
    setIsSharingWebCatalog(true);
    try {
      const selectedClient = gen.clients.find(c => c.id === gen.clientId);
      const recipientName = selectedClient?.name || gen.recipientName || 'Valued Client';

      const res = await fetch('/api/catalog/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: gen.supplierId || null,
          productIds: gen.productIds || [],
          variantIds: gen.variantIds || [],
          priceSource: gen.priceSource || 'wholeseller',
          currency: gen.currency || 'USD',
          recipientName,
          recipientType: gen.recipientType || 'wholesaler',
          accountManagerName: gen.accountManagerName || 'Atlas Commercial Desk',
          accountManagerEmail: gen.accountManagerEmail || 'orders@atlas-solutions.com',
          validityDays: 30
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.shareableUrl) {
        try {
          await navigator.clipboard.writeText(data.shareableUrl);
          notifier.success('🌐 Web Catalog link copied to clipboard! ✓');
        } catch {
          notifier.success('🌐 Interactive Micro-Catalog link generated ✓');
        }
        setPdfData({ url: data.shareableUrl, filename: `Catalog_${recipientName}.pdf`, variants: gen.canonicalMetrics.variantCount });
        setShareModalOpen(true);
      } else {
        notifier.error(data.error || 'Failed to generate link');
      }
    } catch (err) {
      notifier.error(`Error: ${err.message}`);
    } finally {
      setIsSharingWebCatalog(false);
    }
  };

  // ─── Footer for Step 1 (Configure) ─────────────────────────────────────────
  const configFooter = isMobile ? (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 10 }}>
      <GeneratorLiveSummary
        docType={gen.docType}
        variantCount={gen.canonicalMetrics.variantCount}
        currency={gen.currency}
        includePrices={gen.includePrices}
        priceSource={gen.priceSource}
        isExWorks={gen.isExWorks}
        adjustmentType={gen.adjustmentType}
        adjustmentValue={gen.adjustmentValue}
        hasOverrides={gen.pricingSummary.hasOverrides}
        groupBy={gen.groupBy}
        isMobile={true}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            exportCatalogToCsv({
              items: gen.variantRows,
              currency: gen.currency,
              incoterm: gen.incoterm,
              priceTier: gen.priceSource,
              filename: `atlas_solutions_catalog_${gen.priceSource}_${new Date().toISOString().slice(0, 10)}.csv`
            });
            notifier.success('Catalog exported to Excel/CSV successfully!');
          }}
          disabled={gen.canonicalMetrics.variantCount === 0}
          style={{
            padding: '9px 10px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <FileSpreadsheet size={14} color="#16a34a" /> Excel (.csv)
        </button>

        <button
          type="button"
          onClick={handleShareWebCatalog}
          disabled={gen.canonicalMetrics.variantCount === 0 || isSharingWebCatalog}
          style={{
            padding: '9px 10px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            fontSize: '0.78rem',
            fontWeight: 700,
            color: '#166534',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {isSharingWebCatalog ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} color="#16a34a" />}
          {isSharingWebCatalog ? 'Generating...' : '🌐 Share Web'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8, width: '100%' }}>
        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '10px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleGeneratePreview}
          disabled={gen.canonicalMetrics.variantCount === 0}
          style={{
            padding: '10px 16px',
            background: '#003666',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 2px 4px rgba(0,54,102,0.15)',
          }}
        >
          <Sparkles size={15} /> Preview PDF →
        </button>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12, flexWrap: 'wrap' }}>
      <GeneratorLiveSummary
        docType={gen.docType}
        variantCount={gen.canonicalMetrics.variantCount}
        currency={gen.currency}
        includePrices={gen.includePrices}
        priceSource={gen.priceSource}
        isExWorks={gen.isExWorks}
        adjustmentType={gen.adjustmentType}
        adjustmentValue={gen.adjustmentValue}
        hasOverrides={gen.pricingSummary.hasOverrides}
        groupBy={gen.groupBy}
        isMobile={false}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={() => {
            exportCatalogToCsv({
              items: gen.variantRows,
              currency: gen.currency,
              incoterm: gen.incoterm,
              priceTier: gen.priceSource,
              filename: `atlas_solutions_catalog_${gen.priceSource}_${new Date().toISOString().slice(0, 10)}.csv`
            });
            notifier.success('Catalog exported to Excel/CSV successfully!');
          }}
          disabled={gen.canonicalMetrics.variantCount === 0}
          style={{
            padding: '8px 14px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <FileSpreadsheet size={14} color="#16a34a" /> Export Excel (.csv)
        </button>

        <button
          type="button"
          onClick={handleShareWebCatalog}
          disabled={gen.canonicalMetrics.variantCount === 0 || isSharingWebCatalog}
          style={{
            padding: '8px 14px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 8,
            fontSize: '0.82rem',
            fontWeight: 700,
            color: '#166534',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isSharingWebCatalog ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} color="#16a34a" />}
          {isSharingWebCatalog ? 'Generating...' : '🌐 Share Web Catalog'}
        </button>

        <button
          type="button"
          onClick={handleClose}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleGeneratePreview}
          disabled={gen.canonicalMetrics.variantCount === 0}
          style={{
            padding: '9px 22px',
            background: '#003666',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 4px rgba(0,54,102,0.15)',
          }}
        >
          <Sparkles size={15} /> Preview PDF →
        </button>
      </div>
    </div>
  );

  // ─── Footer for Step 2 (Preview) ───────────────────────────────────────────
  const previewFooter = isMobile ? (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 10 }}>
      {/* Mobile Top Secondary Utility Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
        <button
          type="button"
          onClick={() => {
            gen.clearAllOverrides();
            setView('config');
          }}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <PlusCircle size={12} /> New Doc
        </button>

        <button
          type="button"
          onClick={() => {
            exportCatalogToCsv({
              items: gen.variantRows,
              currency: gen.currency,
              incoterm: gen.incoterm,
              priceTier: gen.priceSource,
              filename: `atlas_solutions_catalog_${gen.priceSource}_${new Date().toISOString().slice(0, 10)}.csv`
            });
            notifier.success('Catalog exported to Excel/CSV successfully!');
          }}
          style={{
            padding: '6px 12px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <FileSpreadsheet size={12} color="#16a34a" /> Excel (.csv)
        </button>

        <button
          type="button"
          onClick={() => {
            if (pdfData?.url) window.open(pdfData.url, '_blank');
          }}
          style={{
            padding: '6px 12px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.76rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ExternalLink size={12} /> Full Screen ↗
        </button>
      </div>

      {/* Mobile Primary Thumb-Zone Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <button
          type="button"
          onClick={() => setView('config')}
          style={{
            padding: '10px 14px',
            minHeight: '44px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={14} /> Edit
        </button>

        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          style={{
            padding: '10px 14px',
            minHeight: '44px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 8,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <Share2 size={14} /> Share
        </button>

        <button
          type="button"
          onClick={() => {
            if (pdfData?.url) {
              const a = document.createElement('a');
              a.href = pdfData.url;
              a.download = pdfData.filename || 'ATLAS_SOLUTIONS_Catalog.pdf';
              a.target = '_blank';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              onClearSelection?.();
            }
          }}
          style={{
            flex: 1,
            padding: '10px 18px',
            minHeight: '44px',
            background: '#003666',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: '0 2px 6px rgba(0,54,102,0.3)',
          }}
        >
          <Download size={15} /> Download PDF
        </button>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => setView('config')}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <ArrowLeft size={13} /> Edit Settings
        </button>

        <button
          type="button"
          onClick={() => {
            gen.clearAllOverrides();
            setView('config');
          }}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <PlusCircle size={13} /> New Document
        </button>

        <button
          type="button"
          onClick={() => {
            exportCatalogToCsv({
              items: gen.variantRows,
              currency: gen.currency,
              incoterm: gen.incoterm,
              priceTier: gen.priceSource,
              filename: `atlas_solutions_catalog_${gen.priceSource}_${new Date().toISOString().slice(0, 10)}.csv`
            });
            notifier.success('Catalog exported to Excel/CSV successfully!');
          }}
          style={{
            padding: '8px 14px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <FileSpreadsheet size={13} color="#16a34a" /> Excel (.csv)
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        <button
          type="button"
          onClick={() => setShareModalOpen(true)}
          style={{
            padding: '8px 14px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Share2 size={13} /> Share ▾
        </button>

        <button
          type="button"
          onClick={() => {
            if (pdfData?.url) window.open(pdfData.url, '_blank');
          }}
          style={{
            padding: '8px 14px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: 7,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#0f172a',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <ExternalLink size={13} /> Open ↗
        </button>

        <button
          type="button"
          onClick={async () => {
            if (pdfData?.url) {
              try {
                notifier.info('Starting PDF download…');
                const res = await fetch(pdfData.url);
                if (!res.ok) throw new Error('Fetch failed');
                const blob = await res.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = pdfData.filename || 'ATLAS_SOLUTIONS_Catalog.pdf';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
                notifier.success('PDF downloaded successfully ✓');
                onClearSelection?.();
              } catch (err) {
                // Fallback direct link
                window.open(pdfData.url, '_blank');
              }
            }
          }}
          style={{
            padding: '8px 18px',
            background: '#003666',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 2px 6px rgba(0,54,102,0.25)',
          }}
        >
          <Download size={14} /> Download PDF
        </button>
      </div>
    </div>
  );

  return (
    <>
      <StandardDrawer
        isOpen={isOpen}
        onClose={handleClose}
        zIndex={10050}
        width={view === 'preview' ? (isMobile ? '100%' : '840px') : (isMobile ? '100%' : '660px')}
        title={view === 'config' ? 'Generate Document' : 'PDF Preview'}
        subtitle={gen.canonicalMetrics.summaryLabel}
        footer={view === 'config' ? configFooter : previewFooter}
      >
        {view === 'config' ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Step 1.0: 1-Click Quick Presets */}
            <QuickPresetsBar
              activePreset={gen.activePreset}
              applyPreset={gen.applyPreset}
              isMobile={isMobile}
            />

            {/* Step 1.1: Document Type (Price List / Catalog / Quote) */}
            <DocumentTypeSelector
              value={gen.docType}
              onChange={gen.setDocType}
              isMobile={isMobile}
            />

            {/* Step 1.2: Quotation Fields (Only if docType === 'quotation') */}
            {gen.docType === 'quotation' && (
              <QuotationDetailsSection
                clients={gen.clients}
                clientsLoading={gen.clientsLoading}
                clientId={gen.clientId}
                setClientId={gen.setClientId}
                recipientName={gen.recipientName}
                setRecipientName={gen.setRecipientName}
                validUntil={gen.validUntil}
                setValidUntil={gen.setValidUntil}
                commercialNotes={gen.commercialNotes}
                setCommercialNotes={gen.setCommercialNotes}
                isMobile={isMobile}
              />
            )}

            {/* Step 1.3: Pricing & Commercial Terms */}
            <PricingConfigSection
              includePrices={gen.includePrices}
              setIncludePrices={gen.setIncludePrices}
              priceSource={gen.priceSource}
              setPriceSource={gen.setPriceSource}
              currency={gen.currency}
              setCurrency={gen.setCurrency}
              priceDisplayMode={gen.priceDisplayMode}
              setPriceDisplayMode={gen.setPriceDisplayMode}
              kitSize={gen.kitSize}
              setKitSize={gen.setKitSize}
              isExWorks={gen.isExWorks}
              setIsExWorks={gen.setIsExWorks}
              incoterm={gen.incoterm}
              setIncoterm={gen.setIncoterm}
              bestSourcingOnly={gen.bestSourcingOnly}
              setBestSourcingOnly={gen.setBestSourcingOnly}
              adjustmentType={gen.adjustmentType}
              setAdjustmentType={gen.setAdjustmentType}
              adjustmentValue={gen.adjustmentValue}
              setAdjustmentValue={gen.setAdjustmentValue}
              adjustmentScope={gen.adjustmentScope}
              setAdjustmentScope={gen.setAdjustmentScope}
              pricingSummary={gen.pricingSummary}
              onOpenGranularEditor={() => setGranularEditorOpen(true)}
              isMobile={isMobile}
            />

            {/* Step 1.4: Content & Columns */}
            <ContentConfigSection
              columns={gen.columns}
              toggleColumn={gen.toggleColumn}
              categories={gen.canonicalMetrics.categories}
              includePrices={gen.includePrices}
              priceSource={gen.priceSource}
              isExWorks={gen.isExWorks}
              isMobile={isMobile}
            />

            {/* Step 1.5: Presentation & Layout Accordion */}
            <PresentationOptionsSection
              groupBy={gen.groupBy}
              setGroupBy={gen.setGroupBy}
              sortBy={gen.sortBy}
              setSortBy={gen.setSortBy}
              pdfLanguage={gen.pdfLanguage}
              setPdfLanguage={gen.setPdfLanguage}
              watermark={gen.watermark}
              setWatermark={gen.setWatermark}
              coverPage={gen.coverPage}
              setCoverPage={gen.setCoverPage}
              onlyInStock={gen.onlyInStock}
              setOnlyInStock={gen.setOnlyInStock}
              includeBibliography={gen.includeBibliography}
              setIncludeBibliography={gen.setIncludeBibliography}
              supplierMasking={gen.supplierMasking}
              setSupplierMasking={gen.setSupplierMasking}
              showPricePerMg={gen.showPricePerMg}
              setShowPricePerMg={gen.setShowPricePerMg}
              showWarehouse={gen.showWarehouse}
              setShowWarehouse={gen.setShowWarehouse}
              productTypeFilter={gen.productTypeFilter}
              setProductTypeFilter={gen.setProductTypeFilter}
              managers={gen.managers}
              accountManagerId={gen.accountManagerId}
              selectAccountManager={gen.selectAccountManager}
              accountManagerName={gen.accountManagerName}
              setAccountManagerName={gen.setAccountManagerName}
              accountManagerEmail={gen.accountManagerEmail}
              setAccountManagerEmail={gen.setAccountManagerEmail}
              wholesellers={gen.wholesellers}
              clinics={gen.clinics}
              doctors={gen.doctors}
              clients={gen.clients}
              recipientType={gen.recipientType}
              setRecipientType={gen.setRecipientType}
              recipientId={gen.recipientId}
              selectRecipient={gen.selectRecipient}
              recipientName={gen.recipientName}
              setRecipientName={gen.setRecipientName}
              recipientEmail={gen.recipientEmail}
              setRecipientEmail={gen.setRecipientEmail}
              followUpNotes={gen.followUpNotes}
              setFollowUpNotes={gen.setFollowUpNotes}
              isMobile={isMobile}
            />
          </div>
        ) : (
          /* Step 2: Dominant PDF Preview Screen */
          <DocumentPreviewView
            pdfUrl={pdfData?.url}
            filename={pdfData?.filename}
            isGenerating={isGenerating}
            generationError={generationError}
            onRetry={handleGeneratePreview}
            onBackToEdit={() => setView('config')}
            onNewDocument={() => {
              gen.clearAllOverrides();
              setView('config');
            }}
            docType={gen.docType}
            variantCount={gen.canonicalMetrics.variantCount}
            isMobile={isMobile}
          />
        )}
      </StandardDrawer>

      {/* Optional Granular Price Editor Modal */}
      <VariantPriceEditorModal
        isOpen={granularEditorOpen}
        onClose={() => setGranularEditorOpen(false)}
        variantRows={gen.variantRows}
        onSetOverride={gen.setIndividualOverride}
        onClearAllOverrides={gen.clearAllOverrides}
        isMobile={isMobile}
      />

      {/* On-Demand Share Modal */}
      <DocumentShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        pdfUrl={pdfData?.url}
        docType={gen.docType}
        variantCount={gen.canonicalMetrics.variantCount}
        recipientName={gen.recipientName}
        recipientEmail={gen.recipientEmail}
        accountManagerName={gen.accountManagerName}
        accountManagerEmail={gen.accountManagerEmail}
        logId={pdfData?.meta?.logId || pdfData?.logId}
        isMobile={isMobile}
      />
    </>
  );
}
