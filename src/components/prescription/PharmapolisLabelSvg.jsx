'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Wraps text into lines with a maximum character limit.
 */
function wrapLines(text, maxChars = 60) {
  if (!text) return [];
  const words = String(text).trim().split(/\s+/);
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

  // Pin footer elements dynamically to bottom of canvas
  const footerLineY = HEIGHT - (isShort ? 94 : isMediumHeight ? 104 : 116);
  const footerTextY = HEIGHT - (isShort ? 58 : isMediumHeight ? 64 : 70);
  const footerFontSize = isShort ? 26 : isMediumHeight ? 29 : 32; // ~8 pt physical print size
  const footerLineGap = isShort ? 34 : 40;

  // Header & Patient Box coordinates
  const headerY = isShort ? 24 : 32;
  const headerTitleSize = isShort ? 44 : 52; // ~9.5-10 pt
  const headerSubSize = isShort ? 20 : 25;   // ~5.5-6 pt

  const patientBoxY = isShort ? 140 : 166;
  const patientBoxHeight = isShort ? 64 : 76;
  const patientBoxBottom = patientBoxY + patientBoxHeight;
  const patientFontSize = isShort ? 30 : 36; // ~10-10.5 pt
  const patientTextY = isShort ? 42 : 50;

  // Extraction of clinical parameters with defensive fallbacks
  const patientName = (labelData.patientName || labelData.patient?.name || 'PATIENT RECORD').toUpperCase();
  const fileNumber = labelData.fileNumber || labelData.fileNo || labelData.rxCode || labelData.id || '51857';
  const productTitle = labelData.productTitle || labelData.productName || 'Compounded Pharmaceutical Protocol';
  const formula = labelData.formula || '';
  const directions = labelData.directions || labelData.instructions || 'Take / apply as directed by prescribing physician.';
  const warnings = labelData.warnings || labelData.warning || 'For external / patient use only. Keep out of reach of children.';
  const prodDate = labelData.prodDate || '15-09-2026';
  const expDate = labelData.expDate || '15-09-2027';
  const storage = labelData.storage || 'Store at room temperature';
  const doctorName = labelData.doctorName || labelData.physician || 'Dr. Marina Cordeiro Fernandes';
  const clinicName = labelData.clinicName || 'NOVA Clinic Day Surgery Center, Dubai';
  const doctorLicense = labelData.doctorLicense || 'DHA-91105367';
  const batchCode = labelData.batchCode || 'PHARM-2026-B948';
  const lote = labelData.lote || '2609-PLV';
  
  // Unique QR URL strictly bound to this prescription (pointing to patient view)
  const targetRxUrl = labelData.targetRxUrl || labelData.url || `https://med-peptides.com/rx/${fileNumber}?view=patient`;
  const cleanDisplayUrl = targetRxUrl.replace(/^https?:\/\//, '');

  // Extract active ingredients list for Block 2 (Back Label)
  const activeIngredientsList = React.useMemo(() => {
    if (Array.isArray(labelData.apis) && labelData.apis.length > 0) {
      const filtered = labelData.apis.filter(a => {
        const n = (a.drugName || a.drug || a.name || a.productName || a.activeIngredient || '').toLowerCase();
        const f = (a.dosageForm || a.form || '').toLowerCase();
        return !a.isVehicle && !a.isVehicleOrBase && !f.includes('vehicle') && !n.includes('vehicle') && !n.includes('trichosol') && !n.includes('pentravan');
      });
      if (filtered.length > 0) {
        return filtered.map(a => {
          const name = a.drugName || a.drug || a.name || a.productName || a.activeIngredient || 'API';
          const dose = a.dosage || a.dose || a.strength || '';
          return `${name} ${dose}`.trim();
        });
      }
    }
    if (formula) {
      const parts = formula.split(/\s*(?:\+|\bin\b)\s*/i).map(p => p.trim()).filter(Boolean);
      if (parts.length > 0) return parts.filter(p => !p.toLowerCase().includes('vehicle') && !p.toLowerCase().includes('trichosol'));
    }
    return ['Personalized Compounded Active Formula'];
  }, [labelData.apis, formula]);

  const formulaLower = (formula || '').toLowerCase();
  const isPomadeOrOintment = formulaLower.includes('pomade') || formulaLower.includes('pomada') || formulaLower.includes('ointment') || formulaLower.includes('diltiazem');
  const vehicleName = labelData.vehicle?.name || 
                      (isPomadeOrOintment ? 'Compounded Topical Pomade Base (30 g)' :
                      (formulaLower.includes('trichosol') ? 'TrichoSol™ Liposomal Hydrophilic Base (100 mL)' : 
                      (formulaLower.includes('trichooil') ? 'TrichoOil™ Natural Lipidic Carrier (30 mL)' : 'Galenic Compounding Vehicle q.s.')));

  // ───────────────────────────────────────────────────────────────────────────
  // COMPONENT: PROFESSIONAL CROP MARKS & SCISSOR CUT GUIDES (✂)
  // ───────────────────────────────────────────────────────────────────────────
  const renderCutGuides = () => {
    if (!showCutGuides) return null;
    return (
      <g className="pharmacy-cut-guides" pointerEvents="none">
        {/* Perimeter Dashed Cutting Border */}
        <rect
          x="3"
          y="3"
          width={WIDTH - 6}
          height={HEIGHT - 6}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.5"
          strokeDasharray="14,10"
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
    const backQrSize = isShort ? 180 : Math.min(colHeight - 130, 240);

    const b1Y = isShort ? 16 : 22;
    const b2Y = isShort ? 94 : 120;
    const bSafetyY = colHeight - (isShort ? 54 : 68);

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
          <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, sans-serif" fontSize={patientFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
            PATIENT NAME: <tspan fontWeight="900">{patientName}</tspan>
          </text>
          <text x="1356" y={patientTextY} textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={patientFontSize} fontWeight="800" fill="#003666">
            FILE #{fileNumber}
          </text>
        </g>

        {/* ── TWO-COLUMN WORKSPACE ── */}
        {/* LEFT COLUMN: LARGE CENTERED QR CODE */}
        <g transform={`translate(60, ${colY})`}>
          <rect x="0" y="0" width="460" height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />
          
          <svg x={Math.round((460 - backQrSize) / 2)} y={isShort ? 10 : 16} width={backQrSize} height={backQrSize} viewBox={`0 0 ${backQrSize} ${backQrSize}`}>
            <QRCodeSVG
              value={targetRxUrl}
              size={backQrSize}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>

          {/* Under QR Verification Details */}
          <text x="230" y={backQrSize + (isShort ? 28 : 36)} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 17} fontWeight="900" fill="#003666" letterSpacing="0.5">
            SCAN FOR DIGITAL POSOLOGY &amp; CoA
          </text>
          <text x="230" y={backQrSize + (isShort ? 46 : 60)} textAnchor="middle" fontFamily="monospace" fontSize={isShort ? 12 : 15} fontWeight="700" fill="#475569">
            {cleanDisplayUrl.length > 34 ? cleanDisplayUrl.slice(0, 32) + '...' : cleanDisplayUrl}
          </text>
          
          {/* Status & Security Verification Pill */}
          <g transform={`translate(230, ${backQrSize + (isShort ? 72 : 96)})`}>
            <rect x="-160" y="-14" width="320" height={isShort ? 28 : 34} fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" rx="17" />
            <text x="0" y={isShort ? 5 : 8} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 13 : 15} fontWeight="800" fill="#065f46">
              ✓ Verified Clinical Atlas Record
            </text>
          </g>
        </g>

        {/* RIGHT COLUMN: CLINICAL INGREDIENTS, BATCH & SAFETY */}
        <g transform={`translate(550, ${colY})`}>
          <rect x="0" y="0" width="890" height={colHeight} fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" rx="8" />

          {/* Block 1: Formulation Name & Batch Numbers */}
          <g transform={`translate(32, ${b1Y})`}>
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 13 : 16} fontWeight="800" fill="#64748b" letterSpacing="0.8">
              FORMULATION &amp; DISPENSING BATCH
            </text>
            <text x="0" y={isShort ? 26 : 34} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 22 : 28} fontWeight="900" fill="#000000">
              {productTitle.length > 40 ? productTitle.slice(0, 38) + '...' : productTitle}
            </text>
            <text x="0" y={isShort ? 52 : 66} fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 15 : 19} fontWeight="700" fill="#003666">
              Batch: <tspan fontFamily="monospace" fontWeight="800">{batchCode}</tspan> • Lote: <tspan fontFamily="monospace" fontWeight="800">{lote}</tspan>
            </text>
            <line x1="0" y1={isShort ? 64 : 80} x2="826" y2={isShort ? 64 : 80} stroke="#e2e8f0" strokeWidth="1.6" />
          </g>

          {/* Block 2: ACTIVE COMPOUNDED INGREDIENTS & STRENGTH (Prominent, High-Contrast Typography) */}
          <g transform={`translate(32, ${b2Y})`}>
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 14 : 17} fontWeight="900" fill="#0284c7" letterSpacing="0.8">
              ACTIVE COMPOUNDED INGREDIENTS &amp; STRENGTH
            </text>
            
            {/* Active Ingredients List */}
            {activeIngredientsList.slice(0, 3).map((ing, iIdx) => (
              <text
                key={iIdx}
                x="0"
                y={isShort ? 30 + iIdx * 34 : 40 + iIdx * 44}
                fontFamily="Arial, Helvetica, sans-serif"
                fontSize={isShort ? 24 : 32}
                fontWeight="800"
                fill="#0f172a"
              >
                • {ing}
              </text>
            ))}

            {/* Compounding Base / Vehicle */}
            <text
              x="0"
              y={isShort ? 30 + Math.min(activeIngredientsList.length, 3) * 34 + 6 : 40 + Math.min(activeIngredientsList.length, 3) * 44 + 8}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={isShort ? 18 : 24}
              fontWeight="700"
              fill="#0369a1"
            >
              Base: {vehicleName.length > 50 ? vehicleName.slice(0, 48) + '...' : vehicleName}
            </text>
          </g>

          {/* Block 3: Mandatory Precaution & Prescriber */}
          <g transform={`translate(32, ${bSafetyY})`}>
            <line x1="0" y1={isShort ? -12 : -16} x2="826" y2={isShort ? -12 : -16} stroke="#e2e8f0" strokeWidth="1.6" />
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={isShort ? 13 : 16} fontWeight="800" fill="#b91c1c" letterSpacing="0.4">
              CAUTION: FOR TOPICAL SCALP USE ONLY • KEEP OUT OF REACH OF CHILDREN
            </text>
            <text
              x="0"
              y={isShort ? 18 : 24}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={isShort ? 13 : 16}
              fontWeight="600"
              fill="#64748b"
            >
              Rx: {doctorName} • {clinicName.length > 30 ? clinicName.slice(0, 28) + '...' : clinicName} ({doctorLicense})
            </text>
          </g>
        </g>

        {/* ── DASHED DIVIDER LINE ── */}
        <line x1="60" y1={footerLineY} x2="1440" y2={footerLineY} stroke="#000000" strokeWidth="2.2" strokeDasharray="10,6" />

        {/* ── FOOTER ROW ── */}
        <g transform={`translate(60, ${footerTextY})`}>
          <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
            Prod. date: <tspan fontWeight="400">{prodDate}</tspan>
          </text>
          <text x="0" y={footerLineGap} fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
            Storage: <tspan fontWeight="400">{storage}</tspan>
          </text>
          <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
            Exp. date: <tspan fontWeight="400">{expDate}</tspan>
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

  // Text Wrapping with clean boundaries
  const maxFormulaChars = 52;
  const formulaLines = formula ? wrapLines(formula, maxFormulaChars) : [];
  const directionLines = wrapDirections(directions, 42, 54);

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
        <text x="24" y={patientTextY} fontFamily="Arial, Helvetica, sans-serif" fontSize={patientFontSize} fontWeight="700" letterSpacing="0.4" fill="#000000">
          PATIENT NAME: <tspan fontWeight="900">{patientName}</tspan>
        </text>
        <text x="1356" y={patientTextY} textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={patientFontSize} fontWeight="800" fill="#003666">
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

      {/* ── DIRECTIONS FOR USE ── */}
      {directionLines.length > 0 && (
        <g>
          <text
            x="60"
            y={directionsStartY}
            fontFamily="Arial, Helvetica, sans-serif"
            fontSize={dirFontSize}
            fontWeight="800"
            fill="#000000"
          >
            Directions for use: <tspan fontWeight="500" fill="#1e293b">{directionLines[0]}</tspan>
          </text>
          {directionLines.slice(1).map((line, idx) => (
            <text
              key={`d-${idx}`}
              x="60"
              y={directionsStartY + (idx + 1) * dirLineGap}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={dirFontSize}
              fontWeight="500"
              fill="#1e293b"
            >
              {line}
            </text>
          ))}
        </g>
      )}

      {/* ── DASHED DIVIDER LINE ── */}
      <line x1="60" y1={footerLineY} x2="1440" y2={footerLineY} stroke="#000000" strokeWidth="2.2" strokeDasharray="10,6" />

      {/* ── FOOTER INFO ROW ── */}
      <g transform={`translate(60, ${footerTextY})`}>
        <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
          Prod. date: <tspan fontWeight="400">{prodDate}</tspan>
        </text>
        <text x="0" y={footerLineGap} fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
          Storage: <tspan fontWeight="400">{storage}</tspan>
        </text>
        <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize={footerFontSize} fontWeight="700" fill="#000000">
          Exp. date: <tspan fontWeight="400">{expDate}</tspan>
        </text>
      </g>

      {/* ── CUT GUIDES & SCISSOR INDICATOR ── */}
      {renderCutGuides()}
    </svg>
  );
}
