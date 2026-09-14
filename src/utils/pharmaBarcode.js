/**
 * pharmaBarcode.js
 * Generador de códigos de lote institucional (Supplier + Fecha + Multiplicador Markup)
 * y renderizador vectorial SVG Code 128-B estándar para escaneo óptico.
 */

const SUPPLIER_CODE_MAP = {
  lotusland: 'LL',
  'np labs': 'NP',
  nplabs: 'NP',
  'pod poland': 'PD',
  europeptides: 'EP',
  regenpept: 'RP',
  fagron: 'FG',
  eterna: 'ET',
  '24genetics': '24',
  bioniq: 'BQ',
  bloodo: 'BL',
};

/**
 * Genera un código de lote farmacéutico intuitivo para el equipo comercial:
 * Formato: RP-[SUPPLIER]-[AAMMDD]-[FACTOR]-[CHECK]
 * Ej: RP-LL-260914-120-7
 *  - LL: Lotusland
 *  - 260914: 14 de Septiembre de 2026
 *  - 120: Factor 1.20 (+20% markup)
 *  - 7: Checksum hex
 */
export function generatePharmaBatchCode({
  supplierId = null,
  catalogueFilter = null,
  issuedAt = null,
  priceMarkupPercent = 0,
  prefix = 'RP'
} = {}) {
  // 1. Identificar Proveedor (2 letras)
  const normSupplier = (supplierId || catalogueFilter || '').toLowerCase().trim();
  let sCode = 'AT'; // Atlas General por defecto
  for (const [key, val] of Object.entries(SUPPLIER_CODE_MAP)) {
    if (normSupplier.includes(key)) {
      sCode = val;
      break;
    }
  }

  // 2. Extraer Fecha (YYMMDD)
  const dateObj = issuedAt ? new Date(issuedAt) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const yy = String(validDate.getFullYear()).slice(-2);
  const mm = String(validDate.getMonth() + 1).padStart(2, '0');
  const dd = String(validDate.getDate()).padStart(2, '0');
  const dateCode = `${yy}${mm}${dd}`;

  // 3. Multiplicador de Markup (100 + markup)
  // Ej: +20% -> 120 | +35% -> 135 | 0% -> 100
  const markupNum = Math.round(Number(priceMarkupPercent) || 0);
  const factor = Math.max(100, 100 + markupNum);

  // 4. Checksum simple
  const rawPayload = `${prefix}${sCode}${dateCode}${factor}`;
  let sum = 0;
  for (let i = 0; i < rawPayload.length; i++) {
    sum = (sum * 31 + rawPayload.charCodeAt(i)) >>> 0;
  }
  const checkHex = (sum % 16).toString(16).toUpperCase();

  return `${prefix}-${sCode}-${dateCode}-${factor}-${checkHex}`;
}

// ── Code 128 Subset B Patterns ──────────────────────────────────────────────
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

const START_B = 104;
const STOP = 106;

/**
 * Genera el SVG vectorial de un código de barras Code 128 (Subset B)
 */
export function generateBarcode128Svg(text, {
  width = 240,
  height = 36,
  color = '#002244',
  bgColor = 'transparent'
} = {}) {
  const clean = String(text || '').trim();
  if (!clean) return '';

  const charCodes = [];
  for (let i = 0; i < clean.length; i++) {
    const ascii = clean.charCodeAt(i);
    if (ascii >= 32 && ascii <= 126) {
      charCodes.push(ascii - 32);
    }
  }

  // Checksum Modulo 103
  let checksum = START_B;
  charCodes.forEach((val, idx) => {
    checksum += val * (idx + 1);
  });
  const checkChar = checksum % 103;

  const sequence = [START_B, ...charCodes, checkChar, STOP];

  let modules = '';
  sequence.forEach(symbolIdx => {
    const pattern = CODE128_PATTERNS[symbolIdx] || CODE128_PATTERNS[0];
    for (let p = 0; p < pattern.length; p++) {
      const runLen = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0;
      modules += (isBar ? '1' : '0').repeat(runLen);
    }
  });

  const quietZone = 8;
  const fullWidthModules = modules.length + quietZone * 2;

  const rects = [];
  let currentRun = 0;
  let inBar = false;

  for (let m = 0; m < modules.length; m++) {
    const bit = modules[m];
    if (bit === '1') {
      if (!inBar) {
        inBar = true;
        currentRun = 1;
      } else {
        currentRun++;
      }
    } else {
      if (inBar) {
        rects.push(`<rect x="${quietZone + (m - currentRun)}" y="0" width="${currentRun}" height="${height}" fill="${color}"/>`);
        inBar = false;
        currentRun = 0;
      }
    }
  }
  if (inBar) {
    rects.push(`<rect x="${quietZone + (modules.length - currentRun)}" y="0" width="${currentRun}" height="${height}" fill="${color}"/>`);
  }

  const bgRect = bgColor !== 'transparent'
    ? `<rect width="${fullWidthModules}" height="${height}" fill="${bgColor}"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullWidthModules} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges" style="display:block;">${bgRect}${rects.join('')}</svg>`;
}
