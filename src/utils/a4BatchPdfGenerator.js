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
 * Packs labels into strict guillotine-friendly horizontal shelves (rows).
 * 
 * GUILLOTINE GENERAL RULES:
 * 1. Strict Height Uniformity: Never mix different heights in the same row.
 *    A full straight horizontal cut across the sheet separates each row cleanly without steps.
 * 2. Format-Block Batching: Labels are clustered by dimensions (hMm, wMm) descending.
 *    Within the same dimension group, multi-part prescriptions for the same patient stay adjacent.
 * 3. Consistent Column Anchor: All rows of the same width tier share identical column X coordinates.
 *    Single labels in a row sit in column 0 (left-aligned to that tier's grid), never floating in the center.
 * 4. Inter-tier Separation: When switching from one label format to another, a distinct horizontal
 *    cutting plane is preserved.
 */
function buildGuillotineOptimizedRows(items, maxRowWidth, minGapX) {
  // Group items by format tier (rounded to nearest 0.5mm to avoid floating point jitter)
  const tiersMap = new Map();
  for (const item of items) {
    const key = `${item.hMm.toFixed(1)}x${item.wMm.toFixed(1)}`;
    if (!tiersMap.has(key)) {
      tiersMap.set(key, { hMm: item.hMm, wMm: item.wMm, items: [] });
    }
    tiersMap.get(key).items.push(item);
  }

  // Sort tiers by height descending, then width descending
  const sortedTiers = Array.from(tiersMap.values()).sort((a, b) => {
    if (Math.abs(b.hMm - a.hMm) > 0.5) return b.hMm - a.hMm;
    return b.wMm - a.wMm;
  });

  const rows = [];

  for (const tier of sortedTiers) {
    // Within the same tier, sort to keep multi-part rxCode prescriptions together
    tier.items.sort((a, b) => {
      const codeA = a.rxCode || '';
      const codeB = b.rxCode || '';
      if (codeA !== codeB) return codeA.localeCompare(codeB);
      return (a.originalIdx || 0) - (b.originalIdx || 0);
    });

    const tierItems = [...tier.items];
    const itemW = tier.wMm;
    const itemH = tier.hMm;

    // Calculate max columns that fit on the row width
    const maxCols = Math.max(1, Math.floor((maxRowWidth + minGapX) / (itemW + minGapX)));

    while (tierItems.length > 0) {
      const currentRow = [];
      while (currentRow.length < maxCols && tierItems.length > 0) {
        currentRow.push(tierItems.shift());
      }
      // Attach tier format metadata to row for consistent column grid calculation
      currentRow.tierFormat = { wMm: itemW, hMm: itemH, maxCols };
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Generates an A4 Multi-Patient Batch PDF sheet laying out each label maintaining
 * its exact physical mm dimensions, with crop marks, patient captions, and guillotine-optimized spacing.
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
  const MIN_MARGIN_X = 3.8; // mm
  const MAX_ROW_WIDTH = PAGE_WIDTH - (2 * MIN_MARGIN_X); // 202.4 mm
  const MARGIN_TOP = 19.5; // mm (leaves room for EU GMP header)
  const MARGIN_BOTTOM = 8; // mm
  const STANDARD_GAP_X = 2.4; // mm (uniform horizontal gap for vertical guillotine cutting)
  const ROW_GAP_Y = 4.5; // mm
  const CAPTION_TOTAL_H = 4.2; // mm (for crop ticks + caption text)
  const CROP_LEN = 2.0; // mm

  // Normalize item dimensions
  const normalizedItems = items.map((item, idx) => ({
    ...item,
    originalIdx: idx,
    wMm: Number(item.widthMm) || 75,
    hMm: Number(item.heightMm) || 45
  }));

  // Build guillotine-optimized shelves (strict height homogeneity + format tiering)
  const rows = buildGuillotineOptimizedRows(normalizedItems, MAX_ROW_WIDTH, STANDARD_GAP_X);

  // Pre-calculate total pages
  let simPages = 1;
  let simY = MARGIN_TOP;
  for (const row of rows) {
    const rowH = (row.tierFormat?.hMm || Math.max(...row.map(it => it.hMm))) + CAPTION_TOTAL_H;
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
      `Physical 1:1 Scale Print (Unscaled) • Container-Adaptive Packaging • Guillotine-Optimized • ${items.length} ${items.length === 1 ? 'Label' : 'Labels'} • Generated ${today}`,
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
    const tier = row.tierFormat || {
      wMm: row[0]?.wMm || 75,
      hMm: row[0]?.hMm || 45,
      maxCols: Math.max(1, Math.floor((MAX_ROW_WIDTH + STANDARD_GAP_X) / ((row[0]?.wMm || 75) + STANDARD_GAP_X)))
    };

    const rowH = tier.hMm;
    const rowTotalH = rowH + CAPTION_TOTAL_H;

    // Check if row fits vertically on current page
    if (currentY + rowTotalH > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage('a4', 'portrait');
      currentPage++;
      drawPageHeader(currentPage);
      currentY = MARGIN_TOP;
    }

    // Fixed column grid coordinates for this tier across all rows of this size
    const maxCols = tier.maxCols;
    const itemW = tier.wMm;
    const gapX = STANDARD_GAP_X;
    const totalTierW = (maxCols * itemW) + ((maxCols - 1) * gapX);
    const tierStartX = Math.max(MIN_MARGIN_X, (PAGE_WIDTH - totalTierW) / 2);

    const itemY = currentY;

    // 1. Draw horizontal guillotine alignment ticks on the page margins (left and right edges)
    pdf.setDrawColor(71, 85, 105); // slate-600
    pdf.setLineWidth(0.22);

    // Top horizontal cut of the row
    pdf.line(0.5, itemY, 3.5, itemY);
    pdf.line(PAGE_WIDTH - 3.5, itemY, PAGE_WIDTH - 0.5, itemY);

    // Bottom horizontal cut of the labels
    pdf.line(0.5, itemY + rowH, 3.5, itemY + rowH);
    pdf.line(PAGE_WIDTH - 3.5, itemY + rowH, PAGE_WIDTH - 0.5, itemY + rowH);

    // Inter-row separation cut guide line in margin
    const interRowCutY = itemY + rowTotalH + (ROW_GAP_Y / 2);
    if (rIdx < rows.length - 1) {
      pdf.setDrawColor(148, 163, 184); // slate-400
      pdf.line(0.5, interRowCutY, 2.5, interRowCutY);
      pdf.line(PAGE_WIDTH - 2.5, interRowCutY, PAGE_WIDTH - 0.5, interRowCutY);
    }

    // 2. Iterate items in the row
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
      const item = row[cIdx];
      processedCount++;

      if (onProgress) {
        onProgress({ current: processedCount, total: items.length, patient: item.patientName });
      }

      // Column position strictly anchored to the tier's column grid
      const itemX = tierStartX + (cIdx * (itemW + gapX));
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

        // Draw outer label border
        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.setLineWidth(0.18);
        pdf.roundedRect(itemX, itemY, wMm, hMm, 1.0, 1.0, 'S');

        // Draw crop marks at corners with crisp line weight
        pdf.setDrawColor(71, 85, 105); // slate-600
        pdf.setLineWidth(0.20);

        const cropLeft = cIdx === 0 ? CROP_LEN : Math.min(CROP_LEN, (gapX / 2) - 0.2);
        const cropRight = cIdx === maxCols - 1 ? CROP_LEN : Math.min(CROP_LEN, (gapX / 2) - 0.2);

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
        pdf.line(itemX + wMm, itemY + hMm, itemX + wMm, itemY + hMm + CROP_LEN);

        // Vertical cutting tick mark between columns
        if (cIdx < maxCols - 1) {
          const cutTickX = itemX + wMm + (gapX / 2);
          pdf.line(cutTickX, itemY - CROP_LEN, cutTickX, itemY - 0.3);
          pdf.line(cutTickX, itemY + hMm + 0.3, cutTickX, itemY + hMm + CROP_LEN);

          // Top/bottom page-edge vertical guillotine ticks for the column cut
          pdf.line(cutTickX, 16.5, cutTickX, 19.0);
          pdf.line(cutTickX, PAGE_HEIGHT - 3.5, cutTickX, PAGE_HEIGHT - 1.0);
        }

        // Top/bottom page-edge ticks for outer boundaries
        if (cIdx === 0) {
          pdf.line(itemX, 16.5, itemX, 18.5);
          pdf.line(itemX, PAGE_HEIGHT - 3.5, itemX, PAGE_HEIGHT - 1.2);
        }
        if (cIdx === row.length - 1) {
          pdf.line(itemX + wMm, 16.5, itemX + wMm, 18.5);
          pdf.line(itemX + wMm, PAGE_HEIGHT - 3.5, itemX + wMm, PAGE_HEIGHT - 1.2);
        }

        // Micro caption safely tucked in discard gutter below label
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.2);
        pdf.setTextColor(100, 116, 139);
        const containerInfo = item.containerTag ? ` • ${item.containerTag}` : '';
        const caption = `[#${item.rxCode || 'RX'} - ${item.patientName || 'Patient'}${item.partLabel ? ` • ${item.partLabel}` : ''}] ${wMm}×${hMm}mm (${item.variantLabel || item.variant || 'Standard'}${containerInfo})`;
        pdf.text(caption, itemX + 0.5, itemY + hMm + 2.4, { maxWidth: wMm - 1 });
      }
    }

    currentY += rowTotalH + ROW_GAP_Y;
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `PHARMAPOLIS_A4_BATCH_${items.length}_LABELS_${dateStr}.pdf`;
  pdf.save(filename);

  return { success: true, filename, totalLabels: items.length, totalPages: currentPage };
}
