'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCustomsDate, getCustomsFriendlyDefault } from '@/utils/labels/customsNaming';

/**
 * Wraps text into lines with a maximum character limit.
 */
function wrapLines(text, maxChars = 60) {
  if (!text) return [];
  // Ensure quantities and units (e.g. "100 mL", "30 g", "90 Capsules", "4 %") are never split across lines
  const boundText = String(text).trim().replace(/(\d+(?:\.\d+)?)\s+([a-zA-Z%]+)\b/g, '$1\u00A0$2');
  const words = boundText.split(/[ \t\r\n]+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxChars) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Wraps directions for use text, accounting for the "Directions for use: " prefix on line 1.
 */
function wrapDirections(text, firstLineMaxChars = 44, otherLinesMaxChars = 56) {
  if (!text) return [];
  const clean = String(text)
    .replace(/^\[[^\]]+\]:\s*/i, '')
    .replace(/^(?:(?:directions\s*(?:for\s*use)?|indicaciones(?:\s*de\s*uso)?|posolog[íi]a|instrucciones|instructions):\s*)+/i, '')
    .trim();
  const words = clean.split(/\s+/);
  const lines = [];
  let current = '';
  let isFirst = true;

  for (const word of words) {
    const limit = isFirst ? firstLineMaxChars : otherLinesMaxChars;
    if ((current + ' ' + word).trim().length <= limit) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) {
        lines.push(current);
        isFirst = false;
      }
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Computes the default clinical header badge text (e.g. "PART 1 OF 2 · 🌙 NIGHT / BEDTIME" or "PART 2 OF 2 · 1-2×/WK · PRE-WASH").
 */
export function computeDefaultHeaderBadge(rawLabelData = {}, fallbackPartIndex = 0, fallbackTotalParts = 1) {
  const labelData = rawLabelData || {};
  const effectiveTotalParts = labelData.totalParts || fallbackTotalParts || 1;
  const effectivePartIdx = labelData.partIndex ?? labelData.phaseIndex ?? fallbackPartIndex ?? 0;
  const rawPart = labelData.partLabel || labelData.partTag || (effectiveTotalParts > 1 ? `Part ${Number(effectivePartIdx) + 1} of ${effectiveTotalParts}` : '');
  let partBadge = '';
  if (rawPart) {
    const match = String(rawPart).match(/part\s*(\d+)(?:\s*(?:\/|of)\s*(\d+))?/i);
    if (match) {
      const pNum = match[1];
      const pTot = match[2] || String(effectiveTotalParts || 2);
      partBadge = `PART ${pNum} OF ${pTot}`;
    } else {
      partBadge = String(rawPart).toUpperCase().trim();
    }
  }

  const corpus = `${labelData.timeOfDay || ''} ${labelData.productTitle || ''} ${labelData.productName || ''} ${labelData.subTitle || ''} ${labelData.directions || ''} ${labelData.instructions || ''} ${labelData.partLabel || ''} ${labelData.formula || ''}`.toLowerCase();
  const isMorning = /\b(morning|breakfast|mañana|desayuno|matutina|am\b)/i.test(corpus);
  const isBedtime = /\b(bedtime|before bed|night|sleep|sueño|dormir|nocturna)\b/i.test(corpus);
  const isEvening = /\b(evening|dinner|afternoon|lunch.*dinner|vespertina|tarde|cena|pm\b)/i.test(corpus);
  const isPreWash = /\b(pre-wash|before washing|antes de lavar)\b/i.test(corpus);
  const isWeekly = /\b(1-2\s*times\s*\/\s*week|1-2\s*times\s+per\s+week|times\s*\/\s*week|times\s+per\s+week|weekly|semanal)\b/i.test(corpus);

  let timeOfDay = '';
  if (isMorning && !isBedtime && !isEvening) timeOfDay = 'MORNING';
  else if (isBedtime) timeOfDay = 'NIGHT / BEDTIME';
  else if (isEvening) timeOfDay = 'EVENING';
  else if (isPreWash && isWeekly) timeOfDay = '1-2×/WK · PRE-WASH';
  else if (isPreWash) timeOfDay = 'PRE-WASH';
  else if (isWeekly) timeOfDay = '1-2× / WEEK';
  else if (/\b(daily|once daily|diaria)\b/i.test(corpus)) timeOfDay = 'ONCE DAILY';

  const timeIcon = timeOfDay === 'MORNING'
    ? '☀️ '
    : (timeOfDay.includes('NIGHT') || timeOfDay.includes('BEDTIME')
      ? '🌙 '
      : (timeOfDay === 'EVENING' ? '🌅 ' : ''));

  if (partBadge && timeOfDay) return `${partBadge} · ${timeIcon}${timeOfDay}`;
  if (partBadge) return partBadge;
  if (timeOfDay) return `${timeIcon}${timeOfDay}`;
  return '';
}

function VectorGlyph({ type, size = 16, fill = '#ffffff' }) {
  if (type === 'sun') {
    return (
      <g transform={`scale(${size / 24})`}>
        <circle cx="12" cy="12" r="5" fill={fill} />
        <path d="M12 1v3m0 16v3M4.22 4.22l2.12 2.12m11.32 11.32l2.12 2.12M1 12h3m16 0h3M4.22 19.78l2.12-2.12m11.32-11.32l2.12-2.12" stroke={fill} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    );
  }
  if (type === 'moon') {
    return (
      <g transform={`scale(${size / 24})`}>
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill={fill} />
      </g>
    );
  }
  if (type === 'capsule') {
    return (
      <g transform={`scale(${size / 24})`}>
        <rect x="5" y="4" width="14" height="16" rx="7" fill="none" stroke={fill} strokeWidth="2.5" />
        <line x1="5" y1="12" x2="19" y2="12" stroke={fill} strokeWidth="2" />
        <path d="M5 11h14V9a5 5 0 0 0-5-5H10a5 5 0 0 0-5 5v2z" fill={fill} />
      </g>
    );
  }
  if (type === 'dropper') {
    return (
      <g transform={`scale(${size / 24})`}>
        <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z" fill="none" stroke={fill} strokeWidth="2" />
        <path d="m5 2 5 5" stroke={fill} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="19" r="2" fill={fill} />
      </g>
    );
  }
  return null;
}

/**
 * Renders an active ingredient line with tabular dot-leader dosage formatting.
 * The molecule name is rendered on the left, the dosage/strength is pinned strictly
 * to the right edge with text-anchor="end", and a dotted connecting line prevents eye-slip.
 */
function renderIngredientLine(line, x, y, fontSize, key, defaultFill = '#0f172a', isMono = true, lineWidth = 0) {
  const cleanLine = String(line).replace(/^[•*-]\s*/, '').trim();
  const match = cleanLine.match(/^(.*?\s+)([\d.,]+[\s\u00A0]*(?:mcg|mg|g|%|iu|fu|spu|ml|capsules?|drops?)(?:[\s\u00A0]*\/[\s\u00A0]*(?:ml|g|cap|dose))?(?:[\s\u00A0]*(?:topical|oral))?(?:[\s\u00A0]*\([^)]+\))?)\s*$/i);

  if (match && lineWidth > 220) {
    const namePart = match[1].trim();
    const dosePart = match[2].trim();
    const estNameW = Math.round(namePart.length * (fontSize * 0.58) + 24);
    const estDoseW = Math.round(dosePart.length * (fontSize * 0.62) + 12);
    const dotStartX = x + estNameW + 8;
    const dotEndX = x + lineWidth - estDoseW - 8;

    return (
      <g key={key}>
        <text x={x} y={y} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={fontSize} textRendering="geometricPrecision">
          <tspan fill={isMono ? '#000000' : '#0284c7'} fontWeight="900">• </tspan>
          <tspan fontWeight="700" fill={isMono ? '#000000' : '#1e293b'}>{namePart}</tspan>
        </text>
        {dotEndX > dotStartX + 24 ? (
          <line
            x1={dotStartX}
            y1={y - Math.round(fontSize * 0.28)}
            x2={dotEndX}
            y2={y - Math.round(fontSize * 0.28)}
            stroke={isMono ? '#888888' : '#cbd5e1'}
            strokeWidth="1.4"
            strokeDasharray="2,6"
          />
        ) : null}
        <text
          x={x + lineWidth}
          y={y}
          textAnchor="end"
          fontFamily="Arial, Helvetica, -apple-system, sans-serif"
          fontSize={fontSize}
          fontWeight="900"
          fill={isMono ? '#000000' : '#0284c7'}
          textRendering="geometricPrecision"
        >
          {dosePart}
        </text>
      </g>
    );
  }

  if (match) {
    const namePart = match[1];
    const dosePart = match[2];
    return (
      <text key={key} x={x} y={y} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={fontSize} textRendering="geometricPrecision">
        <tspan fontWeight="700" fill={isMono ? '#000000' : '#1e293b'}>{namePart}</tspan>
        <tspan fontWeight="900" fill={isMono ? '#000000' : '#0284c7'}>{dosePart}</tspan>
      </text>
    );
  }

  return (
    <text key={key} x={x} y={y} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={fontSize} fontWeight="800" fill={isMono ? '#000000' : defaultFill} textRendering="geometricPrecision">
      {line}
    </text>
  );
}

/**
 * PharmapolisLabelSvg
 * ─────────────────────────────────────────────────────────────────────────────
 * High-precision vector SVG pharmaceutical & dispensary label generator.
 * Supports Delivery (Clinical EU GMP) and Shipping (Simple Pharmacy Bottle) modes.
 * Standard 7.5 cm × 4.5 cm (75 mm × 45 mm) base = 1500 × 900 px canvas.
 * Compliant with EU GMP, EMA, and USP <17> / USP <795> compounding font standards:
 *  - Prominent Patient Name (≥ 10 pt print equivalent)
 *  - High-Contrast Active Ingredients & Strength (≥ 10 pt print equivalent)
 *  - Legible Directions for Use (≥ 9.5 pt print equivalent)
 *  - High-Resolution QR Codes with Direct Patient Monograph Binding
 *  - Professional Crop Marks & Scissor Cut Lines (✂) for effortless physical cutting
 */
export default function PharmapolisLabelSvg({
  labelData: rawLabelData = {},
  variant = 'backQr', // 'backQr' | 'front' | 'frontWithQr'
  widthMm = 75,
  heightMm = 45,
  showCutGuides = false,
  colorMode = 'monochrome', // 'monochrome' (pure black / grayscale high-contrast for thermal & laser printing) | 'color' (preview)
  svgRef = null,
  boldPosology = true
}) {
  const labelData = rawLabelData || {};
  const isMono = colorMode === 'monochrome';
  const isBoldPosology = (labelData.boldPosology !== undefined) ? Boolean(labelData.boldPosology) : Boolean(boldPosology);
  const posFontWeight = isBoldPosology ? '800' : '500';
  const posCharWidthFactor = isBoldPosology ? 0.50 : 0.45;
  const posLineGapFactor = isBoldPosology ? 1.40 : 1.30;

  // Base coordinates: 1500 px base width, dynamic responsive height
  const WIDTH = 1500;
  const HEIGHT = Math.round((heightMm / widthMm) * 1500) || 900;

  // Responsive height tiers
  const isShort = HEIGHT < 720; // e.g. 90x38 mm (633 px)
  const isMediumHeight = HEIGHT >= 720 && HEIGHT < 850; // e.g. 100x50 mm (750 px)

  // Pin footer elements dynamically to bottom of canvas (with 4-5 mm safety bleed clearance)
  const footerLineY = HEIGHT - (isShort ? 50 : isMediumHeight ? 56 : 64);
  const footerTextY = HEIGHT - (isShort ? 20 : isMediumHeight ? 23 : 26);
  const footerFontSize = isShort ? 18 : isMediumHeight ? 21 : 23; // Boosted technical print size
  const footerLineGap = 0; // single-line compact footer, zero vertical waste

  // Header & Patient Box coordinates (Pharmacy title intentionally subdued so Patient & Formula lead hierarchy)
  const headerY = isShort ? 24 : 28;
  const headerTitleSize = isShort ? 32 : 36;
  const headerSubSize = isShort ? 17 : 19;

  const patientBoxY = isShort ? 114 : 130;
  const patientBoxHeight = isShort ? 64 : 74;
  const patientBoxBottom = patientBoxY + patientBoxHeight;
  // Extraction of clinical parameters with defensive fallbacks (never prefix with "PATIENT:")
  const patientName = String(labelData.patientName || labelData.patient?.name || 'PATIENT RECORD')
    .replace(/^patient:\s*/i, '')
    .trim()
    .toUpperCase();
  const patientLabelFontSize = isShort ? 28 : 32;
  const nameLen = patientName.length;
  // Patient name font: large and crisp with graceful scaling for long names
  const patientNameFontSize = isShort
    ? (nameLen > 36 ? 26 : nameLen > 28 ? 30 : 34)
    : (nameLen > 36 ? 30 : nameLen > 28 ? 34 : 38);
  const patientFontSize = patientLabelFontSize;
  const patientTextY = isShort ? 42 : 48;
  const fileNumber = labelData.fileNumber || labelData.fileNo || labelData.rxCode || labelData.id || '51857';

  // Rule #71: Never display redundant "PART X OF Y" badges on patient labels
  const rawPart = labelData.partLabel || labelData.partTag || '';
  let partBadge = '';
  if (rawPart) {
    const cleanedPart = String(rawPart)
      .replace(/part\s*\d+(?:\s*(?:\/|of)\s*\d+)?\s*(?:·|-|\|)?\s*/gi, '')
      .trim();
    if (cleanedPart) {
      partBadge = cleanedPart.toUpperCase();
    }
  }

  // Detect clinical Time of Day / Regimen Timing (Morning, Evening, Night / Bedtime, Pre-Wash / Weekly)
  const timeOfDay = React.useMemo(() => {
    const corpus = `${labelData.timeOfDay || ''} ${labelData.productTitle || ''} ${labelData.productName || ''} ${labelData.subTitle || ''} ${labelData.directions || ''} ${labelData.instructions || ''} ${labelData.partLabel || ''} ${labelData.formula || ''}`.toLowerCase();

    const isMorning = /\b(morning|breakfast|mañana|desayuno|matutina|am\b)/i.test(corpus);
    const isBedtime = /\b(bedtime|before bed|night|sleep|sueño|dormir|nocturna)\b/i.test(corpus);
    const isEvening = /\b(evening|dinner|afternoon|lunch.*dinner|vespertina|tarde|cena|pm\b)/i.test(corpus);
    const isPreWash = /\b(pre-wash|before washing|antes de lavar)\b/i.test(corpus);
    const isWeekly = /\b(1-2\s*times\s*\/\s*week|1-2\s*times\s+per\s+week|times\s*\/\s*week|times\s+per\s+week|weekly|semanal)\b/i.test(corpus);

    if (isMorning && !isBedtime && !isEvening) return 'MORNING';
    if (isBedtime) return 'NIGHT / BEDTIME';
    if (isEvening) return 'EVENING';
    if (isPreWash && isWeekly) return '1-2×/WK · PRE-WASH';
    if (isPreWash) return 'PRE-WASH';
    if (isWeekly) return '1-2× / WEEK';
    if (/\b(daily|once daily|diaria)\b/i.test(corpus)) return 'ONCE DAILY';
    return '';
  }, [labelData]);

  // Unified Header Badge: Supports show/hide toggle (`showHeaderBadge`) and custom text override (`customHeaderBadge`)
  const autoHeaderBadgeText = React.useMemo(() => {
    const timeIcon = isMono
      ? ''
      : (timeOfDay === 'MORNING'
        ? '☀️ '
        : (timeOfDay.includes('NIGHT') || timeOfDay.includes('BEDTIME')
          ? '🌙 '
          : (timeOfDay === 'EVENING' ? '🌅 ' : '')));
    if (partBadge && timeOfDay) {
      return `${partBadge} · ${timeIcon}${timeOfDay}`;
    }
    if (partBadge) return partBadge;
    if (timeOfDay) return `${timeIcon}${timeOfDay}`;
    return '';
  }, [isMono, partBadge, timeOfDay]);

  const headerBadgeText = React.useMemo(() => {
    if (labelData.showHeaderBadge === false) return '';
    const raw = typeof labelData.customHeaderBadge === 'string'
      ? labelData.customHeaderBadge
          .replace(/part\s*\d+(?:\s*(?:\/|of)\s*\d+)?\s*(?:·|-|\|)?\s*/gi, '')
          .trim()
      : autoHeaderBadgeText;
    if (isMono && raw) {
      return raw.replace(/(?:☀️|🌙|🌅)/g, '').replace(/\s*·\s*·\s*/g, ' · ').trim();
    }
    return raw;
  }, [labelData.showHeaderBadge, labelData.customHeaderBadge, autoHeaderBadgeText, isMono]);

  // Clinical Color Theme for Time of Day & Part indicator
  const badgeTheme = React.useMemo(() => {
    const effectiveUpper = (headerBadgeText || timeOfDay || '').toUpperCase();
    let glyph = null;
    if (effectiveUpper.includes('MORNING') || effectiveUpper.includes('MAÑANA') || effectiveUpper.includes('AM')) {
      glyph = 'sun';
    } else if (effectiveUpper.includes('NIGHT') || effectiveUpper.includes('BEDTIME') || effectiveUpper.includes('NOCHE') || effectiveUpper.includes('SLEEP')) {
      glyph = 'moon';
    } else if (effectiveUpper.includes('PRE-WASH') || effectiveUpper.includes('SCALP') || effectiveUpper.includes('TOPICAL') || effectiveUpper.includes('DROPS')) {
      glyph = 'dropper';
    } else if (effectiveUpper.includes('CAPSULE') || effectiveUpper.includes('ORAL') || effectiveUpper.includes('DAILY')) {
      glyph = 'capsule';
    }

    if (isMono) {
      return { fill: '#000000', text: '#ffffff', border: '#000000', accent: '#000000', glyph };
    }
    if (glyph === 'sun') {
      return { fill: '#b45309', text: '#ffffff', border: '#d97706', accent: '#f59e0b', glyph }; // Warm amber gold
    }
    if (glyph === 'moon') {
      return { fill: '#1e1b4b', text: '#ffffff', border: '#312e81', accent: '#6366f1', glyph }; // Midnight indigo
    }
    if (glyph === 'dropper') {
      return { fill: '#0f766e', text: '#ffffff', border: '#14b8a6', accent: '#2dd4bf', glyph }; // Evening teal
    }
    return { fill: '#003666', text: '#ffffff', border: '#0284c7', accent: '#38bdf8', glyph }; // Clinical dispensary navy
  }, [isMono, headerBadgeText, timeOfDay]);

  // Header badge sizing and right-aligned position (guaranteed zero overlap with patientName)
  const badgeCharCount = headerBadgeText.length;
  const badgeFontSize = isShort ? (badgeCharCount > 24 ? 13 : 15) : (badgeCharCount > 24 ? 15 : 17);
  const hasGlyph = Boolean(badgeTheme.glyph);
  const badgeWidth = Math.max(120, Math.round(badgeCharCount * (badgeFontSize * 0.64) + (hasGlyph ? 56 : 36)));
  const badgeX = 1380 - badgeWidth - 16;
  const badgeHeight = isShort ? 38 : 44;
  const badgeY = isShort ? 13 : 15;

  // Dynamic zero-collision scaling for <Patient Name> against right-aligned header badge
  const patientMaxPx = headerBadgeText ? Math.max(360, badgeX - 44) : 1332;
  const estPatientLabelPx = 0;
  const estPatientNamePx = nameLen * (patientNameFontSize * 0.68);
  const estTotalPatientPx = estPatientLabelPx + estPatientNamePx;
  const patientScaleRatio = estTotalPatientPx > patientMaxPx ? (patientMaxPx / estTotalPatientPx) : 1;
  const resolvedPatientLabelFontSize = Math.max(18, Math.floor(patientLabelFontSize * patientScaleRatio));
  const resolvedPatientNameFontSize = Math.max(19, Math.floor(patientNameFontSize * patientScaleRatio));

  const productTitle = labelData.productTitle || labelData.productName || 'Compounded Pharmaceutical Protocol';
  const formula = labelData.formula || '';
  const rawDirections = labelData.directions || labelData.instructions || 'Take / apply as directed by prescribing physician.';
  const directions = React.useMemo(() => {
    let d = String(rawDirections).trim();
    // Normalize and remove redundant prefixes like "[Anti-hair loss]: " or "Directions for use: "
    d = d.replace(/^\[[^\]]+\]:\s*/i, '').trim();
    d = d.replace(/^(?:(?:directions\s*(?:for\s*use)?|indicaciones(?:\s*de\s*uso)?|posolog[íi]a|instrucciones|instructions):\s*)+/i, '').trim();
    // Normalize and remove redundant trailing "as prescribed"
    d = d.replace(/[,.]?\s*as\s+prescribed\.?$/i, '').trim();
    if (d && !d.endsWith('.')) d += '.';
    return d || 'Take / apply as directed by prescribing physician.';
  }, [rawDirections]);
  const warnings = labelData.warnings || labelData.warning || 'For external / patient use only. Keep out of reach of children.';
  const formatLabelDate = (val, fallback = '15-09-2026') => {
    if (!val) return fallback;
    if (typeof val === 'object' && (val._seconds != null || val.seconds != null)) {
      const s = val._seconds ?? val.seconds;
      const dt = new Date(s * 1000);
      return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`;
    }
    const str = String(val).trim();
    if (str.includes('T') || (str.includes('-') && str.length > 10)) {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
    }
    return str.replace(/T.*$/, '');
  };

  const prodDate = formatLabelDate(labelData.prodDate || labelData.mfgDate, '05-10-2026');
  const expDate = formatLabelDate(labelData.expDate, '04-10-2027');
  const storage = labelData.storage || 'Store at room temperature';
  const doctorName = labelData.doctorName !== undefined && labelData.doctorName !== null ? String(labelData.doctorName).trim() : (labelData.physician || '');
  const rawClinicName = labelData.clinicName !== undefined && labelData.clinicName !== null ? String(labelData.clinicName).trim() : (labelData.clinic || '');
  // By default, do NOT show clinic name on the printed label (only doctorName + license).
  // It is only rendered if explicitly enabled via showClinicOnLabel === true.
  const clinicName = (labelData.showClinicOnLabel === true && rawClinicName && !/^licensed\s+clinical\s+practice$/i.test(rawClinicName) && !/^centro\s+m[eé]dico\s+prescriptor$/i.test(rawClinicName))
    ? rawClinicName
    : '';
  const doctorLicense = labelData.doctorLicense !== undefined && labelData.doctorLicense !== null ? String(labelData.doctorLicense).trim() : (labelData.license || '');
  const batchCode = labelData.batchCode || 'PHARM-2026-B948';
  const lote = labelData.lote || '2609-PLV';
  const volume = labelData.volume || labelData.netVolume || labelData.size || labelData.netContent || labelData.totalVolume || labelData.quantity || '100 mL';

  // Dynamic Dispensing Pharmacy Name & Address
  let rawPharmacyName = (labelData.pharmacyName || labelData.pharmacy || labelData.dispensingPharmacy || 'Pharmapolis Compounding Pharmacy').trim();
  if (/^pharmapolis(\s*compounding\s*pharmacy|\s*lab)?$/i.test(rawPharmacyName) || rawPharmacyName.toUpperCase() === 'PHARMAPOLIS' || rawPharmacyName.toUpperCase() === 'PHARMAPOLISLAB') {
    rawPharmacyName = 'Pharmapolis Compounding Pharmacy';
  }
  const pharmacyName = rawPharmacyName.toUpperCase();
  const pharmacyAddress = labelData.pharmacyAddress || labelData.dispensaryAddress || '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria';
  const dynHeaderTitleSize = pharmacyName.length > 26
    ? Math.round(headerTitleSize * 0.72)
    : pharmacyName.length > 18
      ? Math.round(headerTitleSize * 0.84)
      : headerTitleSize;

  // Unique QR URL strictly bound to this prescription (pointing to public patient refill view)
  const targetRxUrl = React.useMemo(() => {
    if (labelData.targetRxUrl) return labelData.targetRxUrl;
    if (labelData.url) return labelData.url;
    const base = `https://www.atlashealth-services.com/rx/${fileNumber}?view=patient`;
    const pIdx = labelData.partIndex ?? labelData.phaseIndex;
    if (pIdx !== undefined && pIdx !== null && labelData.totalParts > 1) {
      return `${base}&part=${Number(pIdx) + 1}&action=refill`;
    }
    return `${base}&action=refill`;
  }, [labelData.targetRxUrl, labelData.url, fileNumber, labelData.partIndex, labelData.phaseIndex, labelData.totalParts]);
  const cleanDisplayUrl = targetRxUrl.replace(/^https?:\/\//, '');

  // Secondary QR URL pointing to Clinical Product Monograph / Patient Guide
  const productUrl = React.useMemo(() => {
    if (labelData.qrProductUrl) return labelData.qrProductUrl;
    if (labelData.productUrl) return labelData.productUrl;
    if (labelData.productSlug) return `https://www.atlashealth-services.com/product/${encodeURIComponent(labelData.productSlug)}`;
    return null;
  }, [labelData.qrProductUrl, labelData.productUrl, labelData.productSlug]);

  // Extract active ingredients list for Block 2 (Back Label)
  const activeIngredientsList = React.useMemo(() => {
    const rawApisSource =
      (Array.isArray(labelData.apis) && labelData.apis.length > 0 ? labelData.apis : null) ||
      (Array.isArray(labelData.items) && labelData.items.length > 0 ? labelData.items : null) ||
      (Array.isArray(labelData.activeIngredients) && labelData.activeIngredients.length > 0 ? labelData.activeIngredients : null) ||
      (Array.isArray(labelData.activeIngredientsList) && labelData.activeIngredientsList.length > 0 ? labelData.activeIngredientsList : null);

    if (rawApisSource && rawApisSource.length > 0) {
      const filtered = rawApisSource.filter(a => {
        if (!a) return false;
        if (typeof a === 'string') {
          const sLower = a.trim().toLowerCase();
          return (
            Boolean(sLower) &&
            sLower !== 'api' &&
            sLower !== 'active api' &&
            sLower !== 'active compounded formulation' &&
            sLower !== 'personalized compounded active formula' &&
            !sLower.includes('trichosol') &&
            !sLower.includes('trichooil') &&
            !sLower.includes('pentravan') &&
            !sLower.includes('vehicle')
          );
        }
        const n = (a.drugName || a.drug || a.name || a.productName || a.activeIngredient || '').toLowerCase().trim();
        const f = (a.dosageForm || a.form || '').toLowerCase();
        const isPlaceholder = !n || n === 'api' || n === 'active api' || n === 'active compounded formulation' || n === 'personalized compounded active formula';
        const isVeh = a.isVehicle || a.isVehicleOrBase || a._isVehicleOrBase || a.itemType === 'vehicle_base' || f.includes('vehicle') || n.includes('vehicle') || n.includes('trichosol') || n.includes('trichooil') || n.includes('pentravan') || n.includes('pomade base') || n.includes('ointment base');
        return !isVeh && !isPlaceholder;
      });
      if (filtered.length > 0) {
        return filtered.map(a => {
          if (typeof a === 'string') {
            return a
              .replace(/^[•*-]\s*/, '')
              .replace(/\s*\bTM\b/g, '™')
              .replace(/\bTocoferol\b/gi, 'Tocopherol')
              .replace(/\bBiotina\b/gi, 'Biotin')
              .replace(/\bEspironolactona\b/gi, 'Spironolactone')
              .replace(/\bMelatonina\b/gi, 'Melatonin')
              .replace(/\bCafeína\b/gi, 'Caffeine')
              .replace(/Tópico/gi, 'Topical')
              .trim();
          }
          let name = String(a.drugName || a.drug || a.name || a.productName || a.activeIngredient || 'API')
            .replace(/\s*\bTM\b/g, '™')
            .replace(/\bTocoferol\b/gi, 'Tocopherol')
            .replace(/\bBiotina\b/gi, 'Biotin')
            .replace(/\bEspironolactona\b/gi, 'Spironolactone')
            .replace(/\bMelatonina\b/gi, 'Melatonin')
            .replace(/\bCafeína\b/gi, 'Caffeine')
            .trim();
          let dose = a.dosage || a.dose || a.strength || a.concentration || '';
          if (dose && dose !== '—' && dose !== '-') {
            dose = String(dose)
              .replace(/Tópico/gi, 'Topical')
              .replace(/Oral/gi, 'Oral')
              .replace(/Dosis a calibrar/gi, 'Standard Compounded Strength')
              .replace(/Dose to calibrate/gi, '3% Topical')
              .trim();
          } else {
            dose = '';
            const nLower = name.toLowerCase();
            if (nLower.includes('prostaquinon')) dose = '3% Topical';
            else if (nLower.includes('minoxidil')) dose = '5% Topical';
            else if (nLower.includes('latanoprost')) dose = '0.005% Topical';
            else if (nLower.includes('vagifem')) {
              // Extract 10 mcg from instructions or standard pharmacopeia Vagifem strength
              const mcgMatch = String(rawDirections || '').match(/(\d+(?:\.\d+)?\s*mcg)/i);
              dose = mcgMatch ? mcgMatch[1] : '10 mcg';
              if (name === 'Vagifem') name = 'Estradiol (as Vagifem®)';
            } else if (nLower.includes('progesterone')) {
              const mgMatch = String(rawDirections || '').match(/(\d+(?:\.\d+)?\s*mg)/i);
              if (mgMatch) dose = mgMatch[1];
            } else if (nLower.includes('dhea')) {
              const mgMatch = String(rawDirections || '').match(/(\d+(?:\.\d+)?\s*mg)/i);
              if (mgMatch) dose = mgMatch[1];
            } else if (nLower.includes('testosterone')) {
              const pctMatch = String(rawDirections || '').match(/(\d+(?:\.\d+)?\s*%)/i);
              if (pctMatch) dose = pctMatch[1];
            }
          }

          // Anti-duplication engine: if name already ends with concentration/dosage that dose repeats
          if (dose) {
            const trailingDoseMatch = name.match(/\s+([0-9]+(?:\.[0-9]+)?\s*(?:%|mg|mcg|g|iu|fu|spu))\s*$/i);
            if (trailingDoseMatch) {
              const trailingUnit = trailingDoseMatch[1].replace(/\s+/g, '').toLowerCase();
              const doseTrimmed = dose.replace(/\s+/g, '').toLowerCase();
              if (doseTrimmed.startsWith(trailingUnit)) {
                name = name.slice(0, trailingDoseMatch.index).trim();
              }
            } else if (name.toLowerCase().endsWith(dose.toLowerCase())) {
              return name;
            }
          }

          return `${name} ${dose}`.trim();
        });
      }
    }
    if (formula) {
      const parts = formula.split(/\s*(?:\+|\bin\b)\s*/i).map(p => p.trim()).filter(Boolean);
      const nonVehParts = parts.filter(p => {
        const pl = p.toLowerCase();
        return !pl.includes('vehicle') && !pl.includes('trichosol') && !pl.includes('trichooil') && !pl.includes('pentravan') && !pl.includes('base') && pl !== 'active compounded formulation' && pl !== 'personalized compounded active formula';
      });
      if (nonVehParts.length > 0) {
        return nonVehParts.map(p => p.replace(/\bTM\b/g, '™').replace(/Tópico/gi, 'Topical').replace(/Oral/gi, 'Oral'));
      }
    }
    return ['Personalized Compounded Active Formula'];
  }, [labelData.apis, labelData.items, labelData.activeIngredients, labelData.activeIngredientsList, formula]);

  const formulaLower = (formula || '').toLowerCase();
  const dFormLower = (labelData.dosageForm || '').toLowerCase();
  const pNameLower = (labelData.productName || productTitle || '').toLowerCase();
  const dirLower = (directions || '').toLowerCase();
  const rawVehStr = (typeof labelData.vehicle === 'string' ? labelData.vehicle : labelData.vehicle?.name) || '';
  const rawVehLower = rawVehStr.toLowerCase();

  const isPomadeOrOintment = formulaLower.includes('pomade') || formulaLower.includes('pomada') || formulaLower.includes('ointment') || formulaLower.includes('diltiazem') || dFormLower.includes('ointment') || dFormLower.includes('pomade') || pNameLower.includes('pomade') || pNameLower.includes('ointment');
  const isVaginal = /\b(vagifem|vaginal|intravaginal|intravaginally|pessary|ovule|óvulo|suppository)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`);
  const isScalpTreatment = !isVaginal && /\b(trichosol|trichowash|trichooil|trichofoam|scalp|hair|cabello|cuero cabelludo|shampoo|17-?a|17-?alpha|alfatradiol|igrantine)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`);
  const isHormone = !isVaginal && !isScalpTreatment && (formulaLower.includes('testosterone') || formulaLower.includes('estradiol') || formulaLower.includes('progesterone') || formulaLower.includes('pentravan') || pNameLower.includes('testosterone') || pNameLower.includes('estradiol') || pNameLower.includes('hormone') || rawVehLower.includes('pentravan'));

  // Prioritize explicit Oral determination before generic topical scalp cues
  const isOral = !isVaginal && !isPomadeOrOintment && !isHormone && (
    dFormLower.includes('oral') ||
    dFormLower.includes('capsule') ||
    dFormLower.includes('cápsul') ||
    formulaLower.includes('capsule') ||
    formulaLower.includes('cápsul') ||
    formulaLower.includes('nattokinase') ||
    formulaLower.includes('serrapeptase') ||
    /\b(take|swallow|ingest|tome|ingerir)\b/i.test(dirLower) ||
    /\b(with water|with food|with breakfast|with meal|with lunch|with dinner|on empty stomach)\b/i.test(dirLower) ||
    /\b\d+\s*(?:capsule|cap|cápsula)s?\s*(?:daily|per day|a day|al día|once daily)/i.test(dirLower) ||
    /caps/i.test(String(volume || ''))
  );

  const isTopicalScalp = !isVaginal && !isPomadeOrOintment && !isHormone && !isOral && (
    /\b(shampoo|trichosol|trichooil|trichofoam)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`) ||
    /\b(leave the solution on your scalp|washing your hair|wash your scalp|apply.*scalp|topical scalp|massage.*rinse)\b/i.test(dirLower) ||
    (/\b(scalp|hair)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${rawVehLower}`) && !isOral)
  );

  const isTrichoOil = isTopicalScalp && /\b(trichooil|scalp oil|washing your hair|pre-wash|massage.*minutes)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`);

  const validSavedVehicle = (isTopicalScalp && /vegetable capsules/i.test(rawVehStr)) || (isVaginal && /vegetable capsules/i.test(rawVehStr)) ? '' : rawVehStr;
  const cleanVolForVeh = (isTopicalScalp && /capsule/i.test(String(volume || ''))) ? (isTrichoOil ? '30 mL' : '100 mL') : volume;

  let vehicleName = validSavedVehicle ||
    (labelData.apis?.find(a => a?.itemType === 'vehicle_base' || a?.isVehicleOrBase)?.name) ||
    (labelData.items?.find(a => a?.itemType === 'vehicle_base' || a?.isVehicleOrBase)?.name) ||
    (isVaginal ? 'Mucoadhesive Hydrophilic Vaginal Matrix (Supplied with Applicator)' :
      (isPomadeOrOintment ? 'Hypoallergenic Non-Irritating Base (Fragrance & Alcohol Free, q.s. 30 g)' :
        (isHormone ? 'Pentravan® Liposomal Transdermal Cream Vehicle' :
          (isTrichoOil || formulaLower.includes('trichooil') || pNameLower.includes('trichooil') ? `TrichoOil™ (100% Natural Scalp Compounding Vehicle${cleanVolForVeh ? `, ${cleanVolForVeh}` : ''})` :
            (isTopicalScalp || formulaLower.includes('trichosol') || pNameLower.includes('trichosol') ? `TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle${cleanVolForVeh ? `, ${cleanVolForVeh}` : ''})` :
              (isOral ? 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.' : 'Galenic Compounding Vehicle q.s.'))))));

  if (isOral && vehicleName.toLowerCase().includes('micronized compounded hard capsules')) {
    vehicleName = 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.';
  }

  // Standardize all pomade and ointment bases to explicitly specify Fragrance & Alcohol Free
  if (isPomadeOrOintment && vehicleName) {
    const vLower = vehicleName.toLowerCase();
    if (!vLower.includes('fragrance') || !vLower.includes('alcohol')) {
      vehicleName = 'Hypoallergenic Non-Irritating Base (Fragrance & Alcohol Free, q.s. 30 g)';
    }
  }

  let cautionText = 'CAUTION: FOR PATIENT USE AS PRESCRIBED • KEEP OUT OF REACH OF CHILDREN';
  if (isVaginal) {
    cautionText = 'CAUTION: FOR VAGINAL USE ONLY • NOT FOR ORAL CONSUMPTION • KEEP OUT OF REACH OF CHILDREN';
  } else if (isPomadeOrOintment) {
    cautionText = 'CAUTION: FOR TOPICAL / PERIANAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isHormone) {
    cautionText = 'CAUTION: FOR TRANSDERMAL / TOPICAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isOral) {
    cautionText = 'CAUTION: FOR ORAL USE ONLY • TAKE WITH WATER • KEEP OUT OF REACH OF CHILDREN';
  } else if (isTopicalScalp) {
    cautionText = 'CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  }

  // ── INTELLIGENT CLINICAL STORAGE & HANDLING ENGINE ─────────────────────────
  // Rule: If explicit storage instructions exist and are not generic, preserve them.
  // Otherwise, automatically derive the best evidence-based storage conditions
  // and color-coded safety pill badge for the exact formulation category.
  const isPen = /\b(pen|cartridge|pluma|multi-dose\s*pen|semaglutide|tirzepatide|retatrutide|cagrilintide|liraglutide)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower}`);
  const isPeptideVial = !isPen && /\b(lyophilized|liofilizado|vial|bpc-?157|tb-?500|cjc|ipamorelin|ghk-cu|epithalon|nad\+|glutathione|pept[íi]d)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower}`);

  const hasExplicitNonGenericStorage = labelData.storage &&
    !/^store at room temperature\.?$/i.test(labelData.storage.trim()) &&
    !/^store at room temperature \(15°c - 25°c\)\.?$/i.test(labelData.storage.trim());

  let resolvedStorageText = '';
  let storagePillBadge = 'PROTECT FROM LIGHT';
  let storagePillTheme = {
    fill: isMono ? '#f8fafc' : '#f0fdf4',
    stroke: isMono ? '#000000' : '#bbf7d0',
    text: isMono ? '#000000' : '#15803d'
  };

  if (hasExplicitNonGenericStorage) {
    resolvedStorageText = labelData.storage.trim();
    if (/refrigerat|2°c|8°c|cold/i.test(resolvedStorageText)) {
      storagePillBadge = 'KEEP REFRIGERATED (2°C–8°C)';
      storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0f9ff', stroke: isMono ? '#000000' : '#bae6fd', text: isMono ? '#000000' : '#0284c7' };
    }
  } else if (isPen) {
    resolvedStorageText = 'Keep refrigerated at 2°C–8°C. Do not freeze. In-use pen may be kept < 25°C for up to 30 days.';
    storagePillBadge = 'REFRIGERATE (2°C–8°C)';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0f9ff', stroke: isMono ? '#000000' : '#bae6fd', text: isMono ? '#000000' : '#0284c7' };
  } else if (isPeptideVial) {
    resolvedStorageText = 'Store dry powder at 2°C–8°C. Once reconstituted: 2°C–8°C max 30 days. Do not freeze.';
    storagePillBadge = 'REFRIGERATE (2°C–8°C)';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0f9ff', stroke: isMono ? '#000000' : '#bae6fd', text: isMono ? '#000000' : '#0284c7' };
  } else if (isHormone) {
    resolvedStorageText = 'Store at room temperature (15°C–25°C). Protect from heat and direct sunlight. Do not freeze.';
    storagePillBadge = 'ROOM TEMP (15°C–25°C)';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#fffbeb', stroke: isMono ? '#000000' : '#fde68a', text: isMono ? '#000000' : '#b45309' };
  } else if (isTopicalScalp) {
    resolvedStorageText = 'Store at room temperature (15°C–25°C). Keep bottle tightly closed after use.';
    storagePillBadge = 'PROTECT FROM LIGHT';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0fdf4', stroke: isMono ? '#000000' : '#bbf7d0', text: isMono ? '#000000' : '#15803d' };
  } else if (isVaginal) {
    resolvedStorageText = 'Store at controlled room temperature (15°C–25°C). Do not refrigerate or freeze.';
    storagePillBadge = 'ROOM TEMP (15°C–25°C)';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f5f3ff', stroke: isMono ? '#000000' : '#ddd6fe', text: isMono ? '#000000' : '#7c3aed' };
  } else if (isOral) {
    resolvedStorageText = 'Store in a cool, dry place (15°C–25°C). Protect from moisture and excessive humidity.';
    storagePillBadge = 'COOL, DRY PLACE';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0fdf4', stroke: isMono ? '#000000' : '#bbf7d0', text: isMono ? '#000000' : '#15803d' };
  } else if (isPomadeOrOintment) {
    resolvedStorageText = 'Store at room temperature (15°C–25°C). Keep tube tightly sealed. Do not freeze.';
    storagePillBadge = 'DO NOT FREEZE';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0f9ff', stroke: isMono ? '#000000' : '#bae6fd', text: isMono ? '#000000' : '#0284c7' };
  } else {
    resolvedStorageText = 'Store at room temperature (15°C–25°C). Protect from light and humidity.';
    storagePillBadge = 'PROTECT FROM LIGHT';
    storagePillTheme = { fill: isMono ? '#f8fafc' : '#f0fdf4', stroke: isMono ? '#000000' : '#bbf7d0', text: isMono ? '#000000' : '#15803d' };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COMPONENT: PROFESSIONAL CROP MARKS & SOLID CUT GUIDES
  // ───────────────────────────────────────────────────────────────────────────
  const renderCutGuides = () => {
    if (!showCutGuides) return null;
    return (
      <g className="pharmacy-cut-guides" pointerEvents="none" shapeRendering="crispEdges">
        {/* Perimeter Solid Fine Hairline Border - Strictly No Dashed Strokes */}
        <rect
          x="3"
          y="3"
          width={WIDTH - 6}
          height={HEIGHT - 6}
          fill="none"
          stroke={isMono ? '#000000' : '#cbd5e1'}
          strokeWidth="1.5"
          rx="2"
        />

        {/* 4 Professional Corner Crop Marks (Standard Imprenta) */}
        {/* Top-Left */}
        <line x1="0" y1="0" x2="38" y2="0" stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="38" stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />

        {/* Top-Right */}
        <line x1={WIDTH} y1="0" x2={WIDTH - 38} y2="0" stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />
        <line x1={WIDTH} y1="0" x2={WIDTH} y2="38" stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />

        {/* Bottom-Left */}
        <line x1="0" y1={HEIGHT} x2="38" y2={HEIGHT} stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />
        <line x1="0" y1={HEIGHT} x2="0" y2={HEIGHT - 38} stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />

        {/* Bottom-Right */}
        <line x1={WIDTH} y1={HEIGHT} x2={WIDTH - 38} y2={HEIGHT} stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />
        <line x1={WIDTH} y1={HEIGHT} x2={WIDTH} y2={HEIGHT - 38} stroke={isMono ? '#000000' : '#475569'} strokeWidth="3" />
      </g>
    );
  };

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 0: SHIPPING LABEL (Etiqueta de Bote / Farmacia Simple, sin QR/Barras)
  // ───────────────────────────────────────────────────────────────────────────
  if (variant === 'shipping') {
    const rawPatient = labelData.patientName || labelData.patient?.name || 'Patient Record';
    const patientDisplayName = rawPatient.replace(/\b([a-zA-Z])/g, m => m.toUpperCase());

    const shippingTitle = (
      labelData.shippingTitle ||
      labelData.shippingName ||
      getCustomsFriendlyDefault(labelData)
    ).trim();

    const quantityDisplay = labelData.quantity || labelData.volume || labelData.netContent || (isShort ? '90 capsules' : '120 capsules');
    const storageDisplay = labelData.storage || 'Store at room temperature.';
    const pharmacyContact = labelData.pharmacyContact || labelData.pharmacyEmail
      ? `${rawPharmacyName.toLowerCase()}lab / ${labelData.pharmacyEmail || labelData.pharmacyContact}`
      : 'Pharmapolislab/pharmapolisplovdiv@gmail.com';

    const prepDateFormatted = formatCustomsDate(labelData.prodDate || labelData.mfgDate, 'full');
    const budDateFormatted = formatCustomsDate(labelData.expDate, 'bud');

    // Directions text with wrapping (compact when boldPosology is false)
    const rawDir = labelData.directions || labelData.instructions || 'Take 2 capsules (one dose) with lunch and 2 capsules (one dose) with dinner.';
    const dirClean = String(rawDir).replace(/^directions\s*(for\s*use)?:\s*/i, '').trim();
    const dirLines = wrapDirections(dirClean, isBoldPosology ? 42 : 52, isBoldPosology ? 54 : 66);

    const baseFontSize = Math.min(35, Math.max(24, Math.round(HEIGHT * 0.040)));
    const titleFontSize = Math.min(48, Math.max(32, Math.round(HEIGHT * 0.054)));
    const headerFontSize = Math.min(22, Math.max(16, Math.round(HEIGHT * 0.024)));
    const lineStep = Math.round(baseFontSize * 1.8);

    // Vertical spacing
    const topMargin = Math.round(HEIGHT * 0.09);
    const titleY = topMargin + Math.round(lineStep * 1.4);
    const qtyY = titleY + lineStep;
    const dirY = qtyY + lineStep;
    const extraDirHeight = Math.max(0, dirLines.length - 1) * Math.round(baseFontSize * 1.35);
    const prepY = dirY + lineStep + extraDirHeight;
    const budY = prepY + lineStep;
    const storageY = budY + lineStep;
    const patientY = storageY + Math.round(lineStep * 1.35);

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="100%"
        textRendering="geometricPrecision"
        shapeRendering="crispEdges"
        style={{ display: 'block', background: '#ffffff', borderRadius: '4px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />

        {/* ── HEADER PHARMACY CONTACT ── */}
        <text
          x="75"
          y={topMargin}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={headerFontSize}
          fontStyle="italic"
          fill={isMono ? '#000000' : '#1e293b'}
        >
          {pharmacyContact}
        </text>

        {/* ── PRODUCT TITLE (Customs-Safe Name) ── */}
        <text
          x="75"
          y={titleY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={titleFontSize}
          fontWeight="bold"
          fill="#000000"
        >
          {shippingTitle}
        </text>

        {/* ── QUANTITY ── */}
        <text
          x="75"
          y={qtyY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={baseFontSize}
          fill="#000000"
        >
          <tspan fontWeight="bold">Quantity: </tspan>
          <tspan fontWeight="normal">{quantityDisplay}</tspan>
        </text>

        {/* ── DIRECTIONS FOR USE ── */}
        <text
          x="75"
          y={dirY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={baseFontSize}
          fill="#000000"
        >
          <tspan fontWeight="bold">Directions for use: </tspan>
          <tspan fontWeight="normal">{dirLines[0] || 'Take as directed.'}</tspan>
          {dirLines.slice(1).map((l, i) => (
            <tspan
              key={i}
              x="75"
              dy={Math.round(baseFontSize * 1.35)}
              fontWeight="normal"
            >
              {l}
            </tspan>
          ))}
        </text>

        {/* ── DATE OF PREPARATION ── */}
        <text
          x="75"
          y={prepY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={baseFontSize}
          fill="#000000"
        >
          <tspan fontWeight="bold">Date of preparation: </tspan>
          <tspan fontWeight="normal">{prepDateFormatted}</tspan>
        </text>

        {/* ── USE-BY DATE / BUD ── */}
        <text
          x="75"
          y={budY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={baseFontSize}
          fill="#000000"
        >
          <tspan fontWeight="bold">Use-by date / BUD: </tspan>
          <tspan fontWeight="normal">{budDateFormatted}</tspan>
        </text>

        {/* ── STORAGE CONDITIONS ── */}
        <text
          x="75"
          y={storageY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={baseFontSize}
          fill="#000000"
        >
          <tspan fontWeight="bold">Storage conditions: </tspan>
          <tspan fontWeight="normal">{storageDisplay}</tspan>
        </text>

        {/* ── PATIENT NAME ── */}
        <text
          x="75"
          y={patientY}
          fontFamily="Georgia, 'Times New Roman', Garamond, serif"
          fontSize={Math.round(baseFontSize * 1.08)}
          fontWeight="bold"
          fill="#000000"
        >
          {patientDisplayName}
        </text>

        {/* Scissor cut lines & corner marks */}
        {renderCutGuides()}
      </svg>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 1: BACK LABEL WITH LARGE PROMINENT QR CODE OR DUAL-QR (Reverso con QR / Doble QR)
  // ───────────────────────────────────────────────────────────────────────────
  if (variant === 'backQr' || variant === 'backDualQr') {
    const isDualQrMode = variant === 'backDualQr' || Boolean(labelData.isDualQr);
    const colY = patientBoxBottom + (isShort ? 12 : 16);
    const colHeight = footerLineY - colY - (isShort ? 12 : 16);
    // Narrow left column to 210 px (195 in short mode) to maximize clinical workspace
    const leftColWidth = isShort ? 195 : 210;
    const rightColX = 60 + leftColWidth + (isShort ? 12 : 16);
    const rightColWidth = 1440 - rightColX;
    const innerUsableWidth = rightColWidth - 48;

    // Snapped QR sizing: balanced to leave generous vertical budget for prominent CTA + aligned specs (zero overflow)
    const dualQrSize = isShort ? 100 : 112;
    const singleQrSize = isShort ? 128 : 152;
    const backQrSize = isDualQrMode ? dualQrSize : singleQrSize;
    const qrX = Math.round((leftColWidth - backQrSize) / 2);
    const qrY = isShort ? 8 : 12;

    // Right column layout
    const b1Y = isShort ? 10 : 12;
    const b1DividerY = isShort ? 26 : 32;
    const b2Y = b1Y + b1DividerY + (isShort ? 10 : 14);

    return (
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="100%"
        textRendering="geometricPrecision"
        shapeRendering="crispEdges"
        style={{ display: 'block', background: '#ffffff', borderRadius: '4px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />

        {/* ── HEADER ── */}
        <g transform={`translate(60, ${headerY})`}>
          <text x="0" y="30" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="800" letterSpacing="0.4" fill="#000000">{pharmacyName}</text>
          <text x="0" y="54" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={headerSubSize} fontWeight="500" fill={isMono ? '#333333' : '#475569'}>{pharmacyAddress}</text>
        </g>

        {/* EU GMP CERTIFIED BADGE */}
        <g transform={`translate(1440, ${headerY + 4})`}>
          <rect x="-286" y="0" width="286" height={isShort ? 34 : 38} fill={isMono ? '#ffffff' : '#f8fafc'} stroke={isMono ? '#000000' : '#003666'} strokeWidth="2" rx="6" />
          <text x="-143" y={isShort ? 22 : 24.5} textAnchor="middle" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 12 : 13.5} fontWeight="800" fill={isMono ? '#000000' : '#003666'} letterSpacing="0.55">
            EU GMP CERTIFIED DISPENSARY
          </text>
        </g>

        {/* ── PATIENT BOX ── */}
        <g transform={`translate(60, ${patientBoxY})`}>
          <rect x="0" y="0" width="1380" height={patientBoxHeight} fill={isMono ? '#ffffff' : '#f8fafc'} stroke="#000000" strokeWidth="2.2" rx="4" />
          <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={resolvedPatientNameFontSize} fontWeight="800" letterSpacing="0.4" fill="#000000">
            {patientName}
          </text>
          {headerBadgeText ? (
            <g transform={`translate(${badgeX}, ${badgeY})`}>
              <rect x="0" y="0" width={badgeWidth} height={badgeHeight} fill={badgeTheme.fill} stroke={badgeTheme.border} strokeWidth="1.2" rx="6" />
              {badgeTheme.glyph ? (
                <g transform={`translate(12, ${isShort ? 10 : 12})`}>
                  <VectorGlyph type={badgeTheme.glyph} size={isShort ? 16 : 19} fill={badgeTheme.text || '#ffffff'} />
                </g>
              ) : null}
              <text
                x={badgeTheme.glyph ? Math.round((badgeWidth + 20) / 2) : Math.round(badgeWidth / 2)}
                y={isShort ? 25 : 29}
                textAnchor="middle"
                fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                fontSize={badgeFontSize}
                fontWeight="900"
                fill={badgeTheme.text || "#ffffff"}
                letterSpacing="0.5"
              >
                {headerBadgeText}
              </text>
            </g>
          ) : null}
        </g>

        {/* ── TWO-COLUMN WORKSPACE ── */}
        {/* LEFT COLUMN: COMPACT SNUG QR CODE(S) + TECHNICAL DISPENSING SPECS */}
        <g transform={`translate(60, ${colY})`}>
          <rect x="0" y="0" width={leftColWidth} height={colHeight} fill="#ffffff" stroke={isMono ? '#000000' : '#cbd5e1'} strokeWidth="2" rx="8" />

          {isDualQrMode ? (
            /* ── DUAL QR CODE ARCHITECTURE: QR 1 (REFILL) + QR 2 (PRODUCT) ── */
            <>
              {/* QR 1: REFILL */}
              <svg x={qrX} y={qrY} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
                <QRCodeSVG
                  value={targetRxUrl}
                  size={backQrSize}
                  level="M"
                  includeMargin={true}
                  fgColor={isMono ? '#000000' : '#003666'}
                  bgColor="#ffffff"
                />
              </svg>
              <text
                x={Math.round(leftColWidth / 2)}
                y={qrY + backQrSize + (isShort ? 13 : 15)}
                textAnchor="middle"
                fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                fontSize={isShort ? 10 : 11}
                fontWeight="900"
                fill={isMono ? '#000000' : '#003666'}
                letterSpacing="0.3"
              >
                <tspan fill={isMono ? '#000000' : '#16a34a'} fontWeight="900">✔ </tspan>REFILL RX
              </text>

              {/* Hairline Divider between QRs */}
              <line
                x1="14"
                y1={qrY + backQrSize + (isShort ? 18 : 22)}
                x2={leftColWidth - 14}
                y2={qrY + backQrSize + (isShort ? 18 : 22)}
                stroke={isMono ? '#cccccc' : '#e2e8f0'}
                strokeWidth="1.2"
              />

              {/* QR 2: PRODUCT DOSSIER */}
              {(() => {
                const qr2Y = qrY + backQrSize + (isShort ? 26 : 30);
                const pUrl = productUrl || targetRxUrl;
                return (
                  <>
                    <svg x={qrX} y={qr2Y} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
                      <QRCodeSVG
                        value={pUrl}
                        size={backQrSize}
                        level="M"
                        includeMargin={true}
                        fgColor={isMono ? '#000000' : '#0284c7'}
                        bgColor="#ffffff"
                      />
                    </svg>
                    <text
                      x={Math.round(leftColWidth / 2)}
                      y={qr2Y + backQrSize + (isShort ? 13 : 15)}
                      textAnchor="middle"
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={isShort ? 10 : 11}
                      fontWeight="900"
                      fill={isMono ? '#000000' : '#0284c7'}
                      letterSpacing="0.3"
                    >
                      <tspan fill={isMono ? '#000000' : '#0284c7'} fontWeight="900">ℹ </tspan>PRODUCT INFO
                    </text>
                  </>
                );
              })()}

              {/* Hairline Divider before Specs */}
              <line
                x1="14"
                y1={qrY + (backQrSize * 2) + (isShort ? 46 : 54)}
                x2={leftColWidth - 14}
                y2={qrY + (backQrSize * 2) + (isShort ? 46 : 54)}
                stroke={isMono ? '#cccccc' : '#e2e8f0'}
                strokeWidth="1.2"
              />
            </>
          ) : (
            /* ── SINGLE LARGE REFILL QR ── */
            <>
              {/* Snug QR Code with integer module snapping & 4-module quiet zone */}
              <svg x={qrX} y={qrY} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
                <QRCodeSVG
                  value={targetRxUrl}
                  size={backQrSize}
                  level="M"
                  includeMargin={true}
                  fgColor={isMono ? '#000000' : '#003666'}
                  bgColor="#ffffff"
                />
              </svg>

              {/* High-Attention Prominent CTA Pill under Refill QR */}
              {(() => {
                const ctaX = 12;
                const ctaW = leftColWidth - 24;
                const ctaH = isShort ? 26 : 30;
                const ctaY = qrY + backQrSize + (isShort ? 5 : 7);
                return (
                  <g>
                    <rect
                      x={ctaX}
                      y={ctaY}
                      width={ctaW}
                      height={ctaH}
                      rx="5"
                      fill={isMono ? '#000000' : '#003666'}
                      stroke={isMono ? '#000000' : '#16a34a'}
                      strokeWidth={isMono ? '1.5' : '1.8'}
                    />
                    {!isMono && (
                      <rect
                        x={ctaX}
                        y={ctaY}
                        width="6"
                        height={ctaH}
                        rx="3"
                        fill="#16a34a"
                      />
                    )}
                    <text
                      x={Math.round(leftColWidth / 2) + (isMono ? 0 : 2)}
                      y={ctaY + Math.round(ctaH * 0.68)}
                      textAnchor="middle"
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={isShort ? 12 : 13.5}
                      fontWeight="900"
                      fill="#ffffff"
                      letterSpacing="0.65"
                    >
                      {isMono ? '▶ SCAN FOR REFILL' : '✔ SCAN FOR REFILL'}
                    </text>
                    <text
                      x={Math.round(leftColWidth / 2)}
                      y={ctaY + ctaH + (isShort ? 14 : 16)}
                      textAnchor="middle"
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={isShort ? 9.5 : 10.5}
                      fontWeight="700"
                      fill={isMono ? '#333333' : '#0369a1'}
                      letterSpacing="0.25"
                    >
                      Scan QR to reorder
                    </text>
                  </g>
                );
              })()}
            </>
          )}

          {/* Clip path to strictly ensure no text ever bleeds outside left column */}
          <clipPath id="pls-left-col-clip">
            <rect x="0" y="0" width={leftColWidth} height={colHeight} rx="8" />
          </clipPath>

          {/* Dispensing & Technical Packaging Specs (Unified Alignment & Zero-Overflow Budget Engine) */}
          {(() => {
            const railPadX = 12;
            const railInnerW = leftColWidth - (railPadX * 2);
            const effectiveVol = cleanVolForVeh || volume || '100 mL';
            const volLines = wrapLines(effectiveVol, 16);

            // Specs origin: generous breathing room beneath SCAN FOR REFILL CTA so the refill callout stands out
            const ctaBlockBottom = qrY + backQrSize + (isShort ? 70 : 86);
            const specsOriginY = isDualQrMode
              ? qrY + (backQrSize * 2) + (isShort ? 82 : 98)
              : ctaBlockBottom;

            const railAvailableH = Math.max(90, colHeight - specsOriginY - 8);
            const headerBadgeH = isShort ? 20 : 22;
            const pillH = isShort ? 22 : 25;

            const volTitleY = headerBadgeH + (isShort ? 15 : 18);
            const firstVolLineY = volTitleY + (isShort ? 16 : 19);
            const volLineGap = isShort ? 16 : 19;
            const volBlockBottom = firstVolLineY + ((volLines.length - 1) * volLineGap) + (isShort ? 6 : 8);

            const storageTitleY = volBlockBottom + (isShort ? 14 : 18);
            const storageStartRelY = storageTitleY + (isShort ? 14 : 16);
            const maxStorageAndPillH = Math.max(46, railAvailableH - storageStartRelY - pillH - 8);

            // Auto-fit storage font & line-wrapping to strictly guarantee zero overflow of PROTECT FROM LIGHT pill
            const storageCandidates = isShort ? [12, 11, 10, 9.2] : [13, 12, 11, 10];
            let storageFontSize = storageCandidates[storageCandidates.length - 1];
            let storageLineGap = Math.round(storageFontSize * 1.32);
            let storageLines = [];

            for (const candFs of storageCandidates) {
              const candMaxChars = Math.max(17, Math.floor(railInnerW / (candFs * 0.56)));
              const candLines = wrapLines(resolvedStorageText, candMaxChars);
              const candGap = Math.round(candFs * 1.32);
              const candH = ((candLines.length - 1) * candGap) + Math.round(candFs * 1.1);
              if (candH <= maxStorageAndPillH || candFs === storageCandidates[storageCandidates.length - 1]) {
                storageFontSize = candFs;
                storageLineGap = candGap;
                storageLines = candLines;
                break;
              }
            }

            const storageTextBottom = storageStartRelY + ((Math.max(1, storageLines.length) - 1) * storageLineGap) + Math.round(storageFontSize * 0.45);
            const maxPillY = Math.max(storageTextBottom + 6, railAvailableH - pillH);
            const pillY = Math.min(maxPillY, storageTextBottom + (isShort ? 8 : 11));
            const clampedPillY = Math.min(pillY, Math.max(storageTextBottom + 4, railAvailableH - pillH));
            const pillFontSize = storagePillBadge.length > 20 ? (isShort ? 8.2 : 9.2) : (isShort ? 9 : 10);

            return (
              <g clipPath="url(#pls-left-col-clip)">
                <g transform={`translate(${railPadX}, ${specsOriginY})`}>
                  <line x1="0" y1={isShort ? -10 : -12} x2={railInnerW} y2={isShort ? -10 : -12} stroke={isMono ? '#999999' : '#cbd5e1'} strokeWidth="1" strokeDasharray="3,3" />
                  {/* Header badge (strictly aligned x=0..railInnerW) */}
                  <rect x="0" y="0" width={railInnerW} height={headerBadgeH} fill={isMono ? '#000000' : '#f0f9ff'} stroke={isMono ? '#000000' : '#bae6fd'} strokeWidth="1.2" rx="4" />
                  <text x="7" y={Math.round(headerBadgeH * 0.70)} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="900" fill={isMono ? '#ffffff' : '#0284c7'} letterSpacing="0.7">
                    DISPENSING SPECS
                  </text>

                  {/* 1. NET CONTENT (strictly aligned x=0) */}
                  <g>
                    <text x="0" y={volTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="800" fill={isMono ? '#333333' : '#475569'} letterSpacing="0.4">
                      NET CONTENT
                    </text>
                    {volLines.map((vLine, vIdx) => (
                      <text
                        key={`vol-${vIdx}`}
                        x="0"
                        y={firstVolLineY + (vIdx * volLineGap)}
                        fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                        fontSize={isShort ? 15 : 17.5}
                        fontWeight="900"
                        fill="#000000"
                      >
                        {vLine}
                      </text>
                    ))}
                  </g>

                  {/* Subtle horizontal divider between Net Content and Storage */}
                  <line x1="0" y1={volBlockBottom + 2} x2={railInnerW} y2={volBlockBottom + 2} stroke={isMono ? '#cccccc' : '#e2e8f0'} strokeWidth="1" />

                  {/* 2. STORAGE & HANDLING (uniformly aligned x=0) */}
                  <g>
                    <text x="0" y={storageTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="800" fill={isMono ? '#333333' : '#475569'} letterSpacing="0.4">
                      STORAGE &amp; HANDLING
                    </text>
                    {storageLines.map((sLine, sIdx) => (
                      <text
                        key={`stg-${sIdx}`}
                        x="0"
                        y={storageStartRelY + (sIdx * storageLineGap)}
                        fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                        fontSize={storageFontSize}
                        fontWeight="600"
                        fill="#111827"
                      >
                        {sLine}
                      </text>
                    ))}
                  </g>

                  {/* 3. DYNAMIC STORAGE HANDLING PILL (Zero-Overflow Bottom-Bounded & Aligned) */}
                  <g transform={`translate(0, ${clampedPillY})`}>
                    <rect x="0" y="0" width={railInnerW} height={pillH} fill={storagePillTheme.fill} stroke={storagePillTheme.stroke} strokeWidth="1.2" rx="4" />
                    <text
                      x={Math.round(railInnerW / 2)}
                      y={Math.round(pillH * 0.68)}
                      textAnchor="middle"
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={pillFontSize}
                      fontWeight="800"
                      fill={storagePillTheme.text}
                      letterSpacing="0.35"
                    >
                      {storagePillBadge}
                    </text>
                  </g>
                </g>
              </g>
            );
          })()}
        </g>

        {/* RIGHT COLUMN: EXPANDED HIGH-LEGIBILITY CLINICAL WORKSPACE (Width 1125 px) */}
        <g transform={`translate(${rightColX}, ${colY})`}>
          <rect x="0" y="0" width={rightColWidth} height={colHeight} fill="#ffffff" stroke={isMono ? '#000000' : '#cbd5e1'} strokeWidth="2" rx="8" />

          {/* Clip path strictly bounding right column */}
          <clipPath id="pls-right-col-clip">
            <rect x="0" y="0" width={rightColWidth} height={colHeight} rx="8" />
          </clipPath>

          {/* INGREDIENTS, DIRECTIONS, AND BALANCED VERTICAL AUTO-FILL ENGINE */}
          {(() => {
            const ingCount = activeIngredientsList.length;

            let vehiclePrefix = 'Compounding Vehicle:';
            const vLower = (vehicleName || '').toLowerCase();
            if (isVaginal) {
              vehiclePrefix = 'Galenic Excipients:';
            } else if (isOral || vLower.includes('capsule')) {
              vehiclePrefix = 'Compounding Vehicle / Shell:';
            } else if (isPomadeOrOintment || vLower.includes('ointment') || vLower.includes('pomade')) {
              vehiclePrefix = 'Compounding Base:';
            }

            let cleanVehicleDisplay = vehicleName;
            if (cleanVehicleDisplay.toLowerCase().startsWith('compounding vehicle:')) {
              cleanVehicleDisplay = cleanVehicleDisplay.slice(20).trim();
            } else if (cleanVehicleDisplay.toLowerCase().startsWith('compounding vehicle / shell:')) {
              cleanVehicleDisplay = cleanVehicleDisplay.slice(28).trim();
            } else if (cleanVehicleDisplay.toLowerCase().startsWith('compounding base:')) {
              cleanVehicleDisplay = cleanVehicleDisplay.slice(17).trim();
            } else if (cleanVehicleDisplay.toLowerCase().startsWith('base:')) {
              cleanVehicleDisplay = cleanVehicleDisplay.slice(5).trim();
            } else if (cleanVehicleDisplay.toLowerCase().startsWith('vehicle:')) {
              cleanVehicleDisplay = cleanVehicleDisplay.slice(8).trim();
            }

            if (cleanVehicleDisplay.toLowerCase().includes('trichosol')) {
              cleanVehicleDisplay = cleanVehicleDisplay
                .replace(/\bliposomal\s+hydrophilic\s+base\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
                .replace(/\bhydrophilic\s+base\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
                .replace(/\bpatented\s+hydrophilic\s+vehicle\s+for\s+scalp\s+retention\b/gi, 'Alcohol-Free Hydrophilic Compounding Vehicle')
                .replace(/\bbase\b/gi, 'Compounding Vehicle');
            }
            if (cleanVehicleDisplay.toLowerCase().includes('trichooil')) {
              cleanVehicleDisplay = cleanVehicleDisplay
                .replace(/\bbase\b/gi, 'Compounding Vehicle')
                .replace(/\bnatural\s+lipidic\s+carrier\b/gi, '100% Natural Scalp Compounding Vehicle');
            }

            // Formula / Protocol title callout (gives formula immediate clinical identity)
            const rawTitle = (labelData.productTitle || labelData.productName || '').trim();
            const hasFormulaTitle = rawTitle.length > 0 && rawTitle.toLowerCase() !== 'compounded pharmaceutical protocol';
            const formulaTitleText = hasFormulaTitle ? rawTitle : '';

            // Multi-API layout strategy:
            // Only split into 2 columns when ingCount >= 4 so 1–3 ingredient formulas enjoy full-width single-line typography
            const isMultiColumn = ingCount >= 4 && innerUsableWidth >= 700;
            const halfColCount = Math.ceil(ingCount / 2);
            const col1Items = isMultiColumn ? activeIngredientsList.slice(0, halfColCount) : [];
            const col2Items = isMultiColumn ? activeIngredientsList.slice(halfColCount) : [];
            const colWidth = Math.floor((innerUsableWidth - 36) / 2);

            const multiColFontSize = isShort ? 16 : isMediumHeight ? 18 : 22;
            const multiColLineGap = Math.round(multiColFontSize * 1.42);
            const multiColMaxChars = Math.max(20, Math.floor((colWidth - 20) / (multiColFontSize * 0.68)));

            const col1Lines = isMultiColumn ? col1Items.flatMap(it => wrapLines(`• ${it}`, multiColMaxChars)) : [];
            const col2Lines = isMultiColumn ? col2Items.flatMap(it => wrapLines(`• ${it}`, multiColMaxChars)) : [];
            const multiColMaxLines = Math.max(col1Lines.length, col2Lines.length);

            // Sparsity detection: allows 1–3 ingredient formulas to boost typography and use space
            const isUltraSparse = ingCount <= 2 && (directions.length < 95);
            const isSparse = ingCount <= 3 && (directions.length < 145);

            // Refined clinical ingredient font sizing (1–3 items: balanced ~7.5–8.5pt, never oversized)
            const ingFontSize = isShort
              ? (isUltraSparse ? 24 : isSparse ? 22 : 20)
              : isMediumHeight
                ? (isUltraSparse ? 25 : isSparse ? 23 : 21)
                : (isUltraSparse ? 26 : isSparse ? 24 : 22);
            const ingLineGap = Math.round(ingFontSize * 1.40);
            const ingMaxChars = Math.max(26, Math.floor((innerUsableWidth - 48) / (ingFontSize * 0.62)));
            const singleIngLines = activeIngredientsList.flatMap(it => wrapLines(`• ${it}`, ingMaxChars));
            const ingLines = singleIngLines.length > 0 ? singleIngLines : wrapLines(`• ${activeIngredientsList.join(' — ')}`, ingMaxChars);
            const ingLineCount = isMultiColumn ? multiColMaxLines : ingLines.length;

            // Single-Line Mandatory Auto-Fit Invariant for "Compounding Vehicle: ..."
            let vehicleSingleLine = `${vehiclePrefix} ${cleanVehicleDisplay}`.replace(/\s{2,}/g, ' ').trim();
            const vehicleCandidates = isShort
              ? [16.5, 15.5, 14.5, 13.5, 12.5, 11.5]
              : [17.5, 16.5, 15.5, 14.5, 13.5, 12.5, 11.5];
            let baseFontSize = vehicleCandidates[vehicleCandidates.length - 1];
            const vehicleMaxWidthPx = innerUsableWidth - 8;

            const findFittingVehicleFont = (txt) => {
              for (const cand of vehicleCandidates) {
                if (txt.length * cand * 0.56 <= vehicleMaxWidthPx) return cand;
              }
              return null;
            };

            let fittedVehicleFs = findFittingVehicleFont(vehicleSingleLine);
            if (!fittedVehicleFs) {
              // Strip redundant volume suffix already shown in NET CONTENT if needed to preserve crisp legibility on 1 line
              const compactVehicle = vehicleSingleLine.replace(/,\s*\d+(?:\.\d+)?\s*(?:mL|ml|g|capsules?|caps?)\)/gi, ')');
              const compactFs = findFittingVehicleFont(compactVehicle);
              if (compactFs) {
                vehicleSingleLine = compactVehicle;
                fittedVehicleFs = compactFs;
              } else {
                fittedVehicleFs = Math.max(10.5, Number(((vehicleMaxWidthPx / Math.max(1, vehicleSingleLine.length)) / 0.56).toFixed(1)));
              }
            }
            baseFontSize = fittedVehicleFs;
            const baseLineGap = Math.round(baseFontSize * 1.35);
            const baseLines = [vehicleSingleLine];

            // Prescriber text & font (computed early so CAUTION can be mathematically centered between Posology and Doctor)
            const cleanDoctorLicense = doctorLicense ? String(doctorLicense).replace(/^license\s*:\s*/i, '').trim() : '';
            const rxParts = [];
            if (doctorName) rxParts.push(`Rx: ${doctorName}`);
            if (clinicName) rxParts.push(clinicName);
            if (cleanDoctorLicense) rxParts.push(cleanDoctorLicense);
            const rxFullText = rxParts.length > 0 ? rxParts.join(' · ') : (doctorName ? `Rx: ${doctorName}` : 'Rx: Licensed Clinical Practice');
            const rxFontSize = isShort ? (rxFullText.length > 68 ? 13.5 : 15) : isMediumHeight ? (rxFullText.length > 68 ? 14.5 : 16.5) : (rxFullText.length > 72 ? 16 : 18);

            // Bottom-anchored Doctor baseline & exact reserved geometry for centered CAUTION banner
            const bottomMargin = isShort ? 12 : isMediumHeight ? 14 : 18;
            const bRxY = colHeight - bottomMargin;
            const rxTopY = bRxY - Math.round(rxFontSize * 0.85);
            const cautionBoxH = isShort ? 24 : 28;
            const minCautionGap = isShort ? 12 : 14;

            // Maximum allowed Y coordinate for the bottom edge of posBox (guarantees equal air above & below CAUTION)
            const maxPosBoxBottom = rxTopY - cautionBoxH - (minCautionGap * 2);

            // Formula title height if present (Crisp clinical branding callout)
            const formulaTitleFontSize = isShort ? 20 : isMediumHeight ? 22 : 24;
            const formulaTitleH = formulaTitleText ? (formulaTitleFontSize + 10) : 0;

            // Typographical baseline offsets with safe font cap-height clearance (Zero overlap)
            const ingHeaderTitleY = (formulaTitleText ? formulaTitleH + 6 : 0) + (isShort ? 12 : isMediumHeight ? 14 : 16);
            const firstIngLineY = ingHeaderTitleY + (isShort ? 8 : isMediumHeight ? 10 : 12) + Math.round((isMultiColumn ? multiColFontSize : ingFontSize) * 0.82);
            const firstBaseLineY = firstIngLineY + ((ingLineCount - 1) * (isMultiColumn ? multiColLineGap : ingLineGap)) + (isShort ? 10 : 12) + Math.round(baseFontSize * 0.85);
            const ingBlockH = firstBaseLineY + 6;

            // Ingredients baseline anchor: posBox CAN NEVER START HIGHER than topIngredientsY + ingBlockH + minGap
            const topIngredientsY = isShort ? 12 : isMediumHeight ? 14 : 16;
            const minMidPad = isShort ? 10 : 14;
            const absoluteMinPosBoxY = topIngredientsY + ingBlockH + minMidPad;

            // Maximum physical height available for the posology box (without colliding with ingredients or caution footer)
            const maxAvailablePosBoxHeight = Math.max(58, maxPosBoxBottom - absoluteMinPosBoxY);

            // ── Dynamic Auto-Fitting Scale for Directions/Posology (Larger & clearer for short instructions) ──
            const candidatePosFontSizes = isShort
              ? [26, 23.5, 21, 19, 17, 15.5, 14, 13]
              : isMediumHeight
                ? [28, 25.5, 23, 20.5, 18.5, 17, 15.5, 14]
                : [30, 27, 24.5, 22, 20, 18, 16, 14.5];

            let resolvedPosFontSize = candidatePosFontSizes[candidatePosFontSizes.length - 1];
            let resolvedPosLineGap = Math.round(resolvedPosFontSize * 1.38);
            let resolvedPosologyLines = [];
            let resolvedFirstPosLineY = 0;
            let resolvedBasePosBoxHeight = 0;
            const posHeaderTitleY = isShort ? 16 : isMediumHeight ? 18 : 20;

            for (const testFontSize of candidatePosFontSizes) {
              const testLineGap = Math.round(testFontSize * posLineGapFactor);
              const testMaxChars = Math.max(28, Math.floor((innerUsableWidth - 38) / (testFontSize * posCharWidthFactor)));
              const testLines = wrapLines(directions, testMaxChars);
              const testFirstLineY = posHeaderTitleY + (isShort ? 9 : isMediumHeight ? 10 : 12) + Math.round(testFontSize * 0.82);
              const testBoxH = testFirstLineY + Math.max(0, testLines.length - 1) * testLineGap + (isShort ? 12 : 14);

              if (testBoxH <= maxAvailablePosBoxHeight || testFontSize === candidatePosFontSizes[candidatePosFontSizes.length - 1]) {
                resolvedPosFontSize = testFontSize;
                resolvedPosLineGap = testLineGap;
                resolvedPosologyLines = testLines;
                resolvedFirstPosLineY = testFirstLineY;
                resolvedBasePosBoxHeight = testBoxH;
                break;
              }
            }

            const posFontSize = resolvedPosFontSize;
            const posLineGap = resolvedPosLineGap;
            const posologyLines = resolvedPosologyLines;
            const firstPosLineY = resolvedFirstPosLineY;
            const basePosBoxHeight = resolvedBasePosBoxHeight;

            // Harmonious compact posBoxHeight (cleanly hugs text without creating a bloated empty box)
            const totalContentNeeded = ingBlockH + basePosBoxHeight;
            const totalAvailableSpace = maxPosBoxBottom - topIngredientsY;
            const verticalSurplus = Math.max(0, totalAvailableSpace - totalContentNeeded);

            const extraBoxPad = Math.min(10, Math.round(verticalSurplus * 0.08));
            const posBoxHeight = Math.min(maxAvailablePosBoxHeight, basePosBoxHeight + extraBoxPad);

            // Tidy padding between ingredients and posology
            const midPad = Math.max(minMidPad, Math.min(24, minMidPad + Math.round(verticalSurplus * 0.22)));

            // Absolute invariant: posBoxY is anchored strictly below ingredients, never exceeding maxPosBoxBottom
            let posBoxY = topIngredientsY + ingBlockH + midPad;
            if (posBoxY + posBoxHeight > maxPosBoxBottom) {
              posBoxY = Math.max(absoluteMinPosBoxY, maxPosBoxBottom - posBoxHeight);
            }
            const posBoxBottom = posBoxY + posBoxHeight;

            // ── EXACT VERTICAL MIDPOINT INVARIANT FOR CAUTION BANNER ──
            // Guarantees gap(Posology -> Caution) === gap(Caution -> Doctor) to the exact pixel
            const zoneBetweenPosAndRx = Math.max(cautionBoxH + 8, rxTopY - posBoxBottom);
            const cautionBoxY = Math.round(posBoxBottom + (zoneBetweenPosAndRx - cautionBoxH) / 2);
            const cautionTextY = cautionBoxY + Math.round(cautionBoxH * 0.68);

            return (
              <>
                {/* Block 2: ACTIVE COMPOUNDED INGREDIENTS & BASE (Dynamic Auto-Fill Layout) */}
                <g transform={`translate(24, ${topIngredientsY})`}>
                  {formulaTitleText ? (
                    <g>
                      <text x="0" y={formulaTitleFontSize} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={formulaTitleFontSize} fontWeight="900" fill={isMono ? '#000000' : '#003666'} letterSpacing="0.4">
                        {formulaTitleText}
                      </text>
                      <line x1="0" y1={formulaTitleFontSize + 6} x2={innerUsableWidth} y2={formulaTitleFontSize + 6} stroke={isMono ? '#000000' : '#e2e8f0'} strokeWidth="1.2" />
                    </g>
                  ) : null}

                  <text x="0" y={ingHeaderTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 13.5 : 15.5} fontWeight="900" fill={isMono ? '#000000' : '#0284c7'} letterSpacing="0.8">
                    ACTIVE COMPOUNDED INGREDIENTS
                  </text>

                  {isMultiColumn ? (
                    <g>
                      {/* Column 1 */}
                      {col1Lines.map((line, lIdx) =>
                        renderIngredientLine(line, 0, firstIngLineY + (lIdx * multiColLineGap), multiColFontSize, `ing1-${lIdx}`, '#000000', isMono, colWidth)
                      )}
                      {/* Column 2 */}
                      {col2Lines.map((line, lIdx) =>
                        renderIngredientLine(line, colWidth + 36, firstIngLineY + (lIdx * multiColLineGap), multiColFontSize, `ing2-${lIdx}`, '#000000', isMono, colWidth)
                      )}
                    </g>
                  ) : (
                    ingLines.map((line, lIdx) =>
                      renderIngredientLine(line, 0, firstIngLineY + (lIdx * ingLineGap), ingFontSize, `ing-${lIdx}`, '#000000', isMono, innerUsableWidth)
                    )
                  )}

                  {baseLines.map((bLine, bIdx) => (
                    <text
                      key={`base-${bIdx}`}
                      x="0"
                      y={firstBaseLineY + (bIdx * baseLineGap)}
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={baseFontSize}
                      fontWeight="700"
                      fill={isMono ? '#222222' : '#0369a1'}
                    >
                      {bLine}
                    </text>
                  ))}
                </g>

                {/* Block 3: DEDICATED CLINICAL POSOLOGY & DIRECTIONS (Harmoniously Weighted & High-Contrast) */}
                <g transform={`translate(24, ${posBoxY})`}>
                  <rect x="0" y="0" width={innerUsableWidth} height={posBoxHeight} fill={isMono ? '#ffffff' : '#f0f9ff'} stroke={isMono ? '#000000' : '#0284c7'} strokeWidth={isMono ? '2.5' : '2'} rx="6" />
                  <rect x="0" y="0" width="8" height={posBoxHeight} fill={isMono ? '#000000' : (badgeTheme.fill || '#0284c7')} rx="4" />

                  <text x="22" y={posHeaderTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 14 : 16} fontWeight="900" fill={isMono ? '#000000' : '#0369a1'} letterSpacing="0.8">
                    {(!isMono && badgeTheme.glyph) ? <VectorGlyph type={badgeTheme.glyph} size={14} fill={badgeTheme.accent || '#0369a1'} /> : null} DIRECTIONS FOR USE / PRESCRIBED POSOLOGY
                  </text>

                  {posologyLines.map((pLine, pIdx) => (
                    <text
                      key={`pos-${pIdx}`}
                      x="22"
                      y={firstPosLineY + (pIdx * posLineGap)}
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={posFontSize}
                      fontWeight={posFontWeight}
                      fill={isMono ? '#000000' : '#0f172a'}
                    >
                      {pLine}
                    </text>
                  ))}
                </g>

                {/* Block 4: Mandatory Precaution (Centered Midpoint between Posology & Doctor) & Prescriber */}
                <g transform="translate(24, 0)">
                  <rect
                    x="-4"
                    y={cautionBoxY}
                    width={innerUsableWidth + 8}
                    height={cautionBoxH}
                    fill="#000000"
                    rx="3"
                  />
                  <text
                    x="8"
                    y={cautionTextY}
                    fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                    fontSize={isShort ? 12.5 : 14.5}
                    fontWeight="900"
                    fill="#ffffff"
                    letterSpacing="0.5"
                  >
                    ⚠️ {cautionText}
                  </text>
                  <text
                    x="0"
                    y={bRxY}
                    fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                    fontSize={rxFontSize}
                    fontWeight="700"
                    fill={isMono ? '#000000' : '#1e293b'}
                  >
                    {rxFullText}
                  </text>
                </g>
              </>
            );
          })()}
        </g>

        {/* ── SOLID DIVIDER LINE ── */}
        <line x1="60" y1={footerLineY} x2="1440" y2={footerLineY} stroke="#000000" strokeWidth="2.2" />

        {/* ── FOOTER ROW: COMPACT EU GMP SPECS (Dates on left, Dispensary Monograph on right) ── */}
        <g transform={`translate(60, ${footerTextY})`}>
          <text x="0" y="0" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
            Mfg: <tspan fontWeight="400">{prodDate}</tspan> • Exp: <tspan fontWeight="400">{expDate}</tspan>
          </text>
          <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={footerFontSize} fontWeight="700" fill={isMono ? '#333333' : '#475569'}>
            Batch: <tspan fontWeight="800" fill={isMono ? '#000000' : '#003666'}>{batchCode}</tspan> • <tspan fontWeight="500" fill="#000000">EU GMP Monograph</tspan>
          </text>
        </g>

        {/* ── CUT GUIDES & SCISSOR INDICATOR ── */}
        {renderCutGuides()}
      </svg>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 2 & 3: FRONT LABEL & FRONT WITH MICRO-QR
  // High-legibility EU GMP / USP calibrated typography engine
  // ───────────────────────────────────────────────────────────────────────────
  const withMicroQr = variant === 'frontWithQr';

  // Micro-QR dimensions and coordinates (engineered to NEVER collide with patient box)
  const microQrY = isShort ? 10 : 12;
  const microQrWidth = isShort ? 136 : 156;
  const microQrHeight = isShort ? 102 : 116;
  const microQrX = 1440 - microQrWidth;
  const qrInnerSize = isShort ? 78 : 90;
  const scanRxY = isShort ? 92 : 105;
  const scanRxSize = isShort ? 11 : 13;

  // Text Wrapping with clean boundaries - utilizing wide right horizontal canvas (up to 1380px)
  const maxFormulaChars = isShort ? 54 : 68;
  const formulaLines = formula ? wrapLines(formula, maxFormulaChars) : [];
  const directionLines = wrapDirections(directions, isShort ? 46 : 56, isShort ? 58 : 72);

  // Dynamic typography scale: calibrated to 9.5pt - 11.5pt physical print equivalents across tiers
  const titleFontSize = isShort ? 34 : isMediumHeight ? 40 : (productTitle.length > 48 ? 44 : 50); // ~11.5 pt
  const formulaFontSize = isShort ? 28 : isMediumHeight ? 32 : 38; // ~10.5 pt
  const formulaLineGap = isShort ? 38 : isMediumHeight ? 44 : 54;
  const dirFontSize = isShort ? 26 : isMediumHeight ? 29 : 35;     // ~9.5 pt
  const dirLineGap = isShort ? 36 : isMediumHeight ? 42 : 52;

  // Generous margin below patient box bottom line
  const titleMarginTop = isShort ? 26 : 36;
  const titleY = patientBoxBottom + titleMarginTop + Math.round(titleFontSize * 0.82);
  const titleBottom = titleY + Math.round(titleFontSize * 0.22);

  // Available vertical canvas between bottom of title and dashed footer
  const availableContentHeight = footerLineY - titleBottom - (isShort ? 24 : 36);

  const formulaBlockHeight = formulaLines.length > 0 ? (formulaLines.length * formulaLineGap) : 0;
  const dirBlockHeight = directionLines.length > 0 ? (directionLines.length * dirLineGap) : 0;

  const totalContentHeight = formulaBlockHeight + dirBlockHeight;
  const remainingSpace = Math.max(20, availableContentHeight - totalContentHeight);

  // Distribute remaining vertical space into balanced breathing gaps
  const gapTitleToFormula = Math.min(isShort ? 36 : 60, Math.max(26, Math.round(remainingSpace * 0.44)));
  const gapFormulaToDir = Math.min(isShort ? 38 : 66, Math.max(28, Math.round(remainingSpace * 0.48)));

  const formulaStartY = titleBottom + gapTitleToFormula;
  const directionsStartY = formulaStartY + formulaBlockHeight + (formulaBlockHeight > 0 ? gapFormulaToDir : 0);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      textRendering="geometricPrecision"
      shapeRendering="crispEdges"
      style={{ display: 'block', background: '#ffffff', borderRadius: '4px' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />

      {/* ── HEADER ── */}
      <g transform={`translate(60, ${headerY})`}>
        <text x="0" y="30" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="800" letterSpacing="0.4" fill="#000000">{pharmacyName}</text>
        <text x="0" y="54" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={headerSubSize} fontWeight="500" fill={isMono ? '#333333' : '#475569'}>{pharmacyAddress}</text>
      </g>

      {/* MICRO-QR (IF ENABLED): Guaranteed zero overlap with patient box */}
      {withMicroQr && (
        <g transform={`translate(${microQrX}, ${microQrY})`}>
          <rect x="0" y="0" width={microQrWidth} height={microQrHeight} fill="#ffffff" stroke={isMono ? '#000000' : '#003666'} strokeWidth="2.2" rx="8" />
          <svg x={Math.round((microQrWidth - qrInnerSize) / 2)} y="8" width={qrInnerSize} height={qrInnerSize} viewBox={`0 0 ${qrInnerSize} ${qrInnerSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={qrInnerSize}
              level="M"
              fgColor={isMono ? '#000000' : '#003666'}
              bgColor="#ffffff"
            />
          </svg>
          <text x={Math.round(microQrWidth / 2)} y={scanRxY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={scanRxSize} fontWeight="900" fill={isMono ? '#000000' : '#003666'} textAnchor="middle" letterSpacing="0.8">
            SCAN RX
          </text>
        </g>
      )}

      {/* ── PATIENT BOX ── */}
      <g transform={`translate(60, ${patientBoxY})`}>
        <rect x="0" y="0" width="1380" height={patientBoxHeight} fill={isMono ? '#ffffff' : '#f8fafc'} stroke="#000000" strokeWidth="2.2" rx="4" />
        <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={resolvedPatientNameFontSize} fontWeight="800" letterSpacing="0.4" fill="#000000">
          {patientName}
        </text>
        {headerBadgeText ? (
          <g transform={`translate(${badgeX}, ${badgeY})`}>
            <rect x="0" y="0" width={badgeWidth} height={badgeHeight} fill={badgeTheme.fill} stroke={badgeTheme.border} strokeWidth="1.2" rx="6" />
            <text
              x={Math.round(badgeWidth / 2)}
              y={isShort ? 25 : 29}
              textAnchor="middle"
              fontFamily="Arial, Helvetica, -apple-system, sans-serif"
              fontSize={badgeFontSize}
              fontWeight="900"
              fill={badgeTheme.text || "#ffffff"}
              letterSpacing="0.5"
            >
              {headerBadgeText}
            </text>
          </g>
        ) : null}
      </g>

      {/* ── PRODUCT TITLE ── */}
      <text x="60" y={titleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={titleFontSize} fontWeight="900" fill="#000000">
        {productTitle}
      </text>

      {/* ── FORMULA DETAILS (High-contrast, prominent clinical posology) ── */}
      {formulaLines.map((line, idx) => (
        <text
          key={`f-${idx}`}
          x="60"
          y={formulaStartY + (idx * formulaLineGap)}
          fontFamily="Arial, Helvetica, -apple-system, sans-serif"
          fontSize={formulaFontSize}
          fontWeight="700"
          fill={isMono ? '#000000' : '#0f172a'}
        >
          {line}
        </text>
      ))}

      {/* ── DIRECTIONS FOR USE / PRESCRIBED POSOLOGY ── */}
      {directionLines.length > 0 && (
        <g>
          <text
            x="60"
            y={directionsStartY}
            fontFamily="Arial, Helvetica, -apple-system, sans-serif"
            fontSize={dirFontSize}
            fontWeight="900"
            fill={isMono ? '#000000' : '#0284c7'}
            letterSpacing="0.4"
          >
            Directions for use: <tspan fontWeight="700" fill={isMono ? '#000000' : '#0f172a'}>{directionLines[0]}</tspan>
          </text>
          {directionLines.slice(1).map((line, idx) => (
            <text
              key={`d-${idx}`}
              x="60"
              y={directionsStartY + (idx + 1) * dirLineGap}
              fontFamily="Arial, Helvetica, -apple-system, sans-serif"
              fontSize={dirFontSize}
              fontWeight="600"
              fill={isMono ? '#000000' : '#0f172a'}
            >
              {line}
            </text>
          ))}
        </g>
      )}

      {/* ── SOLID DIVIDER LINE ── */}
      <line x1="60" y1={footerLineY} x2="1440" y2={footerLineY} stroke="#000000" strokeWidth="2.2" />

      {/* ── FOOTER ROW: COMPACT EU GMP SPECS (Dates on left, Storage on right in clean technical font) ── */}
      <g transform={`translate(60, ${footerTextY})`}>
        <text x="0" y="0" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
          Mfg: <tspan fontWeight="400">{prodDate}</tspan> • Exp: <tspan fontWeight="400">{expDate}</tspan>
        </text>
        <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={footerFontSize} fontWeight="700" fill={isMono ? '#333333' : '#475569'}>
          Storage: <tspan fontWeight="500" fill={isMono ? '#000000' : '#0f172a'}>{storage}</tspan>
        </text>
      </g>

      {/* ── CUT GUIDES & SCISSOR INDICATOR ── */}
      {renderCutGuides()}
    </svg>
  );
}
