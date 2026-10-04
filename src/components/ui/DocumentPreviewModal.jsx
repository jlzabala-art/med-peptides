"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Download, Printer, Loader2, AlertTriangle } from 'lucide-react';

/**
 * DocumentPreviewModal — "Preview first, then print" (GCP-style)
 * ─────────────────────────────────────────────────────────────────────────────
 * Loads the PDF as a same-origin Blob so that:
 *  - The user always SEES the document before printing/downloading.
 *  - Printing uses the browser's native PDF print (iframe.contentWindow.print()),
 *    which respects the PDF's own page size (e.g. 38×90 mm labels) instead of
 *    forcing an A4 HTML print of the page.
 *
 * Props:
 *  - fileUrl       URL to preview (served inline)
 *  - downloadUrl   Optional URL for the download button (defaults to fileUrl)
 *  - downloadName  Optional filename for the download
 *  - title / subtitle
 *  - printable     Show the Print button (default true)
 */
export default function DocumentPreviewModal({
  isOpen,
  onClose,
  fileUrl,
  downloadUrl,
  downloadName,
  title = 'Document Preview',
  subtitle,
  printable = true,
}) {
  const iframeRef = useRef(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error

  // Fetch the PDF as a blob (same-origin → printable from the iframe)
  useEffect(() => {
    if (!isOpen || !fileUrl) return undefined;
    let cancelled = false;
    let createdUrl = null;
    setStatus('loading');
    setBlobUrl(null);

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });
        createdUrl = URL.createObjectURL(pdfBlob);
        setBlobUrl(createdUrl);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('fallback'); });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [isOpen, fileUrl]);

  // Escape to close + lock background scroll
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      const win = iframeRef.current?.contentWindow;
      if (!win) throw new Error('no frame');
      win.focus();
      win.print();
    } catch {
      // Fallback (e.g. iOS Safari): open the PDF in a new tab, where the native viewer can print it
      window.open(blobUrl || fileUrl, '_blank', 'noopener');
    }
  };

  const effectiveDownloadUrl = downloadUrl || blobUrl || fileUrl;

  return (
    <div className="dpm-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="dpm-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dpm-header">
          <div style={{ minWidth: 0 }}>
            <h2 className="dpm-title">{title}</h2>
            {subtitle && <p className="dpm-subtitle">{subtitle}</p>}
          </div>
          <div className="dpm-actions">
            {printable && (
              <button
                id="dpm-print-btn"
                type="button"
                className="dpm-btn dpm-btn--primary"
                onClick={handlePrint}
                disabled={status !== 'ready' && status !== 'fallback'}
              >
                {status === 'loading' ? <Loader2 size={16} className="dpm-spin" /> : <Printer size={16} />}
                <span>Print</span>
              </button>
            )}
            {fileUrl && (
              <a
                id="dpm-download-btn"
                className="dpm-btn"
                href={effectiveDownloadUrl}
                download={downloadName || true}
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} /> <span className="dpm-btn-label">Download</span>
              </a>
            )}
            {fileUrl && (
              <a id="dpm-open-btn" className="dpm-btn dpm-btn--ghost" href={blobUrl || fileUrl} target="_blank" rel="noreferrer" title="Open in new tab">
                <ExternalLink size={16} />
              </a>
            )}
            <button id="dpm-close-btn" type="button" className="dpm-btn dpm-btn--ghost" onClick={onClose} aria-label="Close preview">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Viewer */}
        <div className="dpm-viewer">
          {status === 'loading' && (
            <div className="dpm-state">
              <div className="dpm-skeleton" />
              <span>Generating preview…</span>
            </div>
          )}
          {status === 'error' && (
            <div className="dpm-state">
              <AlertTriangle size={28} color="#dc2626" />
              <strong style={{ color: '#0f172a' }}>The document could not be loaded</strong>
              <a className="dpm-btn" href={fileUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} /> Open in new tab
              </a>
            </div>
          )}
          {!fileUrl && (
            <div className="dpm-state"><span>No document URL provided.</span></div>
          )}
          {status === 'ready' && blobUrl && (
            <iframe ref={iframeRef} src={blobUrl} className="dpm-frame" title={title} />
          )}
          {status === 'fallback' && fileUrl && (
            <iframe ref={iframeRef} src={fileUrl} className="dpm-frame" title={title} />
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dpm-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.7); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 2rem; }
        .dpm-panel { background: #fff; border-radius: 14px; width: 100%; max-width: 1000px; height: 90vh;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden;
          animation: dpmScaleIn 0.2s cubic-bezier(0.16,1,0.3,1); }
        .dpm-header { display: flex; justify-content: space-between; align-items: center; gap: 12px;
          padding: 0.85rem 1.25rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
        .dpm-title { margin: 0; font-size: 1.02rem; font-weight: 650; color: #0f172a;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dpm-subtitle { margin: 2px 0 0; font-size: 0.76rem; color: #64748b; }
        .dpm-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .dpm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px;
          padding: 0 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; color: #1e293b;
          font-size: 0.84rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: background 0.15s ease; }
        .dpm-btn:hover:not(:disabled) { background: #f1f5f9; }
        .dpm-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .dpm-btn--primary { background: var(--color-primary, #003666); border-color: var(--color-primary, #003666); color: #fff; }
        .dpm-btn--primary:hover:not(:disabled) { background: var(--color-primary, #003666); filter: brightness(1.12); }
        .dpm-btn--ghost { border-color: transparent; background: transparent; color: #64748b; padding: 0 10px; }
        .dpm-viewer { flex: 1; background: #e2e8f0; position: relative; }
        .dpm-frame { width: 100%; height: 100%; border: none; background: #fff; }
        .dpm-state { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 12px; color: #64748b; font-size: 0.86rem; text-align: center; padding: 1rem; }
        .dpm-skeleton { width: min(340px, 70%); height: 180px; border-radius: 10px;
          background: linear-gradient(90deg, #f1f5f9 25%, #ffffff 50%, #f1f5f9 75%); background-size: 200% 100%;
          animation: dpmShimmer 1.2s infinite; }
        .dpm-spin { animation: dpmSpin 1s linear infinite; }
        @keyframes dpmScaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes dpmShimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
        @keyframes dpmSpin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .dpm-overlay { padding: 0; }
          .dpm-panel { height: 100dvh; max-width: none; border-radius: 0; }
          .dpm-header { padding: 0.6rem 0.75rem; }
          .dpm-btn-label { display: none; }
          .dpm-btn { min-width: 44px; min-height: 44px; padding: 0 10px; }
        }
      ` }} />
    </div>
  );
}
