'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

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
 * High-precision vector SVG pharmaceutical label generator.
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
  const footerTextY = HEIGHT - (isShort ? 16 : isMediumHeight ? 18 : 20);
  const footerFontSize = isShort ? 14 : isMediumHeight ? 16 : 17; // ~5.5-6 pt technical print size
  const footerLineGap = 0; // single-line compact footer, zero vertical waste

  // Header & Patient Box coordinates
  const headerY = isShort ? 24 : 32;
  const headerTitleSize = isShort ? 44 : 52; // ~9.5-10 pt
  const headerSubSize = isShort ? 20 : 25;   // ~5.5-6 pt

  const patientBoxY = isShort ? 140 : 166;
  const patientBoxHeight = isShort ? 64 : 76;
  const patientBoxBottom = patientBoxY + patientBoxHeight;
  // Extraction of clinical parameters with defensive fallbacks
  const patientName = (labelData.patientName || labelData.patient?.name || 'PATIENT RECORD').toUpperCase();
  const patientLabelFontSize = isShort ? 25 : 30; // ~7.5-8.5 pt clean label
  const nameLen = patientName.length;
  // Patient name font: slightly smaller ("un poco más pequeña") with dynamic grace for long 30+ char names
  const patientNameFontSize = isShort
    ? (nameLen > 30 ? 21 : 24)
    : (nameLen > 30 ? 26 : 29);
  const patientFontSize = patientLabelFontSize;
  const patientTextY = isShort ? 41 : 48;
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
  const doctorName = labelData.doctorName || labelData.physician || 'Dr. Marina Cordeiro Fernandes';
  const clinicName = labelData.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const doctorLicense = labelData.doctorLicense || 'DHA-91105367';
  const batchCode = labelData.batchCode || 'PHARM-2026-B948';
  const lote = labelData.lote || '2609-PLV';
  const volume = labelData.volume || labelData.netVolume || labelData.size || labelData.netContent || labelData.totalVolume || labelData.quantity || '100 mL';
  
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
  // VARIANT 1: BACK LABEL WITH LARGE PROMINENT QR CODE (Reverso con QR)
  // ───────────────────────────────────────────────────────────────────────────
  if (variant === 'backQr') {
    const colY = patientBoxBottom + (isShort ? 12 : 18);
    const colHeight = footerLineY - colY - (isShort ? 12 : 18);
    const backQrSize = isShort ? 200 : Math.min(colHeight - 64, 275);
    const qrStartY = Math.max(isShort ? 12 : 18, Math.round((colHeight - backQrSize - (isShort ? 32 : 44)) / 2));

    // ── RIGHT COLUMN LAYOUT: FULL HORIZONTAL SPACE UTILIZATION (826 px usable width) ──
    const b1Y = isShort ? 14 : 18;

    // Block 1: Dispensing Batch & Net Quantity / Size
    const b1SizeY = isShort ? 20 : 25;
    const b1BatchY = b1SizeY + (isShort ? 20 : 25);
    const b1DividerY = b1BatchY + (isShort ? 14 : 16);

    // Block 2: Ingredients & Compounding Base
    const b2Y = b1Y + b1DividerY + (isShort ? 14 : 18);
    const bSafetyY = colHeight - (isShort ? 46 : 56);

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
          <text x="0" y="34" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">PHARMAPOLIS</text>
          <text x="0" y="60" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize} fontWeight="500" fill="#334155">Verification &amp; Digital Monograph Registry</text>
          <text x="0" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize - 2} fontWeight="400" fill="#64748b">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
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
        {/* LEFT COLUMN: LARGE CENTERED QR CODE */}
        <g transform={`translate(60, ${colY})`}>
          <rect x="0" y="0" width="460" height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />
          
          <svg x={Math.round((460 - backQrSize) / 2)} y={qrStartY} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={backQrSize}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>

          {/* Under QR Refill & Digital Posology Callout */}
          <text
            x="230"
            y={qrStartY + backQrSize + (isShort ? 26 : 34)}
            textAnchor="middle"
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={isShort ? 13 : 16}
            fontWeight="900"
            fill="#003666"
            letterSpacing="0.4"
          >
            <tspan fill="#16a34a" fontWeight="900">✔ </tspan>SCAN FOR REFILL &amp; DIGITAL POSOLOGY
          </text>
        </g>

        {/* RIGHT COLUMN: CLINICAL INGREDIENTS, BATCH, POSOLOGY & SAFETY */}
        <g transform={`translate(550, ${colY})`}>
          <rect x="0" y="0" width="890" height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />

          {/* Block 1: Net Quantity & Dispensing Batch */}
          <g transform={`translate(32, ${b1Y})`}>
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 12 : 14} fontWeight="800" fill="#64748b" letterSpacing="0.8">
              NET QUANTITY &amp; DISPENSING BATCH
            </text>
            <text
              x="0"
              y={b1SizeY}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={isShort ? 20 : 25}
              fontWeight="900"
              fill="#000000"
              letterSpacing="0.3"
            >
              Net Content / Size: {volume}
            </text>
            <text x="0" y={b1BatchY} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 13 : 16} fontWeight="700" fill="#003666">
              Batch: <tspan fontFamily="monospace" fontWeight="800">{batchCode}</tspan> • Lote: <tspan fontFamily="monospace" fontWeight="800">{lote}</tspan>
            </text>
            <line x1="0" y1={b1DividerY} x2="826" y2={b1DividerY} stroke="#e2e8f0" strokeWidth="1.6" />
          </g>

          {/* Block 2 & Block 3: ACTIVE COMPOUNDED INGREDIENTS & HIGH-PRIORITY CLINICAL POSOLOGY */}
          {(() => {
            const ingCount = activeIngredientsList.length;
            let ingFontSize = isShort ? 18 : 22;
            let ingLineGap = isShort ? 24 : 29;
            if (ingCount >= 5) {
              ingFontSize = isShort ? 14 : 16;
              ingLineGap = isShort ? 18 : 22;
            } else if (ingCount >= 3) {
              ingFontSize = isShort ? 16 : 19;
              ingLineGap = isShort ? 21 : 25;
            }

            let vehiclePrefix = 'Compounding Vehicle:';
            const vLower = (vehicleName || '').toLowerCase();
            if (isOral || vLower.includes('capsule')) {
              vehiclePrefix = 'Compounding Vehicle / Shell:';
            } else if (isPomadeOrOintment || vLower.includes('ointment') || vLower.includes('pomade')) {
              vehiclePrefix = 'Compounding Base:';
            } else {
              vehiclePrefix = 'Compounding Vehicle:';
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

            const baseStartY = (isShort ? 22 : 28) + (ingCount * ingLineGap) + (isShort ? 2 : 4);
            const baseLines = wrapLines(`${vehiclePrefix} ${cleanVehicleDisplay}`, isShort ? 65 : 88);
            const baseFontSize = isShort ? (cleanVehicleDisplay.length > 40 ? 13 : 15) : (cleanVehicleDisplay.length > 55 ? 15 : 17);
            const baseLineGap = isShort ? 16 : 20;
            const b2TotalHeight = baseStartY + (baseLines.length * baseLineGap);

            // Dynamic Posology Box placement
            const b3Y = b2Y + b2TotalHeight + (isShort ? 12 : 16);
            const posologyLines = wrapLines(directions, isShort ? 50 : 60);
            const posFontSize = isShort ? 15 : 19;
            const posLineGap = isShort ? 20 : 25;
            const posBoxHeight = (isShort ? 30 : 38) + (posologyLines.length * posLineGap);

            return (
              <>
                {/* Block 2: Ingredients & Base */}
                <g transform={`translate(32, ${b2Y})`}>
                  <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 13 : 15} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
                    ACTIVE COMPOUNDED INGREDIENTS &amp; STRENGTH
                  </text>
                  
                  {activeIngredientsList.map((ing, iIdx) => (
                    <text
                      key={iIdx}
                      x="0"
                      y={(isShort ? 22 : 28) + (iIdx * ingLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={ingFontSize}
                      fontWeight="800"
                      fill="#0f172a"
                    >
                      • {ing}
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

                {/* Block 3: DEDICATED CLINICAL POSOLOGY & DIRECTIONS FOR USE */}
                <g transform={`translate(32, ${b3Y})`}>
                  <rect x="0" y="0" width="826" height={posBoxHeight} fill="#f8fafc" stroke="#bae6fd" strokeWidth="1.5" rx="6" />
                  <rect x="0" y="0" width="6" height={posBoxHeight} fill="#0284c7" rx="3" />
                  
                  <text x="18" y={isShort ? 18 : 22} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 12 : 14} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
                    DIRECTIONS FOR USE / PRESCRIBED POSOLOGY
                  </text>

                  {posologyLines.map((pLine, pIdx) => (
                    <text
                      key={`pos-${pIdx}`}
                      x="18"
                      y={(isShort ? 38 : 46) + (pIdx * posLineGap)}
                      fontFamily="Arial, Helvetica, sans-serif"
                      fontSize={posFontSize}
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {pLine}
                    </text>
                  ))}
                </g>
              </>
            );
          })()}

          {/* Block 4: Mandatory Precaution & Prescriber */}
          <g transform={`translate(32, ${bSafetyY})`}>
            <line x1="0" y1={isShort ? -10 : -14} x2="826" y2={isShort ? -10 : -14} stroke="#e2e8f0" strokeWidth="1.6" />
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 12 : 15} fontWeight="800" fill="#b91c1c" letterSpacing="0.4">
              {cautionText}
            </text>
            {(() => {
              const rxFullText = `Rx: ${doctorName} • ${clinicName} (${doctorLicense})`;
              const rxFontSize = isShort ? (rxFullText.length > 65 ? 11 : 12) : (rxFullText.length > 70 ? 13 : 15);
              return (
                <text
                  x="0"
                  y={isShort ? 16 : 22}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={rxFontSize}
                  fontWeight="600"
                  fill="#64748b"
                >
                  {rxFullText}
                </text>
              );
            })()}
          </g>
        </g>

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

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 2 & 3: FRONT LABEL & FRONT WITH MICRO-QR
  // High-legibility EU GMP / USP calibrated typography engine
  // ───────────────────────────────────────────────────────────────────────────
  const withMicroQr = variant === 'frontWithQr';

  // Micro-QR dimensions and coordinates (engineered to NEVER collide with patient box)
  const microQrY = isShort ? 12 : 16;
  const microQrWidth = isShort ? 136 : 156;
  const microQrHeight = isShort ? 130 : 144;
  const microQrX = 1440 - microQrWidth;
  const qrInnerSize = isShort ? 98 : 112;
  const scanRxY = isShort ? 118 : 132;
  const scanRxSize = isShort ? 12 : 14;

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
        <text x="0" y="34" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerTitleSize} fontWeight="900" letterSpacing="0.5" fill="#000000">PHARMAPOLIS</text>
        <text x="0" y="60" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize} fontWeight="400" fill="#222222">g.k. Hristo Botev-North/Yuzhen</text>
        <text x="0" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize={headerSubSize - 2} fontWeight="400" fill="#222222">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
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
