/**
 * pdfRenderer.js — Base PDF rendering utilities using jspdf + jspdf-autotable.
 *
 * Provides reusable building blocks used by all templates:
 *   - Cover page
 *   - Product card (image + data columns)
 *   - Section headers
 *   - Footer with page numbers + legal notice
 *   - Table of contents
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const PAGE_W = 210; // A4 width mm
export const PAGE_H = 297; // A4 height mm
export const MARGIN = 14;
export const CONTENT_W = PAGE_W - MARGIN * 2;

// ── Brand palette ──────────────────────────────────────────────────────────
export const COLORS = {
  primary:    [30, 41, 59],    // slate-800
  accent:     [37, 99, 235],   // blue-600
  light:      [248, 250, 252], // slate-50
  border:     [226, 232, 240], // slate-200
  text:       [15, 23, 42],    // slate-900
  muted:      [100, 116, 139], // slate-500
  white:      [255, 255, 255],
  warning:    [217, 119, 6],   // amber-600
};

/**
 * Create a new jsPDF document with common defaults.
 */
export function createDocument() {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

/**
 * Draw the standard page footer.
 * Called after each page is added.
 */
export function drawFooter(doc, { catalogTitle, pageNumber, totalPages, isExWorks = true }) {
  const y = PAGE_H - 8;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);

  // Left: catalog name
  doc.text(catalogTitle || 'Medical Catalog', MARGIN, y);

  // Center: ex-works notice
  if (isExWorks) {
    const notice = 'All prices are ex-works — shipping costs not included.';
    doc.text(notice, PAGE_W / 2, y, { align: 'center' });
  }

  // Right: page numbers
  doc.text(`${pageNumber} / ${totalPages}`, PAGE_W - MARGIN, y, { align: 'right' });

  // Divider line
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, PAGE_H - 10, PAGE_W - MARGIN, PAGE_H - 10);
}

/**
 * Add footers to ALL pages retroactively (called after document is fully built).
 */
export function addAllFooters(doc, { catalogTitle, isExWorks }) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // Skip cover page footer
    if (i === 1) continue;
    drawFooter(doc, { catalogTitle, pageNumber: i - 1, totalPages: totalPages - 1, isExWorks });
  }
}

/**
 * Draw the cover page.
 */
export function drawCoverPage(doc, { title, description, date, audience, tenantName, tenantLogo }) {
  // Background gradient effect (dark header block)
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 80, 'F');

  // Accent bar
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 80, PAGE_W, 2, 'F');

  // Atlas Health branding
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text((tenantName || 'Atlas Health').toUpperCase(), MARGIN, 14);

  // Title
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(title || 'Medical Catalog', CONTENT_W - 10);
  doc.text(titleLines, MARGIN, 35);

  // Description
  if (description) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 210, 220);
    const descLines = doc.splitTextToSize(description, CONTENT_W - 10);
    doc.text(descLines, MARGIN, 55);
  }

  // Date + audience chip on cover
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.white);
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  doc.text(formattedDate, MARGIN, 73);

  if (audience) {
    const audienceLabel = { patients: 'For Patients', doctors: 'For Doctors / Clinics', wholesalers: 'For Wholesalers' }[audience] || audience;
    doc.text(audienceLabel, PAGE_W - MARGIN, 73, { align: 'right' });
  }

  // Decorative vertical bar (left side)
  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 0, 3, PAGE_H, 'F');
}

/**
 * Draw a section header divider.
 */
export function drawSectionHeader(doc, label, y) {
  doc.setFillColor(...COLORS.light);
  doc.rect(MARGIN, y, CONTENT_W, 8, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN, y, CONTENT_W, 8, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.accent);
  doc.text(label.toUpperCase(), MARGIN + 3, y + 5.5);
  return y + 10;
}

/**
 * Draw a key-value info row (used inside product cards).
 */
export function drawInfoRow(doc, label, value, x, y, labelWidth = 30) {
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.muted);
  doc.text(label, x, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.text);
  const lines = doc.splitTextToSize(String(value || '—'), CONTENT_W - labelWidth - 5);
  doc.text(lines, x + labelWidth, y);
  return y + (lines.length * 4.5);
}

/**
 * Attempt to load a product image from URL as base64.
 * Returns null if it fails (network error, CORS, etc.).
 */
export async function loadImageAsBase64(url) {
  if (!url) return null;
  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}
