/**
 * atlasPdfChrome.js
 * Unified institutional PDF header, metadata KPI strip, AutoTable styling,
 * guest callout banner, and running page footer for all Atlas Health Services PDFs.
 * Enforces zero-overlap coordinate math (Golden Rules #60, #61, #66).
 */

export const ATLAS_PDF_PALETTE = {
  navy: [0, 54, 102],          // #003666
  teal: [13, 148, 136],        // #0d9488
  iceBlue: [186, 230, 253],    // #bae6fd
  slate900: [15, 23, 42],      // #0f172a
  slate700: [51, 65, 85],      // #334155
  slate500: [100, 116, 139],   // #64748b
  slate400: [148, 163, 184],   // #94a3b8
  border: [226, 232, 240],     // #e2e8f0
  surface: [248, 250, 252],    // #f8fafc
  headerTint: [241, 245, 249], // #f1f5f9
  ctaBg: [240, 249, 255],      // #f0f9ff
  ctaBorder: [186, 230, 253],  // #bae6fd
  ctaText: [3, 105, 161],      // #0369a1
  white: [255, 255, 255],
};

/**
 * Draws the unified Navy + Teal institutional letterhead.
 * Returns the next Y coordinate (31mm) for subsequent sections.
 */
export function drawAtlasInstitutionalHeader(
  doc,
  {
    title = 'ATLAS HEALTH SERVICES — PRICE SCHEDULE',
    subtitle = '',
    documentRef = '',
    issuedDate = new Date().toISOString().slice(0, 10),
    tierLabel = '',
  } = {}
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerH = 27;

  // Primary Navy band
  doc.setFillColor(...ATLAS_PDF_PALETTE.navy);
  doc.rect(0, 0, pageWidth, headerH, 'F');

  // Teal institutional accent stripe
  doc.setFillColor(...ATLAS_PDF_PALETTE.teal);
  doc.rect(0, headerH, pageWidth, 1.4, 'F');

  // Eyebrow
  doc.setTextColor(...ATLAS_PDF_PALETTE.iceBlue);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text('ATLAS HEALTH SERVICES  ·  PRECISION & REGENERATIVE MEDICINE', 14, 8.2);

  // Right-aligned metadata box (reserved 58mm width so title never overlaps)
  const rightColX = pageWidth - 14;
  doc.setTextColor(...ATLAS_PDF_PALETTE.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const topRight = documentRef ? `REF: ${String(documentRef).slice(0, 24)}` : `ISSUED: ${issuedDate}`;
  doc.text(topRight, rightColX, 8.2, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  if (documentRef) {
    doc.text(`Issued: ${issuedDate}`, rightColX, 13.5, { align: 'right' });
  }
  if (tierLabel) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...ATLAS_PDF_PALETTE.iceBlue);
    doc.text(String(tierLabel).slice(0, 34), rightColX, documentRef ? 19.2 : 14.2, { align: 'right' });
  }

  // Main title (wrapped/clipped strictly within left 68% of printable width)
  const maxTitleWidth = pageWidth - 14 - 66;
  doc.setTextColor(...ATLAS_PDF_PALETTE.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(String(title), maxTitleWidth);
  doc.text(titleLines[0] || '', 14, 15.2);

  // Subtitle
  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(226, 232, 240);
    const subLines = doc.splitTextToSize(String(subtitle), maxTitleWidth);
    doc.text(subLines[0] || '', 14, 21.4);
  }

  return headerH + 6;
}

/**
 * Draws a horizontal row of clean KPI / metadata cards.
 * Returns the next Y coordinate after the strip.
 */
export function drawAtlasKpiStrip(doc, { startY = 33, items = [] } = {}) {
  const validItems = (items || []).filter((it) => it && it.label && it.value !== undefined && it.value !== null && it.value !== '');
  if (!validItems.length) return startY;

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 14;
  const gap = 3;
  const totalW = pageWidth - marginX * 2;
  const cardW = (totalW - gap * (validItems.length - 1)) / validItems.length;
  const cardH = 12.5;

  validItems.slice(0, 4).forEach((item, idx) => {
    const x = marginX + idx * (cardW + gap);
    doc.setFillColor(...ATLAS_PDF_PALETTE.surface);
    doc.setDrawColor(...ATLAS_PDF_PALETTE.border);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, startY, cardW, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...ATLAS_PDF_PALETTE.slate500);
    doc.text(String(item.label).toUpperCase().slice(0, 26), x + 3, startY + 4.4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.setTextColor(...ATLAS_PDF_PALETTE.slate900);
    const valLines = doc.splitTextToSize(String(item.value), cardW - 6);
    doc.text(valLines[0] || '', x + 3, startY + 9.6);
  });

  return startY + cardH + 4.5;
}

/**
 * Shared AutoTable configuration for crisp institutional schedules.
 */
export function getAtlasAutoTableDefaults({ rightAlignCols = [], columnStyles = {} } = {}) {
  const mergedColStyles = { ...columnStyles };
  rightAlignCols.forEach((colIdx) => {
    mergedColStyles[colIdx] = {
      ...(mergedColStyles[colIdx] || {}),
      halign: 'right',
      fontStyle: 'bold',
    };
  });

  return {
    theme: 'grid',
    showHead: 'everyPage',
    styles: {
      fontSize: 7.8,
      cellPadding: { top: 2.4, right: 2.6, bottom: 2.4, left: 2.6 },
      textColor: ATLAS_PDF_PALETTE.slate900,
      lineColor: ATLAS_PDF_PALETTE.border,
      lineWidth: 0.2,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: ATLAS_PDF_PALETTE.navy,
      textColor: ATLAS_PDF_PALETTE.white,
      fontStyle: 'bold',
      fontSize: 7.8,
    },
    alternateRowStyles: {
      fillColor: ATLAS_PDF_PALETTE.surface,
    },
    margin: { left: 14, right: 14, bottom: 20 },
    columnStyles: mergedColStyles,
  };
}

/**
 * Draws a subtle institutional sign-in CTA box at the end of Guest PDFs
 * without colliding with the running footer.
 */
export function drawAtlasGuestCtaBanner(doc, message) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxH = 12;
  let y = (doc.lastAutoTable?.finalY || 60) + 6;

  if (y + boxH > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(...ATLAS_PDF_PALETTE.ctaBg);
  doc.setDrawColor(...ATLAS_PDF_PALETTE.ctaBorder);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, pageWidth - 28, boxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.setTextColor(...ATLAS_PDF_PALETTE.ctaText);
  doc.text('PARTNER & CLINIC TIERS', 18, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(...ATLAS_PDF_PALETTE.slate700);
  const text =
    message ||
    'This public schedule displays Wholeseller B2B pricing only. Sign in at atlashealth-services.com/login to unlock Clinic & Retail MSRP tiers.';
  const lines = doc.splitTextToSize(text, pageWidth - 36);
  doc.text(lines[0] || '', 18, y + 9.2);
}

/**
 * Applies a consistent institutional footer with "Page X of Y" across every page.
 */
export function applyAtlasRunningFooter(doc, { disclaimer = '' } = {}) {
  const totalPages = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const footerText =
    disclaimer ||
    'ATLAS HEALTH SERVICES · PRECISION MEDICINE · CONFIDENTIAL COMMERCIAL SCHEDULE';

  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    doc.setDrawColor(...ATLAS_PDF_PALETTE.border);
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(...ATLAS_PDF_PALETTE.slate400);
    doc.text(String(footerText).slice(0, 105), 14, pageHeight - 9);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 14, pageHeight - 9, { align: 'right' });
  }
}

/**
 * Preview-first output helper (Golden Rule #67):
 * Always opens the global DocumentPreviewModal before downloading when running
 * in the browser, falling back to doc.save(filename) only in non-mounted contexts.
 */
export function previewOrSavePdf(
  doc,
  filename = 'atlas-document.pdf',
  { title = 'Atlas Health Services — Document Preview', subtitle = '' } = {}
) {
  if (typeof window !== 'undefined' && window.__atlasPdfPreviewAvailable) {
    const pdfBlob = doc.output('blob');
    window.dispatchEvent(
      new CustomEvent('atlas-open-pdf-preview', {
        detail: {
          title,
          subtitle,
          downloadName: filename,
          pdfBlob,
          printable: true,
        },
      })
    );
    return pdfBlob;
  }
  doc.save(filename);
  return null;
}

/**
 * Opens a server-generated PDF endpoint (/api/.../pdf) inside DocumentPreviewModal
 * instead of triggering a blind download or popup tab.
 */
export function previewRemotePdf(
  fileUrl,
  { title = 'Atlas Health Services — Document Preview', subtitle = '', downloadName = 'atlas-document.pdf' } = {}
) {
  if (typeof window !== 'undefined' && window.__atlasPdfPreviewAvailable) {
    window.dispatchEvent(
      new CustomEvent('atlas-open-pdf-preview', {
        detail: {
          title,
          subtitle,
          downloadName,
          fileUrl,
          printable: true,
        },
      })
    );
    return true;
  }
  if (typeof window !== 'undefined') {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  }
  return false;
}

