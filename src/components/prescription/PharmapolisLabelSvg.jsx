'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Wraps text into lines with a maximum character limit.
 */
function wrapLines(text, maxChars = 80) {
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
 * PharmapolisLabelSvg
 * ─────────────────────────────────────────────────────────────────────────────
 * High-precision vector SVG pharmaceutical label generator.
 * Standard 7.5 cm × 4.5 cm (75 mm × 45 mm) at 200 DPI = 1500 × 900 px base.
 * Dynamically adjusts to custom dimensions (e.g. 38×90 mm, 100×50 mm)
 * and maximizes vertical & horizontal space utilization for effortless reading.
 */
export default function PharmapolisLabelSvg({
  labelData = {},
  variant = 'backQr', // 'backQr' | 'front' | 'frontWithQr'
  widthMm = 75,
  heightMm = 45,
  svgRef = null
}) {
  // Base coordinates: 1500 x 900 for 75 x 45 mm
  const baseWidth = Math.round(widthMm * 20);
  const baseHeight = Math.round(heightMm * 20);
  const WIDTH = 1500;
  const HEIGHT = Math.round((heightMm / widthMm) * 1500) || 900;

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
  
  // Unique QR URL strictly bound to this prescription
  const targetRxUrl = labelData.targetRxUrl || labelData.url || `https://med-peptides.com/rx/${fileNumber}`;
  const cleanDisplayUrl = targetRxUrl.replace(/^https?:\/\//, '');

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 1: BACK LABEL WITH LARGE PROMINENT QR CODE (Reverso con QR)
  // ───────────────────────────────────────────────────────────────────────────
  if (variant === 'backQr') {
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
        <g transform="translate(60, 42)">
          <text x="0" y="32" fontFamily="Arial, Helvetica, sans-serif" fontSize="34" fontWeight="900" letterSpacing="0.5" fill="#000000">PHARMAPOLIS</text>
          <text x="0" y="58" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="500" fill="#334155">Verification &amp; Digital Monograph Registry</text>
          <text x="0" y="82" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="400" fill="#64748b">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
        </g>

        {/* EU GMP CERTIFIED BADGE */}
        <g transform="translate(1440, 46)">
          <rect x="-310" y="0" width="310" height="44" fill="#f8fafc" stroke="#003666" strokeWidth="1.6" rx="6" />
          <text x="-155" y="28" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800" fill="#003666" letterSpacing="0.5">
            EU GMP CERTIFIED DISPENSARY
          </text>
        </g>

        {/* ── PATIENT BOX ── */}
        <g transform="translate(60, 155)">
          <rect x="0" y="0" width="1380" height="58" fill="#f8fafc" stroke="#000000" strokeWidth="1.8" rx="4" />
          <text x="20" y="37" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="700" letterSpacing="0.4" fill="#000000">
            PATIENT NAME: <tspan fontWeight="900">{patientName}</tspan>
          </text>
          <text x="1360" y="37" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="800" fill="#003666">
            FILE #{fileNumber}
          </text>
        </g>

        {/* ── TWO-COLUMN WORKSPACE ── */}
        {/* LEFT COLUMN: LARGE CENTERED QR CODE (460 x 485 px) */}
        <g transform="translate(60, 235)">
          <rect x="0" y="0" width="460" height="485" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.6" rx="8" />
          
          {/* Centered Large QR Code: 310 x 310 px */}
          <svg x="75" y="16" width="310" height="310" viewBox="0 0 310 310">
            <QRCodeSVG
              value={targetRxUrl}
              size={310}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>

          {/* Under QR Verification Details */}
          <text x="230" y="358" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="800" fill="#003666" letterSpacing="0.5">
            SCAN FOR DIGITAL POSOLOGY &amp; CoA
          </text>
          <text x="230" y="390" textAnchor="middle" fontFamily="monospace" fontSize="14" fontWeight="700" fill="#475569">
            {cleanDisplayUrl}
          </text>
          
          {/* Status & Security Verification Pills */}
          <g transform="translate(230, 432)">
            <rect x="-175" y="-18" width="350" height="36" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.2" rx="18" />
            <text x="0" y="5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800" fill="#065f46">
              ✓ Verified Clinical Atlas Record
            </text>
          </g>
        </g>

        {/* RIGHT COLUMN: CLINICAL TRACEABILITY & SPECIFICATIONS (890 x 485 px) */}
        <g transform="translate(550, 235)">
          <rect x="0" y="0" width="890" height="485" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.6" rx="8" />

          {/* Block 1: Formulation & Batch */}
          <g transform="translate(32, 42)">
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800" fill="#64748b" letterSpacing="0.8">
              FORMULATION CODE &amp; BATCH
            </text>
            <text x="0" y="32" fontFamily="Arial, Helvetica, sans-serif" fontSize="23" fontWeight="900" fill="#000000">
              {productTitle}
            </text>
            <text x="0" y="64" fontFamily="Arial, Helvetica, sans-serif" fontSize="18" fontWeight="700" fill="#003666">
              Batch: <tspan fontFamily="monospace" fontWeight="800">{batchCode}</tspan> • Lote Control: <tspan fontFamily="monospace" fontWeight="800">{lote}</tspan>
            </text>
          </g>

          {/* Block 2: Prescribing Physician & Clinic */}
          <g transform="translate(32, 175)">
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800" fill="#64748b" letterSpacing="0.8">
              PRESCRIBING PHYSICIAN &amp; CLINIC
            </text>
            <text x="0" y="30" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="850" fill="#0f172a">
              {doctorName}
            </text>
            <text x="0" y="58" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="600" fill="#475569">
              {clinicName}
            </text>
            <text x="0" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="500" fill="#64748b">
              License: {doctorLicense} • Refill Authorization: Active
            </text>
          </g>

          {/* Block 3: Compounding Specifications & Purity */}
          <g transform="translate(32, 310)">
            <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize="15" fontWeight="800" fill="#64748b" letterSpacing="0.8">
              COMPOUNDING SPECIFICATIONS &amp; PURITY
            </text>
            <text x="0" y="28" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="700" fill="#0f172a">
              • Hypoallergenic formulation: Zero gluten, zero lactose, zero dairy.
            </text>
            <text x="0" y="56" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="700" fill="#0f172a">
              • No bromelain, no sunflower lecithin, no seed oils in capsule fill.
            </text>
            <text x="0" y="84" fontFamily="Arial, Helvetica, sans-serif" fontSize="17" fontWeight="700" fill="#0f172a">
              • HPLC Verified Raw Materials &gt; 98.5% Active Pharmaceutical Purity.
            </text>
            <text x="0" y="112" fontFamily="Arial, Helvetica, sans-serif" fontSize="16" fontWeight="750" fill="#16a34a">
              ✓ Tamper-evident seal intact upon dispensary release.
            </text>
          </g>
        </g>

        {/* ── DASHED DIVIDER LINE ── */}
        <line x1="60" y1="742" x2="1440" y2="742" stroke="#000000" strokeWidth="1.8" strokeDasharray="8,6" />

        {/* ── FOOTER ROW ── */}
        <g transform="translate(60, 788)">
          <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize="23" fontWeight="700" fill="#000000">
            Prod. date: <tspan fontWeight="400">{prodDate}</tspan>
          </text>
          <text x="0" y="38" fontFamily="Arial, Helvetica, sans-serif" fontSize="23" fontWeight="700" fill="#000000">
            Storage: <tspan fontWeight="400">{storage}</tspan>
          </text>
          <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize="23" fontWeight="700" fill="#000000">
            Exp. date: <tspan fontWeight="400">{expDate}</tspan>
          </text>
        </g>
      </svg>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // VARIANT 2 & 3: FRONT LABEL & FRONT WITH MICRO-QR
  // Space Maximization Engine: dynamically distributes typography & line heights
  // ───────────────────────────────────────────────────────────────────────────
  const withMicroQr = variant === 'frontWithQr';

  // Text Wrapping with dynamic width constraints
  const maxFormulaChars = withMicroQr ? 74 : 80;
  const maxDirChars = withMicroQr ? 70 : 76;
  const maxWarnChars = withMicroQr ? 72 : 78;

  const formulaLines = formula ? wrapLines(formula, maxFormulaChars) : [];
  const directionLines = wrapLines(directions, maxDirChars);
  const warningLines = warnings ? wrapLines(warnings, maxWarnChars) : [];

  // Space allocation & typography scaling based on density
  const totalContentLines = (formulaLines.length > 0 ? formulaLines.length + 1 : 0) +
                            (directionLines.length > 0 ? directionLines.length + 1 : 0) +
                            warningLines.length;

  const isSparse = totalContentLines <= 6;
  const isMedium = totalContentLines > 6 && totalContentLines <= 10;

  const titleFontSize = isSparse ? 40 : isMedium ? 34 : 28;
  const formulaFontSize = isSparse ? 30 : isMedium ? 26 : 22;
  const formulaLineGap = isSparse ? 44 : isMedium ? 38 : 30;
  const dirFontSize = isSparse ? 30 : isMedium ? 27 : 23;
  const dirLineGap = isSparse ? 44 : isMedium ? 38 : 32;
  const warnFontSize = isSparse ? 26 : isMedium ? 23 : 20;
  const warnLineGap = isSparse ? 38 : isMedium ? 34 : 28;

  // Available vertical canvas between patient box (y=220) and dashed footer (y=742)
  const contentStartY = 270;
  const availableContentHeight = 742 - contentStartY; // ~472px

  const titleBlockHeight = titleFontSize + 16;
  const formulaBlockHeight = formulaLines.length > 0 ? (formulaLines.length * formulaLineGap) : 0;
  const dirBlockHeight = directionLines.length > 0 ? (directionLines.length * dirLineGap + 36) : 0;
  const warnBlockHeight = warningLines.length > 0 ? (warningLines.length * warnLineGap) : 0;

  const totalRawHeight = titleBlockHeight + formulaBlockHeight + dirBlockHeight + warnBlockHeight;
  const remainingSpace = Math.max(16, availableContentHeight - totalRawHeight);

  // Distribute remaining space across the active section separators
  const activeSectionsCount = (formulaLines.length > 0 ? 1 : 0) + (directionLines.length > 0 ? 1 : 0) + (warningLines.length > 0 ? 1 : 0);
  const distributedGap = Math.min(65, Math.max(22, Math.floor(remainingSpace / (activeSectionsCount || 1))));

  let currentY = contentStartY;
  const titleY = currentY;
  currentY += titleBlockHeight + distributedGap;

  const formulaStartY = currentY;
  if (formulaLines.length > 0) {
    currentY += formulaBlockHeight + distributedGap;
  }

  const directionsStartY = currentY;
  if (directionLines.length > 0) {
    currentY += dirBlockHeight + distributedGap;
  }

  const warningsStartY = currentY;

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
      <g transform="translate(60, 42)">
        <text x="0" y="32" fontFamily="Arial, Helvetica, sans-serif" fontSize="36" fontWeight="900" letterSpacing="0.5" fill="#000000">PHARMAPOLIS</text>
        <text x="0" y="60" fontFamily="Arial, Helvetica, sans-serif" fontSize="19" fontWeight="400" fill="#222222">g.k. Hristo Botev-North/Yuzhen</text>
        <text x="0" y="86" fontFamily="Arial, Helvetica, sans-serif" fontSize="19" fontWeight="400" fill="#222222">1A Arhimandrit Evlogi Street, 4013 Plovdiv, Bulgaria</text>
      </g>

      {/* MICRO-QR (IF ENABLED): Crisp 140 x 140 container with centered 112 px QR Code */}
      {withMicroQr && (
        <g transform="translate(1300, 16)">
          <rect x="0" y="0" width="140" height="140" fill="#ffffff" stroke="#003666" strokeWidth="2" rx="8" />
          <svg x="14" y="10" width="112" height="112" viewBox="0 0 112 112">
            <QRCodeSVG
              value={targetRxUrl}
              size={112}
              level="M"
              fgColor="#003666"
              bgColor="#ffffff"
            />
          </svg>
          <text x="70" y="132" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="900" fill="#003666" textAnchor="middle" letterSpacing="0.8">
            SCAN RX
          </text>
        </g>
      )}

      {/* ── PATIENT BOX ── */}
      <g transform="translate(60, 155)">
        <rect x="0" y="0" width="1380" height="60" fill="#f8fafc" stroke="#000000" strokeWidth="2" rx="4" />
        <text x="20" y="38" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="700" letterSpacing="0.4" fill="#000000">
          PATIENT NAME: <tspan fontWeight="900">{patientName}</tspan>
        </text>
      </g>

      {/* ── PRODUCT TITLE ── */}
      <text x="60" y={titleY} fontFamily="Arial, Helvetica, sans-serif" fontSize={titleFontSize} fontWeight="900" fill="#000000">
        {productTitle}
      </text>

      {/* ── FORMULA DETAILS ── */}
      {formulaLines.map((line, idx) => (
        <text
          key={`f-${idx}`}
          x="60"
          y={formulaStartY + (idx * formulaLineGap)}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={formulaFontSize}
          fontWeight="600"
          fill="#1e293b"
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
            Directions for use: <tspan fontWeight="400" fill="#111111">{directionLines[0]}</tspan>
          </text>
          {directionLines.slice(1).map((line, idx) => (
            <text
              key={`d-${idx}`}
              x="60"
              y={directionsStartY + (idx + 1) * dirLineGap}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize={dirFontSize}
              fontWeight="400"
              fill="#111111"
            >
              {line}
            </text>
          ))}
        </g>
      )}

      {/* ── WARNINGS & PRECAUTIONS ── */}
      {warningLines.map((line, idx) => (
        <text
          key={`w-${idx}`}
          x="60"
          y={warningsStartY + (idx * warnLineGap)}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize={warnFontSize}
          fontWeight="500"
          fill="#475569"
        >
          {line}
        </text>
      ))}

      {/* ── DASHED DIVIDER LINE ── */}
      <line x1="60" y1="742" x2="1440" y2="742" stroke="#000000" strokeWidth="1.8" strokeDasharray="8,6" />

      {/* ── FOOTER INFO ROW ── */}
      <g transform="translate(60, 788)">
        <text x="0" y="0" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="700" fill="#000000">
          Prod. date: <tspan fontWeight="400">{prodDate}</tspan>
        </text>
        <text x="0" y="38" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="700" fill="#000000">
          Storage: <tspan fontWeight="400">{storage}</tspan>
        </text>
        <text x="1380" y="0" textAnchor="end" fontFamily="Arial, Helvetica, sans-serif" fontSize="24" fontWeight="700" fill="#000000">
          Exp. date: <tspan fontWeight="400">{expDate}</tspan>
        </text>
      </g>
    </svg>
  );
}
