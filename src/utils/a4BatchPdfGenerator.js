import { jsPDF } from 'jspdf';

/**
 * Rasterizes an SVG DOM element to a high-res PNG Data URL at exact physical millimeter dimensions.
 */
export async function rasterizeSvgToImageData(svgEl, widthMm, heightMm, targetDpi = 600) {
  const widthPx = Math.round((widthMm / 25.4) * targetDpi);
  const heightPx = Math.round((heightMm / 25.4) * targetDpi);

  const clonedSvg = svgEl.cloneNode(true);
  if (!clonedSvg.getAttribute('xmlns')) {
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  clonedSvg.setAttribute('width', `${widthPx}px`);
  clonedSvg.setAttribute('height', `${heightPx}px`);

  const svgXml = new XMLSerializer().serializeToString(clonedSvg);
  const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = widthPx;
        canvas.height = heightPx;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, widthPx, heightPx);
        ctx.drawImage(img, 0, 0, widthPx, heightPx);
        URL.revokeObjectURL(svgUrl);
        resolve(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        URL.revokeObjectURL(svgUrl);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(svgUrl);
      reject(err);
    };
    img.src = svgUrl;
  });
}

/**
 * Packs labels into horizontal shelves/rows maximizing paper usage on A4
 * while strictly preserving each label's exact physical millimeter dimensions (1:1 scale)
 * and keeping multi-part prescriptions for the same patient paired together when possible.
 */
function buildOptimizedRows(items, maxRowWidth, minGapX) {
  const remaining = [...items];
  const rows = [];

  while (remaining.length > 0) {
    const currentRow = [];
    let currentWidth = 0;

    let i = 0;
    while (i < remaining.length) {
      const candidate = remaining[i];
      const neededWidth = currentRow.length === 0
        ? candidate.wMm
        : candidate.wMm + minGapX;

      if (currentWidth + neededWidth <= maxRowWidth) {
        // If candidate is part of a multi-part prescription, check if remaining parts would be separated
        const rxCode = candidate.rxCode;
        const siblingCandidates = remaining.filter((it, idx) => idx !== i && it.rxCode === rxCode);

        if (siblingCandidates.length > 0 && currentRow.length > 0) {
          const allSiblingsWidth = candidate.wMm + siblingCandidates.reduce((acc, s) => acc + s.wMm + minGapX, 0);
          if (currentWidth + allSiblingsWidth > maxRowWidth) {
            // Cannot fit all parts of this prescription together in the current row.
            // Check if there is another single-part label that can cleanly fill this row instead.
            const altIdx = remaining.findIndex((it, idx) => idx > i && it.rxCode !== rxCode && (currentWidth + it.wMm + minGapX <= maxRowWidth));
            if (altIdx !== -1) {
              const altItem = remaining.splice(altIdx, 1)[0];
              currentRow.push(altItem);
              currentWidth += altItem.wMm + minGapX;
              continue;
            }
          }
        }

        currentRow.push(candidate);
        currentWidth += neededWidth;
        remaining.splice(i, 1);
      } else {
        i++;
      }
    }

    if (currentRow.length === 0) {
      // Fallback in case a single oversized label exists
      const single = remaining.shift();
      currentRow.push(single);
    }

    rows.push(currentRow);
  }

  return rows;
}

/**
 * Generates an A4 Multi-Patient Batch PDF sheet laying out each label maintaining
 * its exact physical mm dimensions, with crop marks, patient captions, and optimized space.
 */
export async function generateA4BatchPdf({
  items = [],
  isEs = false,
  dpi = 600,
  onProgress = null
}) {
  if (!items || items.length === 0) {
    throw new Error(isEs ? 'No hay etiquetas en la cola para imprimir' : 'No labels in queue to print');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MIN_MARGIN_X = 3.8; // mm (compatible with virtually all desktop and office laser/inkjet printers)
  const MAX_ROW_WIDTH = PAGE_WIDTH - (2 * MIN_MARGIN_X); // 202.4 mm (comfortably fits two 100mm labels side-by-side)
  const MARGIN_TOP = 19.5; // mm (leaves room for EU GMP header)
  const MARGIN_BOTTOM = 8; // mm
  const MIN_LABEL_GAP_X = 2.0; // mm
  const MAX_LABEL_GAP_X = 6.0; // mm
  const ROW_GAP_Y = 4.2; // mm
  const CAPTION_TOTAL_H = 4.2; // mm (for crop ticks + caption text)
  const CROP_LEN = 1.8; // mm

  // Normalize item dimensions
  const normalizedItems = items.map((item, idx) => ({
    ...item,
    originalIdx: idx,
    wMm: Number(item.widthMm) || 75,
    hMm: Number(item.heightMm) || 45
  }));

  // Build space-optimized rows (shelf bin-packing)
  const rows = buildOptimizedRows(normalizedItems, MAX_ROW_WIDTH, MIN_LABEL_GAP_X);

  // Pre-calculate total pages
  let simPages = 1;
  let simY = MARGIN_TOP;
  for (const row of rows) {
    const rowH = Math.max(...row.map(it => it.hMm)) + CAPTION_TOTAL_H;
    if (simY + rowH > PAGE_HEIGHT - MARGIN_BOTTOM) {
      simPages++;
      simY = MARGIN_TOP;
    }
    simY += rowH + ROW_GAP_Y;
  }
  const totalPages = simPages;

  let currentPage = 1;
  let currentY = MARGIN_TOP;

  const drawPageHeader = (pageNum) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.text(
      `PHARMAPOLIS COMPOUNDING PHARMACY — A4 MULTI-LABEL BATCH SHEET | Page ${pageNum} of ${totalPages}`,
      MIN_MARGIN_X,
      10.5
    );

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6.8);
    pdf.setTextColor(100, 116, 139); // slate-500
    const today = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    pdf.text(
      `Physical 1:1 Scale Print (Unscaled) • Container-Adaptive Packaging • Space-Optimized • ${items.length} ${items.length === 1 ? 'Label' : 'Labels'} • Generated ${today}`,
      MIN_MARGIN_X,
      14.2
    );

    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(0.25);
    pdf.line(MIN_MARGIN_X, 16.0, PAGE_WIDTH - MIN_MARGIN_X, 16.0);
  };

  drawPageHeader(currentPage);

  let processedCount = 0;

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    const rowMaxH = Math.max(...row.map(it => it.hMm));
    const rowTotalH = rowMaxH + CAPTION_TOTAL_H;

    // Check if row fits vertically on the current page
    if (currentY + rowTotalH > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage('a4', 'portrait');
      currentPage++;
      drawPageHeader(currentPage);
      currentY = MARGIN_TOP;
    }

    // Horizontally center the row on the A4 page
    const count = row.length;
    const sumLabelsW = row.reduce((sum, it) => sum + it.wMm, 0);

    let gapX = MIN_LABEL_GAP_X;
    let rowTotalW = sumLabelsW;

    if (count > 1) {
      const availableGapsSpace = PAGE_WIDTH - (2 * MIN_MARGIN_X) - sumLabelsW;
      gapX = Math.max(MIN_LABEL_GAP_X, Math.min(MAX_LABEL_GAP_X, availableGapsSpace / (count - 1)));
      rowTotalW = sumLabelsW + ((count - 1) * gapX);
    }

    const rowStartX = Math.max(MIN_MARGIN_X, (PAGE_WIDTH - rowTotalW) / 2);

    let itemX = rowStartX;

    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const item = row[cIdx];
      processedCount++;

      if (onProgress) {
        onProgress({ current: processedCount, total: items.length, patient: item.patientName });
      }

      const itemY = currentY;
      const wMm = item.wMm;
      const hMm = item.hMm;

      // Rasterize SVG element to high-res image
      let imgData = null;
      const targetSvg = item.svgEl || item.svgElement;
      if (targetSvg) {
        imgData = await rasterizeSvgToImageData(targetSvg, wMm, hMm, dpi);
      }

      if (imgData) {
        // Draw physical 1:1 image
        pdf.addImage(imgData, 'PNG', itemX, itemY, wMm, hMm, undefined, 'SLOW');

        // Draw outer rounded border
        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.setLineWidth(0.18);
        pdf.roundedRect(itemX, itemY, wMm, hMm, 1.0, 1.0, 'S');

        // Draw crop marks at corners
        pdf.setDrawColor(148, 163, 184); // slate-400
        pdf.setLineWidth(0.15);

        const cropLeft = cIdx === 0 ? CROP_LEN : Math.min(CROP_LEN, (gapX / 2) - 0.2);
        const cropRight = cIdx === count - 1 ? CROP_LEN : Math.min(CROP_LEN, (gapX / 2) - 0.2);

        // Top-left
        pdf.line(itemX - cropLeft, itemY, itemX, itemY);
        pdf.line(itemX, itemY - CROP_LEN, itemX, itemY);

        // Top-right
        pdf.line(itemX + wMm, itemY, itemX + wMm + cropRight, itemY);
        pdf.line(itemX + wMm, itemY - CROP_LEN, itemX + wMm, itemY);

        // Bottom-left
        pdf.line(itemX - cropLeft, itemY + hMm, itemX, itemY + hMm);
        pdf.line(itemX, itemY + hMm, itemX, itemY + hMm + CROP_LEN);

        // Bottom-right
        pdf.line(itemX + wMm, itemY + hMm, itemX + wMm + cropRight, itemY + hMm);
        pdf.line(itemX + wMm, itemY + hMm, itemX + wMm + CROP_LEN, itemY + hMm + CROP_LEN);

        // Vertical cutting tick mark in the middle of gap between items
        if (cIdx < count - 1) {
          const cutTickX = itemX + wMm + (gapX / 2);
          pdf.line(cutTickX, itemY - CROP_LEN, cutTickX, itemY - 0.3);
          pdf.line(cutTickX, itemY + hMm + 0.3, cutTickX, itemY + hMm + CROP_LEN);
        }

        // Micro caption below label with patient info, container tag & dimensions
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.8);
        pdf.setTextColor(100, 116, 139);
        const containerInfo = item.containerTag ? ` • ${item.containerTag}` : '';
        const caption = `[#${item.rxCode || 'RX'} - ${item.patientName || 'Patient'}${item.partLabel ? ` • ${item.partLabel}` : ''}] ${wMm}×${hMm}mm (${item.variantLabel || item.variant || 'Standard'}${containerInfo})`;
        pdf.text(caption, itemX + 0.5, itemY + hMm + 2.8, { maxWidth: wMm - 1 });
      }

      itemX += wMm + gapX;
    }

    currentY += rowTotalH + ROW_GAP_Y;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `PHARMAPOLIS_A4_BATCH_${items.length}_LABELS_${dateStr}.pdf`;
  pdf.save(filename);

  return { success: true, filename, totalLabels: items.length, totalPages: currentPage };
}
