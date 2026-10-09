import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';
import { PDFDocument } from 'pdf-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../public/labels/pharmapolis');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 7.5 x 4.5 ratio at 200 DPI = 1500 x 900 px
const WIDTH = 1500;
const HEIGHT = 900;

async function createPdfFromPngBuffer(pngBuffer, widthMm = 75, heightMm = 45) {
  const pdfDoc = await PDFDocument.create();
  const widthPt = (widthMm / 25.4) * 72;
  const heightPt = (heightMm / 25.4) * 72;
  const page = pdfDoc.addPage([widthPt, heightPt]);
  const pngImage = await pdfDoc.embedPng(pngBuffer);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt
  });
  return await pdfDoc.save();
}

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

function wrapText(text, maxCharsPerLine = 85) {
  if (!text) return [];
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

async function generateFrontLabelSvg(data, options = { withMicroQr: false, qrSvg: '' }) {
  const patientLines = wrapText(data.patientName, 70);
  const patientDisplay = patientLines[0] || data.patientName;

  const formulaLines = wrapText(data.formula || '', 92);
  const directionLines = wrapText(data.directions || '', 88);
  const warningLines = wrapText(data.warnings || '', 88);

  let currentY = 255;
  const productTitleY = currentY;
  currentY += 40;

  const formulaSvgLines = formulaLines.map((line, idx) => {
    const y = currentY + (idx * 28);
    return `<text x="60" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="500" fill="#222222">${escapeXml(line)}</text>`;
  }).join('\n');

  if (formulaLines.length > 0) {
    currentY += (formulaLines.length * 28) + 20;
  } else {
    currentY += 15;
  }

  const directionsStartY = currentY;
  let directionsSvg = '';
  if (directionLines.length > 0) {
    directionsSvg = `
      <text x="60" y="${directionsStartY}" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="700" fill="#000000">Directions for use: <tspan font-weight="400" fill="#111111">${escapeXml(directionLines[0])}</tspan></text>
      ${directionLines.slice(1).map((line, idx) => `
        <text x="60" y="${directionsStartY + 30 + (idx * 28)}" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="400" fill="#111111">${escapeXml(line)}</text>
      `).join('\n')}
    `;
    currentY += (directionLines.length * 29) + 15;
  }

  let warningsSvg = '';
  if (warningLines.length > 0) {
    warningsSvg = warningLines.map((line, idx) => {
      const y = currentY + (idx * 28);
      return `<text x="60" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="400" fill="#333333">${escapeXml(line)}</text>`;
    }).join('\n');
  }

  // Micro QR in top-right if enabled (takes ZERO space away from directions or patient info)
  let microQrSnippet = '';
  if (options.withMicroQr && options.qrSvg) {
    microQrSnippet = `
      <g transform="translate(1320, 25)">
        <rect x="-8" y="-8" width="136" height="136" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" rx="4" />
        ${options.qrSvg}
        <text x="60" y="142" font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="800" fill="#003666" text-anchor="middle" letter-spacing="0.5">SCAN RX</text>
      </g>
    `;
  }

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />

    <!-- PHARMAPOLIS HEADER -->
    <g transform="translate(60, 48)">
      <text x="0" y="32" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" letter-spacing="0.5" fill="#000000">PHARMAPOLIS</text>
      <text x="0" y="58" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="400" fill="#222222">g.k. Hristo Botev-North/Yuzhen</text>
      <text x="0" y="82" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="400" fill="#222222">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
    </g>

    ${microQrSnippet}

    <!-- PATIENT NAME BOX -->
    <g transform="translate(60, 160)">
      <rect x="0" y="0" width="1380" height="58" fill="none" stroke="#000000" stroke-width="2" />
      <text x="18" y="37" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="0.4" fill="#000000">
        PATIENT NAME: <tspan font-weight="900">${escapeXml(patientDisplay)}</tspan>
      </text>
    </g>

    <!-- PRODUCT TITLE -->
    <text x="60" y="${productTitleY}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="#000000">${escapeXml(data.productTitle)}</text>

    <!-- FORMULA DETAILS IF PRESENT -->
    ${formulaSvgLines}

    <!-- DIRECTIONS FOR USE -->
    ${directionsSvg}

    <!-- WARNINGS -->
    ${warningsSvg}

    <!-- DASHED DIVIDER -->
    <line x1="60" y1="730" x2="1440" y2="730" stroke="#000000" stroke-width="1.8" stroke-dasharray="7,5" />

    <!-- FOOTER INFO ROW -->
    <g transform="translate(60, 775)">
      <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Prod. date: <tspan font-weight="400">${escapeXml(data.prodDate || '19-08-2026')}</tspan>
      </text>
      <text x="0" y="36" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Storage: <tspan font-weight="400">${escapeXml(data.storage || 'Store at room temperature')}</tspan>
      </text>

      <text x="1380" y="0" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Exp. date: <tspan font-weight="400">${escapeXml(data.expDate || '19-08-2027')}</tspan>
      </text>
    </g>
  </svg>
  `;
}

async function generateBackLabelSvg(data, qrSvg) {
  const patientDisplay = data.patientName;
  const qrUrl = data.url || `https://med-peptides.com/rx/${data.rxCode || '50957'}`;

  return `
  <svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff" />

    <!-- PHARMAPOLIS HEADER & TRACEABILITY BADGE -->
    <g transform="translate(60, 48)">
      <text x="0" y="32" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" letter-spacing="0.5" fill="#000000">PHARMAPOLIS</text>
      <text x="0" y="58" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="400" fill="#222222">Verification &amp; Digital Monograph Registry</text>
      <text x="0" y="82" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="400" fill="#222222">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
    </g>

    <!-- RIGHT BADGE -->
    <g transform="translate(1440, 50)">
      <rect x="-310" y="0" width="310" height="42" fill="#f8fafc" stroke="#003666" stroke-width="1.5" rx="6" />
      <text x="-155" y="27" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#003666" letter-spacing="0.5">EU GMP CERTIFIED DISPENSARY</text>
    </g>

    <!-- PATIENT IDENTIFICATION BOX -->
    <g transform="translate(60, 160)">
      <rect x="0" y="0" width="1380" height="58" fill="none" stroke="#000000" stroke-width="2" />
      <text x="18" y="37" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="0.4" fill="#000000">
        PATIENT NAME: <tspan font-weight="900">${escapeXml(patientDisplay)}</tspan>
      </text>
      <text x="1360" y="37" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#003666">
        FILE #${escapeXml(data.fileNumber || data.rxCode || '50957')}
      </text>
    </g>

    <!-- BACK CONTENT: 2 COLUMNS (LEFT: QR CODE 360x360, RIGHT: CLINICAL & TRACEABILITY DETAILS) -->
    <!-- LEFT: QR CODE CARD -->
    <g transform="translate(60, 250)">
      <rect x="0" y="0" width="460" height="455" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="8" />
      ${qrSvg}
      <text x="230" y="375" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="#003666" letter-spacing="0.5">SCAN FOR DIGITAL POSOLOGY &amp; CoA</text>
      <text x="230" y="405" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#64748b">${escapeXml(qrUrl)}</text>
      <text x="230" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="600" fill="#16a34a">✓ Verified Clinical Atlas Record</text>
    </g>

    <!-- RIGHT: CLINICAL TRACEABILITY & EXCIPIENTS -->
    <g transform="translate(560, 250)">
      <rect x="0" y="0" width="880" height="455" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" rx="8" />
      
      ${data.apis && data.apis.length > 0 ? `
      <!-- ROW 1: NET QUANTITY & DISPENSING BATCH -->
      <g transform="translate(30, 40)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#64748b" letter-spacing="0.8">NET QUANTITY &amp; DISPENSING BATCH</text>
        <text x="0" y="28" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="900" fill="#000000">${escapeXml(data.productTitle)}</text>
        <text x="0" y="56" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#003666">Batch: <tspan font-family="monospace">${escapeXml(data.batchCode || 'PHARM-2026-B948')}</tspan> • Lote Control: <tspan font-family="monospace">${escapeXml(data.lote || '2609-PLV')}</tspan></text>
        <line x1="0" y1="70" x2="820" y2="70" stroke="#e2e8f0" stroke-width="1.5" />
      </g>

      <!-- ROW 2: ACTIVE COMPOUNDED INGREDIENTS AND STRENGTH -->
      <g transform="translate(30, 130)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="900" fill="#0284c7" letter-spacing="0.8">ACTIVE COMPOUNDED INGREDIENTS AND STRENGTH</text>
        ${data.apis.map((ing, idx) => {
          const ingText = typeof ing === 'string' ? ing : `${ing.name || ing.activeIngredient || ''}${ing.dose || ing.dosage ? ' ' + (ing.dose || ing.dosage) : ''}`.trim();
          return `<text x="0" y="${24 + (idx * 24)}" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" fill="#0f172a">• ${escapeXml(ingText)}</text>`;
        }).join('')}
        ${(() => {
          const vehRaw = data.vehicle || data.base;
          if (!vehRaw) return '';
          let vehText = typeof vehRaw === 'string' ? vehRaw : (vehRaw.name || '');
          let prefix = 'Compounding Vehicle:';
          const vLower = vehText.toLowerCase();
          if (vLower.includes('capsule')) {
            prefix = 'Compounding Vehicle / Shell:';
          } else if (vLower.includes('ointment') || vLower.includes('pomade')) {
            prefix = 'Compounding Base:';
          }
          if (vehText.toLowerCase().startsWith('compounding vehicle:')) {
            vehText = vehText.slice(20).trim();
          } else if (vehText.toLowerCase().startsWith('compounding base:')) {
            vehText = vehText.slice(17).trim();
          } else if (vehText.toLowerCase().startsWith('base:')) {
            vehText = vehText.slice(5).trim();
          }
          if (vehText.toLowerCase().includes('trichosol')) {
            vehText = vehText
              .replace(/\bliposomal\s+hydrophilic\s+base\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
              .replace(/\bhydrophilic\s+base\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
              .replace(/\bpatented\s+hydrophilic\s+vehicle\s+for\s+scalp\s+retention\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
              .replace(/\bbase\b/gi, 'Compounding Vehicle');
          }
          if (vehText.toLowerCase().includes('trichooil')) {
            vehText = vehText
              .replace(/\bbase\b/gi, 'Compounding Vehicle')
              .replace(/\bnatural\s+lipidic\s+carrier\b/gi, '100% Natural Scalp Compounding Vehicle');
          }
          const fullVehDisplay = `${prefix} ${vehText}`;
          return `
            <text x="0" y="${24 + (data.apis.length * 24) + 2}" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" fill="#0369a1">${escapeXml(fullVehDisplay)}</text>
          `;
        })()}
        <line x1="0" y1="${24 + (data.apis.length * 24) + ((data.base || data.vehicle) ? 18 : 10)}" x2="820" y2="${24 + (data.apis.length * 24) + ((data.base || data.vehicle) ? 18 : 10)}" stroke="#e2e8f0" stroke-width="1.5" />
      </g>

      <!-- ROW 3: DIRECTIONS FOR USE / PRESCRIBED POSOLOGY -->
      <g transform="translate(30, 258)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#0284c7" letter-spacing="0.8">DIRECTIONS FOR USE / PRESCRIBED POSOLOGY</text>
        ${(() => {
          const pLines = wrapText(data.directions || 'Apply or take as prescribed by physician.', 70);
          return pLines.slice(0, 2).map((pLine, pIdx) => `
            <text x="0" y="${22 + (pIdx * 22)}" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="700" fill="#0f172a">${escapeXml(pLine)}</text>
          `).join('');
        })()}
        <line x1="0" y1="68" x2="820" y2="68" stroke="#e2e8f0" stroke-width="1.5" />
      </g>

      <!-- ROW 4: PRESCRIBING PHYSICIAN & CLINIC -->
      <g transform="translate(30, 348)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="800" fill="#64748b" letter-spacing="0.8">PRESCRIBING PHYSICIAN &amp; CLINIC</text>
        <text x="0" y="24" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#1e293b">Rx: ${escapeXml(data.doctorName || 'Dr. Sezgin Cagatay')} • ${escapeXml(data.clinicName || 'Hortman Clinics, Dubai')} (${escapeXml(data.doctorLicense || 'DHA-00013060-006')})</text>
        <text x="0" y="46" font-family="Arial, Helvetica, sans-serif" font-size="13" font-weight="800" fill="#b91c1c" letter-spacing="0.4">${escapeXml(data.warnings || 'CAUTION: FOR CLINICAL USE ONLY • KEEP OUT OF REACH OF CHILDREN')}</text>
      </g>
      ` : `
      <!-- ROW 1: PRODUCT & BATCH -->
      <g transform="translate(30, 45)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#64748b" letter-spacing="0.8">FORMULATION CODE &amp; BATCH</text>
        <text x="0" y="30" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="900" fill="#000000">${escapeXml(data.productTitle)}</text>
        <text x="0" y="60" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="#003666">Batch: <tspan font-family="monospace">${escapeXml(data.batchCode || 'PHARM-2026-B948')}</tspan> • Lote Control: <tspan font-family="monospace">${escapeXml(data.lote || '2609-PLV')}</tspan></text>
      </g>

      <!-- ROW 2: PRESCRIBING PHYSICIAN -->
      <g transform="translate(30, 160)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#64748b" letter-spacing="0.8">PRESCRIBING PHYSICIAN &amp; CLINIC</text>
        <text x="0" y="28" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="850" fill="#1e293b">${escapeXml(data.doctorName || 'Dra. Haydee Camacho Gamboa / Dr. Sezgin Cagatay')}</text>
        <text x="0" y="54" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" fill="#475569">${escapeXml(data.clinicName || 'Clínica Dra Camacho / Hortman Clinics')}</text>
        <text x="0" y="78" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="500" fill="#64748b">License: ${escapeXml(data.doctorLicense || 'DHA / COMB Registered')} • Refill Authorization: Active</text>
      </g>

      <!-- ROW 3: QUALITY SPECIFICATIONS & SPECIAL REQUIREMENTS -->
      <g transform="translate(30, 285)">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="800" fill="#64748b" letter-spacing="0.8">COMPOUNDING SPECIFICATIONS &amp; PURITY</text>
        ${(data.productTitle || '').toLowerCase().includes('pomade') || (data.productTitle || '').toLowerCase().includes('ointment') ? `
        <text x="0" y="26" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">• Hypoallergenic ointment base: 100% Fragrance-free and alcohol-free.</text>
        <text x="0" y="52" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">• Non-irritating soothing carrier: Safe for sensitive cutaneous and perianal mucosa.</text>
        ` : `
        <text x="0" y="26" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">• Hypoallergenic formulation: Zero gluten, zero lactose, zero dairy.</text>
        <text x="0" y="52" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">• No bromelain, no sunflower lecithin, no seed oils in capsule fill.</text>
        `}
        <text x="0" y="78" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="#0f172a">• HPLC Verified Raw Materials &gt; 98.5% Active Pharmaceutical Purity.</text>
        <text x="0" y="104" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="600" fill="#16a34a">✓ Tamper-evident seal intact upon dispensary release.</text>
      </g>
      `}
    </g>

    <!-- DASHED DIVIDER -->
    <line x1="60" y1="730" x2="1440" y2="730" stroke="#000000" stroke-width="1.8" stroke-dasharray="7,5" />

    <!-- FOOTER INFO ROW -->
    <g transform="translate(60, 775)">
      <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Prod. date: <tspan font-weight="400">${escapeXml(data.prodDate || '19-08-2026')}</tspan>
      </text>
      <text x="0" y="36" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Storage: <tspan font-weight="400">${escapeXml(data.storage || 'Store at room temperature')}</tspan>
      </text>

      <text x="1380" y="0" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="#000000">
        Exp. date: <tspan font-weight="400">${escapeXml(data.expDate || '19-08-2027')}</tspan>
      </text>
    </g>
  </svg>
  `;
}

// Full catalogue of Pharmapolis Prescriptions & Products
const PRESCRIPTIONS_CATALOG = [
  // 1. Alan Maclean Rutledge - Cetirizine 1% (from uploaded sample)
  {
    codeId: '50957_cetirizine',
    rxCode: '50957',
    fileNumber: '50957',
    patientName: 'Alan Maclean Rutledge',
    productTitle: 'Cetirizine 1% - Hydroalcoholic Topical scalp solution 100 ml',
    formula: '',
    directions: 'Apply 1 ml to the affected areas of the scalp once daily, preferably in the evening. Gently massage into the scalp and allow to dry.',
    warnings: 'For topical use only. Avoid contact with eyes and mucous membranes.',
    prodDate: '19-08-2026',
    expDate: '19-08-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-CET100',
    lote: '2608-CET',
    url: 'https://med-peptides.com/rx/50957'
  },
  // 2. Alan Maclean Rutledge - Proteolytic Enzymes 270 caps (RX-50957-A)
  {
    codeId: '50957_proteolytic_270caps',
    rxCode: 'RX-50957-A',
    fileNumber: '50957',
    patientName: 'Alan Maclean Rutledge',
    productTitle: 'Proteolytic Formula - 270 acid-resistant vegetable capsules',
    formula: 'Nattokinase 2,000 FU (100 mg) + Serrapeptase 40,000 SPU (20 mg)',
    directions: 'Week 1: 1 cap daily morning on empty stomach. From Week 2 onwards: 1 cap 3 times daily (morning, 5:00 PM, bedtime on empty stomach).',
    warnings: 'Acid-resistant vegetable capsules. Discontinue 3 days before blood tests. Start 2 weeks after FMT.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dra. Haydee Camacho Gamboa',
    doctorLicense: 'COMB 46759',
    clinicName: 'Clínica Dra Camacho, Barcelona',
    batchCode: 'PHARM-2026-NATSER',
    lote: '2609-NAT',
    url: 'https://med-peptides.com/rx/RX-50957-A'
  },
  // 3. Alan Maclean Rutledge - Liver & Mitochondrial Support 90 caps (RX-50957-B)
  {
    codeId: '50957_mitochondrial_90caps',
    rxCode: 'RX-50957-B',
    fileNumber: '50957',
    patientName: 'Alan Maclean Rutledge',
    productTitle: 'Liver & Mitochondrial Support - 90 vegetable capsules',
    formula: 'Alpha-Lipoic Acid 200 mg + Ubiquinol 100 mg + Pyrroloquinoline Quinone (PQQ) 10 mg',
    directions: 'Take 1 capsule daily in the morning with food for 3 months.',
    warnings: 'Gluten-free, lactose-free, dairy-free. Hypoallergenic vegetable capsules.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dra. Haydee Camacho Gamboa',
    doctorLicense: 'COMB 46759',
    clinicName: 'Clínica Dra Camacho, Barcelona',
    batchCode: 'PHARM-2026-ALAUPI',
    lote: '2609-MITO',
    url: 'https://med-peptides.com/rx/RX-50957-B'
  },

  // 4. Saeed Musallam Mefleh Khamis Almazrouei - Night Formula (from uploaded sample)
  {
    codeId: 'saeed_night_formula_270caps',
    rxCode: 'saeed-almazrouei',
    fileNumber: 'SAEED-2026',
    patientName: 'Saeed Musallam Mefleh Khamis Almazrouei',
    productTitle: 'Night Formula - 270 capsules',
    formula: 'P5P (Pyridoxal-5-Phosphate) 25 mg + Magnesium Glycinate 500 mg + L-Theanine 200 mg + Glycine 1000 mg + 5-HTP 50 mg + Apigenin 50 mg',
    directions: 'Take 3 capsules per dose nightly 30-60 minutes before bedtime.',
    warnings: 'May cause drowsiness. Do not drive or operate machinery after consumption. Keep out of reach of children.',
    prodDate: '18-08-2026',
    expDate: '18-08-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-NF270',
    lote: '2608-NF',
    url: 'https://med-peptides.com/rx/saeed-almazrouei'
  },

  // 5. Amna Sultan Mohamed Ahmed Alotaiba - Morning Formula (RX-51857-A)
  {
    codeId: '51857_morning_90caps',
    rxCode: 'RX-51857-A',
    fileNumber: '51857',
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    productTitle: 'Morning Formula | With Breakfast',
    volume: '60 Caps, 2 Months Treatment',
    formula: 'Ubiquinol 250 mg + Saw Palmetto Extract 250 mg',
    directions: 'Take 1 capsule once daily with breakfast.',
    warnings: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 2 months.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-UBISWP',
    lote: '2609-AMN1',
    url: 'https://med-peptides.com/rx/51857'
  },
  // 6. Amna Sultan Mohamed Ahmed Alotaiba - Red Yeast Rice (RX-51857-B)
  {
    codeId: '51857_metabolic_90caps',
    rxCode: 'RX-51857-B',
    fileNumber: '51857',
    patientName: 'Amna Sultan Mohamed Ahmed Alotaiba',
    productTitle: 'Red Yeast Rice Extract 600 mg',
    volume: '120 Caps, 1 Month Treatment',
    formula: 'Red Yeast Rice Extract 600 mg',
    directions: 'Take 2 caps with lunch and 2 caps with dinner.',
    warnings: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives. Duration: 1 month.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-RYR',
    lote: '2609-AMN2',
    url: 'https://med-peptides.com/rx/51857'
  },

  // 7. Abdulla Sultan Mohamed Ahmed Alotaiba - Morning Methylation (RX-51812-A)
  {
    codeId: '51812_morning_90caps',
    rxCode: 'RX-51812-A',
    fileNumber: '51812',
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    productTitle: 'Morning Methylation & Mitochondrial Formula - 90 capsules',
    formula: 'B12 500 mcg + P5P 25 mg + B2 10 mg + TMG 500 mg + Ubiquinol 200 mg + Resveratrol 250 mg + NAC 600 mg',
    directions: 'Take 1 capsule every morning with breakfast for 3 months.',
    warnings: 'May cause harmless bright yellow urine discoloration. Take with adequate water and food.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-METH90',
    lote: '2609-ABD1',
    url: 'https://med-peptides.com/rx/51812'
  },
  // 8. Abdulla Sultan Mohamed Ahmed Alotaiba - Night Formula (RX-51812-B)
  {
    codeId: '51812_night_90caps',
    rxCode: 'RX-51812-B',
    fileNumber: '51812',
    patientName: 'Abdulla Sultan Mohamed Ahmed Alotaiba',
    productTitle: 'Before Bed Neuromuscular Formula - 90 capsules',
    formula: 'Magnesium Bisglycinate (eq. 400 mg elemental Mg) + Glycine 1,000 mg + L-Theanine 200 mg',
    directions: 'Take 1 serving 30-45 minutes before bedtime with water for 3 months.',
    warnings: 'Non-habit forming. Promotes restorative slow-wave sleep architecture. Store tightly sealed.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-REST90',
    lote: '2609-ABD2',
    url: 'https://med-peptides.com/rx/51812'
  },

  // 9. Basma Haitham K Bouzo - Morning Testosterone Cream (RX-51861-A)
  {
    codeId: '51861_testosterone_90ml',
    rxCode: 'RX-51861-A',
    fileNumber: '51861',
    patientName: 'Basma Haitham K Bouzo',
    productTitle: 'Morning Testosterone Transdermal Cream 2 mg/mL - 90 mL',
    formula: 'Testosterone Micronized USP 2 mg/mL in Pentravan® Liposomal Vehicle Base 1 mL',
    directions: 'Apply 1 pump (1 mL = 2 mg) every morning to clean, hairless skin of the inner forearm or lower abdomen.',
    warnings: 'For topical transdermal use only. Wash hands with soap after application. Avoid contact with children.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-TEST90',
    lote: '2609-BAS1',
    url: 'https://med-peptides.com/rx/51861'
  },
  // 10. Basma Haitham K Bouzo - Evening Estradiol Cream (RX-51861-B)
  {
    codeId: '51861_estradiol_90ml',
    rxCode: 'RX-51861-B',
    fileNumber: '51861',
    patientName: 'Basma Haitham K Bouzo',
    productTitle: 'Evening Estradiol Transdermal Cream 2 mg/mL - 90 mL',
    formula: '17β-Estradiol Micronized USP 2 mg/mL in Pentravan® Liposomal Vehicle Base 1 mL',
    directions: 'Apply 1 pump (1 mL = 2 mg) every evening at bedtime to clean skin of the inner thigh or upper arm.',
    warnings: 'For topical transdermal use only. Do not apply directly to breasts or mucous membranes. Wash hands after use.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Plastic Surgery Clinic, Dubai',
    batchCode: 'PHARM-2026-ESTR90',
    lote: '2609-BAS2',
    url: 'https://med-peptides.com/rx/51861'
  },

  // 11. Mohammed Ahmad Aishehhi - TrichoSol 100ml (RX-BOX03483AATRI)
  {
    codeId: 'box03483_trichotest_100ml',
    rxCode: 'BOX03483AATRI',
    fileNumber: 'BOX03483AATRI',
    patientName: 'Mohammed Ahmad Aishehhi',
    productTitle: 'TrichoSol 100ml',
    apis: [
      'Minoxidil 4%',
      'Spironolactone 1%',
      'Arginine 1.5%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Minoxidil 4% + Spironolactone 1% + Arginine 1.5% in TrichoSol™ 100 mL',
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Leave on scalp as long as possible. Wash scalp the next day.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-TRI100',
    lote: '2609-MHD1',
    url: 'https://med-peptides.com/rx/BOX03483AATRI'
  },

  // 12. Julien Boiteux - TrichoSol 100ml (BOX03529AATRI - Part 1)
  {
    codeId: 'box03529_trichosol_100ml',
    rxCode: 'BOX03529AATRI',
    fileNumber: 'BOX03529AATRI',
    patientName: 'Julien Boiteux',
    productTitle: 'TrichoSol 100ml',
    apis: [
      'Minoxidil 4%',
      'Spironolactone 1%',
      'Arginine 1.5%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Minoxidil 4% + Spironolactone 1% + Arginine 1.5% in TrichoSol™ 100 mL',
    directions: 'Apply at night before bedtime. Leave the solution on your scalp for as long as possible. Wash your scalp the next day.',
    warnings: 'For topical scalp use only. Leave on scalp as long as possible. Wash scalp the next day.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-TRI-BOX03529',
    lote: '2609-JB1',
    url: 'https://med-peptides.com/rx/BOX03529AATRI'
  },
  // 13. Julien Boiteux - TrichoOil 30ml (BOX03529AATRI - Part 2)
  {
    codeId: 'box03529_trichooil_30ml',
    rxCode: 'BOX03529AATRI',
    fileNumber: 'BOX03529AATRI',
    patientName: 'Julien Boiteux',
    productTitle: 'TrichoOil 30ml',
    apis: [
      'Ginseng 2%',
      'Ginkgo biloba 2.5%',
      'Vitamin E (Tocopherol) 5%'
    ],
    base: 'TrichoOil™ 30 mL (100% Natural Scalp Compounding Vehicle)',
    formula: 'Ginseng 2% + Ginkgo biloba 2.5% + Vitamin E (Tocopherol) 5% in TrichoOil™ 30 mL',
    directions: '1-2 times / week, massage for 3-5 minutes and leave it on for 10 min before washing your hair.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-OIL-BOX03529',
    lote: '2609-JB2',
    url: 'https://med-peptides.com/rx/BOX03529AATRI'
  },

  // 14. Mangesh Sakharkar - TrichoSol (RX-MS-0903)
  {
    codeId: 'mangesh_trichosol_100ml',
    rxCode: 'RX-MS-0903',
    fileNumber: 'RX-MS-0903',
    patientName: 'Mangesh Sakharkar',
    productTitle: 'TrichoSol - 100 ml',
    apis: ['Latanoprost 0.005 %', 'Dutasteride 0.25 %', 'TrichoXidil 4 %'],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Latanoprost 0.005 % + Dutasteride 0.25 % + TrichoXidil 4 %',
    directions: 'Apply at night before bedtime. Leave on scalp overnight. Wash next day. Massage gently.',
    warnings: 'For topical use only. Avoid contact with eyes and mucous membranes.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MS-TR1',
    lote: '2609-MS1',
    url: 'https://med-peptides.com/rx/RX-MS-0903'
  },
  // 15. Mangesh Sakharkar - Oral Minoxidil (RX-MS-0903)
  {
    codeId: 'mangesh_oral_90caps',
    rxCode: 'RX-MS-0903',
    fileNumber: 'RX-MS-0903',
    patientName: 'Mangesh Sakharkar',
    productTitle: 'Oral Treatment - 90 Capsules (3 Months)',
    apis: ['Oral Minoxidil 3.5 mg', 'Selenium yeast 80 mg'],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    formula: 'Oral Minoxidil (man) 3.5 mg + Selenium yeast 80 mg',
    directions: 'Take 1 capsule per day with food. 90 capsules for 3 months course.',
    warnings: 'Take with food. Do not exceed prescribed dose. Keep out of reach of children.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MS-OR1',
    lote: '2609-MS2',
    url: 'https://med-peptides.com/rx/RX-MS-0903'
  },

  // 16. Matthew Taylor - TrichoSol (RX-MT-0903)
  {
    codeId: 'matthew_trichosol_100ml',
    rxCode: 'RX-MT-0903',
    fileNumber: 'RX-MT-0903',
    patientName: 'Matthew Taylor',
    productTitle: 'TrichoSol - 100ml',
    apis: ['Latanoprost 0.005 %', 'Dutasteride 0.25 %'],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Latanoprost Fagron 0.005 % + Dutasteride 0.25 %',
    directions: 'Apply at night before bedtime. Leave on scalp overnight. Wash next day. Massage gently.',
    warnings: 'For topical use only. Avoid contact with eyes and mucous membranes.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MT-TR1',
    lote: '2609-MT1',
    url: 'https://med-peptides.com/rx/RX-MT-0903'
  },
  // 17. Matthew Taylor - TrichoOil (RX-MT-0903)
  {
    codeId: 'matthew_trichooil_30ml',
    rxCode: 'RX-MT-0903',
    fileNumber: 'RX-MT-0903',
    patientName: 'Matthew Taylor',
    productTitle: 'TrichoOil - 30ml',
    formula: 'Vitamin E (Tocoferol) 5 % in TrichoOil',
    apis: ['Vitamin E (Tocopherol) 5%'],
    base: 'TrichoOil™ 30 mL (100% Natural Scalp Compounding Vehicle)',
    directions: '1-2 times / week, massage 3-5 min, leave 10 min before washing.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '03-09-2026',
    expDate: '03-09-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-MT-OIL',
    lote: '2609-MT2',
    url: 'https://med-peptides.com/rx/RX-MT-0903'
  },

  // 18. Aamer Reza Habib - Diltiazem 2% + Lidocaine 2% Pomade - 30 g (RX-51245)
  {
    codeId: '51245_diltiazem_30g',
    rxCode: 'RX-51245',
    fileNumber: '51245',
    patientName: 'Aamer Reza Habib',
    productTitle: 'Diltiazem 2% + Lidocaine 2% Pomade - 30 g',
    formula: 'Diltiazem Hydrochloride USP 2% (0.6 g) + Lidocaine Hydrochloride USP 2% (0.6 g) in Hypoallergenic Ointment Base (Fragrance & Alcohol Free) q.s. 30 g',
    apis: [
      { name: 'Diltiazem Hydrochloride USP', dose: '2% (0.6 g)', dosage: '2% (0.6 g)' },
      { name: 'Lidocaine Hydrochloride USP', dose: '2% (0.6 g)', dosage: '2% (0.6 g)' }
    ],
    vehicle: { name: 'Hypoallergenic Non-Irritating Ointment Base (Fragrance & Alcohol Free, q.s. 30 g)', volume: '30 g' },
    directions: 'Apply a pea-sized amount to the affected area twice daily (morning and evening) for 2 months.',
    warnings: 'For topical / perianal use only. Wash hands after application. Keep out of reach of children.',
    prodDate: '15-09-2026',
    expDate: '15-09-2027',
    storage: 'Store at room temperature (15°C - 25°C)',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic Day Surgery Center, Dubai',
    batchCode: 'PHARM-2026-DL30G',
    lote: '2609-HAB1',
    url: 'https://med-peptides.com/rx/RX-51245'
  },

  // ── SPREADSHEET AUDIT PRESCRIPTIONS (NEW EN ALTAS) ──

  // 19. Noura Majed Mohamed Alfuttaim - Personalized Evening Formula (RX-NMMA-2)
  {
    codeId: 'nmma_evening_formula_90caps',
    rxCode: 'RX-NMMA-2',
    fileNumber: 'RX-NMMA-2',
    patientName: 'Noura Majed Mohamed Alfuttaim',
    productTitle: 'Personalized Evening Formula - 90 capsules',
    apis: [
      'Ashwagandha (KSM-66) 600 mg',
      'Citrus sinensis extract 500 mg',
      'Magnesium Glycinate 400 mg',
      'L-Tryptophan 400 mg',
      'L-Theanine 200 mg',
      'GABA 200 mg',
      'Pyridoxal-5-Phosphate (P5P) 20 mg',
      'Melatonin 5 mg',
      'L-Methylfolate 400 mcg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free.',
    formula: 'Personalized Evening Formula (Ashwagandha, Citrus, Mg Glycinate, Tryptophan, Theanine, GABA, P5P, Melatonin, Folate)',
    directions: 'Take 3 capsules 30-45 minutes before bedtime with water for 1 month.',
    warnings: 'Promotes restorative sleep & metabolic recovery. Store tightly sealed.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-NMMA-EVE',
    lote: '2609-NOU1',
    url: 'https://med-peptides.com/rx/rx_nmma_2'
  },

  // 20. Daria Grek - TrichoSol 100ml (RX-20261001-SW8B - Part 1)
  {
    codeId: 'daria_trichosol_100ml',
    rxCode: 'RX-20261001-SW8B',
    fileNumber: 'SW8B',
    patientName: 'Daria Grek',
    productTitle: 'TrichoSol 100ml',
    apis: [
      'Minoxidil 3%',
      'Spironolactone 2.5%',
      'Arginine 1.5%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Minoxidil 3% + Spironolactone 2.5% + Arginine 1.5% in TrichoSol™ 100 mL',
    directions: 'Apply at night before bedtime. Leave on scalp as long as possible. Wash scalp the next day.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-TR1',
    lote: '2609-DG1',
    url: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  // 21. Daria Grek - Capsules (RX-20261001-SW8B - Part 2)
  {
    codeId: 'daria_capsules_90caps',
    rxCode: 'RX-20261001-SW8B',
    fileNumber: 'SW8B',
    patientName: 'Daria Grek',
    productTitle: 'Oral Hair Vitality Formula - 90 capsules',
    apis: [
      'Turmeric Dry Extract 200 mg',
      'Coenzyme Q10 45 mg',
      'N-Acetyl-L-Cysteine 138 mg',
      'Biotin 1,000 mcg',
      'Zinc 12 mg',
      'Iron Bisglycinate 50 mg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.',
    formula: 'Oral Hair Vitality Complex (Turmeric, CoQ10, NAC, Biotin, Zinc, Iron)',
    directions: 'Take 1 capsule 3 times daily with meals for 3 months.',
    warnings: 'Oral dietary supplement. Store in a cool dry place.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-CAP',
    lote: '2609-DG2',
    url: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  // 22. Daria Grek - TrichoOil 30ml (RX-20261001-SW8B - Part 3)
  {
    codeId: 'daria_trichooil_30ml',
    rxCode: 'RX-20261001-SW8B',
    fileNumber: 'SW8B',
    patientName: 'Daria Grek',
    productTitle: 'TrichoOil 30ml',
    apis: [
      'Ginseng 2.5%',
      'Ginkgo biloba 1%',
      'Vitamin E (Tocopherol) 5%'
    ],
    base: 'TrichoOil™ 30 mL (100% Natural Scalp Compounding Vehicle)',
    formula: 'Ginseng 2.5% + Ginkgo biloba 1% + Vitamin E (Tocopherol) 5% in TrichoOil™ 30 mL',
    directions: '1-2 times / week, massage 3-5 min, leave 10 min before washing your hair.',
    warnings: 'For topical scalp use only. Store away from direct sunlight.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-OIL',
    lote: '2609-DG3',
    url: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },
  // 23. Daria Grek - TrichoWash 250ml (RX-20261001-SW8B - Part 4)
  {
    codeId: 'daria_trichowash_250ml',
    rxCode: 'RX-20261001-SW8B',
    fileNumber: 'SW8B',
    patientName: 'Daria Grek',
    productTitle: 'TrichoWash 250ml',
    apis: [
      'Salicylic Acid 2%',
      'Ketoconazole 2%',
      'TrichoWash Cleansing Base q.s. 250 mL'
    ],
    base: '',
    formula: 'Salicylic Acid 2% + Ketoconazole 2% in TrichoWash™ Cleansing Shampoo Base 250 mL',
    directions: 'Apply to wet scalp 2-3 times weekly, lather, leave for 2-3 minutes, rinse thoroughly.',
    warnings: 'For external scalp wash only. Avoid contact with eyes.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-DG-WASH',
    lote: '2609-DG4',
    url: 'https://med-peptides.com/rx/CfOwJCEFcnwmww0TjtZ5'
  },

  // 24. Ghada Abdulaziz Ishaq - Formula Estradiol Transdermal (RX-51253)
  {
    codeId: '51253_estradiol_60ml',
    rxCode: 'RX-51253',
    fileNumber: '51253',
    patientName: 'Ghada Abdulaziz Ishaq',
    productTitle: 'Formula Estradiol (Transdermal) - 60 mL',
    apis: [
      'Estradiol (micronized, bioidentical) 1 mg/mL'
    ],
    base: 'Pentravan® Liposomal Vehicle Base q.s.p. 1 mL',
    formula: '17β-Estradiol Micronized Bioidentical 1 mg/mL in Pentravan® Base 1 mL',
    directions: 'Apply 1 mL transdermally before bedtime to clean, dry, hairless skin of inner thigh.',
    warnings: 'For transdermal use only. Do not apply to breasts. Wash hands after application.',
    prodDate: '06-10-2026',
    expDate: '05-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City',
    batchCode: 'PHARM-2026-GHA-EST',
    lote: '2609-GHA1',
    url: 'https://med-peptides.com/rx/RX-51253'
  },
  // 25. Ghada Abdulaziz Ishaq - Dehydroepiandrosterone (DHEA) 5 mg (RX-51253-B)
  {
    codeId: '51253_dhea_60caps',
    rxCode: 'RX-51253-B',
    fileNumber: '51253',
    patientName: 'Ghada Abdulaziz Ishaq',
    productTitle: 'Dehydroepiandrosterone (DHEA) 5 mg - 60 capsules',
    apis: [
      'Dehydroepiandrosterone (DHEA) 5 mg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free, colorant-free.',
    formula: 'Dehydroepiandrosterone (DHEA) USP 5 mg in vegetable capsules',
    directions: 'Take 1 capsule once daily in the morning with breakfast with water.',
    warnings: 'Oral route only. Keep out of reach of children. Store tightly closed.',
    prodDate: '06-10-2026',
    expDate: '05-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic · Dubai Healthcare City',
    batchCode: 'PHARM-2026-GHA-DHEA',
    lote: '2609-GHA2',
    url: 'https://med-peptides.com/rx/RX-51253-B'
  },

  // 26. Reem F M Alghanim - Bioidentical Hormone Cream (RX-RFMA-2)
  {
    codeId: 'rfma_hormone_cream_60ml',
    rxCode: 'RX-RFMA-2',
    fileNumber: '51855',
    patientName: 'Reem F M Alghanim',
    productTitle: 'Bioidentical Hormone Cream - 60 mL',
    apis: [
      'Testosterone (Micronized) 1 mg/mL',
      'Estradiol (Micronized) 2 mg/mL'
    ],
    base: 'Pentravan® Liposomal Micronized Base q.s. 1 mL',
    formula: 'Testosterone Micronized 1 mg + Estradiol Micronized 2 mg in Pentravan® Base',
    directions: 'Apply 1 pump (1 mL) once daily in morning to clean skin of inner forearm or thigh.',
    warnings: 'For transdermal use only. Wash hands thoroughly after application.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Marina Cordeiro Fernandes',
    doctorLicense: 'DHA-91105367',
    clinicName: 'NOVA Clinic, Dubai',
    batchCode: 'PHARM-2026-RFMA-CRM',
    lote: '2609-RFM1',
    url: 'https://med-peptides.com/rx/rx_rfma_2'
  },

  // 27. George Mills - TrichoSol 100ml (RX-518134)
  {
    codeId: '518134_trichosol_100ml',
    rxCode: 'RX-518134',
    fileNumber: '518134',
    patientName: 'George Mills',
    productTitle: 'TrichoSol 100ml',
    apis: [
      'Minoxidil 5%',
      'Finasteride 0.1%'
    ],
    base: 'TrichoSol™ 100 mL (Alcohol-Free Hydrophilic Compounding Vehicle)',
    formula: 'Minoxidil 5% + Finasteride 0.1% in TrichoSol™ 100 mL',
    directions: 'Apply 1 mL once daily at night before bedtime to scalp. Wash next day.',
    warnings: 'For topical scalp use only. Keep out of reach of children.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-GM-TRI',
    lote: '2609-GM1',
    url: 'https://med-peptides.com/rx/RX-518134'
  },

  // 28. Sara Khalid Al-Meadadi - Pentravan (BOX03049AATEL - Part 1)
  {
    codeId: 'box03049_pentravan_30g',
    rxCode: 'BOX03049AATEL',
    fileNumber: 'BOX03049AATEL',
    patientName: 'Sara Khalid Al-Meadadi',
    productTitle: 'Cellular Longevity Transdermal Cream (Pentravan) - 30 g',
    apis: [
      'Metformin 88 mg',
      'Testosterone 3 mg',
      'Astaxanthin 17 mg'
    ],
    base: 'Pentravan® Liposomal Transdermal Vehicle Base q.s. 30 g',
    formula: 'Metformin 88 mg + Testosterone 3 mg + Astaxanthin 17 mg in Pentravan® Base 30 g',
    directions: 'Apply 1 dose daily to clean inner thigh or forearm skin as directed.',
    warnings: 'For transdermal use only. Wash hands after application.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store at room temperature',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-SKA-PEN',
    lote: '2609-SKA1',
    url: 'https://med-peptides.com/rx/BOX03049AATEL'
  },
  // 29. Sara Khalid Al-Meadadi - Capsules (BOX03049AATEL - Part 2)
  {
    codeId: 'box03049_capsules_90caps',
    rxCode: 'BOX03049AATEL',
    fileNumber: 'BOX03049AATEL',
    patientName: 'Sara Khalid Al-Meadadi',
    productTitle: 'Mitochondrial & Telomere Oral Formula - 90 capsules',
    apis: [
      'Turmeric Dry Extract 200 mg',
      'Coenzyme Q10 45 mg',
      'N-Acetyl-L-Cysteine 138 mg'
    ],
    base: 'Vegetable capsules. Gluten-free, lactose-free.',
    formula: 'Turmeric Dry Extract 200 mg + CoQ10 45 mg + N-Acetyl-L-Cysteine 138 mg',
    directions: 'Take 1 capsule 3 times daily with meals for 3 months.',
    warnings: 'Oral dietary supplement. Store in a cool dry place.',
    prodDate: '05-10-2026',
    expDate: '04-10-2027',
    storage: 'Store in a cool dry place',
    doctorName: 'Dr. Sezgin Cagatay',
    doctorLicense: 'DHA-00013060-006',
    clinicName: 'Hortman Clinics, Dubai',
    batchCode: 'PHARM-2026-SKA-CAP',
    lote: '2609-SKA2',
    url: 'https://med-peptides.com/rx/BOX03049AATEL'
  }
];

async function run() {
  console.log(`🏷️ Starting generation of ${PRESCRIPTIONS_CATALOG.length} Pharmapolis products...`);

  const generatedFiles = [];

  for (const item of PRESCRIPTIONS_CATALOG) {
    console.log(`Generating labels for: ${item.patientName} -> ${item.productTitle}`);

    // Generate Raw QR SVG for the prescription URL
    const qrUrl = item.url || `https://med-peptides.com/rx/${item.rxCode}`;
    const rawQrSvg = await QRCode.toString(qrUrl, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#003666',
        light: '#ffffff'
      }
    });

    // Clean nested SVGs with precise coordinates and scale
    const backQrSvg = rawQrSvg.replace(/<\?xml.*?\?>/g, '').replace(/<svg\s+/, '<svg x="70" y="25" width="320" height="320" ');
    const microQrSvg = rawQrSvg.replace(/<\?xml.*?\?>/g, '').replace(/<svg\s+/, '<svg x="0" y="0" width="120" height="120" ');

    // Sanitize patient name for clear, identifiable file naming
    const patientSlug = (item.patientName || 'PATIENT')
      .toUpperCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    // 1. FRONT LABEL (Exact Match to User's Pharmapolis template)
    const frontSvg = await generateFrontLabelSvg(item, { withMicroQr: false });
    const frontPngBuffer = await sharp(Buffer.from(frontSvg)).png().toBuffer();
    const frontFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_FRONT.png`;
    const frontPath = path.join(OUTPUT_DIR, frontFilename);
    fs.writeFileSync(frontPath, frontPngBuffer);

    const frontPdfBytes = await createPdfFromPngBuffer(frontPngBuffer, 75, 45);
    const frontPdfFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_FRONT.pdf`;
    fs.writeFileSync(path.join(OUTPUT_DIR, frontPdfFilename), frontPdfBytes);

    // 2. BACK LABEL (Parte de atrás: Dedicated 7.5 x 4.5 cm with QR, Batch & Physician specs)
    const backSvg = await generateBackLabelSvg(item, backQrSvg);
    const backPngBuffer = await sharp(Buffer.from(backSvg)).png().toBuffer();
    const backFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_BACK_QR.png`;
    const backPath = path.join(OUTPUT_DIR, backFilename);
    fs.writeFileSync(backPath, backPngBuffer);

    const backPdfBytes = await createPdfFromPngBuffer(backPngBuffer, 75, 45);
    const backPdfFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_BACK_QR.pdf`;
    fs.writeFileSync(path.join(OUTPUT_DIR, backPdfFilename), backPdfBytes);

    // 3. FRONT LABEL WITH MICRO-QR (Optional hybrid: QR in top right corner without robbing space)
    const frontQrSvg = await generateFrontLabelSvg(item, { withMicroQr: true, qrSvg: microQrSvg });
    const frontQrPngBuffer = await sharp(Buffer.from(frontQrSvg)).png().toBuffer();
    const frontQrFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_FRONT_WITH_QR.png`;
    fs.writeFileSync(path.join(OUTPUT_DIR, frontQrFilename), frontQrPngBuffer);
    const frontQrPdfBytes = await createPdfFromPngBuffer(frontQrPngBuffer, 75, 45);
    const frontQrPdfFilename = `PHARMAPOLIS_${patientSlug}_${item.codeId}_FRONT_WITH_QR.pdf`;
    fs.writeFileSync(path.join(OUTPUT_DIR, frontQrPdfFilename), frontQrPdfBytes);

    // Write backwards-compatible legacy files without slug
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_FRONT.png`), frontPngBuffer);
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_FRONT.pdf`), frontPdfBytes);
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_BACK_QR.png`), backPngBuffer);
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_BACK_QR.pdf`), backPdfBytes);
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_FRONT_WITH_QR.png`), frontQrPngBuffer);
    fs.writeFileSync(path.join(OUTPUT_DIR, `PHARMAPOLIS_${item.codeId}_FRONT_WITH_QR.pdf`), frontQrPdfBytes);

    // Export copies directly to ~/Downloads for immediate client use
    const DOWNLOADS_DIR = '/Users/joseluiszabala/Downloads';
    if (fs.existsSync(DOWNLOADS_DIR)) {
      fs.writeFileSync(path.join(DOWNLOADS_DIR, frontFilename), frontPngBuffer);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, frontPdfFilename), frontPdfBytes);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, backFilename), backPngBuffer);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, backPdfFilename), backPdfBytes);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, frontQrFilename), frontQrPngBuffer);
      fs.writeFileSync(path.join(DOWNLOADS_DIR, frontQrPdfFilename), frontQrPdfBytes);
    }

    generatedFiles.push({
      patient: item.patientName,
      product: item.productTitle,
      front: `/labels/pharmapolis/${frontFilename}`,
      frontPdf: `/labels/pharmapolis/${frontPdfFilename}`,
      back: `/labels/pharmapolis/${backFilename}`,
      backPdf: `/labels/pharmapolis/${backPdfFilename}`,
      frontWithQr: `/labels/pharmapolis/${frontQrFilename}`,
      frontWithQrPdf: `/labels/pharmapolis/${frontQrPdfFilename}`
    });
  }

  // Also create an index.html sheet for previewing & printing all labels directly
  const htmlGallery = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Pharmapolis Individual Labels (7.5 x 4.5 cm)</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; padding: 2rem; color: #1e293b; }
      h1 { color: #003666; margin-bottom: 0.5rem; }
      .subtitle { color: #64748b; margin-bottom: 2rem; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 2rem; }
      .card { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
      .card-title { font-size: 1.1rem; font-weight: 800; color: #003666; margin-bottom: 0.25rem; }
      .card-patient { font-size: 0.9rem; font-weight: 600; color: #475569; margin-bottom: 1rem; }
      .tabs { display: flex; gap: 8px; margin-bottom: 12px; }
      .tab-btn { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer; }
      .img-preview { width: 100%; height: auto; border: 1px solid #94a3b8; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .btn-download { display: inline-block; margin-top: 10px; font-size: 0.78rem; font-weight: 700; color: #003666; text-decoration: none; padding: 6px 12px; background: #e0f2fe; border-radius: 4px; }
      .btn-download:hover { background: #bae6fd; }
    </style>
  </head>
  <body>
    <h1>PHARMAPOLIS • Individual Labels Catalogue (7.5 x 4.5 cm)</h1>
    <p class="subtitle">Complete set of Front Labels, Back QR Verification Labels, and Hybrid Front+QR Labels rendered at high-resolution 1500 x 900 px (exact 5:3 ratio for 75 mm x 45 mm thermal/adhesive stickers).</p>
    
    <div class="grid">
      ${generatedFiles.map(f => `
        <div class="card">
          <div class="card-title">${escapeXml(f.product)}</div>
          <div class="card-patient">Patient: ${escapeXml(f.patient)}</div>
          <div style="margin-bottom: 12px;">
            <strong style="font-size: 0.8rem; color: #003666;">Front Label (7.5 x 4.5 cm):</strong>
            <img src="${f.front}" class="img-preview" alt="Front Label" />
            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <a href="${f.front}" download class="btn-download">Download PNG</a>
              <a href="${f.frontPdf}" download class="btn-download" style="background: #fef3c7; color: #92400e;">Download PDF (Editable)</a>
            </div>
          </div>
          <div style="margin-bottom: 12px;">
            <strong style="font-size: 0.8rem; color: #003666;">Back Verification Label with QR (7.5 x 4.5 cm):</strong>
            <img src="${f.back}" class="img-preview" alt="Back Label" />
            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <a href="${f.back}" download class="btn-download">Download PNG</a>
              <a href="${f.backPdf}" download class="btn-download" style="background: #fef3c7; color: #92400e;">Download PDF (Editable)</a>
            </div>
          </div>
        </div>
      `).join('\n')}
    </div>
  </body>
  </html>
  `;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), htmlGallery);

  console.log(`✅ All ${generatedFiles.length * 3} labels generated successfully in: ${OUTPUT_DIR}`);
}

run().catch(err => {
  console.error('❌ Error generating labels:', err);
  process.exit(1);
});
