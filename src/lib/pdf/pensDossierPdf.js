/**
 * pensDossierPdf.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Editorial Luxury Clinical A4 Vector PDF for Atlas Health Services
 * Pre-filled Multi-Dose Peptide Pens (Golden Rule #67).
 *
 * Design architecture inspired by Swiss Private Longevity Clinic dosing guides:
 *  - Executive dark navy header band + elevated "100 clicks = 1 mL" conversion pill
 *  - Airy rounded clinical cards color-coded by therapeutic specialty
 *  - Hero 3-metric strip with 3px vertical specialty accent bars (DOSE | PEN DIAL | FREQUENCY)
 *  - Secondary 3-column metadata strip (CYCLE | YIELD/PEN | tinted PEN SPEC / PENS REQUIRED pill)
 *  - Supports 2 automatic modes:
 *      1) Personalized Protocol Guide (1-page executive PDF for physician-selected pens + SUPPLY SUMMARY)
 *      2) Full Clinical Formulary (all 19 formulas / 26 SKUs in clean non-splitting cards)
 *  - 100% Atlas Health Services branding (zero external supplier exposure)
 *  - WinAnsi/Latin-1 sanitizer (zero corrupted Greek glyphs) & opens in DocumentPreviewModal
 */
import jsPDF from 'jspdf';
import { previewOrSavePdf } from '@/lib/pdf/atlasPdfChrome';

export function formatAtlasPenSku(rawSku = '', itemNumber = '') {
  const cleaned = String(rawSku || '').trim();
  if (!cleaned) return `ATL-PEN-${String(itemNumber || '01').padStart(2, '0')}`;
  return cleaned.replace(/^DN-PEN-/i, 'ATL-PEN-').replace(/^DN-/i, 'ATL-');
}

export function sanitizePdfLatinText(text = '') {
  return String(text || '')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/κ/g, 'k')
    .replace(/μ/g, 'mc')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/×/g, 'x')
    .replace(/[–—]/g, '-')
    .replace(/™/g, 'TM')
    .replace(/•/g, '·')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Computes exact per-mL concentration label (e.g. "30 mg" / "3 mL" -> "10 mg/mL",
 * "6 mg / 9 mg" / "3 mL" -> "2 / 3 mg/mL", "5,000 IU" / "2 mL" -> "2,500 IU/mL").
 */
export function computePerMlRatio(concentration = '', volume = '3 mL') {
  const volMatch = String(volume || '3 mL').match(/(\d+(?:\.\d+)?)/);
  const volMl = volMatch ? parseFloat(volMatch[1]) : 3;
  if (!volMl || volMl <= 0) return String(concentration || '');

  const raw = String(concentration || '').replace(/,/g, '').trim();
  const unitMatch = raw.match(/\b(mg|mcg|iu)\b/i);
  const unit = unitMatch ? (unitMatch[1].toLowerCase() === 'iu' ? 'IU' : unitMatch[1].toLowerCase()) : 'mg';
  const nums = raw.match(/\d+(?:\.\d+)?/g);
  if (!nums || nums.length === 0) return `${concentration} / ${volume}`;

  const perMlParts = nums.map((nStr) => {
    const val = parseFloat(nStr) / volMl;
    const rounded = val >= 100 ? Math.round(val) : Number(val.toFixed(val % 1 === 0 ? 0 : 1));
    return rounded >= 1000 ? rounded.toLocaleString('en-US') : String(rounded);
  });

  return `${perMlParts.join(' / ')} ${unit}/mL`;
}

function hexToRgb(hex = '#1d4ed8') {
  const clean = String(hex).replace('#', '').trim();
  if (clean.length !== 6) return [29, 78, 216];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

const NAVY_DARK = [13, 31, 53];       // #0d1f35
const NAVY_INSET = [7, 19, 33];       // #071321
const NAVY_BORDER = [34, 59, 92];     // #223b5c
const ICE_TEXT = [147, 197, 253];     // #93c5fd
const SLATE_900 = [15, 23, 42];       // #0f172a
const SLATE_700 = [51, 65, 85];       // #334155
const SLATE_500 = [100, 116, 139];    // #64748b
const SLATE_400 = [148, 163, 184];    // #94a3b8
const BORDER_CARD = [218, 226, 236];  // #dae2ec
const HAIRLINE = [237, 242, 247];     // #edf2f7
const PILL_BG = [243, 246, 250];      // #f3f6fa
const WHITE = [255, 255, 255];

function drawEditorialHeader(doc, { isEs, isProtocolMode, isContinuation = false, selectedCategory = 'ALL' }) {
  const pageW = doc.internal.pageSize.getWidth();
  const headerH = isContinuation ? 18 : 34;

  // Full-bleed executive dark navy header
  doc.setFillColor(...NAVY_DARK);
  doc.rect(0, 0, pageW, headerH, 'F');

  // Subtle bottom accent border
  doc.setFillColor(30, 58, 95);
  doc.rect(0, headerH, pageW, 0.8, 'F');

  if (isContinuation) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...ICE_TEXT);
    doc.text('ATLAS HEALTH SERVICES', 14, 7.6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(...WHITE);
    doc.text(
      isEs ? 'GUIA DE PLUMAS DE PEPTIDOS · FORMULARIO CLINICO' : 'PEPTIDE PEN DOSING GUIDE · CLINICAL FORMULARY',
      14,
      13.6
    );

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.0);
    doc.setTextColor(...WHITE);
    doc.text(
      isEs ? 'DIAL U-100: 100 clics = 1 mL' : 'U-100 DIAL: 100 clicks = 1 mL',
      pageW - 14,
      11.2,
      { align: 'right' }
    );
    return headerH + 6.5;
  }

  // Main Cover / Page 1 Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(...ICE_TEXT);
  doc.text('ATLAS HEALTH SERVICES', 14, 10.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17.5);
  doc.setTextColor(...WHITE);
  doc.text(
    isEs ? 'GUIA DE PLUMAS DE PEPTIDOS' : 'PEPTIDE PEN DOSING GUIDE',
    14,
    19.8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.4);
  doc.setTextColor(186, 202, 222);
  const catNote = selectedCategory && selectedCategory !== 'ALL' ? ` · ${sanitizePdfLatinText(selectedCategory)}` : '';
  const subText = isProtocolMode
    ? (isEs
        ? 'Protocolo personalizado · dosis, clics del dial, frecuencia y suministro'
        : 'Personalized protocol · dose, pen dial clicks, frequency and supply')
    : (isEs
        ? `Formulario clinico oficial · dosis, clics del dial, frecuencia y rendimiento${catNote}`
        : `Clinical formulary · dose, pen dial clicks, frequency and yield${catNote}`);
  doc.text(subText, 14, 26.8);

  // Right-side Elevated Dark Inset Pill: U-100 Conversion
  const pillW = 55;
  const pillH = 16.5;
  const pillX = pageW - 14 - pillW;
  const pillY = 8.8;
  doc.setFillColor(...NAVY_INSET);
  doc.setDrawColor(...NAVY_BORDER);
  doc.setLineWidth(0.35);
  doc.roundedRect(pillX, pillY, pillW, pillH, 2.8, 2.8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.setTextColor(...SLATE_400);
  doc.text(isEs ? 'CONVERSION DIAL U-100' : 'U-100 PEN CONVERSION', pillX + 4.5, pillY + 5.6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.6);
  doc.setTextColor(...WHITE);
  doc.text(isEs ? '100 clics = 1 mL' : '100 clicks = 1 mL', pillX + 4.5, pillY + 12.2);

  return headerH + 8;
}

function drawEditorialFooterOnAllPages(doc, { isEs }) {
  const totalPages = doc.internal.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const footerH = 15.5;
  const footerY = pageH - footerH;

  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);

    // Full-bleed dark navy executive footer band
    doc.setFillColor(...NAVY_DARK);
    doc.rect(0, footerY, pageW, footerH, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.1);
    doc.setTextColor(148, 175, 208);
    const pillars = isEs
      ? 'PREVENTIVA  ·  PREDICTIVA  ·  PERSONALIZADA  ·  PRECISION  ·  LONGEVIDAD  ·  GRADO CLINICO'
      : 'PREVENTIVE  ·  PREDICTIVE  ·  PERSONALIZED  ·  PRECISION  ·  PERFORMANCE  ·  CLINICAL GRADE';
    doc.text(pillars, pageW / 2, footerY + 5.8, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.4);
    doc.setTextColor(...WHITE);
    doc.text(
      'Atlas Health Services  ·  atlashealth-services.com/pricing/pens',
      pageW / 2,
      footerY + 11.2,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(...SLATE_400);
    doc.text(`${i} / ${totalPages}`, pageW - 14, footerY + 11.2, { align: 'right' });
  }
}

/**
 * Generates the Editorial Luxury Visual Guide PDF (Protocol Mode OR Full Formulary Mode).
 *
 * @param {Object} opts
 * @param {Array}  opts.products          All (or filtered) pen catalog items
 * @param {Array}  opts.protocolItems     Optional selected protocol items: [{ product, variant, qty }]
 * @param {Object} opts.selectedVariants  Optional map of productId -> variantIndex for full formulary view
 * @param {string} opts.lang              'en' | 'es'
 * @param {string} opts.selectedCategory  Active category filter label
 */
export async function generateAtlasPensDossierPdf({
  products = [],
  protocolItems = [],
  selectedVariants = {},
  lang = 'en',
  selectedCategory = 'ALL',
} = {}) {
  const isEs = lang === 'es';
  const isProtocolMode = Array.isArray(protocolItems) && protocolItems.length > 0;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toISOString().slice(0, 10);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const cardW = pageW - marginX * 2; // 182 mm
  const bottomSafeY = pageH - 20;    // Leaves 4.5 mm breathing above 15.5 mm dark footer

  // Build normalized entries to render as visual cards
  const entries = isProtocolMode
    ? protocolItems.map((item, idx) => ({
        index: idx + 1,
        product: item.product,
        variant: item.variant || item.product.variants?.[0] || {},
        otherVariants: (item.product.variants || []).filter((v) => v.id !== (item.variant?.id || '')),
        qty: Math.max(1, Number(item.qty) || 1),
      }))
    : products.map((product, idx) => {
        const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [{}];
        const vIdx = Math.min(selectedVariants[product.id] ?? 0, variants.length - 1);
        const primary = variants[vIdx] || variants[0];
        const others = variants.filter((_, i) => i !== vIdx);
        return {
          index: idx + 1,
          product,
          variant: primary,
          otherVariants: others,
          qty: null,
        };
      });

  let curY = drawEditorialHeader(doc, { isEs, isProtocolMode, isContinuation: false, selectedCategory });

  const renderCard = (entry) => {
    const { index, product, variant, otherVariants, qty } = entry;
    const accentRgb = hexToRgb(product.categoryColor || '#1d4ed8');
    const atlasSku = formatAtlasPenSku(product.sku, index);
    const perMl = computePerMlRatio(variant.concentration, variant.volume);

    const clicksStr = variant.clicksRange
      ? `${variant.clicksRange} ${isEs ? 'clics' : 'clicks'}`
      : `${variant.clicksPerDose || 10} ${isEs ? 'clics' : 'clicks'}`;

    const doseText = sanitizePdfLatinText(variant.doseBreakdown || `${variant.clicksPerDose || 10} units`);
    const freqText = sanitizePdfLatinText(variant.frequency || 'Daily, Subcutaneous');
    const cycleText = sanitizePdfLatinText(variant.cycleDuration || '4 to 6 weeks');
    const yieldText = sanitizePdfLatinText(
      `${variant.dosesPerPenLabel || `${Math.floor((variant.totalUnits || 300) / (variant.clicksPerDose || 10))} doses`} · ${variant.volume || '3 mL'} (${variant.totalUnits || 300} IU)`
    );

    const rightPillTitle = isProtocolMode
      ? (isEs ? 'PLUMAS REQUERIDAS' : 'PENS REQUIRED')
      : (isEs ? 'PRESENTACION DEL PEN' : 'PEN SPECIFICATION');
    const rightPillValue = isProtocolMode
      ? sanitizePdfLatinText(`${qty} x ${variant.concentration} (${variant.volume || '3 mL'})`)
      : sanitizePdfLatinText(`${variant.concentration} · ${variant.volume || '3 mL'} Pen`);

    // Build concise footnote (extra variants + timing + cold-chain)
    const footnoteParts = [];
    if (otherVariants && otherVariants.length > 0) {
      const altList = otherVariants
        .map((ov) => {
          const ovClicks = ov.clicksRange || ov.clicksPerDose || 10;
          const ovRatio = computePerMlRatio(ov.concentration, ov.volume);
          return `${ov.concentration}/${ov.volume || '3 mL'} (${ovRatio}) @ ${ovClicks} ${isEs ? 'clics' : 'clicks'}`;
        })
        .join('  |  ');
      footnoteParts.push(
        sanitizePdfLatinText(
          `${isEs ? '*Otras potencias' : '*Other strengths'}: ${altList}.`
        )
      );
    }
    const mechanismSummary = sanitizePdfLatinText(product.description || '');
    if (mechanismSummary && isProtocolMode) {
      footnoteParts.push(mechanismSummary);
    } else if (product.timing) {
      footnoteParts.push(
        sanitizePdfLatinText(
          `${isEs ? 'Momento' : 'Timing'}: ${product.timing} · ${isEs ? 'Frio 2-8°C (BUD 30d)' : 'Store 2-8°C (30d BUD)'} · ${product.needle || '31G/32G 4mm'}.`
        )
      );
    }

    // Measure wrapped lines for accurate dynamic card height (zero overflow, zero page slicing)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.6);
    const doseLines = doc.splitTextToSize(doseText, 50).slice(0, 2);
    const dialLines = doc.splitTextToSize(sanitizePdfLatinText(clicksStr), 48).slice(0, 2);
    doc.setFontSize(9.0);
    const freqLines = doc.splitTextToSize(freqText, 52).slice(0, 2);

    const heroLinesCount = Math.max(doseLines.length, dialLines.length, freqLines.length);
    const heroRowH = heroLinesCount > 1 ? 15.5 : 12.2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    const footnoteWrapped = footnoteParts.length > 0
      ? doc.splitTextToSize(footnoteParts.join(' '), cardW - 14).slice(0, 2)
      : [];
    const footnoteH = footnoteWrapped.length > 0 ? (footnoteWrapped.length * 3.1 + 2.5) : 0;

    // Total card height
    const cardH = 14 + heroRowH + 14.5 + footnoteH + 4;

    // Page-break check BEFORE drawing card (guarantees zero mid-card splits!)
    if (curY + cardH > bottomSafeY) {
      doc.addPage();
      curY = drawEditorialHeader(doc, { isEs, isProtocolMode, isContinuation: true, selectedCategory });
    }

    // 1. Card Outer Shell
    doc.setFillColor(...WHITE);
    doc.setDrawColor(...BORDER_CARD);
    doc.setLineWidth(0.32);
    doc.roundedRect(marginX, curY, cardW, cardH, 3.2, 3.2, 'FD');

    // 2. Card Header Row: Numbered Colored Circle + Peptide Name + Right mg/mL
    const circleCx = marginX + 8.5;
    const circleCy = curY + 7.2;
    doc.setFillColor(...accentRgb);
    doc.circle(circleCx, circleCy, 3.7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.2);
    doc.setTextColor(...WHITE);
    doc.text(String(index), circleCx, circleCy + 1.1, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.2);
    doc.setTextColor(...SLATE_900);
    const cleanTitle = sanitizePdfLatinText(product.name);
    doc.text(cleanTitle, marginX + 15, curY + 7.2);

    // Subtle specialty + SKU sub-label next to/below title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.setTextColor(...SLATE_500);
    doc.text(
      sanitizePdfLatinText(`${product.category || 'Clinical Peptide'}  ·  ${atlasSku}`),
      marginX + 15,
      curY + 10.9
    );

    // Right-aligned mg/mL concentration badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.setTextColor(...SLATE_700);
    doc.text(sanitizePdfLatinText(perMl), marginX + cardW - 6.5, curY + 8.0, { align: 'right' });

    // Hairline divider under header
    const divY = curY + 13.0;
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.28);
    doc.line(marginX + 6, divY, marginX + cardW - 6, divY);

    // 3. Hero 3-Metric Row with 1.2 mm Colored Vertical Accent Bars (LXV Signature!)
    const heroY = divY + 3.2;
    const barH = heroRowH - 2.2;
    const col1X = marginX + 6.5;
    const col2X = marginX + 67.5;
    const col3X = marginX + 124.5;

    // Metric 1: DOSE
    doc.setFillColor(...accentRgb);
    doc.roundedRect(col1X, heroY, 1.25, barH, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(...SLATE_500);
    doc.text(isEs ? 'DOSIS ACTIVA' : 'DOSE', col1X + 3.5, heroY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.4);
    doc.setTextColor(...SLATE_900);
    doseLines.forEach((ln, li) => doc.text(ln, col1X + 3.5, heroY + 7.4 + li * 4.0));

    // Metric 2: PEN DIAL (U-100)
    doc.setFillColor(...accentRgb);
    doc.roundedRect(col2X, heroY, 1.25, barH, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(...SLATE_500);
    doc.text(isEs ? 'DIAL PEN (U-100)' : 'U-100 PEN DIAL', col2X + 3.5, heroY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.0);
    doc.setTextColor(...SLATE_900);
    dialLines.forEach((ln, li) => doc.text(ln, col2X + 3.5, heroY + 7.4 + li * 4.0));

    // Metric 3: FREQUENCY
    doc.setFillColor(...accentRgb);
    doc.roundedRect(col3X, heroY, 1.25, barH, 0.5, 0.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.1);
    doc.setTextColor(...SLATE_500);
    doc.text(isEs ? 'FRECUENCIA' : 'FREQUENCY', col3X + 3.5, heroY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(...SLATE_900);
    freqLines.forEach((ln, li) => doc.text(ln, col3X + 3.5, heroY + 7.4 + li * 3.8));

    // 4. Secondary 3-Column Row: CYCLE DURATION | YIELD / PEN | TINTED PEN SPEC PILL
    const secY = heroY + heroRowH + 1.6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.0);
    doc.setTextColor(...SLATE_500);
    doc.text(isEs ? 'DURACION DEL CICLO' : 'CYCLE DURATION', col1X, secY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(...SLATE_900);
    doc.text(cycleText.slice(0, 32), col1X, secY + 7.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.0);
    doc.setTextColor(...SLATE_500);
    doc.text(isEs ? 'RENDIMIENTO / PEN' : 'YIELD / PEN', col2X, secY + 2.8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.1);
    doc.setTextColor(...SLATE_900);
    const yieldClipped = doc.splitTextToSize(yieldText, 53)[0] || yieldText;
    doc.text(yieldClipped, col2X, secY + 7.3);

    // Tinted Right-Hand Highlight Pill (exact LXV signature)
    const specPillX = col3X;
    const specPillW = marginX + cardW - 6.5 - specPillX;
    const specPillH = 10.6;
    doc.setFillColor(...PILL_BG);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.25);
    doc.roundedRect(specPillX, secY - 0.6, specPillW, specPillH, 2.2, 2.2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(...SLATE_500);
    doc.text(rightPillTitle, specPillX + 3.5, secY + 3.0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(...accentRgb);
    const rightValClipped = doc.splitTextToSize(rightPillValue, specPillW - 7)[0] || rightPillValue;
    doc.text(rightValClipped, specPillX + 3.5, secY + 7.6);

    // 5. Clinical Footnote
    if (footnoteWrapped.length > 0) {
      const footY = secY + 12.2;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...SLATE_500);
      footnoteWrapped.forEach((ln, li) => {
        doc.text(ln, col1X, footY + li * 3.1);
      });
    }

    curY += cardH + (isProtocolMode ? 5.5 : 4.2);
  };

  // Render all cards
  entries.forEach(renderCard);

  // ── SUPPLY SUMMARY / CLINICAL CALIBRATION BOX AT BOTTOM (Exact LXV Signature) ──
  const summaryBoxH = isProtocolMode ? 20 : 22;
  if (curY + summaryBoxH + 8 > bottomSafeY) {
    doc.addPage();
    curY = drawEditorialHeader(doc, { isEs, isProtocolMode, isContinuation: true, selectedCategory });
  }

  doc.setFillColor(...PILL_BG);
  doc.setDrawColor(...BORDER_CARD);
  doc.setLineWidth(0.32);
  doc.roundedRect(marginX, curY + 1, cardW, summaryBoxH, 3.0, 3.0, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(...SLATE_700);
  doc.text(
    isProtocolMode
      ? (isEs ? 'RESUMEN DE SUMINISTRO (SUPPLY SUMMARY)' : 'SUPPLY SUMMARY')
      : (isEs ? 'ESTANDAR CLINICO Y GUIA DEL PACIENTE' : 'CLINICAL ADMINISTRATION & PATIENT GUIDE SUMMARY'),
    marginX + 6,
    curY + 6.6
  );

  if (isProtocolMode) {
    // Horizontal color-coded pen count items (GHK-Cu 1 pen · MOTS-c 2 pens...)
    const maxPerRow = Math.min(4, entries.length);
    const slotW = (cardW - 12) / Math.max(1, maxPerRow);
    entries.slice(0, 4).forEach((e, idx) => {
      const rgb = hexToRgb(e.product.categoryColor || '#1d4ed8');
      const sx = marginX + 6 + idx * slotW;
      const shortName = sanitizePdfLatinText(e.product.name.split('(')[0].trim()).slice(0, 18);
      const penWord = e.qty === 1 ? 'pen' : 'pens';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.8);
      doc.setTextColor(...rgb);
      doc.text(`${shortName}  `, sx, curY + 14.0);
      const nameW = doc.getTextWidth(`${shortName}  `);
      doc.setFont('helvetica', 'normal');
      doc.text(`${e.qty} ${penWord}`, sx + nameW, curY + 14.0);
    });
  } else {
    const totalVariants = products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.setTextColor(...SLATE_700);
    const lines = isEs
      ? [
          `• Portafolio: ${products.length} plumas formuladas (${totalVariants} concentraciones) · Pureza analitica >= 99.2% HPLC con COA.`,
          '• Estandar SubQ: Aguja esteril nueva 31G/32G x 4 mm en cada uso · Refrigerar 2-8°C (BUD 30 dias tras apertura).',
          '• Guia Interactiva para Pacientes: atlashealth-services.com/calculator?format=pen',
        ]
      : [
          `• Formulary: ${products.length} formulated pens (${totalVariants} strengths) · >= 99.2% HPLC certified purity with COA.`,
          '• Injection & Cold-Chain: Fresh sterile 31G/32G x 4 mm needle per dose · Refrigerate 2-8°C (30-day BUD once pierced).',
          '• Interactive Patient Guide: atlashealth-services.com/calculator?format=pen',
        ];
    lines.forEach((ln, i) => {
      doc.text(sanitizePdfLatinText(ln), marginX + 6, curY + 11.4 + i * 3.8);
    });
  }

  // Verification disclaimer centered below summary box
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.9);
  doc.setTextColor(...SLATE_500);
  doc.text(
    isEs
      ? 'Verificar siempre la concentracion dispensada y la calibracion U-100 del dial antes de administrar.'
      : 'Verify the dispensed concentration and U-100 pen dial calibration before administration.',
    pageW / 2,
    curY + summaryBoxH + 5.8,
    { align: 'center' }
  );

  // Stamp luxury dark footer band on every page
  drawEditorialFooterOnAllPages(doc, { isEs });

  const filename = isProtocolMode
    ? (isEs
        ? `Atlas_Health_Guia_Protocolo_Pens_${today}.pdf`
        : `Atlas_Health_Peptide_Pen_Protocol_Guide_${today}.pdf`)
    : (isEs
        ? `Atlas_Health_Guia_Clinica_Plumas_Peptidos_${today}.pdf`
        : `Atlas_Health_Peptide_Pen_Dosing_Guide_${today}.pdf`);

  return previewOrSavePdf(doc, filename, {
    title: isProtocolMode
      ? (isEs
          ? 'Atlas Health Services — Guía Personalizada de Plumas (PDF)'
          : 'Atlas Health Services — Personalized Peptide Pen Dosing Guide')
      : (isEs
          ? 'Atlas Health Services — Guía Clínica Visual de Plumas Precargadas'
          : 'Atlas Health Services — Peptide Pen Dosing Guide (Clinical Formulary)'),
    subtitle: isProtocolMode
      ? `${entries.length} ${isEs ? 'plumas en protocolo' : 'pens in protocol'} · 100 clicks = 1 mL`
      : `${products.length} ${isEs ? 'fórmulas' : 'formulas'} · REF DOC-ATL-PENS-2026`,
  });
}
