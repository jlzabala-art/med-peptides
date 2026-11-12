import { rgb } from 'pdf-lib';

/**
 * Universal WinAnsi font and text sanitizer (prevents WinAnsi encoding crashes in pdf-lib).
 */
export const sanitizePdfText = (str = '') => {
  if (!str || typeof str !== 'string') return '';
  const map = {
    '🥬': '[Veg]', '🐟': '[Fish]', '🫒': '[Oil]', '🍵': '[Tea]', '🥗': '[Diet]',
    '🌍': '[Global]', '✨': '[*]', '⚡': '[!]', '🧠': '[Brain]',
    '≥': '>=', '≤': '<=', '•': '-', '·': '|', '—': '-', '–': '-', '≈': '~',
    'µ': 'u', '²': '2', 'º': 'o', '®': '(R)', '™': '(TM)', '€': 'EUR',
    'é': 'e', 'á': 'a', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n',
    'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
  };
  let res = str;
  for (const [k, v] of Object.entries(map)) {
    res = res.replaceAll(k, v);
  }
  return res.replace(/[^\x20-\x7E\t\n\r]/g, '');
};

/**
 * Patches PDFDocument and embedded fonts so that all drawn text is automatically sanitized.
 */
export function patchPdfDoc(pdfDoc, fonts = {}) {
  Object.values(fonts).forEach(font => {
    if (!font || !font.widthOfTextAtSize) return;
    const origWidth = font.widthOfTextAtSize.bind(font);
    font.widthOfTextAtSize = (t, s) => origWidth(sanitizePdfText(t), s);
  });

  const origAddPage = pdfDoc.addPage.bind(pdfDoc);
  pdfDoc.addPage = (dims) => {
    const pg = origAddPage(dims);
    const origDrawText = pg.drawText.bind(pg);
    pg.drawText = (text, options) => origDrawText(sanitizePdfText(text), options);
    return pg;
  };

  return pdfDoc;
}

/**
 * Robust word-wrapping calculator for pdf-lib text blocks.
 */
export const getWrappedLines = (text, font, size, maxWidth) => {
  if (!text) return [];
  const clean = sanitizePdfText(text);
  const words = clean.trim().split(/\s+/);
  const lines = [];
  let curLine = '';

  for (const word of words) {
    const testLine = curLine ? `${curLine} ${word}` : word;
    const testW = font.widthOfTextAtSize(testLine, size);
    if (testW <= maxWidth) {
      curLine = testLine;
    } else {
      if (curLine) lines.push(curLine);
      curLine = word;
    }
  }
  if (curLine) lines.push(curLine);
  return lines;
};

/**
 * Draws a wrapped text block with line height spacing and returns the bottom Y coordinate.
 */
export const drawWrappedBlock = (targetPage, text, { x, y, size, font, color, maxWidth, lineHeight, maxLines = 10 }) => {
  const lines = getWrappedLines(text, font, size, maxWidth).slice(0, maxLines);
  let curY = y;
  for (const line of lines) {
    targetPage.drawText(line, { x, y: curY, size, font, color });
    curY -= lineHeight;
  }
  return curY;
};

/**
 * Standard Clinical PDF RGB Color Palette & GCP Semantic Tokens
 */
export const pdfColors = {
  navyPrimary: rgb(0 / 255, 54 / 255, 102 / 255),       // #003666
  tealAccent: rgb(13 / 255, 148 / 255, 136 / 255),      // #0d9488
  darkSlate: rgb(15 / 255, 23 / 255, 42 / 255),         // #0f172a
  mutedSlate: rgb(100 / 255, 116 / 255, 139 / 255),    // #64748b
  lightBg: rgb(248 / 255, 250 / 255, 252 / 255),        // #f8fafc
  cardBorder: rgb(226 / 255, 232 / 255, 240 / 255),    // #e2e8f0
  white: rgb(1, 1, 1),

  // Traffic Light Semantic Colors
  greenBorder: rgb(34 / 255, 197 / 255, 94 / 255),     // #22c55e
  greenBg: rgb(240 / 255, 253 / 255, 244 / 255),        // #f0fdf4
  greenText: rgb(21 / 255, 128 / 255, 61 / 255),        // #15803d

  amberBorder: rgb(245 / 255, 158 / 255, 11 / 255),    // #f59e0b
  amberBg: rgb(254 / 255, 243 / 255, 199 / 255),        // #fef3c7
  amberText: rgb(180 / 255, 83 / 255, 9 / 255),         // #b45309
  amberDark: rgb(180 / 255, 83 / 255, 9 / 255),

  redBorder: rgb(239 / 255, 68 / 255, 68 / 255),        // #ef4444
  redBg: rgb(254 / 255, 242 / 255, 242 / 255),          // #fef2f2
  redText: rgb(185 / 255, 28 / 255, 28 / 255),          // #b91c1c
  alertRed: rgb(185 / 255, 28 / 255, 28 / 255),
  badgeRedBg: rgb(254 / 255, 242 / 255, 242 / 255),

  blueBorder: rgb(2 / 255, 132 / 255, 199 / 255),       // #0284c7
  blueBg: rgb(224 / 255, 242 / 255, 254 / 255),         // #e0f2fe
  blueDark: rgb(2 / 255, 132 / 255, 199 / 255),

  emeraldDark: rgb(22 / 255, 163 / 255, 74 / 255),      // #16a34a
  emeraldBg: rgb(240 / 255, 253 / 255, 244 / 255),

  purpleDark: rgb(124 / 255, 58 / 255, 237 / 255),      // #7c3aed
  purpleBg: rgb(243 / 255, 232 / 255, 255 / 255),        // #f3e8ff

  // Google Cloud Console UX Semantic Tokens (Neutral, Anti-Bias)
  gcpBorder: rgb(218 / 255, 220 / 255, 224 / 255),      // #dadce0 (GCP Card Border)
  gcpPillBg: rgb(241 / 255, 243 / 255, 244 / 255),      // #f1f3f4 (GCP Chip Surface)
  gcpPillText: rgb(60 / 255, 64 / 255, 67 / 255),       // #3c4043 (GCP Chip Label)
  googleBlue: rgb(26 / 255, 115 / 255, 232 / 255),       // #1a73e8 (GCP Blue)
  googleBlueBg: rgb(232 / 255, 240 / 255, 254 / 255),   // #e8f0fe (GCP Blue Light Surface)
  googleBlueBorder: rgb(210 / 255, 227 / 255, 252 / 255),// #d2e3fc
  gcpGreen: rgb(19 / 255, 115 / 255, 51 / 255),         // #137333 (GCP Active Green)
  gcpGreenBg: rgb(230 / 255, 244 / 255, 234 / 255),     // #e6f4ea (GCP Active Green Bg)
  gcpGreenBorder: rgb(206 / 255, 234 / 255, 214 / 255),  // #ceead6
  gcpAmber: rgb(176 / 255, 96 / 255, 0 / 255),          // #b06000 (GCP Amber)
  gcpAmberBg: rgb(254 / 255, 247 / 255, 224 / 255),     // #fef7e0 (GCP Amber Bg)
  gcpAmberBorder: rgb(254 / 255, 239 / 255, 195 / 255), // #feefc3
  gcpRed: rgb(217 / 255, 48 / 255, 37 / 255),           // #d93025 (GCP Alert Red)
  gcpRedBg: rgb(252 / 255, 232 / 255, 230 / 255),       // #fce8e6 (GCP Alert Red Bg)
  gcpRedBorder: rgb(249 / 255, 171 / 255, 166 / 255)    // #f9aba6
};
