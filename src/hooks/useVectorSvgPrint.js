'use client';

import { useState, useCallback } from 'react';
import { renderSvgToPdfVector } from '@/utils/labels/vectorPdfEngine';

function resolveSvgElement(svgOrContainer) {
  if (!svgOrContainer) return null;
  if (typeof svgOrContainer.tagName === 'string' && svgOrContainer.tagName.toLowerCase() === 'svg') {
    return svgOrContainer;
  }
  return svgOrContainer.querySelector?.('svg') || null;
}

/**
 * useVectorSvgPrint
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable hook for 100% vector SVG-to-PDF export across the portal:
 *  - exportSvgAsPdf: exports standalone SVG components (labels, QR cards, badges) at 1:1 mm scale.
 *  - embedSvgInPdf: embeds SVG charts (e.g. Recharts) or diagrams directly into an existing jsPDF doc
 *    without rasterizing via html-to-image / toPng().
 */
export function useVectorSvgPrint() {
  const [isExporting, setIsExporting] = useState(false);

  const exportSvgAsPdf = useCallback(async (svgOrContainer, {
    widthMm = 75,
    heightMm = 45,
    filename = 'document.pdf',
    fallbackDpi = 600
  } = {}) => {
    const svgEl = resolveSvgElement(svgOrContainer);
    if (!svgEl) {
      return { success: false, vector: false, error: 'SVG element not found' };
    }

    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const isLandscape = widthMm >= heightMm;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [widthMm, heightMm],
        compress: true
      });

      const { vector } = await renderSvgToPdfVector(svgEl, pdf, {
        x: 0,
        y: 0,
        width: widthMm,
        height: heightMm,
        fallbackDpi
      });

      pdf.save(filename);
      return { success: true, vector, filename };
    } catch (err) {
      console.error('[useVectorSvgPrint] exportSvgAsPdf failed:', err);
      return { success: false, vector: false, error: err?.message || 'PDF export failed' };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const embedSvgInPdf = useCallback(async (svgOrContainer, pdfInstance, {
    x = 0,
    y = 0,
    width,
    height,
    fallbackDpi = 600
  } = {}) => {
    const svgEl = resolveSvgElement(svgOrContainer);
    if (!svgEl || !pdfInstance) {
      return { success: false, vector: false };
    }
    const { vector } = await renderSvgToPdfVector(svgEl, pdfInstance, {
      x,
      y,
      width,
      height,
      fallbackDpi
    });
    return { success: true, vector };
  }, []);

  return {
    isExporting,
    exportSvgAsPdf,
    embedSvgInPdf
  };
}
