/**
 * pensDossierPdf.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates a Physician-Grade Institutional A4 Vector PDF for the Atlas Health
 * Services Pre-filled Multi-Dose Peptide Pens Clinical Portfolio (Golden Rule #67).
 *
 * - 100% Atlas Health Services branding (zero external supplier exposure)
 * - Bilingual EN (default) / ES support
 * - Groups pens cleanly by Therapeutic Area for fast physician review
 * - Shows ALL variants, exact click-to-mcg breakdown, timing, doses/pen & cycle
 * - Opens in DocumentPreviewModal via previewOrSavePdf (never blind download)
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ATLAS_PDF_PALETTE,
  drawAtlasInstitutionalHeader,
  drawAtlasKpiStrip,
  getAtlasAutoTableDefaults,
  applyAtlasRunningFooter,
  previewOrSavePdf,
} from '@/lib/pdf/atlasPdfChrome';

/**
 * Formats an internal pen SKU into a clean white-label Atlas code (ATL-PEN-*).
 */
export function formatAtlasPenSku(rawSku = '', itemNumber = '') {
  const cleaned = String(rawSku || '').trim();
  if (!cleaned) return `ATL-PEN-${String(itemNumber || '01').padStart(2, '0')}`;
  return cleaned.replace(/^DN-PEN-/i, 'ATL-PEN-').replace(/^DN-/i, 'ATL-');
}

export async function generateAtlasPensDossierPdf({
  products = [],
  lang = 'en',
  selectedCategory = 'ALL',
} = {}) {
  const isEs = lang === 'es';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toISOString().slice(0, 10);

  const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 1), 0);
  const categorySubtitle =
    selectedCategory && selectedCategory !== 'ALL'
      ? ` · ${selectedCategory}`
      : '';

  // 1. Unified Atlas Institutional Header (Navy + Teal)
  let nextY = drawAtlasInstitutionalHeader(doc, {
    title: isEs
      ? 'FORMULARIO CLINICO · PLUMAS PRECARGADAS (3 mL)'
      : 'CLINICAL FORMULARY · PRE-FILLED PEPTIDE PENS (3 mL)',
    subtitle: isEs
      ? `Plumas Multidosis con Dial de Clics · Cadena de Frio 2-8°C · Pureza HPLC >= 99.2%${categorySubtitle}`
      : `Multi-Dose Click-Dial Pens · 2-8°C Cold-Chain · HPLC Certified Purity >= 99.2%${categorySubtitle}`,
    documentRef: 'DOC-ATL-PENS-2026',
    issuedDate: today,
    tierLabel: isEs ? 'DOSSIER MEDICO PROFESIONAL' : 'PHYSICIAN CLINICAL DOSSIER',
  });

  // 2. Institutional KPI Strip
  nextY = drawAtlasKpiStrip(doc, {
    startY: nextY,
    items: [
      {
        label: isEs ? 'FORMULAS DISPONIBLES' : 'CLINICAL FORMULAS',
        value: `${products.length} ${isEs ? 'Plumas' : 'Pens'} (${totalVariants} SKUs)`,
      },
      {
        label: isEs ? 'SISTEMA DE DIAL' : 'DIAL CALIBRATION',
        value: '3.0 mL = 300 IU (1 click = 0.01 mL)',
      },
      {
        label: isEs ? 'PUREZA & CALIDAD' : 'ANALYTICAL PURITY',
        value: '>= 99.2% HPLC · COA',
      },
      {
        label: isEs ? 'FRIO / AGUJA / BUD' : 'COLD-CHAIN / NEEDLE / BUD',
        value: '2-8°C · 31G/32G 4mm · 30d BUD',
      },
    ],
  });

  // 3. Group products by therapeutic category so physicians scan by specialty
  const grouped = new Map();
  products.forEach((p) => {
    const cat = p.category || (isEs ? 'Péptidos Clínicos' : 'Clinical Peptides');
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat).push(p);
  });

  const head = [
    [
      '#',
      isEs ? 'Péptido / SKU Atlas' : 'Peptide / Atlas SKU',
      isEs ? 'Concentración (3 mL)' : 'Strength (3 mL)',
      isEs ? 'Indicaciones Clínicas' : 'Clinical Indications',
      isEs ? 'Pauta, Clics y Momento' : 'Dial Dosing & Timing',
      isEs ? 'Duración / Pen' : 'Est. Duration / Pen',
    ],
  ];

  const body = [];
  for (const [catName, catItems] of grouped.entries()) {
    // Specialty group subheader row
    body.push([
      {
        content: `${catName.toUpperCase()}  (${catItems.length})`,
        colSpan: 6,
        styles: {
          fillColor: [232, 240, 254],
          textColor: ATLAS_PDF_PALETTE.navy,
          fontStyle: 'bold',
          fontSize: 7.4,
          cellPadding: { top: 2.0, right: 3, bottom: 2.0, left: 3 },
        },
      },
    ]);

    catItems.forEach((p, idx) => {
      const num = String(p.itemNumber || idx + 1).padStart(2, '0');
      const atlasSku = formatAtlasPenSku(p.sku, num);
      const variantsList = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [];

      const strengthsText = variantsList
        .map((v) => `${v.concentration || ''}${v.label ? `\n(${v.label})` : ''}`)
        .join('\n—\n');

      const dosingText = variantsList
        .map((v) => {
          const clicks = v.clicksPerDose != null ? `${v.clicksPerDose} ${isEs ? 'clics' : 'clicks'}` : '';
          const breakdown = v.doseBreakdown || '';
          const freq = v.frequency || '';
          return `${clicks}${breakdown ? ` · ${breakdown}` : ''}${freq ? `\n${freq}` : ''}`;
        })
        .join('\n—\n');

      const timingLine = p.timing ? `\n[${isEs ? 'Momento' : 'Timing'}: ${p.timing}]` : '';

      const durationText = variantsList
        .map((v) => {
          const totalU = Number(v.totalUnits) || 300;
          const doseU = Number(v.clicksPerDose || v.recommendedDoseUnits) || 10;
          const dosesCount = Math.max(1, Math.floor(totalU / doseU));
          const days = v.daysSupply ? `~${v.daysSupply}${isEs ? 'd' : 'd'}` : `~${dosesCount}d`;
          const cycle = v.cycleDuration ? `\n${isEs ? 'Ciclo' : 'Cycle'}: ${v.cycleDuration}` : '';
          return `${dosesCount} ${isEs ? 'dosis' : 'doses'} (${days})${cycle}`;
        })
        .join('\n—\n');

      body.push([
        `#${num}`,
        `${p.name}\n${atlasSku}`,
        strengthsText || '3 mL Cartridge',
        p.description || '',
        `${dosingText || '—'}${timingLine}`,
        durationText || (isEs ? '30 dosis (~30d)' : '30 doses (~30d)'),
      ]);
    });
  }

  const defaults = getAtlasAutoTableDefaults({
    columnStyles: {
      0: { cellWidth: 9, halign: 'center', fontStyle: 'bold', textColor: [100, 116, 139] },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 26, font: 'courier', fontSize: 6.9 },
      3: { cellWidth: 45, fontSize: 6.9, textColor: [51, 65, 85] },
      4: { cellWidth: 45, fontSize: 7.0 },
      5: { cellWidth: 25, halign: 'center', fontStyle: 'bold', fontSize: 6.9, textColor: [5, 150, 105] },
    },
  });

  autoTable(doc, {
    ...defaults,
    startY: nextY,
    head,
    body,
    styles: {
      ...defaults.styles,
      fontSize: 7.1,
      cellPadding: { top: 2.2, right: 2.0, bottom: 2.2, left: 2.0 },
    },
  });

  // 4. Physician Clinical Reference & Administration Standard Box at end of document
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxH = 21;
  let refY = (doc.lastAutoTable?.finalY || 60) + 5;
  if (refY + boxH > pageHeight - 18) {
    doc.addPage();
    refY = 18;
  }

  doc.setFillColor(...ATLAS_PDF_PALETTE.surface);
  doc.setDrawColor(...ATLAS_PDF_PALETTE.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, refY, pageWidth - 28, boxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.setTextColor(...ATLAS_PDF_PALETTE.navy);
  doc.text(
    isEs
      ? 'ESTANDAR CLINICO DE ADMINISTRACION Y CONSERVACION · ATLAS HEALTH SERVICES'
      : 'CLINICAL ADMINISTRATION & COLD-CHAIN STANDARD · ATLAS HEALTH SERVICES',
    18,
    refY + 4.8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.0);
  doc.setTextColor(...ATLAS_PDF_PALETTE.slate700);
  const noteLines = isEs
    ? [
        '• Mecanica del Dial: Cartucho esteril de 3.0 mL = 300 unidades (clics). Cada clic equivale exactamente a 0.01 mL. Purgar 1-2 clics antes del primer uso.',
        '• Tecnica & Aguja: Administracion subcutanea (abdomen o muslo) con aguja esteril nueva 31G/32G x 4 mm en cada aplicacion. Retirar aguja tras inyectar.',
        '• Estabilidad & Guia Paciente: Refrigerar 2°C-8°C protegido de la luz (BUD 30 dias tras apertura). Guia interactiva: atlashealth-services.com/calculator?format=pen',
      ]
    : [
        '• Dial Calibration: Sterile 3.0 mL cartridge = 300 units (clicks). Each click delivers exactly 0.01 mL. Prime 1-2 clicks before first administration.',
        '• Injection Standard: Subcutaneous administration (abdomen/thigh) using a fresh sterile 31G/32G x 4 mm pen needle per dose. Remove needle immediately after use.',
        '• Cold-Chain & Patient Guide: Refrigerate 2°C-8°C away from light (30-day BUD once pierced). Interactive patient guide: atlashealth-services.com/calculator?format=pen',
      ];
  noteLines.forEach((line, i) => {
    doc.text(line, 18, refY + 9.4 + i * 3.9);
  });

  // 5. Institutional Running Footer on every page
  applyAtlasRunningFooter(doc, {
    disclaimer: isEs
      ? 'ATLAS HEALTH SERVICES · FORMULARIO CLINICO DE PLUMAS PRECARGADAS · SOLO PARA MEDICOS Y CLINICAS · atlashealth-services.com/pricing/pens'
      : 'ATLAS HEALTH SERVICES · CLINICAL PRE-FILLED PENS FORMULARY · FOR PHYSICIANS & CLINICS ONLY · atlashealth-services.com/pricing/pens',
  });

  const filename = isEs
    ? `Atlas_Health_Plumas_Precargadas_Formulario_${today}.pdf`
    : `Atlas_Health_PreFilled_Pens_Formulary_${today}.pdf`;

  return previewOrSavePdf(doc, filename, {
    title: isEs
      ? 'Atlas Health Services — Formulario Clínico de Plumas Precargadas'
      : 'Atlas Health Services — Pre-filled Peptide Pens Clinical Formulary',
    subtitle: isEs
      ? `${products.length} fórmulas · ${totalVariants} variantes · REF DOC-ATL-PENS-2026`
      : `${products.length} formulas · ${totalVariants} variants · REF DOC-ATL-PENS-2026`,
  });
}
