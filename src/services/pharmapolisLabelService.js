/**
 * Pharmapolis Ltd. Prescription Sticker Sheet Generator
 * Standard 7.5 cm × 4.5 cm (75 mm × 45 mm) label format on A4 Sheet (210 × 297 mm)
 * 
 * Supplier: Pharmapolis Ltd.
 * Address: 1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria
 */

export const PHARMAPOLIS_SUPPLIER_INFO = {
  name: 'PHARMAPOLIS LTD.',
  license: 'Compounding Pharmacy & Sterile Preparations',
  address: '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria',
  phone: '+359 32 123 456',
  email: 'orders@pharmapolis.bg',
};

// Sticker Dimensions in mm
export const STICKER_DIMENSIONS = {
  widthMm: 75,
  heightMm: 45,
  colsPerPage: 2,
  rowsPerPage: 5,
  stickersPerPage: 10,
  marginLeftMm: 20,
  colGapMm: 20,
  marginTopMm: 24,
  rowGapMm: 8,
};

/**
 * Normalizes prescription and patient data into label items
 */
export function extractLabelData(patient, prescriptions = []) {
  const patientName = patient?.name || patient?.fullName || 'Patient';
  const dob = patient?.dateOfBirth || patient?.dob || patient?.birthDate || '—';
  const age = patient?.age || (patient?.dateOfBirth ? calculateAge(patient.dateOfBirth) : '—');
  const fileNo = patient?.fileNumber || patient?.recordNumber || patient?.id?.slice(0, 8).toUpperCase() || '—';
  const doctorName = patient?.physician || patient?.doctorName || 'Dr. Hanieh Erdmann';

  const labels = [];

  prescriptions.forEach((rx, rxIndex) => {
    const rxId = rx.id || `RX-${rxIndex + 1}`;
    const items = rx.items || rx.compounds || rx.products || (rx.product ? [rx.product] : []);
    const directions = rx.instructions || rx.directions || rx.sig || 'Take / apply as directed by physician.';
    const createdDate = formatDate(rx.createdAt || rx.dateIssued || new Date());
    const expDate = calculateExpDate(rx.createdAt || new Date(), rx.expirationMonths || 6);
    const lotNumber = rx.lotNumber || rx.batchNumber || `PH-${(rx.id || '000').slice(-6).toUpperCase()}`;
    const storageCondition = rx.storage || rx.storageCondition || 'Store below 25°C in a dry place away from sunlight.';

    // If prescription has multiple items or bottle counts, generate appropriate labels
    const bottlesCount = rx.quantityBottles || rx.bottles || 1;

    for (let b = 1; b <= bottlesCount; b++) {
      const bottleSuffix = bottlesCount > 1 ? ` (Bottle ${b} of ${bottlesCount})` : '';

      labels.push({
        rxId,
        patientName,
        dob,
        age,
        fileNo,
        doctorName: rx.doctorName || doctorName,
        productName: rx.name || rx.title || rx.medicationName || items[0]?.name || 'Compounded Medication',
        bottleLabel: bottleSuffix,
        volumeOrQty: rx.volume || rx.quantity || rx.dose || items[0]?.volume || items[0]?.dosage || '',
        activeIngredients: items.map(it => ({
          name: it.name || it.compound || it.ingredient || 'Active Ingredient',
          strength: it.strength || it.dose || it.concentration || it.dosage || '',
        })),
        directions,
        createdDate,
        expDate,
        lotNumber,
        storageCondition,
        warning: rx.warning || 'For external / patient use only. Keep out of reach of children.',
      });
    }
  });

  return labels;
}

function calculateAge(dobString) {
  try {
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return '—';
    const diffMs = Date.now() - birth.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  } catch {
    return '—';
  }
}

function formatDate(d) {
  try {
    if (!d) return new Date().toISOString().split('T')[0];
    if (typeof d?.toDate === 'function') return d.toDate().toISOString().split('T')[0];
    const date = new Date(d);
    return isNaN(date.getTime()) ? new Date().toISOString().split('T')[0] : date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function calculateExpDate(baseDate, months = 6) {
  try {
    const d = baseDate?.toDate ? baseDate.toDate() : new Date(baseDate);
    d.setMonth(d.getMonth() + months);
    return formatDate(d);
  } catch {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return formatDate(d);
  }
}

/**
 * Generate A4 PDF with 7.5 × 4.5 cm stickers
 */
export async function generatePharmapolisStickersPDF(patient, prescriptions = [], options = {}) {
  const [jsPdfModule] = await Promise.all([import('jspdf')]);
  const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF || jsPdfModule;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 × 297 mm
  });

  const labels = extractLabelData(patient, prescriptions);
  const { widthMm, heightMm, colsPerPage, rowsPerPage, marginLeftMm, colGapMm, marginTopMm, rowGapMm, stickersPerPage } = STICKER_DIMENSIONS;

  const totalPages = Math.max(1, Math.ceil(labels.length / stickersPerPage));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) doc.addPage('a4', 'portrait');

    // Sheet Header outside sticker printable area
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `PHARMAPOLIS COMPOUNDING PHARMACY — A4 PRESCRIPTION STICKERS (75 × 45 mm) | Page ${pageIdx + 1} of ${totalPages}`,
      marginLeftMm,
      12
    );
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      `Patient: ${patient?.name || 'Patient'} • File: ${patient?.fileNumber || patient?.id?.slice(0, 8) || 'N/A'} • Generated: ${new Date().toLocaleDateString('en-GB')}`,
      marginLeftMm,
      16
    );

    const pageLabels = labels.slice(pageIdx * stickersPerPage, (pageIdx + 1) * stickersPerPage);

    pageLabels.forEach((label, idx) => {
      const col = idx % colsPerPage;
      const row = Math.floor(idx / colsPerPage);

      const x = marginLeftMm + col * (widthMm + colGapMm);
      const y = marginTopMm + row * (heightMm + rowGapMm);

      drawSingleSticker(doc, x, y, widthMm, heightMm, label);
    });
  }

  const patientSlug = (patient?.name || 'patient').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `pharmapolis_stickers_${patientSlug}_${formatDate(new Date())}.pdf`;

  if (options.returnBlob) {
    return doc.output('blob');
  }

  doc.save(filename);
  return filename;
}

/**
 * Draws a single 7.5 × 4.5 cm (75 × 45 mm) sticker on the PDF page
 */
function drawSingleSticker(doc, x, y, w, h, label) {
  // 1. Sticker Outer Border (dashed cutting guideline / rounded label outline)
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');

  // Inner margin: 2.5 mm
  const pad = 2.5;
  const contentX = x + pad;
  const contentW = w - (pad * 2);

  // 2. Pharmacy Brand Header (Height ~7mm)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('PHARMAPOLIS', contentX, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(100, 116, 139);
  doc.text('1A Arhimandrit Evlogi St, 4013 Plovdiv, Bulgaria', contentX, y + 7.2);

  // Right Header Badge: Rx Only + Rx Id
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(contentX + contentW - 22, y + 1.8, 22, 6, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.2);
  doc.setTextColor(13, 148, 136); // Teal 600
  doc.text('Rx ONLY', contentX + contentW - 20.5, y + 4.2);
  doc.setFontSize(4.5);
  doc.setTextColor(71, 85, 105);
  doc.text(label.rxId.slice(0, 12), contentX + contentW - 20.5, y + 6.8);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(contentX, y + 8.5, contentX + contentW, y + 8.5);

  // 3. Patient Info Section (Height ~5mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(15, 23, 42);
  const patText = `PATIENT: ${label.patientName.toUpperCase()}`;
  doc.text(doc.splitTextToSize(patText, contentW - 24), contentX, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(71, 85, 105);
  doc.text(`DOB: ${label.dob} (${label.age}y) | File: #${label.fileNo}`, contentX, y + 14.8);

  // 4. Medication Title & Active Ingredients (Height ~10mm)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(3, 105, 161); // Ocean blue 700
  const medTitle = `${label.productName}${label.bottleLabel} ${label.volumeOrQty ? `• ${label.volumeOrQty}` : ''}`;
  doc.text(doc.splitTextToSize(medTitle, contentW), contentX, y + 18.5);

  // Active Ingredients breakdown
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(30, 41, 59);

  let ingrY = y + 21.2;
  if (label.activeIngredients && label.activeIngredients.length > 0) {
    const ingrList = label.activeIngredients
      .slice(0, 3)
      .map(i => `${i.name} ${i.strength}`.trim())
      .join('  •  ');
    const splitIngr = doc.splitTextToSize(ingrList, contentW);
    doc.text(splitIngr, contentX, ingrY);
    ingrY += (splitIngr.length * 2.2);
  }

  // 5. Directions / Sig (In a light background box)
  const sigBoxY = Math.max(ingrY + 0.5, y + 24.5);
  const sigBoxH = 8.5;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(contentX, sigBoxY, contentW, sigBoxH, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.8);
  doc.setTextColor(15, 23, 42);
  doc.text('DIRECTIONS:', contentX + 1.2, sigBoxY + 3);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(4.6);
  doc.setTextColor(51, 65, 85);
  const sigLines = doc.splitTextToSize(label.directions, contentW - 2.4);
  doc.text(sigLines.slice(0, 2), contentX + 1.2, sigBoxY + 5.5);

  // 6. Regulatory, Prescriber & Lot Footer (Height ~9mm)
  const footY = sigBoxY + sigBoxH + 2.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(100, 116, 139);

  doc.text(`Prescriber: ${label.doctorName}`, contentX, footY);
  doc.text(`Date: ${label.createdDate}`, contentX + contentW - 20, footY);

  doc.text(`LOT: ${label.lotNumber}`, contentX, footY + 2.8);
  doc.text(`EXP: ${label.expDate}`, contentX + 24, footY + 2.8);
  doc.text('Sterile / Compounded', contentX + contentW - 24, footY + 2.8);

  doc.setFontSize(4.2);
  doc.setTextColor(148, 163, 184);
  const storageStr = `${label.storageCondition} ${label.warning}`;
  doc.text(doc.splitTextToSize(storageStr, contentW)[0] || '', contentX, footY + 5.6);
}

/**
 * Render single sticker or full sheet to PNG Data URL using HTML Canvas
 */
export async function generatePharmapolisStickerPNG(patient, prescription, options = {}) {
  const widthMm = 75;
  const heightMm = 45;
  const dpi = 300;
  const mmToPx = dpi / 25.4;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthMm * mmToPx); // ~886 px
  canvas.height = Math.round(heightMm * mmToPx); // ~531 px

  const ctx = canvas.getContext('2d');
  const scale = canvas.width / widthMm;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer border with subtle rounding
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, 10);
  ctx.stroke();

  const labels = extractLabelData(patient, [prescription]);
  const l = labels[0] || {};

  const pad = 20;

  // Header Brand
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('PHARMAPOLIS', pad, 45);

  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 14px sans-serif';
  ctx.fillText('1A Arhimandrit Evlogi St, 4013 Plovdiv, Bulgaria', pad, 68);

  // Rx Only badge
  ctx.fillStyle = '#f0fdf4';
  roundRect(ctx, canvas.width - 190, 20, 170, 50, 6);
  ctx.fill();
  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('Rx ONLY', canvas.width - 180, 42);
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.fillText(l.rxId || '', canvas.width - 180, 62);

  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, 82);
  ctx.lineTo(canvas.width - pad, 82);
  ctx.stroke();

  // Patient
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(`PATIENT: ${(l.patientName || '').toUpperCase()}`, pad, 114);

  ctx.fillStyle = '#475569';
  ctx.font = 'normal 15px sans-serif';
  ctx.fillText(`DOB: ${l.dob} (${l.age}y)  |  File: #${l.fileNo}`, pad, 138);

  // Product Title
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 22px sans-serif';
  const prodTitle = `${l.productName || ''}${l.bottleLabel || ''} ${l.volumeOrQty ? `• ${l.volumeOrQty}` : ''}`;
  ctx.fillText(prodTitle, pad, 175);

  // Active Ingredients
  ctx.fillStyle = '#1e293b';
  ctx.font = 'normal 15px sans-serif';
  const ingrStr = (l.activeIngredients || []).map(i => `${i.name} ${i.strength}`.trim()).join('  •  ');
  ctx.fillText(ingrStr.slice(0, 80), pad, 202);

  // Directions Box
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, pad, 218, canvas.width - (pad * 2), 95, 6);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('DIRECTIONS FOR USE:', pad + 12, 245);

  ctx.fillStyle = '#334155';
  ctx.font = 'italic 16px sans-serif';
  wrapText(ctx, l.directions || '', pad + 12, 275, canvas.width - (pad * 2) - 24, 22);

  // Prescriber & Lot Footer
  ctx.fillStyle = '#64748b';
  ctx.font = 'normal 14px sans-serif';
  ctx.fillText(`Prescriber: ${l.doctorName}`, pad, 345);
  ctx.fillText(`Rx Date: ${l.createdDate}`, canvas.width - 220, 345);

  ctx.fillText(`LOT: ${l.lotNumber}`, pad, 375);
  ctx.fillText(`EXP: ${l.expDate}`, pad + 200, 375);
  ctx.fillText('Sterile Compounding', canvas.width - 220, 375);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.fillText(`${l.storageCondition || ''} — Keep out of reach of children.`, pad, 410);

  return canvas.toDataURL('image/png');
}

/**
 * Generate high-res A4 Sheet PNG containing all patient prescriptions
 */
export async function generatePharmapolisA4SheetPNG(patient, prescriptions = []) {
  const widthMm = 210;
  const heightMm = 297;
  const dpi = 200; // High resolution A4
  const mmToPx = dpi / 25.4;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthMm * mmToPx);
  canvas.height = Math.round(heightMm * mmToPx);

  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = dpi / 25.4;
  const { widthMm: sW, heightMm: sH, colsPerPage, rowsPerPage, marginLeftMm, colGapMm, marginTopMm, rowGapMm, stickersPerPage } = STICKER_DIMENSIONS;

  // Header on Sheet
  ctx.fillStyle = '#64748b';
  ctx.font = `bold ${Math.round(9 * scale * 0.35)}px sans-serif`;
  ctx.fillText(`PHARMAPOLIS COMPOUNDING PHARMACY — A4 PRESCRIPTION STICKERS (75 × 45 mm)`, marginLeftMm * scale, 12 * scale);

  ctx.font = `normal ${Math.round(7.5 * scale * 0.35)}px sans-serif`;
  ctx.fillText(`Patient: ${patient?.name || 'Patient'} • File: ${patient?.fileNumber || patient?.id?.slice(0, 8) || 'N/A'} • Generated: ${new Date().toLocaleDateString('en-GB')}`, marginLeftMm * scale, 16 * scale);

  const labels = extractLabelData(patient, prescriptions).slice(0, stickersPerPage);

  labels.forEach((label, idx) => {
    const col = idx % colsPerPage;
    const row = Math.floor(idx / colsPerPage);

    const x = (marginLeftMm + col * (sW + colGapMm)) * scale;
    const y = (marginTopMm + row * (sH + rowGapMm)) * scale;
    const w = sW * scale;
    const h = sH * scale;

    drawStickerOnCanvas(ctx, x, y, w, h, label, scale);
  });

  return canvas.toDataURL('image/png');
}

function drawStickerOnCanvas(ctx, x, y, w, h, l, scale) {
  // Border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 6);
  ctx.stroke();

  const pad = 6 * scale;

  // Brand Header
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.round(7.5 * scale * 0.35)}px sans-serif`;
  ctx.fillText('PHARMAPOLIS', x + pad, y + 4.5 * scale);

  ctx.fillStyle = '#64748b';
  ctx.font = `normal ${Math.round(4.8 * scale * 0.35)}px sans-serif`;
  ctx.fillText('1A Arhimandrit Evlogi St, 4013 Plovdiv, Bulgaria', x + pad, y + 7.2 * scale);

  // Rx Only badge
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, x + w - (22 * scale), y + 1.8 * scale, 20 * scale, 6 * scale, 3);
  ctx.fill();
  ctx.fillStyle = '#0d9488';
  ctx.font = `bold ${Math.round(5.2 * scale * 0.35)}px sans-serif`;
  ctx.fillText('Rx ONLY', x + w - (20.5 * scale), y + 4.2 * scale);

  // Divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(x + pad, y + 8.5 * scale);
  ctx.lineTo(x + w - pad, y + 8.5 * scale);
  ctx.stroke();

  // Patient
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.round(6.8 * scale * 0.35)}px sans-serif`;
  ctx.fillText(`PATIENT: ${(l.patientName || '').toUpperCase()}`, x + pad, y + 12 * scale);

  ctx.fillStyle = '#475569';
  ctx.font = `normal ${Math.round(4.8 * scale * 0.35)}px sans-serif`;
  ctx.fillText(`DOB: ${l.dob} (${l.age}y) | File: #${l.fileNo}`, x + pad, y + 14.8 * scale);

  // Product
  ctx.fillStyle = '#0369a1';
  ctx.font = `bold ${Math.round(7.2 * scale * 0.35)}px sans-serif`;
  const prodTitle = `${l.productName || ''}${l.bottleLabel || ''} ${l.volumeOrQty ? `• ${l.volumeOrQty}` : ''}`;
  ctx.fillText(prodTitle.slice(0, 42), x + pad, y + 18.5 * scale);

  // Active Ingredients
  ctx.fillStyle = '#1e293b';
  ctx.font = `normal ${Math.round(4.8 * scale * 0.35)}px sans-serif`;
  const ingrStr = (l.activeIngredients || []).slice(0, 3).map(i => `${i.name} ${i.strength}`.trim()).join(' • ');
  ctx.fillText(ingrStr.slice(0, 48), x + pad, y + 21.2 * scale);

  // Directions Box
  const sigY = y + 23.5 * scale;
  const sigH = 8.5 * scale;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, x + pad, sigY, w - (pad * 2), sigH, 4);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold ${Math.round(4.8 * scale * 0.35)}px sans-serif`;
  ctx.fillText('DIRECTIONS:', x + pad + 3, sigY + 2.8 * scale);

  ctx.fillStyle = '#334155';
  ctx.font = `italic ${Math.round(4.6 * scale * 0.35)}px sans-serif`;
  ctx.fillText((l.directions || '').slice(0, 56), x + pad + 3, sigY + 5.8 * scale);

  // Footer
  const footY = sigY + sigH + 2.5 * scale;
  ctx.fillStyle = '#64748b';
  ctx.font = `normal ${Math.round(4.5 * scale * 0.35)}px sans-serif`;
  ctx.fillText(`Prescriber: ${l.doctorName}`, x + pad, footY);
  ctx.fillText(`Date: ${l.createdDate}`, x + w - (22 * scale), footY);

  ctx.fillText(`LOT: ${l.lotNumber} | EXP: ${l.expDate}`, x + pad, footY + 2.8 * scale);
  ctx.fillText('Sterile Compounded', x + w - (22 * scale), footY + 2.8 * scale);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
