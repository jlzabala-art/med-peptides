/**
 * zplGenerator.js
 * Generates clean, native Zebra Programming Language (ZPL II) code
 * for direct thermal printing on Zebra printers (e.g., ZD420, ZD620, GK420d).
 * 
 * Target size: 75 mm × 45 mm (Standard European Dispensary Vial Label)
 * Default resolution: 300 DPI (12 dots/mm) -> 885 × 531 dots
 * Fallback resolution: 203 DPI (8 dots/mm) -> 600 × 360 dots
 */

export function generateLabelZpl(labelData = {}, dpi = 300) {
  const dotsPerMm = dpi === 203 ? 8 : 12;
  const widthDots = Math.round(75 * dotsPerMm); // 885 at 300 DPI
  const heightDots = Math.round(45 * dotsPerMm); // 531 at 300 DPI

  const patientName = String(labelData.patientName || 'PATIENT RECORD').toUpperCase().slice(0, 48);
  const pharmacyName = String(labelData.pharmacyName || labelData.pharmacy || 'PHARMAPOLIS COMPOUNDING PHARMACY').toUpperCase().slice(0, 42);
  const formulaTitle = String(labelData.productTitle || labelData.productName || 'Compounded Pharmaceutical Formulation').slice(0, 52);
  const directions = String(labelData.directions || labelData.instructions || 'Take / apply as directed by prescribing physician.').slice(0, 220);
  const batchCode = String(labelData.batchCode || 'PHARM-2026-B948').toUpperCase();
  const prodDate = String(labelData.prodDate || '05-10-2026');
  const expDate = String(labelData.expDate || '04-10-2027');
  const doctorName = String(labelData.doctorName || 'Dr. Marina Cordeiro Fernandes');
  const targetRxUrl = String(labelData.targetRxUrl || 'https://www.atlashealth-services.com');
  const cautionText = String(labelData.warnings || labelData.warning || 'KEEP OUT OF REACH OF CHILDREN • FOR PATIENT USE ONLY').toUpperCase().slice(0, 75);

  // Extract raw APIs list
  const apis = Array.isArray(labelData.apis) && labelData.apis.length > 0
    ? labelData.apis.map(a => {
        const name = a.drugName || a.name || a.activeIngredient || '';
        const dose = a.dosage || a.dose || a.strength || '';
        return `${name} ${dose}`.trim();
      }).filter(Boolean)
    : (labelData.formula ? [labelData.formula] : ['Active Compounded Formulation']);

  const qrMagnification = dpi === 203 ? 4 : 5;

  let zpl = `^XA\n`;
  zpl += `^PW${widthDots}\n`;
  zpl += `^LL${heightDots}\n`;
  zpl += `^LH0,0\n`;
  zpl += `^CI28\n`; // UTF-8 Encoding

  // Outer border
  zpl += `^FO${Math.round(2 * dotsPerMm)},${Math.round(2 * dotsPerMm)}^GB${widthDots - Math.round(4 * dotsPerMm)},${heightDots - Math.round(4 * dotsPerMm)},2^FS\n`;

  // Header: Pharmacy & EU GMP Monograph
  zpl += `^FO${Math.round(4 * dotsPerMm)},${Math.round(3.5 * dotsPerMm)}^A0N,${Math.round(2.6 * dotsPerMm)},${Math.round(2.6 * dotsPerMm)}^FD${pharmacyName}^FS\n`;
  zpl += `^FO${widthDots - Math.round(35 * dotsPerMm)},${Math.round(3.5 * dotsPerMm)}^A0N,${Math.round(2.2 * dotsPerMm)},${Math.round(2.2 * dotsPerMm)}^FDEU GMP DISPENSARY^FS\n`;

  // Patient Banner Box
  zpl += `^FO${Math.round(4 * dotsPerMm)},${Math.round(6.8 * dotsPerMm)}^GB${widthDots - Math.round(8 * dotsPerMm)},${Math.round(6 * dotsPerMm)},2^FS\n`;
  zpl += `^FO${Math.round(6 * dotsPerMm)},${Math.round(8.2 * dotsPerMm)}^A0N,${Math.round(3.8 * dotsPerMm)},${Math.round(3.8 * dotsPerMm)}^FDPATIENT: ${patientName}^FS\n`;

  // Left Column: Native Zebra QR Code
  // ^BQ,2,magnification (2=model 2, 7=standard error correction)
  zpl += `^FO${Math.round(5 * dotsPerMm)},${Math.round(14.5 * dotsPerMm)}^BQN,2,${qrMagnification},M,7^FDQA,${targetRxUrl}^FS\n`;
  zpl += `^FO${Math.round(5 * dotsPerMm)},${Math.round(31 * dotsPerMm)}^A0N,${Math.round(1.8 * dotsPerMm)},${Math.round(1.8 * dotsPerMm)}^FDSCAN FOR REFILL^FS\n`;

  // Left Column: Net Quantity
  const vol = String(labelData.volume || '100 mL');
  zpl += `^FO${Math.round(5 * dotsPerMm)},${Math.round(34 * dotsPerMm)}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FDNET: ${vol}^FS\n`;

  // Right Column: Formula Title
  const rightX = Math.round(26 * dotsPerMm);
  zpl += `^FO${rightX},${Math.round(14.5 * dotsPerMm)}^A0N,${Math.round(3.0 * dotsPerMm)},${Math.round(3.0 * dotsPerMm)}^FD${formulaTitle}^FS\n`;
  zpl += `^FO${rightX},${Math.round(17.8 * dotsPerMm)}^GB${widthDots - rightX - Math.round(5 * dotsPerMm)},1,1^FS\n`;

  // Right Column: Active Ingredients (up to 4 lines)
  let currY = Math.round(19 * dotsPerMm);
  apis.slice(0, 4).forEach(api => {
    zpl += `^FO${rightX},${currY}^A0N,${Math.round(2.2 * dotsPerMm)},${Math.round(2.2 * dotsPerMm)}^FD* ${api}^FS\n`;
    currY += Math.round(2.8 * dotsPerMm);
  });

  // Directions for use box
  const dirBoxY = Math.max(currY + Math.round(1 * dotsPerMm), Math.round(27 * dotsPerMm));
  const dirBoxH = Math.round(8 * dotsPerMm);
  zpl += `^FO${rightX},${dirBoxY}^GB${widthDots - rightX - Math.round(5 * dotsPerMm)},${dirBoxH},1^FS\n`;
  zpl += `^FO${rightX + Math.round(2 * dotsPerMm)},${dirBoxY + Math.round(1.5 * dotsPerMm)}^A0N,${Math.round(2.2 * dotsPerMm)},${Math.round(2.2 * dotsPerMm)}^FDPOSOLOGY:^FS\n`;
  // Wrap directions to 48 chars
  const dirLine1 = directions.slice(0, 48);
  const dirLine2 = directions.slice(48, 96);
  zpl += `^FO${rightX + Math.round(2 * dotsPerMm)},${dirBoxY + Math.round(3.8 * dotsPerMm)}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FD${dirLine1}^FS\n`;
  if (dirLine2) {
    zpl += `^FO${rightX + Math.round(2 * dotsPerMm)},${dirBoxY + Math.round(5.8 * dotsPerMm)}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FD${dirLine2}^FS\n`;
  }

  // Knockout Caution Ribbon: Inverted black box with white text
  const cautionY = Math.round(37.5 * dotsPerMm);
  const cautionH = Math.round(3.2 * dotsPerMm);
  zpl += `^FO${rightX},${cautionY}^GB${widthDots - rightX - Math.round(5 * dotsPerMm)},${cautionH},${cautionH}^FS\n`;
  zpl += `^FO${rightX + Math.round(2 * dotsPerMm)},${cautionY + Math.round(0.8 * dotsPerMm)}^FR^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FD${cautionText}^FS\n`;

  // Footer: Dates, Doctor, Batch
  const footerY = Math.round(41.5 * dotsPerMm);
  zpl += `^FO${Math.round(4 * dotsPerMm)},${footerY}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FDMfg: ${prodDate}  Exp: ${expDate}^FS\n`;
  zpl += `^FO${Math.round(32 * dotsPerMm)},${footerY}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FDRx: ${doctorName.slice(0, 24)}^FS\n`;
  zpl += `^FO${widthDots - Math.round(32 * dotsPerMm)},${footerY}^A0N,${Math.round(2.0 * dotsPerMm)},${Math.round(2.0 * dotsPerMm)}^FDBatch: ${batchCode}^FS\n`;

  zpl += `^XZ\n`;
  return zpl;
}
