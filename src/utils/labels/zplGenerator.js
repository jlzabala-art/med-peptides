/**
 * zplGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates native ZPL II (^XA ... ^XZ) commands for Zebra thermal printers
 * (ZD421, GK420d, ZT230, etc.) at 203 DPI (8 dots/mm) or 300 DPI (12 dots/mm).
 */

function sanitizeZplText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/[\^~\\]/g, ' ')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

export function generateLabelZpl(labelItem = {}, rx = {}, options = {}) {
  const dpi = options.dpi === 300 ? 300 : 203;
  const dotsPerMm = dpi === 300 ? 11.811 : 8;
  const widthMm = Number(labelItem.widthMm || options.widthMm || 75);
  const heightMm = Number(labelItem.heightMm || options.heightMm || 45);

  const pw = Math.round(widthMm * dotsPerMm);
  const ll = Math.round(heightMm * dotsPerMm);
  const margin = Math.round(2.5 * dotsPerMm);
  const contentWidth = Math.max(100, pw - margin * 2 - Math.round(18 * dotsPerMm));

  const rxCode = sanitizeZplText(rx?.fileNumber || rx?.code || labelItem.rxCode || 'RX');
  const patientName = sanitizeZplText(labelItem.patientName || rx?.patient?.name || rx?.patientName || 'Patient');
  const doctorName = sanitizeZplText(labelItem.doctorName || rx?.doctorName || 'Treating Physician');
  const productName = sanitizeZplText(labelItem.productName || labelItem.title || labelItem.formulaName || 'Compounded Formula');
  const composition = sanitizeZplText(
    labelItem.composition ||
    labelItem.activesSummary ||
    (Array.isArray(labelItem.actives) ? labelItem.actives.map(a => `${a.name || a} ${a.concentration || ''}`).join(', ') : '')
  );
  const posology = sanitizeZplText(labelItem.posology || labelItem.dosage || labelItem.instructions || '');
  const batchNumber = sanitizeZplText(labelItem.batchNumber || labelItem.lotNumber || 'LOT-PENDING');
  const bud = sanitizeZplText(labelItem.expiryDate || labelItem.bud || 'BUD-30D');
  const storage = sanitizeZplText(labelItem.storage || labelItem.storageConditions || 'Store 2-8 C / Refrigerated');

  const qrUrl = `https://www.atlashealth-services.com/rx/${encodeURIComponent(rxCode)}`;

  const fTitle = Math.round(2.8 * dotsPerMm);
  const fBody = Math.round(2.1 * dotsPerMm);
  const fSmall = Math.round(1.7 * dotsPerMm);

  const yHeader = margin;
  const yPatient = yHeader + Math.round(4.5 * dotsPerMm);
  const yProduct = yPatient + Math.round(4.2 * dotsPerMm);
  const yComp = yProduct + Math.round(4.2 * dotsPerMm);
  const yPos = yComp + Math.round(7.5 * dotsPerMm);
  const yFooter = Math.max(yPos + Math.round(7 * dotsPerMm), ll - Math.round(6.5 * dotsPerMm));

  const qrX = pw - margin - Math.round(16 * dotsPerMm);
  const qrY = yPatient;
  const qrMag = dpi === 300 ? 4 : 3;

  return [
    '^XA',
    '^CI28',
    `^PW${pw}`,
    `^LL${ll}`,
    `^FO${margin},${yHeader}^A0N,${fSmall},${fSmall}^FDPHARMAPOLIS EU GMP COMPOUNDING  |  RX #${rxCode}^FS`,
    `^FO${margin},${yHeader + Math.round(2.6 * dotsPerMm)}^GB${pw - margin * 2},1,1^FS`,
    `^FO${margin},${yPatient}^A0N,${fTitle},${fTitle}^FB${contentWidth},1,0,L^FD${patientName}^FS`,
    `^FO${margin},${yProduct}^A0N,${fBody},${fBody}^FB${contentWidth},1,0,L^FD${productName}^FS`,
    composition ? `^FO${margin},${yComp}^A0N,${fSmall},${fSmall}^FB${contentWidth},3,2,L^FD${composition}^FS` : '',
    posology ? `^FO${margin},${yPos}^A0N,${fSmall},${fSmall}^FB${contentWidth},3,2,L^FDUse: ${posology}^FS` : '',
    `^FO${qrX},${qrY}^BQN,2,${qrMag}^FDQA,${qrUrl}^FS`,
    `^FO${margin},${yFooter - Math.round(1.5 * dotsPerMm)}^GB${pw - margin * 2},1,1^FS`,
    `^FO${margin},${yFooter}^A0N,${fSmall},${fSmall}^FDLOT: ${batchNumber}   BUD: ${bud}   Dr. ${doctorName}^FS`,
    `^FO${margin},${yFooter + Math.round(2.5 * dotsPerMm)}^A0N,${fSmall},${fSmall}^FD${storage}^FS`,
    '^XZ'
  ].filter(Boolean).join('\n');
}

export function generateBatchZpl(patientQueue = [], options = {}) {
  const chunks = [];
  for (const pItem of patientQueue) {
    const labels = Array.isArray(pItem.labels) && pItem.labels.length > 0 ? pItem.labels : [{}];
    const selectedIdx = pItem.selectedPartIndex;
    const indices = (selectedIdx != null && selectedIdx !== 'all' && labels[selectedIdx])
      ? [Number(selectedIdx)]
      : labels.map((_, i) => i);

    for (const idx of indices) {
      const lbl = {
        ...(labels[idx] || {}),
        widthMm: labels[idx]?.widthMm || pItem.widthMm || 75,
        heightMm: labels[idx]?.heightMm || pItem.heightMm || 45
      };
      chunks.push(generateLabelZpl(lbl, pItem.rx || {}, options));
    }
  }
  return chunks.join('\n\n');
}
