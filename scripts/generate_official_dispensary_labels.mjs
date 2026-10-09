/**
 * scripts/generate_official_dispensary_labels.mjs
 *
 * Generates the official Pharmapolis 2-column label (Back QR layout from PharmapolisLabelSvg)
 * matching the EXACT format in Katarzyna Mlotkowska's WhatsApp message, both as 300 DPI PNG
 * and 1:1 physical mm PDF (75 x 45 mm).
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = '/Users/joseluiszabala/Downloads';
const PUBLIC_DIR = path.resolve(__dirname, '../public/labels/pharmapolis');

const WIDTH = 1500;
const HEIGHT = 900;

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function wrapLines(text, maxChars = 65) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function renderLabelSvg(item) {
  const targetRxUrl = item.targetRxUrl || 'https://med-peptides.com/rx/51857';
  const qrSvgString = await QRCode.toString(targetRxUrl, {
    type: 'svg',
    margin: 1,
    color: { dark: '#003666', light: '#ffffff' }
  });
  const cleanQr = qrSvgString.replace(/<\?xml.*?\?>/, '').replace(/<!DOCTYPE.*?>/, '');

  const isShort = false;
  const headerY = 32;
  const headerTitleSize = 52;
  const headerSubSize = 25;

  const patientBoxY = 166;
  const patientBoxHeight = 76;
  const patientTextY = 48;
  const patientLabelFontSize = 30;
  const patientNameFontSize = 29;

  const footerLineY = 825;
  const footerTextY = 862;
  const footerFontSize = 24;

  const colY = patientBoxY + patientBoxHeight + 18;
  const colHeight = footerLineY - colY - 18;
  const backQrSize = 275;
  const qrStartY = Math.round((colHeight - backQrSize - 44) / 2);

  const b1Y = 18;
  const b1SizeY = 25;
  const b1BatchY = b1SizeY + 25;
  const b1DividerY = b1BatchY + 16;

  const b2Y = b1Y + b1DividerY + 18;
  const bSafetyY = colHeight - 56;

  const ingCount = item.apis.length;
  let ingFontSize = 22;
  let ingLineGap = 29;
  if (ingCount >= 4) {
    ingFontSize = 18;
    ingLineGap = 24;
  }

  const baseStartY = 28 + (ingCount * ingLineGap) + 4;
  let vehiclePrefix = 'Compounding Vehicle:';
  const vLower = (item.base || '').toLowerCase();
  if (vLower.includes('capsule')) {
    vehiclePrefix = 'Compounding Vehicle / Shell:';
  } else if (vLower.includes('ointment') || vLower.includes('pomade')) {
    vehiclePrefix = 'Compounding Base:';
  }
  let cleanVeh = (item.base || '').trim();
  if (cleanVeh.toLowerCase().startsWith('compounding vehicle:')) cleanVeh = cleanVeh.slice(20).trim();
  if (cleanVeh.toLowerCase().startsWith('base:')) cleanVeh = cleanVeh.slice(5).trim();
  const baseLines = cleanVeh ? wrapLines(`${vehiclePrefix} ${cleanVeh}`, 75) : [];
  const baseFontSize = cleanVeh.length > 55 ? 15 : 17;
  const baseLineGap = 20;
  const b2TotalHeight = baseStartY + (baseLines.length * baseLineGap);

  const b3Y = b2Y + b2TotalHeight + 16;
  const posologyLines = wrapLines(item.directions, 58);
  const posFontSize = 19;
  const posLineGap = 25;
  const posBoxHeight = 38 + (posologyLines.length * posLineGap);

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />

    <!-- HEADER -->
    <g transform="translate(60, ${headerY})">
      <text x="0" y="34" font-family="Arial, Helvetica, sans-serif" font-size="${headerTitleSize}" font-weight="900" letter-spacing="0.5" fill="#000000">PHARMAPOLIS</text>
      <text x="0" y="60" font-family="Arial, Helvetica, sans-serif" font-size="${headerSubSize}" font-weight="500" fill="#334155">Verification &amp; Digital Monograph Registry</text>
      <text x="0" y="84" font-family="Arial, Helvetica, sans-serif" font-size="${headerSubSize - 2}" font-weight="400" fill="#64748b">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
    </g>

    <!-- EU GMP CERTIFIED BADGE -->
    <g transform="translate(1440, ${headerY + 2})">
      <rect x="-330" y="0" width="330" height="46" fill="#f8fafc" stroke="#003666" stroke-width="2" rx="6" />
      <text x="-165" y="30" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#003666" letter-spacing="0.6">
        EU GMP CERTIFIED DISPENSARY
      </text>
    </g>

    <!-- PATIENT BOX -->
    <g transform="translate(60, ${patientBoxY})">
      <rect x="0" y="0" width="1380" height="${patientBoxHeight}" fill="#f8fafc" stroke="#000000" stroke-width="2.2" rx="4" />
      <text x="24" y="${patientTextY}" font-family="Arial, Helvetica, sans-serif" font-size="${patientLabelFontSize}" font-weight="700" letter-spacing="0.4" fill="#000000">
        PATIENT: <tspan font-weight="800" font-size="${patientNameFontSize}">${escapeXml(item.patientName)}</tspan>
      </text>
      <text x="1356" y="${patientTextY}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${patientLabelFontSize}" font-weight="800" fill="#003666">
        FILE #${escapeXml(item.fileNumber)}
      </text>
    </g>

    <!-- TWO-COLUMN WORKSPACE -->
    <!-- LEFT COLUMN: QR CODE -->
    <g transform="translate(60, ${colY})">
      <rect x="0" y="0" width="460" height="${colHeight}" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="8" />
      <g transform="translate(${Math.round((460 - backQrSize) / 2)}, ${qrStartY})">
        <svg width="${backQrSize}" height="${backQrSize}" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          ${cleanQr}
        </svg>
      </g>
      <text x="230" y="${qrStartY + backQrSize + 34}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="900" fill="#003666" letter-spacing="0.4">
        <tspan fill="#16a34a" font-weight="900">✔ </tspan>SCAN FOR REFILL &amp; DIGITAL POSOLOGY
      </text>
    </g>

    <!-- RIGHT COLUMN: CLINICAL INGREDIENTS & SPECS -->
    <g transform="translate(550, ${colY})">
      <rect x="0" y="0" width="890" height="${colHeight}" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="8" />

      <!-- Block 1: Net Quantity & Dispensing Batch -->
      <g transform="translate(32, ${b1Y})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="800" fill="#64748b" letter-spacing="0.8">
          NET QUANTITY &amp; DISPENSING BATCH
        </text>
        <text x="0" y="${b1SizeY}" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="900" fill="#000000" letter-spacing="0.3">
          Net Content / Size: ${escapeXml(item.volume)}
        </text>
        <text x="0" y="${b1BatchY}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#003666">
          Batch: <tspan font-family="monospace" font-weight="800">${escapeXml(item.batchCode)}</tspan> • Lote: <tspan font-family="monospace" font-weight="800">${escapeXml(item.lote)}</tspan>
        </text>
        <line x1="0" y1="${b1DividerY}" x2="826" y2="${b1DividerY}" stroke="#e2e8f0" stroke-width="1.6" />
      </g>

      <!-- Block 2: Ingredients & Base -->
      <g transform="translate(32, ${b2Y})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="900" fill="#0284c7" letter-spacing="0.8">
          ACTIVE COMPOUNDED INGREDIENTS &amp; STRENGTH
        </text>
        ${item.apis.map((ing, iIdx) => `
          <text x="0" y="${28 + (iIdx * ingLineGap)}" font-family="Arial, Helvetica, sans-serif" font-size="${ingFontSize}" font-weight="800" fill="#0f172a">
            • ${escapeXml(ing)}
          </text>
        `).join('')}

        ${baseLines.map((bLine, bIdx) => `
          <text x="0" y="${baseStartY + (bIdx * baseLineGap)}" font-family="Arial, Helvetica, sans-serif" font-size="${baseFontSize}" font-weight="700" fill="#0369a1">
            ${escapeXml(bLine)}
          </text>
        `).join('')}
      </g>

      <!-- Block 3: Directions for Use -->
      <g transform="translate(32, ${b3Y})">
        <rect x="0" y="0" width="826" height="${posBoxHeight}" fill="#f8fafc" stroke="#bae6fd" stroke-width="1.5" rx="6" />
        <rect x="0" y="0" width="6" height="${posBoxHeight}" fill="#0284c7" rx="3" />
        
        <text x="18" y="22" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#0284c7" letter-spacing="0.8">
          DIRECTIONS FOR USE / PRESCRIBED POSOLOGY
        </text>
        ${posologyLines.map((pLine, pIdx) => `
          <text x="18" y="${46 + (pIdx * posLineGap)}" font-family="Arial, Helvetica, sans-serif" font-size="${posFontSize}" font-weight="700" fill="#0f172a">
            ${escapeXml(pLine)}
          </text>
        `).join('')}
      </g>

      <!-- Block 4: Caution & Prescriber -->
      <g transform="translate(32, ${bSafetyY})">
        <line x1="0" y1="-14" x2="826" y2="-14" stroke="#e2e8f0" stroke-width="1.6" />
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#b91c1c" letter-spacing="0.4">
          ${escapeXml(item.caution)}
        </text>
        <text x="0" y="22" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="600" fill="#64748b">
          ${escapeXml(item.rxLine)}
        </text>
      </g>
    </g>

    <!-- FOOTER DIVIDER -->
    <line x1="60" y1="${footerLineY}" x2="1440" y2="${footerLineY}" stroke="#000000" stroke-width="2.2" />

    <!-- FOOTER ROW -->
    <g transform="translate(60, ${footerTextY})">
      <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${footerFontSize}" font-weight="700" fill="#000000">
        Mfg: <tspan font-weight="400">${escapeXml(item.mfg)}</tspan> • Exp: <tspan font-weight="400">${escapeXml(item.exp)}</tspan>
      </text>
      <text x="1380" y="0" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${footerFontSize}" font-weight="700" fill="#475569">
        Storage: <tspan font-weight="500" fill="#0f172a">${escapeXml(item.storage)}</tspan>
      </text>
    </g>
  </svg>
  `;
}

async function exportBoth(svgStr, baseFilename) {
  const pngBuffer = await sharp(Buffer.from(svgStr)).png().toBuffer();

  // 1. Save PNG to Downloads
  const pngPathDownloads = path.join(OUTPUT_DIR, `${baseFilename}.png`);
  fs.writeFileSync(pngPathDownloads, pngBuffer);
  console.log('✅ Generated PNG:', pngPathDownloads);

  // 2. Save PDF to Downloads (75 x 45 mm exact)
  const pdfDoc = await PDFDocument.create();
  const widthPt = (75 / 25.4) * 72;
  const heightPt = (45 / 25.4) * 72;
  const page = pdfDoc.addPage([widthPt, heightPt]);
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  page.drawImage(pngImage, { x: 0, y: 0, width: widthPt, height: heightPt });
  const pdfBytes = await pdfDoc.save();
  const pdfPathDownloads = path.join(OUTPUT_DIR, `${baseFilename}.pdf`);
  fs.writeFileSync(pdfPathDownloads, pdfBytes);
  console.log('✅ Generated PDF:', pdfPathDownloads);

  // Also mirror to public dir
  fs.writeFileSync(path.join(PUBLIC_DIR, `${baseFilename}.png`), pngBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, `${baseFilename}.pdf`), pdfBytes);
}

async function main() {
  console.log('🚀 Generating updated labels directly from Katarzyna WhatsApp specs...');

  // 1. Part 1: Morning Formula (60 caps, 2 months treatment)
  const part1 = {
    patientName: 'AMNA SULTAN MOHAMED AHMED ALOTAIBA',
    fileNumber: '51857',
    volume: '60 Caps, 2 Months Treatment',
    batchCode: 'PHARM-2026-UBISWP',
    lote: '2609-AMN1',
    apis: [
      'Ubiquinol 250 mg',
      'Saw Palmetto Extract 250 mg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    directions: 'Take 1 capsule once daily with breakfast.',
    caution: 'CAUTION: FOR ORAL USE ONLY • TAKE WITH WATER • KEEP OUT OF REACH OF CHILDREN',
    rxLine: 'Rx: Dr. Marina Cordeiro Fernandes • NOVA Clinic - Dubai Healthcare City, Dubai, UAE (DHA-91105367)',
    mfg: '05/10/26',
    exp: '04/10/27',
    storage: 'Store in a cool dry place',
    targetRxUrl: 'https://med-peptides.com/rx/51857'
  };

  const svgPart1 = await renderLabelSvg(part1);
  await exportBoth(svgPart1, 'PHARMAPOLIS_AMNA_SULTAN_MOHAMED_AHMED_ALOTAIBA_51857_PART-1_60CAPS_75x45mm_BACK-QR_300DPI');
  await exportBoth(svgPart1, 'PHARMAPOLIS_51857_PART-1_60CAPS_75x45mm_BACK-QR_300DPI');
  await exportBoth(svgPart1, 'PHARMAPOLIS_51857_PART-1_60CAPS_75x45mm_BACK-QR');

  // 2. Part 2: Red Yeast Rice Extract 600 mg (120 caps, 1 month treatment)
  const part2 = {
    patientName: 'AMNA SULTAN MOHAMED AHMED ALOTAIBA',
    fileNumber: '51857',
    volume: '120 Caps, 1 Month Treatment',
    batchCode: 'PHARM-2026-RYR',
    lote: '2609-AMN2',
    apis: [
      'Red Yeast Rice Extract 600 mg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    directions: 'Take 2 caps with lunch and 2 caps with dinner.',
    caution: 'CAUTION: FOR ORAL USE ONLY • TAKE WITH WATER • KEEP OUT OF REACH OF CHILDREN',
    rxLine: 'Rx: Dr. Marina Cordeiro Fernandes • NOVA Clinic - Dubai Healthcare City, Dubai, UAE (DHA-91105367)',
    mfg: '05/10/26',
    exp: '04/10/27',
    storage: 'Store in a cool dry place',
    targetRxUrl: 'https://med-peptides.com/rx/51857'
  };

  const svgPart2 = await renderLabelSvg(part2);
  await exportBoth(svgPart2, 'PHARMAPOLIS_AMNA_SULTAN_MOHAMED_AHMED_ALOTAIBA_51857_PART-2_120CAPS_75x45mm_BACK-QR_300DPI');
  await exportBoth(svgPart2, 'PHARMAPOLIS_51857_PART-2_120CAPS_75x45mm_BACK-QR_300DPI');
  await exportBoth(svgPart2, 'PHARMAPOLIS_51857_PART-2_120CAPS_75x45mm_BACK-QR');

  // 3. Mohammed Ahmad Aishehhi (BOX03483AATRI)
  const aishehhi = {
    patientName: 'MOHAMMED AHMAD AISHEHHI',
    fileNumber: 'BOX03483AATRI',
    volume: 'TrichoSol 100ml',
    batchCode: 'PHARM-2026-TRI100',
    lote: '2609-MHD1',
    apis: [
      'Minoxidil 4%',
      'Spironolactone 1%',
      'Arginine 1.5%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    directions: 'Apply at night before bedtime. Leave on scalp as long as possible. Wash scalp the next day.',
    caution: 'CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN',
    rxLine: 'Rx: Dr. Sezgin Cagatay • Hortman Clinics, Dubai (DHA-00013060-006)',
    mfg: '05/10/26',
    exp: '04/10/27',
    storage: 'Store at room temperature',
    targetRxUrl: 'https://med-peptides.com/rx/BOX03483AATRI'
  };
  const svgAishehhi = await renderLabelSvg(aishehhi);
  await exportBoth(svgAishehhi, 'PHARMAPOLIS_MOHAMMED_AHMAD_AISHEHHI_BOX03483AATRI_TRICHOSOL_100ML_75x45mm_BACK-QR_300DPI');

  // 4. Julien Boiteux Part 1 (BOX03529AATRI) - TrichoSol 100ml
  const julienPart1 = {
    patientName: 'JULIEN BOITEUX',
    fileNumber: 'BOX03529AATRI',
    volume: 'TrichoSol 100ml',
    batchCode: 'PHARM-2026-TRI-BOX03529',
    lote: '2609-JB1',
    apis: [
      'Minoxidil 4%',
      'Spironolactone 1%',
      'Arginine 1.5%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    directions: 'Apply at night before bedtime. Leave on scalp as long as possible. Wash scalp the next day.',
    caution: 'CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN',
    rxLine: 'Rx: Dr. Sezgin Cagatay • Hortman Clinics, Dubai (DHA-00013060-006)',
    mfg: '05/10/26',
    exp: '04/10/27',
    storage: 'Store at room temperature',
    targetRxUrl: 'https://med-peptides.com/rx/BOX03529AATRI'
  };
  const svgJulien1 = await renderLabelSvg(julienPart1);
  await exportBoth(svgJulien1, 'PHARMAPOLIS_JULIEN_BOITEUX_BOX03529AATRI_PART-1_TRICHOSOL_100ML_75x45mm_BACK-QR_300DPI');

  // 5. Julien Boiteux Part 2 (BOX03529AATRI) - TrichoOil 30ml
  const julienPart2 = {
    patientName: 'JULIEN BOITEUX',
    fileNumber: 'BOX03529AATRI',
    volume: 'TrichoOil 30ml',
    batchCode: 'PHARM-2026-OIL-BOX03529',
    lote: '2609-JB2',
    apis: [
      'Ginseng 2%',
      'Ginkgo biloba 2.5%',
      'Vitamin E (Tocopherol) 5%'
    ],
    base: 'TrichoOil™ 30 mL (100% Natural Scalp Compounding Vehicle)',
    directions: '1-2 times / week, massage for 3-5 minutes and leave on for 10 min before washing.',
    caution: 'CAUTION: FOR TOPICAL SCALP USE ONLY • STORE AWAY FROM DIRECT SUNLIGHT',
    rxLine: 'Rx: Dr. Sezgin Cagatay • Hortman Clinics, Dubai (DHA-00013060-006)',
    mfg: '05/10/26',
    exp: '04/10/27',
    storage: 'Store at room temperature',
    targetRxUrl: 'https://med-peptides.com/rx/BOX03529AATRI'
  };
  const svgJulien2 = await renderLabelSvg(julienPart2);
  await exportBoth(svgJulien2, 'PHARMAPOLIS_JULIEN_BOITEUX_BOX03529AATRI_PART-2_TRICHOOIL_30ML_75x45mm_BACK-QR_300DPI');

  console.log('🎉 Done! All requested files generated with patient names in filename.');
}

main().catch(console.error);
