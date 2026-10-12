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
  const clean = String(text).replace(/^directions\s*(for\s*use)?:\s*/i, '').trim();
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
  showCutGuides = true,
  svgRef = null
}) {
  // Base coordinates: 1500 px base width, dynamic responsive height
  const WIDTH = 1500;
  const HEIGHT = Math.round((heightMm / widthMm) * 1500) || 900;

  // Responsive height tiers
  const isShort = HEIGHT < 720; // e.g. 90x38 mm (633 px)
  const isMediumHeight = HEIGHT >= 720 && HEIGHT < 850; // e.g. 100x50 mm (750 px)

  // Pin footer elements dynamically to bottom of canvas (Compact EU GMP / USP technical specs bar)
  const footerLineY = HEIGHT - (isShort ? 44 : isMediumHeight ? 50 : 56);
  const footerTextY = HEIGHT - (isShort ? 15 : isMediumHeight ? 17 : 19);
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
  const productTitle = labelData.productTitle || labelData.productName || 'Compounded Pharmaceutical Protocol';
  const formula = labelData.formula || '';
  const rawDirections = labelData.directions || labelData.instructions || 'Take / apply as directed by prescribing physician.';
  const directions = React.useMemo(() => {
    let d = String(rawDirections).trim();
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
  const clinicName = labelData.clinicName !== undefined && labelData.clinicName !== null ? String(labelData.clinicName).trim() : (labelData.clinic || '');
  const doctorLicense = labelData.doctorLicense !== undefined && labelData.doctorLicense !== null ? String(labelData.doctorLicense).trim() : (labelData.license || '');
  const batchCode = labelData.batchCode || 'PHARM-2026-B948';
  const lote = labelData.lote || '2609-PLV';
  const volume = labelData.volume || labelData.netVolume || labelData.size || labelData.netContent || labelData.totalVolume || labelData.quantity || '100 mL';
  
  // Dynamic Dispensing Pharmacy Name & Address
  const rawPharmacyName = (labelData.pharmacyName || labelData.pharmacy || labelData.dispensingPharmacy || 'PHARMAPOLIS').trim();
  const pharmacyName = rawPharmacyName.toUpperCase();
  const pharmacyAddress = labelData.pharmacyAddress || labelData.dispensaryAddress || '1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria';
  const dynHeaderTitleSize = pharmacyName.length > 26 
    ? Math.round(headerTitleSize * 0.72) 
    : pharmacyName.length > 18 
      ? Math.round(headerTitleSize * 0.84) 
      : headerTitleSize;

  // Unique QR URL strictly bound to this prescription (pointing to patient view)
  const targetRxUrl = labelData.targetRxUrl || labelData.url || `https://med-peptides.com/rx/${fileNumber}?view=patient`;
  const cleanDisplayUrl = targetRxUrl.replace(/^https?:\/\//, '');

  // Extract active ingredients list for Block 2 (Back Label)
  const activeIngredientsList = React.useMemo(() => {
    if (Array.isArray(labelData.apis) && labelData.apis.length > 0) {
      const filtered = labelData.apis.filter(a => {
        const n = (a.drugName || a.drug || a.name || a.productName || a.activeIngredient || '').toLowerCase();
        const f = (a.dosageForm || a.form || '').toLowerCase();
        const isVeh = a.isVehicle || a.isVehicleOrBase || a._isVehicleOrBase || a.itemType === 'vehicle_base' || f.includes('vehicle') || n.includes('vehicle') || n.includes('trichosol') || n.includes('trichooil') || n.includes('pentravan') || n.includes('pomade base') || n.includes('ointment base');
        return !isVeh;
      });
      if (filtered.length > 0) {
        return filtered.map(a => {
          let name = String(a.drugName || a.drug || a.name || a.productName || a.activeIngredient || 'API').trim();
          let dose = a.dosage || a.dose || a.strength || a.concentration || '';
          if (dose) {
            dose = String(dose)
              .replace(/Tópico/gi, 'Topical')
              .replace(/Oral/gi, 'Oral')
              .replace(/Dosis a calibrar/gi, 'Standard Compounded Strength')
              .replace(/Dose to calibrate/gi, '3% Topical')
              .trim();
          } else {
            const nLower = name.toLowerCase();
            if (nLower.includes('prostaquinon')) dose = '3% Topical';
            else if (nLower.includes('minoxidil')) dose = '5% Topical';
            else if (nLower.includes('latanoprost')) dose = '0.005% Topical';
          }

          // Anti-duplication engine: if name already ends with concentration/dosage that dose repeats
          // Example: name = "Diltiazem Hydrochloride 2%", dose = "2% (0.6 g)" -> "Diltiazem Hydrochloride 2% (0.6 g)"
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
      const nonVehParts = parts.filter(p => !p.toLowerCase().includes('vehicle') && !p.toLowerCase().includes('trichosol') && !p.toLowerCase().includes('trichooil') && !p.toLowerCase().includes('pentravan') && !p.toLowerCase().includes('base'));
      if (nonVehParts.length > 0) {
        return nonVehParts.map(p => p.replace(/Tópico/gi, 'Topical').replace(/Oral/gi, 'Oral'));
      }
    }
    return ['Personalized Compounded Active Formula'];
  }, [labelData.apis, formula]);

  const formulaLower = (formula || '').toLowerCase();
  const dFormLower = (labelData.dosageForm || '').toLowerCase();
  const pNameLower = (labelData.productName || productTitle || '').toLowerCase();

  const isPomadeOrOintment = formulaLower.includes('pomade') || formulaLower.includes('pomada') || formulaLower.includes('ointment') || formulaLower.includes('diltiazem') || dFormLower.includes('ointment') || dFormLower.includes('pomade');
  const isHormone = formulaLower.includes('testosterone') || formulaLower.includes('estradiol') || formulaLower.includes('progesterone') || formulaLower.includes('pentravan') || pNameLower.includes('testosterone') || pNameLower.includes('estradiol') || pNameLower.includes('hormone');
  const isOral = dFormLower.includes('oral') || dFormLower.includes('capsule') || formulaLower.includes('capsule') || formulaLower.includes('nattokinase') || formulaLower.includes('serrapeptase');

  let vehicleName = (typeof labelData.vehicle === 'string' ? labelData.vehicle : labelData.vehicle?.name) || 
                      (labelData.apis?.find(a => a.itemType === 'vehicle_base' || a.isVehicleOrBase)?.name) ||
                      (isPomadeOrOintment ? 'Hypoallergenic Non-Irritating Base (Fragrance & Alcohol Free, q.s. 30 g)' :
                      (isHormone ? 'Pentravan® Liposomal Transdermal Cream Vehicle' :
                      (formulaLower.includes('trichosol') || pNameLower.includes('trichosol') ? `TrichoSol™ (Alcohol-Free Hydrophilic Compounding Vehicle${volume ? `, ${volume}` : ''})` : 
                      (formulaLower.includes('trichooil') || pNameLower.includes('trichooil') ? `TrichoOil™ (100% Natural Scalp Compounding Vehicle${volume ? `, ${volume}` : ''})` : 
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

  let cautionText = 'CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  if (isPomadeOrOintment) {
    cautionText = 'CAUTION: FOR TOPICAL / PERIANAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isHormone) {
    cautionText = 'CAUTION: FOR TRANSDERMAL / TOPICAL USE ONLY • KEEP OUT OF REACH OF CHILDREN';
  } else if (isOral) {
    cautionText = 'CAUTION: FOR ORAL USE ONLY • TAKE WITH WATER • KEEP OUT OF REACH OF CHILDREN';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COMPONENT: PROFESSIONAL CROP MARKS & SOLID CUT GUIDES
  // ───────────────────────────────────────────────────────────────────────────
  const renderCutGuides = () => {
    if (!showCutGuides) return null;
    return (
      <g className="pharmacy-cut-guides" pointerEvents="none">
        {/* Perimeter Solid Fine Hairline Border - Strictly No Dashed Strokes */}
        <rect
          x="3"
          y="3"
          width={WIDTH - 6}
          height={HEIGHT - 6}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1.5"
          rx="2"
        />

        {/* 4 Professional Corner Crop Marks (Standard Imprenta) */}
        {/* Top-Left */}
        <line x1="0" y1="0" x2="38" y2="0" stroke="#475569" strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="38" stroke="#475569" strokeWidth="3" />

        {/* Top-Right */}
        <line x1={WIDTH} y1="0" x2={WIDTH - 38} y2="0" stroke="#475569" strokeWidth="3" />
        <line x1={WIDTH} y1="0" x2={WIDTH} y2="38" stroke="#475569" strokeWidth="3" />

        {/* Bottom-Left */}
        <line x1="0" y1={HEIGHT} x2="38" y2={HEIGHT} stroke="#475569" strokeWidth="3" />
        <line x1="0" y1={HEIGHT} x2="0" y2={HEIGHT - 38} stroke="#475569" strokeWidth="3" />

        {/* Bottom-Right */}
        <line x1={WIDTH} y1={HEIGHT} x2={WIDTH - 38} y2={HEIGHT} stroke="#475569" strokeWidth="3" />
        <line x1={WIDTH} y1={HEIGHT} x2={WIDTH} y2={HEIGHT - 38} stroke="#475569" strokeWidth="3" />

        {/* Top Scissor Cut Indicator Badge */}
        <g transform="translate(56, 0)">
          <rect x="0" y="0" width="240" height="24" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" rx="4" />
          <text
            x="120"
            y="17"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="14"
            fontWeight="800"
            fill="#475569"
            letterSpacing="0.8"
          >
            ✂ CUT LINE · {widthMm}×{heightMm} mm
          </text>
        </g>

        {/* Right Edge Scissor Cut Indicator Badge */}
        <g transform={`translate(${WIDTH}, ${Math.round(HEIGHT / 2) - 40}) rotate(90)`}>
          <rect x="0" y="-12" width="80" height="24" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.2" rx="4" />
          <text
            x="40"
            y="5"
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize="13"
            fontWeight="800"
            fill="#475569"
            letterSpacing="0.6"
          >
            ✂ CUT
          </text>
        </g>
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
          fill="#1e293b"
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
    // Narrow left column from 340 to 235 px to eliminate wide empty margins around QR
    const leftColWidth = isShort ? 215 : 235;
    const rightColX = 60 + leftColWidth + (isShort ? 14 : 18);
    const rightColWidth = 1440 - rightColX;
    const innerUsableWidth = rightColWidth - 48;

    // Compact QR size: 180 units (160 in short mode) - perfectly scannable at ~9mm physical
    const backQrSize = isShort ? 160 : 180;
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
        style={{ display: 'block', background: '#ffffff', borderRadius: '4px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />

        {/* ── HEADER ── */}
        <g transform={`translate(60, ${headerY})`}>
          <text x="0" y="34" fontFamily="Arial, Helvetica, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">{pharmacyName}</text>
          <text x="0" y="62" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize} fontWeight="500" fill="#475569">{pharmacyAddress}</text>
        </g>

        {/* EU GMP CERTIFIED BADGE */}
        <g transform={`translate(1440, ${headerY + 2})`}>
          <rect x="-330" y="0" width="330" height={isShort ? 40 : 46} fill="#f8fafc" stroke="#003666" strokeWidth="2" rx="6" />
          <text x="-165" y={isShort ? 26 : 30} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 16} fontWeight="800" fill="#003666" letterSpacing="0.6">
            EU GMP CERTIFIED DISPENSARY
          </text>
        </g>

        {/* ── PATIENT BOX ── */}
        <g transform={`translate(60, ${patientBoxY})`}>
          <rect x="0" y="0" width="1380" height={patientBoxHeight} fill="#f8fafc" stroke="#000000" strokeWidth="2.2" rx="4" />
          <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, sans-serif" fontSize={patientLabelFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
            PATIENT: <tspan fontWeight="800" fontSize={patientNameFontSize}>{patientName}</tspan>
          </text>
          <text x="1356" y={patientTextY} textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={patientLabelFontSize} fontWeight="800" fill="#003666">
            FILE #{fileNumber}
          </text>
        </g>

        {/* ── TWO-COLUMN WORKSPACE ── */}
        {/* LEFT COLUMN: COMPACT SNUG QR CODE + TECHNICAL DISPENSING SPECS (Zero dead space around QR) */}
        <g transform={`translate(60, ${colY})`}>
          <rect x="0" y="0" width={leftColWidth} height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />
          
          {/* Snug QR Code with balanced 27px side margins */}
          <svg x={qrX} y={qrY} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={backQrSize}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>

          {/* Under QR Refill Callout */}
          <text
            x={Math.round(leftColWidth / 2)}
            y={qrY + backQrSize + (isShort ? 18 : 22)}
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={isShort ? 13 : 15}
            fontWeight="900"
            fill="#003666"
            letterSpacing="0.4"
          >
            <tspan fill="#16a34a" fontWeight="900">✔ </tspan>SCAN FOR REFILL
          </text>

          {/* Hairline Divider */}
          <line
            x1="14"
            y1={qrY + backQrSize + (isShort ? 26 : 32)}
            x2={leftColWidth - 14}
            y2={qrY + backQrSize + (isShort ? 26 : 32)}
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />

          {/* Clip path to strictly ensure no text ever bleeds outside left column */}
          <clipPath id="pls-left-col-clip">
            <rect x="0" y="0" width={leftColWidth} height={colHeight} rx="8" />
          </clipPath>

          {/* Dispensing & Technical Packaging Specs (fully legible, dynamic vertical flow, zero cut-off or collision) */}
          {(() => {
            const volLines = wrapLines(volume, 16);
            const batchLines = wrapLines(batchCode, 15);
            const storageLines = wrapLines(storage, 17);

            const volY = isShort ? 16 : 22;
            const volLineGap = isShort ? 15 : 18;
            const volTotalH = volY + (volLines.length * volLineGap);

            const batchY = volTotalH + (isShort ? 10 : 14);
            const batchLineGap = isShort ? 14 : 16;
            const batchTotalH = batchY + (batchLines.length * batchLineGap);

            const storageY = batchTotalH + (isShort ? 10 : 14);
            const storageLineGap = isShort ? 13 : 16;

            return (
              <g clipPath="url(#pls-left-col-clip)" transform={`translate(14, ${qrY + backQrSize + (isShort ? 40 : 48)})`}>
                {/* Header badge */}
                <rect x="-4" y="-14" width={leftColWidth - 20} height={isShort ? 20 : 22} fill="#f0f9ff" rx="4" />
                <text x="2" y={isShort ? 0 : 2} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
                  DISPENSING SPECS
                </text>

                {/* 1. NET CONTENT */}
                <g transform={`translate(0, ${volY})`}>
                  <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="800" fill="#64748b" letterSpacing="0.4">
                    NET CONTENT
                  </text>
                  {volLines.map((vLine, vIdx) => (
                    <text
                      key={`vol-${vIdx}`}
                      x="0"
                      y={volLineGap + (vIdx * volLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={isShort ? 13 : 15}
                      fontWeight="900"
                      fill="#0f172a"
                    >
                      {vLine}
                    </text>
                  ))}
                </g>

                {/* 2. DISPENSING BATCH */}
                <g transform={`translate(0, ${batchY})`}>
                  <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="800" fill="#64748b" letterSpacing="0.4">
                    DISPENSING BATCH
                  </text>
                  {batchLines.map((bLine, bIdx) => (
                    <text
                      key={`bch-${bIdx}`}
                      x="0"
                      y={batchLineGap + (bIdx * batchLineGap)}
                      fontFamily="monospace"
                      fontSize={isShort ? 12 : 14}
                      fontWeight="900"
                      fill="#003666"
                    >
                      {bLine}
                    </text>
                  ))}
                </g>

                {/* 3. STORAGE */}
                <g transform={`translate(0, ${storageY})`}>
                  <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 10 : 11} fontWeight="800" fill="#64748b" letterSpacing="0.4">
                    STORAGE CONDITIONS
                  </text>
                  {storageLines.map((sLine, sIdx) => (
                    <text
                      key={`stg-${sIdx}`}
                      x="0"
                      y={storageLineGap + (sIdx * storageLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={isShort ? 11 : 13}
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {sLine}
                    </text>
                  ))}
                </g>
              </g>
            );
          })()}
        </g>

        {/* RIGHT COLUMN: EXPANDED HIGH-LEGIBILITY CLINICAL WORKSPACE (Width 1125 px) */}
        <g transform={`translate(${rightColX}, ${colY})`}>
          <rect x="0" y="0" width={rightColWidth} height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />

          {/* INGREDIENTS, DIRECTIONS, AND TIGHT CAUTION (Bottom-Up Anchored) */}
          {(() => {
            const ingCount = activeIngredientsList.length;
            const topIngredientsY = isShort ? 16 : 22;

            // ── BOTTOM-UP ANCHOR CALCULATIONS ──
            const bottomMargin = isShort ? 14 : 18;
            const bMonographsY = colHeight - bottomMargin;
            const bRxY = bMonographsY - (isShort ? 16 : 20);
            const bCautionY = bRxY - (isShort ? 18 : 22);
            const bCautionDividerY = bCautionY - (isShort ? 12 : 14);
            const gapDirectionsToCaution = isShort ? 12 : 14;
            const posBoxBottomY = bCautionDividerY - gapDirectionsToCaution;

            // Directions Box Dimensions
            const posologyLines = wrapLines(directions, isShort ? 58 : 70);
            const posFontSize = isShort ? 20 : (posologyLines.length <= 2 ? 26 : 23);
            const posLineGap = isShort ? 26 : 33;
            const posBoxHeight = (isShort ? 36 : 42) + (posologyLines.length * posLineGap);
            const posBoxY = posBoxBottomY - posBoxHeight;
            const posTextPadTop = isShort ? 38 : 44;

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

            const baseLines = wrapLines(`${vehiclePrefix} ${cleanVehicleDisplay}`, isShort ? 70 : 86);
            const baseFontSize = isShort ? 17 : (cleanVehicleDisplay.length > 55 ? 20 : 22);
            const baseLineGap = isShort ? 23 : 28;

            // ── COMPACT INLINE INGREDIENTS WITH EM-DASH (Flowing layout) ──
            // Stacking every ingredient vertically wastes massive vertical space and forces tiny fonts.
            // Joining them with ' — ' flows them continuously into 2-3 lines, saving ~140px of vertical space
            // and allowing a much larger, high-contrast typography (USP / EU GMP compliant).
            const rawIngText = activeIngredientsList.length === 1
              ? `• ${activeIngredientsList[0]}`
              : `• ${activeIngredientsList.join('  —  ')}`;
            const ingLines = wrapLines(rawIngText, isShort ? 66 : 78);
            const ingLineCount = ingLines.length;

            // Space available for ingredients & base above Posology
            const gapIngToDirections = isShort ? 12 : 16;
            const availableUpperH = Math.max(200, posBoxY - topIngredientsY - gapIngToDirections);
            const estBaseH = (baseLines.length * baseLineGap) + (isShort ? 16 : 22);
            const spaceForApis = Math.max(80, availableUpperH - estBaseH);

            // Generous dynamic font size and spacing to evenly balance upper canvas with zero dead void
            const rawIngGap = Math.floor(spaceForApis / Math.max(1, ingLineCount));
            const ingLineGap = isShort
              ? Math.max(28, Math.min(42, rawIngGap))
              : Math.max(30, Math.min(46, rawIngGap));
            const ingFontSize = Math.min(isShort ? 25 : 29, Math.max(isShort ? 19 : 22, Math.round(ingLineGap * 0.72)));

            const baseStartY = (isShort ? 26 : 32) + (ingLineCount * ingLineGap) + (isShort ? 8 : 12);

            const rxParts = [];
            if (doctorName) rxParts.push(`Rx: ${doctorName}`);
            if (clinicName) rxParts.push(clinicName);
            if (doctorLicense) rxParts.push(`(${doctorLicense})`);
            const rxFullText = rxParts.length > 0 ? rxParts.join(' • ') : (doctorName ? `Rx: ${doctorName}` : 'Rx: Licensed Clinical Practice');
            const rxFontSize = isShort ? (rxFullText.length > 65 ? 13 : 15) : (rxFullText.length > 70 ? 15 : 17);

            return (
              <>
                {/* Block 2: ACTIVE COMPOUNDED INGREDIENTS & BASE (Continuous Flowing Layout) */}
                <g transform={`translate(24, ${topIngredientsY})`}>
                  <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 17} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
                    ACTIVE COMPOUNDED INGREDIENTS
                  </text>
                  
                  {ingLines.map((line, lIdx) => (
                    <text
                      key={`ing-${lIdx}`}
                      x="0"
                      y={(isShort ? 26 : 32) + (lIdx * ingLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={ingFontSize}
                      fontWeight="800"
                      fill="#0f172a"
                    >
                      {line}
                    </text>
                  ))}

                  {baseLines.map((bLine, bIdx) => (
                    <text
                      key={`base-${bIdx}`}
                      x="0"
                      y={baseStartY + (bIdx * baseLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={baseFontSize}
                      fontWeight="700"
                      fill="#0369a1"
                    >
                      {bLine}
                    </text>
                  ))}
                </g>

                {/* Block 3: DEDICATED CLINICAL POSOLOGY & DIRECTIONS (Anchored above Caution) */}
                <g transform={`translate(24, ${posBoxY})`}>
                  <rect x="0" y="0" width={innerUsableWidth} height={posBoxHeight} fill="#f8fafc" stroke="#bae6fd" strokeWidth="1.8" rx="6" />
                  <rect x="0" y="0" width="6" height={posBoxHeight} fill="#0284c7" rx="3" />
                  
                  <text x="18" y={isShort ? 20 : 24} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 16} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
                    DIRECTIONS FOR USE / PRESCRIBED POSOLOGY
                  </text>

                  {posologyLines.map((pLine, pIdx) => (
                    <text
                      key={`pos-${pIdx}`}
                      x="18"
                      y={posTextPadTop + (pIdx * posLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={posFontSize}
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {pLine}
                    </text>
                  ))}
                </g>

                {/* Block 4: Mandatory Precaution & Prescriber (Bottom Anchored) */}
                <g transform="translate(24, 0)">
                  <line x1="0" y1={bCautionDividerY} x2={innerUsableWidth} y2={bCautionDividerY} stroke="#e2e8f0" strokeWidth="1.8" />
                  <text x="0" y={bCautionY} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 17} fontWeight="800" fill="#b91c1c" letterSpacing="0.4">
                    {cautionText}
                  </text>
                  <text
                    x="0"
                    y={bRxY}
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize={rxFontSize}
                    fontWeight="600"
                    fill="#475569"
                  >
                    {rxFullText}
                  </text>
                  <text
                    x="0"
                    y={bMonographsY}
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize={isShort ? 11 : 13}
                    fontWeight="600"
                    fill="#94a3b8"
                  >
                    Compound prepared in compliance with EU GMP &amp; Pharmacopoeia monographs.
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
          <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
            Mfg: <tspan fontWeight="400">{prodDate}</tspan> • Exp: <tspan fontWeight="400">{expDate}</tspan>
          </text>
          <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#475569">
            Batch: <tspan fontWeight="800" fill="#003666">{batchCode}</tspan> • <tspan fontWeight="500" fill="#0f172a">EU GMP Monograph</tspan>
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

  // Dynamic typography scale: calibrated to 9.5pt - 11.5pt physical print equivalents
  const titleFontSize = isShort ? 38 : (productTitle.length > 48 ? 44 : 50); // ~11.5 pt
  const formulaFontSize = isShort ? 32 : 38; // ~10.5 pt
  const formulaLineGap = isShort ? 46 : 54;
  const dirFontSize = isShort ? 29 : 35;     // ~9.5 pt
  const dirLineGap = isShort ? 44 : 52;

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
      style={{ display: 'block', background: '#ffffff', borderRadius: '4px' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={WIDTH} height={HEIGHT} fill="#ffffff" />

      {/* ── HEADER ── */}
      <g transform={`translate(60, ${headerY})`}>
        <text x="0" y="34" fontFamily="Arial, Helvetica, sans-serif" fontSize={dynHeaderTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">{pharmacyName}</text>
        <text x="0" y="62" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize} fontWeight="500" fill="#475569">{pharmacyAddress}</text>
      </g>

      {/* MICRO-QR (IF ENABLED): Guaranteed zero overlap with patient box */}
      {withMicroQr && (
        <g transform={`translate(${microQrX}, ${microQrY})`}>
          <rect x="0" y="0" width={microQrWidth} height={microQrHeight} fill="#ffffff" stroke="#003666" strokeWidth="2.2" rx="8" />
          <svg x={Math.round((microQrWidth - qrInnerSize) / 2)} y="8" width={qrInnerSize} height={qrInnerSize} viewBox={`0 0 ${qrInnerSize} ${qrInnerSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={qrInnerSize}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>
          <text x={Math.round(microQrWidth / 2)} y={scanRxY} fontFamily="Arial, Helvetica, sans-serif" fontSize={scanRxSize} fontWeight="900" fill="#003666" textAnchor="middle" letterSpacing="0.8">
            SCAN RX
          </text>
        </g>
      )}

      {/* ── PATIENT BOX ── */}
      <g transform={`translate(60, ${patientBoxY})`}>
        <rect x="0" y="0" width="1380" height={patientBoxHeight} fill="#f8fafc" stroke="#000000" strokeWidth="2.2" rx="4" />
        <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, sans-serif" fontSize={patientLabelFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
          PATIENT: <tspan fontWeight="800" fontSize={patientNameFontSize}>{patientName}</tspan>
        </text>
        <text x="1356" y={patientTextY} textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={patientLabelFontSize} fontWeight="800" fill="#003666">
          RX #{fileNumber}
        </text>
      </g>

      {/* ── PRODUCT TITLE ── */}
      <text x="60" y={titleY} fontFamily="Arial, Helvetica, sans-serif" fontSize={titleFontSize} fontWeight="900" fill="#000000">
        {productTitle}
      </text>

      {/* ── FORMULA DETAILS (High-contrast, prominent clinical posology) ── */}
      {formulaLines.map((line, idx) => (
        <text
          key={`f-${idx}`}
          x="60"
          y={formulaStartY + (idx * formulaLineGap)}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={formulaFontSize}
          fontWeight="700"
          fill="#0f172a"
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
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={dirFontSize}
            fontWeight="900"
            fill="#0284c7"
            letterSpacing="0.4"
          >
            Directions for use: <tspan fontWeight="700" fill="#0f172a">{directionLines[0]}</tspan>
          </text>
          {directionLines.slice(1).map((line, idx) => (
            <text
              key={`d-${idx}`}
              x="60"
              y={directionsStartY + (idx + 1) * dirLineGap}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={dirFontSize}
              fontWeight="600"
              fill="#0f172a"
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
        <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
          Mfg: <tspan fontWeight="400">{prodDate}</tspan> • Exp: <tspan fontWeight="400">{expDate}</tspan>
        </text>
        <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#475569">
          Storage: <tspan fontWeight="500" fill="#0f172a">{storage}</tspan>
        </text>
      </g>

      {/* ── CUT GUIDES & SCISSOR INDICATOR ── */}
      {renderCutGuides()}
    </svg>
  );
}
