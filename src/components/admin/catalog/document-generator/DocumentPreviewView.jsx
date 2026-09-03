'use client';
import React, { useState } from 'react';
import DocumentShareModal from './DocumentShareModal';
import { FileText, Loader2, RefreshCw, Printer, Download, ExternalLink } from 'lucide-react';
import notifier from '@/services/NotificationService';

export default function DocumentPreviewView({
  pdfUrl,
  filename,
  isGenerating,
  generationError,
  onRetry,
  onBackToEdit,
  docType,
  variantCount,
  isMobile,
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    try {
      setIsDownloading(true);
      const res = await fetch(pdfUrl);
      if (!res.ok) throw new Error('Download request failed');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'ATLAS_SOLUTIONS_PriceList.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
      notifier.success('PDF downloaded successfully ✓');
    } catch (err) {
      console.warn('[PDF download error, fallback to direct open]:', err);
      // Fallback
      window.open(pdfUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!pdfUrl) return;
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        try {
          printWindow.print();
        } catch {
          // Native browser viewer print handles it
        }
      });
    }
  };

  // Loading State
  if (isGenerating) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '420px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <Loader2 size={36} color="#003666" style={{ animation: 'spin 1s linear infinite' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '14px 0 4px 0' }}>
          Preparing document…
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: 300 }}>
          Calculating exchange rates, formatting tables, and rendering high-resolution PDF preview.
        </p>
      </div>
    );
  }

  // Error State
  if (generationError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{ background: '#fef2f2', padding: 12, borderRadius: '50%', color: '#dc2626', marginBottom: 12 }}>
          <FileText size={32} />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px 0' }}>
          Document Generation Failed
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', maxWidth: 380, marginBottom: 16 }}>
          {generationError}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onBackToEdit}
            style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 7, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to Edit
          </button>
          <button
            type="button"
            onClick={onRetry}
            style={{ padding: '8px 18px', background: '#003666', color: '#ffffff', border: 'none', borderRadius: 7, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  // Mobile Top Bar
  const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
  const pdfViewerUrl = isAndroid && pdfUrl && pdfUrl.startsWith('http')
    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}`
    : `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Document Action Helper Bar (Desktop + Mobile) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        border: '1px solid #cbd5e1',
        borderRadius: 8,
        fontSize: '0.8rem',
        color: '#334155',
        marginBottom: 10,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: '#003666' }}>📄 {docType?.toUpperCase() || 'DOCUMENT'} PREVIEW</span>
          {variantCount > 0 && (
            <span style={{ fontSize: '0.72rem', background: '#e2e8f0', padding: '2px 7px', borderRadius: 10, color: '#475569', fontWeight: 600 }}>
              {variantCount} items
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 11px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Printer size={13} color="#003666" /> Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 6,
              background: '#003666',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: isDownloading ? 'wait' : 'pointer',
              boxShadow: '0 1px 2px rgba(0,54,102,0.2)',
            }}
          >
            <Download size={13} /> {isDownloading ? 'Downloading…' : 'Download'}
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#0284c7',
              fontSize: '0.78rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={12} /> Open ↗
          </a>
        </div>
      </div>

      {/* Main Dominant PDF Canvas — Studio Studio Backdrop */}
      <div style={{
        flex: 1,
        minHeight: isMobile ? '460px' : 'calc(100vh - 220px)',
        height: isMobile ? '520px' : '640px',
        background: '#334155',
        border: '1px solid #475569',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {pdfUrl ? (
          <iframe
            src={pdfViewerUrl}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block', background: '#ffffff' }}
            title="PDF Preview"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
            No preview available
          </div>
        )}
      </div>

      {/* On-Demand Share Modal */}
      <DocumentShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        pdfUrl={pdfUrl}
        docType={docType}
        variantCount={variantCount}
        isMobile={isMobile}
      />
    </div>
  );
}
