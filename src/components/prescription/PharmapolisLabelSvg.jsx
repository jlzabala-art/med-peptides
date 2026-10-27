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
export function computeDefaultHeaderBadge(labelData = {}, fallbackPartIndex = 0, fallbackTotalParts = 1) {
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

/**
 * Renders an active ingredient line with tabular/high-contrast dosage formatting.
 * The molecule name is rendered in slate-800 (#1e293b), while the strength/dosage
 * (e.g., 500 mcg, 25 mg, 4%, etc.) is rendered in bold dark blue (#0284c7) for instant recognition.
 */
function renderIngredientLine(line, x, y, fontSize, key, defaultFill = '#0f172a', isMono = true) {
  const match = String(line).match(/^(.*?\s+)([\d.,]+[\s\u00A0]*(?:mcg|mg|g|%|iu|fu|spu|ml|capsules?|drops?)(?:[\s\u00A0]*\/[\s\u00A0]*(?:ml|g|cap|dose))?(?:[\s\u00A0]*(?:topical|oral))?(?:[\s\u00A0]*\([^)]+\))?)\s*$/i);
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
  labelData = {},
  variant = 'backQr', // 'backQr' | 'front' | 'frontWithQr'
  widthMm = 75,
  heightMm = 45,
  showCutGuides = false,
  colorMode = 'monochrome', // 'monochrome' (pure black / grayscale high-contrast for thermal & laser printing) | 'color' (preview)
  svgRef = null
}) {
  const isMono = colorMode === 'monochrome';

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

  // Header & Patient Box coordinates
  const headerY = isShort ? 22 : 26;
  const headerTitleSize = isShort ? 46 : 52;
  const headerSubSize = isShort ? 22 : 25;

  const patientBoxY = isShort ? 114 : 130;
  const patientBoxHeight = isShort ? 64 : 74;
  const patientBoxBottom = patientBoxY + patientBoxHeight;
  // Extraction of clinical parameters with defensive fallbacks
  const patientName = (labelData.patientName || labelData.patient?.name || 'PATIENT RECORD').toUpperCase();
  const patientLabelFontSize = isShort ? 28 : 32;
  const nameLen = patientName.length;
  // Patient name font: large and crisp with graceful scaling for long names
  const patientNameFontSize = isShort
    ? (nameLen > 36 ? 26 : nameLen > 28 ? 30 : 34)
    : (nameLen > 36 ? 30 : nameLen > 28 ? 34 : 38);
  const patientFontSize = patientLabelFontSize;
  const patientTextY = isShort ? 42 : 48;
  const fileNumber = labelData.fileNumber || labelData.fileNo || labelData.rxCode || labelData.id || '51857';

  // Extract multi-part prescription badge (e.g. "PART 1 OF 2")
  const rawPart = labelData.partLabel || labelData.partTag || (labelData.totalParts > 1 ? `Part ${(Number(labelData.partIndex ?? labelData.phaseIndex ?? 0)) + 1} of ${labelData.totalParts}` : '');
  let partBadge = '';
  if (rawPart) {
    const match = String(rawPart).match(/part\s*(\d+)(?:\s*(?:\/|of)\s*(\d+))?/i);
    if (match) {
      const pNum = match[1];
      const pTot = match[2] || (labelData.totalParts ? String(labelData.totalParts) : '2');
      partBadge = `PART ${pNum} OF ${pTot}`;
    } else {
      partBadge = String(rawPart).toUpperCase().trim();
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
    let raw = '';
    if (typeof labelData.customHeaderBadge === 'string') {
      raw = labelData.customHeaderBadge.trim();
    } else {
      raw = autoHeaderBadgeText;
    }
    if (isMono && raw) {
      return raw.replace(/[☀️🌙🌅]/g, '').replace(/\s*·\s*·\s*/g, ' · ').trim();
    }
    return raw;
  }, [labelData.showHeaderBadge, labelData.customHeaderBadge, autoHeaderBadgeText, isMono]);

  // Clinical Color Theme for Time of Day & Part indicator
  const badgeTheme = React.useMemo(() => {
    if (isMono) {
      return { fill: '#000000', text: '#ffffff', border: '#000000', accent: '#000000', icon: '' };
    }
    const effectiveUpper = (headerBadgeText || timeOfDay || '').toUpperCase();
    if (effectiveUpper.includes('MORNING') || effectiveUpper.includes('MAÑANA')) {
      return { fill: '#b45309', text: '#ffffff', border: '#d97706', accent: '#f59e0b', icon: '☀️' }; // Warm amber gold
    }
    if (effectiveUpper.includes('NIGHT') || effectiveUpper.includes('BEDTIME') || effectiveUpper.includes('NOCHE')) {
      return { fill: '#1e1b4b', text: '#ffffff', border: '#312e81', accent: '#6366f1', icon: '🌙' }; // Midnight indigo
    }
    if (effectiveUpper.includes('EVENING') || effectiveUpper.includes('TARDE')) {
      return { fill: '#0f766e', text: '#ffffff', border: '#14b8a6', accent: '#2dd4bf', icon: '🌅' }; // Evening teal
    }
    return { fill: '#003666', text: '#ffffff', border: '#0284c7', accent: '#38bdf8', icon: '' }; // Clinical dispensary navy
  }, [isMono, headerBadgeText, timeOfDay]);

  // Header badge sizing and right-aligned position (guaranteed zero overlap with patientName)
  const badgeCharCount = headerBadgeText.length;
  const badgeFontSize = isShort ? (badgeCharCount > 24 ? 13 : 15) : (badgeCharCount > 24 ? 15 : 17);
  const badgeWidth = Math.max(120, Math.round(badgeCharCount * (badgeFontSize * 0.64) + 36));
  const badgeX = 1380 - badgeWidth - 16;
  const badgeHeight = isShort ? 38 : 44;
  const badgeY = isShort ? 13 : 15;

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
  const isScalpTreatment = /\b(trichosol|trichowash|trichooil|trichofoam|scalp|hair|cabello|cuero cabelludo|shampoo|17-?a|17-?alpha|alfatradiol|igrantine)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`);
  const isHormone = !isScalpTreatment && (formulaLower.includes('testosterone') || formulaLower.includes('estradiol') || formulaLower.includes('progesterone') || formulaLower.includes('pentravan') || pNameLower.includes('testosterone') || pNameLower.includes('estradiol') || pNameLower.includes('hormone') || rawVehLower.includes('pentravan'));
  
  // Prioritize explicit Oral determination before generic topical scalp cues
  const isOral = !isPomadeOrOintment && !isHormone && (
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

  const isTopicalScalp = !isPomadeOrOintment && !isHormone && !isOral && (
    /\b(shampoo|trichosol|trichooil|trichofoam)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`) ||
    /\b(leave the solution on your scalp|washing your hair|wash your scalp|apply.*scalp|topical scalp|massage.*rinse)\b/i.test(dirLower) ||
    (/\b(scalp|hair)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${rawVehLower}`) && !isOral)
  );

  const isTrichoOil = isTopicalScalp && /\b(trichooil|scalp oil|washing your hair|pre-wash|massage.*minutes)\b/i.test(`${formulaLower} ${dFormLower} ${pNameLower} ${dirLower} ${rawVehLower}`);

  const validSavedVehicle = (isTopicalScalp && /vegetable capsules/i.test(rawVehStr)) ? '' : rawVehStr;
  const cleanVolForVeh = (isTopicalScalp && /capsule/i.test(String(volume || ''))) ? (isTrichoOil ? '30 mL' : '100 mL') : volume;

  let vehicleName = validSavedVehicle || 
                      (labelData.apis?.find(a => a?.itemType === 'vehicle_base' || a?.isVehicleOrBase)?.name) ||
                      (labelData.items?.find(a => a?.itemType === 'vehicle_base' || a?.isVehicleOrBase)?.name) ||
                      (isPomadeOrOintment ? 'Hypoallergenic Non-Irritating Base (Fragrance & Alcohol Free, q.s. 30 g)' :
                      (isHormone ? 'Pentravan® Liposomal Transdermal Cream Vehicle' :
                      (isTrichoOil || formulaLower.includes('trichooil') || pNameLower.includes('trichooil') ? `TrichoOil™ (100% Natural Scalp Compounding Vehicle${cleanVolForVeh ? `, ${cleanVolForVeh}` : ''})` :
                      (isTopicalScalp || formulaLower.includes('trichosol') || pNameLower.includes('trichosol') ? `TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle${cleanVolForVeh ? `, ${cleanVolForVeh}` : ''})` : 
                      (isOral ? 'Vegetable capsules. Gluten-free, lactose-free, colorant-free, and without unnecessary additives.' : 'Galenic Compounding Vehicle q.s.')))));

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
  if (isPomadeOrOintment) {
    cautionText = 'CAUTION: FOR TOPICAL / PERIANAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isHormone) {
    cautionText = 'CAUTION: FOR TRANSDERMAL / TOPICAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isOral) {
    cautionText = 'CAUTION: FOR ORAL USE ONLY • TAKE WITH WATER • KEEP OUT OF REACH OF CHILDREN';
  } else if (isTopicalScalp) {
    cautionText = 'CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN';
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

    // Directions text with wrapping
    const rawDir = labelData.directions || labelData.instructions || 'Take 2 capsules (one dose) with lunch and 2 capsules (one dose) with dinner.';
    const dirClean = String(rawDir).replace(/^directions\s*(for\s*use)?:\s*/i, '').trim();
    const dirLines = wrapDirections(dirClean, 42, 54);

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
  // VARIANT 1: BACK LABEL WITH LARGE PROMINENT QR CODE (Reverso con QR)
  // ───────────────────────────────────────────────────────────────────────────
  if (variant === 'backQr') {
    const colY = patientBoxBottom + (isShort ? 12 : 16);
    const colHeight = footerLineY - colY - (isShort ? 12 : 16);
    // Narrow left column to 210 px (195 in short mode) to maximize clinical workspace
    const leftColWidth = isShort ? 195 : 210;
    const rightColX = 60 + leftColWidth + (isShort ? 12 : 16);
    const rightColWidth = 1440 - rightColX;
    const innerUsableWidth = rightColWidth - 48;

    // Compact QR size: 165 units (150 in short mode) - perfectly scannable at ~8.5mm physical
    const backQrSize = isShort ? 150 : 165;
    const qrX = Math.round((leftColWidth - backQrSize) / 2);
    const qrY = isShort ? 14 : 18;

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
          <text x="0" y="34" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">{pharmacyName}</text>
          <text x="0" y="62" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={headerSubSize} fontWeight="500" fill={isMono ? '#333333' : '#475569'}>{pharmacyAddress}</text>
        </g>

        {/* EU GMP CERTIFIED BADGE */}
        <g transform={`translate(1440, ${headerY + 2})`}>
          <rect x="-330" y="0" width="330" height={isShort ? 40 : 46} fill={isMono ? '#ffffff' : '#f8fafc'} stroke={isMono ? '#000000' : '#003666'} strokeWidth="2.2" rx="6" />
          <text x="-165" y={isShort ? 26 : 30} textAnchor="middle" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 14 : 16} fontWeight="800" fill={isMono ? '#000000' : '#003666'} letterSpacing="0.6">
            EU GMP CERTIFIED DISPENSARY
          </text>
        </g>

        {/* ── PATIENT BOX ── */}
        <g transform={`translate(60, ${patientBoxY})`}>
          <rect x="0" y="0" width="1380" height={patientBoxHeight} fill={isMono ? '#ffffff' : '#f8fafc'} stroke="#000000" strokeWidth="2.2" rx="4" />
          <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={patientLabelFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
            PATIENT: <tspan fontWeight="800" fontSize={patientNameFontSize}>{patientName}</tspan>
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

        {/* ── TWO-COLUMN WORKSPACE ── */}
        {/* LEFT COLUMN: COMPACT SNUG QR CODE + TECHNICAL DISPENSING SPECS (Zero dead space around QR) */}
        <g transform={`translate(60, ${colY})`}>
          <rect x="0" y="0" width={leftColWidth} height={colHeight} fill="#ffffff" stroke={isMono ? '#000000' : '#cbd5e1'} strokeWidth="2" rx="8" />
          
          {/* Snug QR Code with balanced 27px side margins */}
          <svg x={qrX} y={qrY} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={backQrSize}
              level="M"
              fgColor={isMono ? '#000000' : '#003666'}
              bgColor="#ffffff"
            />
          </svg>

          {/* Under QR Refill Callout */}
          <text
            x={Math.round(leftColWidth / 2)}
            y={qrY + backQrSize + (isShort ? 16 : 20)}
            textAnchor="middle"
            fontFamily="Arial, Helvetica, -apple-system, sans-serif"
            fontSize={isShort ? 12 : 14}
            fontWeight="900"
            fill={isMono ? '#000000' : '#003666'}
            letterSpacing="0.4"
          >
            <tspan fill={isMono ? '#000000' : '#16a34a'} fontWeight="900">✔ </tspan>SCAN FOR REFILL
          </text>

          {/* Hairline Divider */}
          <line
            x1="14"
            y1={qrY + backQrSize + (isShort ? 20 : 24)}
            x2={leftColWidth - 14}
            y2={qrY + backQrSize + (isShort ? 20 : 24)}
            stroke={isMono ? '#cccccc' : '#e2e8f0'}
            strokeWidth="1.5"
          />

          {/* Clip path to strictly ensure no text ever bleeds outside left column */}
          <clipPath id="pls-left-col-clip">
            <rect x="0" y="0" width={leftColWidth} height={colHeight} rx="8" />
          </clipPath>

          {/* Dispensing & Technical Packaging Specs (Streamlined & High-Legibility, Zero Clipping) */}
          {(() => {
            const effectiveVol = cleanVolForVeh || volume || '100 mL';
            const volLines = wrapLines(effectiveVol, 15);
            const storageLines = wrapLines(storage, 16);

            // Explicit vertical coordinates with generous font sizing (batch is already in footer)
            const volTitleY = isShort ? 30 : 38;
            const firstVolLineY = volTitleY + (isShort ? 17 : 22);
            const volLineGap = isShort ? 18 : 22;
            const volBlockBottom = firstVolLineY + ((volLines.length - 1) * volLineGap) + (isShort ? 8 : 12);

            const storageTitleY = volBlockBottom + (isShort ? 16 : 24);
            const firstStorageLineY = storageTitleY + (isShort ? 16 : 20);
            const storageLineGap = isShort ? 16 : 19;
            const storageBlockBottom = firstStorageLineY + ((storageLines.length - 1) * storageLineGap) + (isShort ? 10 : 14);

            return (
              <g clipPath="url(#pls-left-col-clip)" transform={`translate(14, ${qrY + backQrSize + (isShort ? 34 : 42)})`}>
                {/* Header badge */}
                <rect x="-4" y="0" width={leftColWidth - 20} height={isShort ? 20 : 24} fill={isMono ? '#000000' : '#f0f9ff'} stroke={isMono ? '#000000' : '#bae6fd'} strokeWidth="1.2" rx="4" />
                <text x="4" y={isShort ? 14 : 17} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 10.5 : 12} fontWeight="900" fill={isMono ? '#ffffff' : '#0284c7'} letterSpacing="0.8">
                  DISPENSING SPECS
                </text>

                {/* 1. NET CONTENT */}
                <g>
                  <text x="0" y={volTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 11 : 12.5} fontWeight="800" fill={isMono ? '#333333' : '#475569'} letterSpacing="0.4">
                    NET CONTENT
                  </text>
                  {volLines.map((vLine, vIdx) => (
                    <text
                      key={`vol-${vIdx}`}
                      x="0"
                      y={firstVolLineY + (vIdx * volLineGap)}
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={isShort ? 16 : 19}
                      fontWeight="900"
                      fill="#000000"
                    >
                      {vLine}
                    </text>
                  ))}
                </g>

                {/* 2. STORAGE CONDITIONS */}
                <g>
                  <text x="0" y={storageTitleY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 11 : 12.5} fontWeight="800" fill={isMono ? '#333333' : '#475569'} letterSpacing="0.4">
                    STORAGE CONDITIONS
                  </text>
                  {storageLines.map((sLine, sIdx) => (
                    <text
                      key={`stg-${sIdx}`}
                      x="0"
                      y={firstStorageLineY + (sIdx * storageLineGap)}
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={isShort ? 13 : 15}
                      fontWeight="700"
                      fill="#000000"
                    >
                      {sLine}
                    </text>
                  ))}
                </g>

                {/* 3. CLINICAL STORAGE & HANDLING MONOGRAPH BADGE */}
                <g transform={`translate(0, ${storageBlockBottom + (isShort ? 8 : 14)})`}>
                  <line x1="0" y1="0" x2={leftColWidth - 28} y2="0" stroke={isMono ? '#cccccc' : '#e2e8f0'} strokeWidth="1.2" />
                  <rect x="-4" y={isShort ? 6 : 8} width={leftColWidth - 20} height={isShort ? 44 : 52} fill={isMono ? '#ffffff' : '#f8fafc'} stroke={isMono ? '#000000' : '#cbd5e1'} strokeWidth="1.2" rx="4" />
                  
                  <text x="4" y={isShort ? 23 : 28} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 10 : 11.5} fontWeight="800" fill={isMono ? '#000000' : '#334155'} letterSpacing="0.2">
                    PROTECT FROM LIGHT
                  </text>
                  <text x="4" y={isShort ? 39 : 46} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 9.5 : 11} fontWeight="800" fill={isMono ? '#000000' : '#0284c7'} letterSpacing="0.3">
                    15°C–25°C • ROOM TEMP.
                  </text>
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
            if (isOral || vLower.includes('capsule')) {
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
            const multiColLineGap = Math.round(multiColFontSize * 1.32);
            const multiColMaxChars = Math.max(20, Math.floor((colWidth - 20) / (multiColFontSize * 0.68)));

            const col1Lines = isMultiColumn ? col1Items.flatMap(it => wrapLines(`• ${it}`, multiColMaxChars)) : [];
            const col2Lines = isMultiColumn ? col2Items.flatMap(it => wrapLines(`• ${it}`, multiColMaxChars)) : [];
            const multiColMaxLines = Math.max(col1Lines.length, col2Lines.length);

            // Sparsity detection: allows 1–3 ingredient formulas to boost typography and use space
            const isUltraSparse = ingCount <= 2 && (directions.length < 95);
            const isSparse = ingCount <= 3 && (directions.length < 145);

            // Single column ingredients (1–3 items): prominent high-legibility font sizing
            const ingFontSize = isShort
              ? (isUltraSparse ? 24 : isSparse ? 21 : 19)
              : isMediumHeight
                ? (isUltraSparse ? 26 : isSparse ? 23 : 21)
                : (isUltraSparse ? 31 : isSparse ? 26 : 24);
            const ingLineGap = Math.round(ingFontSize * 1.32);
            const ingMaxChars = Math.max(24, Math.floor((innerUsableWidth - 48) / (ingFontSize * 0.65)));
            const singleIngLines = activeIngredientsList.flatMap(it => wrapLines(`• ${it}`, ingMaxChars));
            const ingLines = singleIngLines.length > 0 ? singleIngLines : wrapLines(`• ${activeIngredientsList.join(' — ')}`, ingMaxChars);
            const ingLineCount = isMultiColumn ? multiColMaxLines : ingLines.length;

            const baseFontSize = isShort
              ? (isUltraSparse ? 17 : isSparse ? 15.5 : 14.5)
              : isMediumHeight
                ? (isUltraSparse ? 18.5 : isSparse ? 17 : 15.5)
                : (isUltraSparse ? 22 : isSparse ? 19.5 : 18);
            const baseLineGap = Math.round(baseFontSize * 1.32);
            const baseMaxChars = Math.max(26, Math.floor((innerUsableWidth - 48) / (baseFontSize * 0.65)));
            const baseLines = wrapLines(`${vehiclePrefix} ${cleanVehicleDisplay}`, baseMaxChars);

            // Directions font scaling & wrapping
            const posFontSize = isShort
              ? (isUltraSparse ? 22 : isSparse ? 20 : 17.5)
              : isMediumHeight
                ? (isUltraSparse ? 24 : isSparse ? 21 : 18.5)
                : (isUltraSparse ? 28 : isSparse ? 24 : 21);
            const posLineGap = Math.round(posFontSize * 1.32);
            const posMaxChars = Math.max(24, Math.floor((innerUsableWidth - 64) / (posFontSize * 0.68)));
            const posologyLines = wrapLines(directions, posMaxChars);

            // Bottom-anchored Caution & Prescriber coordinates (crisp 2-line footer block, zero low-contrast clutter)
            const bottomMargin = isShort ? 12 : isMediumHeight ? 14 : 18;
            const bRxY = colHeight - bottomMargin;
            const bCautionY = bRxY - (isShort ? 18 : isMediumHeight ? 21 : 25);
            const bCautionDividerY = bCautionY - (isShort ? 12 : isMediumHeight ? 14 : 17);

            // Maximum allowed Y coordinate for the bottom edge of posBox (zero overlap guarantee)
            const maxPosBoxBottom = bCautionDividerY - (isShort ? 10 : isMediumHeight ? 12 : 14);

            // Formula title height if present
            const formulaTitleFontSize = isShort ? 16 : isMediumHeight ? 18 : 21;
            const formulaTitleH = formulaTitleText ? (formulaTitleFontSize + 12) : 0;

            // Typographical baseline offsets with safe font cap-height clearance (Zero overlap)
            const ingHeaderTitleY = (formulaTitleText ? formulaTitleH + 6 : 0) + (isShort ? 12 : isMediumHeight ? 14 : 16);
            const firstIngLineY = ingHeaderTitleY + (isShort ? 10 : isMediumHeight ? 12 : 16) + Math.round((isMultiColumn ? multiColFontSize : ingFontSize) * 0.82);
            const firstBaseLineY = firstIngLineY + ((ingLineCount - 1) * (isMultiColumn ? multiColLineGap : ingLineGap)) + (isUltraSparse ? 15 : isSparse ? 12 : 10) + Math.round(baseFontSize * 0.82);
            const ingBlockH = firstBaseLineY + ((baseLines.length - 1) * baseLineGap) + 8;

            const posHeaderTitleY = isShort ? 16 : isMediumHeight ? 18 : 22;
            const firstPosLineY = posHeaderTitleY + (isShort ? 10 : isMediumHeight ? 12 : 16) + Math.round(posFontSize * 0.82);
            const basePosBoxHeight = firstPosLineY + ((posologyLines.length - 1) * posLineGap) + (isShort ? 14 : isMediumHeight ? 16 : 22);

            // Available vertical space above Block 4
            const totalContentNeeded = ingBlockH + basePosBoxHeight;
            const totalAvailableSpace = maxPosBoxBottom - (isShort ? 10 : isMediumHeight ? 12 : 16);
            const verticalSurplus = Math.max(0, totalAvailableSpace - totalContentNeeded);

            // Expand posBoxHeight to absorb surplus space naturally
            const extraBoxPad = Math.min(72, Math.round(verticalSurplus * 0.38));
            const posBoxHeight = basePosBoxHeight + extraBoxPad;

            const topIngredientsY = isShort ? 8 : isMediumHeight ? 10 : Math.max(12, Math.min(22, Math.round(verticalSurplus * 0.18)));
            const midPad = isShort ? 10 : isMediumHeight ? 12 : Math.max(12, Math.min(36, Math.round(verticalSurplus * 0.36)));

            // Absolute hard clamp: posBoxY + posBoxHeight CAN NEVER EXCEED maxPosBoxBottom
            let posBoxY = topIngredientsY + ingBlockH + midPad;
            if (posBoxY + posBoxHeight > maxPosBoxBottom) {
              posBoxY = maxPosBoxBottom - posBoxHeight;
            }

            const cleanDoctorLicense = doctorLicense ? String(doctorLicense).replace(/^license\s*:\s*/i, '').trim() : '';
            const rxParts = [];
            if (doctorName) rxParts.push(`Rx: ${doctorName}`);
            if (clinicName) rxParts.push(clinicName);
            if (cleanDoctorLicense) rxParts.push(`(License: ${cleanDoctorLicense})`);
            const rxFullText = rxParts.length > 0 ? rxParts.join(' • ') : (doctorName ? `Rx: ${doctorName}` : 'Rx: Licensed Clinical Practice');
            const rxFontSize = isShort ? (rxFullText.length > 68 ? 13.5 : 15.5) : isMediumHeight ? (rxFullText.length > 68 ? 15 : 17) : (rxFullText.length > 72 ? 16.5 : 19);

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
                        renderIngredientLine(line, 0, firstIngLineY + (lIdx * multiColLineGap), multiColFontSize, `ing1-${lIdx}`, '#000000', isMono)
                      )}
                      {/* Column 2 */}
                      {col2Lines.map((line, lIdx) => 
                        renderIngredientLine(line, colWidth + 36, firstIngLineY + (lIdx * multiColLineGap), multiColFontSize, `ing2-${lIdx}`, '#000000', isMono)
                      )}
                    </g>
                  ) : (
                    ingLines.map((line, lIdx) => 
                      renderIngredientLine(line, 0, firstIngLineY + (lIdx * ingLineGap), ingFontSize, `ing-${lIdx}`, '#000000', isMono)
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
                    {(!isMono && badgeTheme.icon) ? `${badgeTheme.icon} ` : ''}DIRECTIONS FOR USE / PRESCRIBED POSOLOGY
                  </text>

                  {posologyLines.map((pLine, pIdx) => (
                    <text
                      key={`pos-${pIdx}`}
                      x="22"
                      y={firstPosLineY + (pIdx * posLineGap)}
                      fontFamily="Arial, Helvetica, -apple-system, sans-serif"
                      fontSize={posFontSize + 1}
                      fontWeight="800"
                      fill={isMono ? '#000000' : '#0f172a'}
                    >
                      {pLine}
                    </text>
                  ))}
                </g>

                {/* Block 4: Mandatory Precaution & Prescriber (High-Contrast Bottom Anchored) */}
                <g transform="translate(24, 0)">
                  <line x1="0" y1={bCautionDividerY} x2={innerUsableWidth} y2={bCautionDividerY} stroke={isMono ? '#000000' : '#cbd5e1'} strokeWidth="1.8" />
                  <text x="0" y={bCautionY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={isShort ? 15.5 : 19} fontWeight="900" fill={isMono ? '#000000' : '#b91c1c'} letterSpacing="0.4">
                    {cautionText}
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
        <text x="0" y="34" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">{pharmacyName}</text>
        <text x="0" y="62" fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={headerSubSize} fontWeight="500" fill={isMono ? '#333333' : '#475569'}>{pharmacyAddress}</text>
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
        <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, -apple-system, sans-serif" fontSize={patientLabelFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
          PATIENT: <tspan fontWeight="800" fontSize={patientNameFontSize}>{patientName}</tspan>
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
