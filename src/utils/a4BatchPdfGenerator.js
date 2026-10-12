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
 * Generates an A4 Multi-Patient Batch PDF sheet laying out each label maintaining
 * its exact physical mm dimensions, with crop marks and patient captions.
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
  const MARGIN_LEFT = 12;
  const MARGIN_RIGHT = 12;
  const MARGIN_TOP = 22;
  const MARGIN_BOTTOM = 14;
  const LABEL_GAP_X = 6;
  const LABEL_GAP_Y = 8;

  let currentPage = 1;
  let currentX = MARGIN_LEFT;
  let currentY = MARGIN_TOP;
  let currentRowMaxHeight = 0;

  const drawPageHeader = (pageNum) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 41, 59); // slate-800
    pdf.text(
      `PHARMAPOLIS COMPOUNDING PHARMACY — MULTI-PATIENT BATCH LABEL SHEET | Page ${pageNum}`,
      MARGIN_LEFT,
      12
    );

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 116, 139); // slate-500
    const today = new Date().toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    pdf.text(
      `EU GMP Vector Standard • Physical 1:1 Scale Print • ${items.length} ${items.length === 1 ? 'Label' : 'Labels'} • Generated ${today}`,
      MARGIN_LEFT,
      16
    );

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN_LEFT, 18, PAGE_WIDTH - MARGIN_RIGHT, 18);
  };

  drawPageHeader(currentPage);

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    if (onProgress) {
      onProgress({ current: idx + 1, total: items.length, patient: item.patientName });
    }

    const wMm = Number(item.widthMm) || 75;
    const hMm = Number(item.heightMm) || 45;

    // Check if label fits in current row horizontally
    if (currentX + wMm > PAGE_WIDTH - MARGIN_RIGHT) {
      // Wrap to next line
      currentX = MARGIN_LEFT;
      currentY += currentRowMaxHeight + LABEL_GAP_Y;
      currentRowMaxHeight = 0;
    }

    // Check if label fits on current page vertically
    if (currentY + hMm > PAGE_HEIGHT - MARGIN_BOTTOM) {
      // Add new page
      pdf.addPage('a4', 'portrait');
      currentPage++;
      drawPageHeader(currentPage);
      currentX = MARGIN_LEFT;
      currentY = MARGIN_TOP;
      currentRowMaxHeight = 0;
    }

    // Rasterize SVG element to image
    let imgData = null;
    const targetSvg = item.svgEl || item.svgElement;
    if (targetSvg) {
      imgData = await rasterizeSvgToImageData(targetSvg, wMm, hMm, dpi);
    }

    if (imgData) {
      // Add label image
      pdf.addImage(imgData, 'PNG', currentX, currentY, wMm, hMm, undefined, 'SLOW');

      // Add subtle outer cut boundary & crop marks
      pdf.setDrawColor(203, 213, 225); // slate-300
      pdf.setLineWidth(0.18);
      pdf.roundedRect(currentX, currentY, wMm, hMm, 1.2, 1.2, 'S');

      // Crop marks at corners (2.5 mm length)
      pdf.setDrawColor(148, 163, 184); // slate-400
      pdf.setLineWidth(0.15);
      const CROP_LEN = 2.5;
      // Top-left
      pdf.line(currentX - CROP_LEN, currentY, currentX, currentY);
      pdf.line(currentX, currentY - CROP_LEN, currentX, currentY);
      // Top-right
      pdf.line(currentX + wMm, currentY, currentX + wMm + CROP_LEN, currentY);
      pdf.line(currentX + wMm, currentY - CROP_LEN, currentX + wMm, currentY);
      // Bottom-left
      pdf.line(currentX - CROP_LEN, currentY + hMm, currentX, currentY + hMm);
      pdf.line(currentX, currentY + hMm, currentX, currentY + hMm + CROP_LEN);
      // Bottom-right
      pdf.line(currentX + wMm, currentY + hMm, currentX + wMm + CROP_LEN, currentY + hMm);
      pdf.line(currentX + wMm, currentY + hMm, currentX + wMm, currentY + hMm + CROP_LEN);

      // Micro caption below label with patient info & dimensions
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(100, 116, 139);
      const caption = `[#${item.rxCode || 'RX'} - ${item.patientName || 'Patient'}] ${wMm}×${hMm}mm (${item.variantLabel || item.variant || 'Standard'})`;
      pdf.text(caption, currentX + 1, currentY + hMm + 3.2);
    }

    // Advance horizontal position
    currentX += wMm + LABEL_GAP_X;
    currentRowMaxHeight = Math.max(currentRowMaxHeight, hMm);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `PHARMAPOLIS_A4_BATCH_${items.length}_LABELS_${dateStr}.pdf`;
  pdf.save(filename);

  return { success: true, filename, totalLabels: items.length, totalPages: currentPage };
}
