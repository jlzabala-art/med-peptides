import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KNOWN_PEPTIDE_DATA } from '@/utils/knownPeptideData';

export function parsePeptideBlendDisplay(productName = '', rawDose = '') {
  const nameStr = String(productName || '').trim();
  const doseStr = String(rawDose || '').trim();
  const upperName = nameStr.toUpperCase();

  // Explicit handling for GLOW & KLOW multi-peptide regenerative blends
  if (upperName.startsWith('GLOW')) {
    const mainTitle = 'GLOW Blend (3-Peptide Stack)';
    const primaryDose = '70 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 mg'
    };
  }

  if (upperName.startsWith('KLOW')) {
    const mainTitle = 'KLOW Blend (4-Peptide Stack)';
    const primaryDose = '80 mg Total';
    return {
      isBlend: true,
      mainTitle,
      titleLine: mainTitle,
      compositionLine: 'BPC-157 (10 mg) + TB-500 (10 mg) + GHK-Cu (50 mg) + KPV (10 mg)',
      primaryDose,
      dosageMain: primaryDose,
      subDose: '10 / 10 / 50 / 10 mg'
    };
  }

  // Generic parenthetical or slash blend detection, e.g. "BPC-157 / TB-500" or "CJC-1295 + Ipamorelin"
  const parenMatch = nameStr.match(/^([^(]+)\(([^)]+)\)$/);
  const doseParts = doseStr.split(/[+·/]/).map(s => s.trim()).filter(Boolean);

  if (parenMatch && doseParts.length > 1) {
    const baseTitle = parenMatch[1].trim();
    const innerIngredients = parenMatch[2].split(/[/+]/).map(s => s.trim()).filter(Boolean);
    const paired = innerIngredients.map((ing, i) => (doseParts[i] ? `${ing} (${doseParts[i]})` : ing)).join(' + ');
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' + ');

    return {
      isBlend: true,
      mainTitle: baseTitle,
      titleLine: baseTitle,
      compositionLine: paired,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.map(d => d.replace(/\s*mg/i, '')).join(' / ') + ' mg'
    };
  }

  if (doseParts.length > 1) {
    const numericSum = doseParts.reduce((acc, part) => {
      const m = part.match(/(\d+(?:\.\d+)?)\s*mg/i);
      return m ? acc + parseFloat(m[1]) : acc;
    }, 0);
    const primaryDose = numericSum > 0 ? `${numericSum} mg Total` : doseParts.join(' · ');

    return {
      isBlend: true,
      mainTitle: nameStr,
      titleLine: nameStr,
      compositionLine: null,
      primaryDose,
      dosageMain: primaryDose,
      subDose: doseParts.join(' + ')
    };
  }

  return {
    isBlend: false,
    mainTitle: nameStr,
    titleLine: nameStr,
    compositionLine: null,
    primaryDose: doseStr || '—',
    dosageMain: doseStr || '—',
    subDose: null
  };
}

export function resolveCasForPdf(productName = '', rowCas = null) {
  if (rowCas) return rowCas;
  const clean = (productName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const found = Object.entries(KNOWN_PEPTIDE_DATA).find(([k]) => {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean.includes(kClean) || kClean.includes(clean);
  });
  return found?.[1]?.casNumber || null;
}

/**
 * buildPeptidesPriceSchedulePdfBlob
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates an institutional-grade A4 PDF document that is 100% pixel- and
 * structure-identical to the on-screen official A4 price schedule preview.
 *
 * Features:
 *  - Atlas Health Services Navy & Teal letterhead
 *  - Official Schedule Reference Card (REF, COA Purity, Logistics)
 *  - 4-Card Executive KPI Grid (Currency, Catalog Depth, Pack 10 Savings, cGMP)
 *  - 7-Column Layout with Category Banners & Page Breaks
 *  - Multi-line Active Principles with CAS numbers & regulatory badges
 *  - Formatted Unit and 10-Pack Prices with per-vial sub-pricing
 *  - Running institutional footer with dynamic "Page X of Y"
 */
export function buildPeptidesPriceSchedulePdfBlob({
  products = [],
  currency = 'USD',
  currencySymbol = '$',
  formatPrice,
  isDistributor = false,
  isEs = false,
  groupByCategory = true,
  documentRef = 'ATLAS-B2B-2026-Q4'
}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setProperties({
    title: isEs ? 'Tarifa Oficial de Péptidos Bioactivos B2B - Atlas Health' : 'Official B2B Peptide Price Schedule - Atlas Health',
    subject: 'Certified Lyophilized Bioactive Vials (10R Borosilicate)',
    author: 'Atlas Health Services · Clinical Supply Division',
    keywords: 'peptides, price schedule, b2b, atlas health, bioactive, cGMP',
    creator: 'Atlas Health Verified Document Engine'
  });

  // Helper price formatter
  const formatMoney = (val) => {
    if (typeof formatPrice === 'function') {
      try { return formatPrice(val); } catch { /* fallback */ }
    }
    const num = Number(val || 0);
    return `${currencySymbol}${num.toFixed(2)}`;
  };

  // ── Page 1: Institutional Header ──
  const headerH = 26;
  doc.setFillColor(0, 54, 102); // #003666
  doc.rect(0, 0, pageWidth, headerH, 'F');
  doc.setFillColor(13, 148, 136); // #0d9488
  doc.rect(0, headerH, pageWidth, 1.2, 'F');

  doc.setTextColor(186, 230, 253); // #bae6fd
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(
    isEs ? 'ATLAS HEALTH SERVICES · SUMINISTRO CLÍNICO' : 'ATLAS HEALTH SERVICES · CLINICAL SUPPLY',
    12,
    7.5
  );

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(
    isEs
      ? 'Formulaciones de Péptidos Bioactivos · Tarifa Oficial B2B'
      : 'Bioactive Peptide Formulations · Official Price Schedule',
    12,
    14.5
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(226, 232, 240);
  doc.text(
    isEs
      ? 'Viales Liofilizados Estériles Certificados (Vidrio Borosilicato 10R USP Tipo I) · Pureza Analítica ≥99.0% HPLC'
      : 'Certified Lyophilized Bioactive Vials (10R Borosilicate USP Type I Glass) · Sterile Analytical Release ≥99.0% HPLC',
    12,
    20.5
  );

  // ── Header Right: Schedule Metadata Box ──
  const boxW = 56;
  const boxX = pageWidth - 12 - boxW;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, 4.2, boxW, 18.5, 1.5, 1.5, 'F');

  doc.setFontSize(6.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(isEs ? 'TARIFA:' : 'SCHEDULE:', boxX + 3, 8.2);
  doc.setTextColor(22, 101, 52);
  doc.text(
    isDistributor
      ? (isEs ? 'DISTRIBUIDOR B2B' : 'DISTRIBUTOR B2B')
      : (isEs ? 'MAYORISTA B2B' : 'WHOLESALER B2B'),
    boxX + 22,
    8.2
  );

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(isEs ? 'CÓDIGO REF:' : 'REF CODE:', boxX + 3, 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(documentRef, boxX + 22, 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(isEs ? 'PUREZA COA:' : 'BATCH COA:', boxX + 3, 15.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136);
  doc.text(isEs ? '≥99.0% HPLC Validado' : '≥99.0% HPLC Validated', boxX + 22, 15.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(isEs ? 'LOGÍSTICA:' : 'DISPATCH:', boxX + 3, 19.6);
  doc.setTextColor(71, 85, 105);
  doc.text(isEs ? 'Despacho Express UE/EAU' : 'UAE & EU Express Dispatch', boxX + 22, 19.6);

  // ── 4 Executive KPI Cards (Exact Parity with Preview) ──
  const kpiY = headerH + 3.8;
  const marginX = 12;
  const gap = 3;
  const totalW = pageWidth - marginX * 2;
  const cardW = (totalW - gap * 3) / 4;
  const cardH = 13.5;

  const kpiData = [
    {
      label: isEs ? 'DIVISA FACTURACIÓN' : 'BILLING CURRENCY',
      val: `${currency} (${currencySymbol})`,
      sub: isEs ? '● Tarifa Activa' : '● Active Quote',
      subColor: [22, 101, 52]
    },
    {
      label: isEs ? 'FORMULACIONES' : 'CATALOG DEPTH',
      val: `${products.length} ${isEs ? 'Items' : 'Items'}`,
      sub: isEs ? 'Viales Estériles 10R' : 'Sterile 10R Formulations',
      subColor: [100, 116, 139]
    },
    {
      label: isEs ? 'VENTAJA PACK ×10' : 'PACK ×10 ADVANTAGE',
      val: '-15% — -52%',
      sub: isEs ? 'Escala por volumen' : 'Wholesale volume tier',
      subColor: [19, 115, 51]
    },
    {
      label: isEs ? 'GARANTÍA CALIDAD' : 'QUALITY RELEASE',
      val: '100% cGMP',
      sub: isEs ? 'Certificado COA lote' : 'Batch analytical COA',
      subColor: [13, 148, 136]
    }
  ];

  kpiData.forEach((kpi, idx) => {
    const x = marginX + idx * (cardW + gap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, kpiY, cardW, cardH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, kpiY + 3.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.4);
    doc.setTextColor(0, 54, 102);
    doc.text(kpi.val, x + 3, kpiY + 8.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(5.8);
    doc.setTextColor(...kpi.subColor);
    doc.text(kpi.sub, x + 3, kpiY + 11.8);
  });

  // ── Construct 7-Column Table Body with Category Banners ──
  const head = [[
    '#',
    isEs ? 'Principio Activo & Composición' : 'Peptide Active Principle & Composition',
    isEs ? 'Concentración' : 'Strength',
    isEs ? 'Clase Terapéutica' : 'Therapeutic Class',
    isEs ? `Vial (1x)` : `Single (1x)`,
    isEs ? `Pack ×10 Viales` : `Pack of 10 (×10)`,
    isEs ? 'Ahorro' : 'Savings'
  ]];

  const body = [];
  let globalIndex = 0;

  if (groupByCategory) {
    const map = new Map();
    products.forEach((p) => {
      const catKey = p.categoryKey || 'general_health';
      const catTitle = isEs
        ? (p?.categoryMeta?.labelEs || p?.categoryMeta?.label || 'Péptidos Clínicos')
        : (p?.categoryMeta?.labelEn || p?.categoryMeta?.label || 'Clinical Peptides');
      if (!map.has(catKey)) {
        map.set(catKey, { title: catTitle, items: [] });
      }
      map.get(catKey).items.push(p);
    });

    map.forEach((section) => {
      // Category banner row spanning all 7 columns
      body.push([
        {
          content: `${section.title.toUpperCase()} (${section.items.length})`,
          colSpan: 7,
          styles: {
            fillColor: [232, 240, 254], // #e8f0fe
            textColor: [0, 54, 102], // #003666
            fontStyle: 'bold',
            fontSize: 7.4,
            cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 }
          }
        }
      ]);

      section.items.forEach((p) => {
        globalIndex += 1;
        const rowIdx = globalIndex;
        const p10 = p.pack10Price || (Number(p.unitPrice || 0) * 10 * 0.85);
        const perUnit = p.tier10UnitPrice || (Number(p.unitPrice || 0) * 0.85);
        const discountPct = Math.max(10, Math.round((1 - (p10 / (Number(p.unitPrice || 0) * 10))) * 100));

        const parsedBlend = parsePeptideBlendDisplay(p.productName || p.name, p.dosage);
        const casNumber = resolveCasForPdf(p.productName || p.name, p.casNumber);
        const badge = p.fdaStatus?.shortBadge || (p.isFdaApproved ? 'FDA Approved' : null);

        let colPrinciple = parsedBlend.mainTitle;
        if (badge) colPrinciple += `  [${badge}]`;
        if (parsedBlend.compositionLine) colPrinciple += `\n${parsedBlend.compositionLine}`;
        if (casNumber) colPrinciple += `\nCAS: ${casNumber}`;

        const therapeuticClass = p.therapeuticClass || p.category || (isEs ? 'Péptido Bioactivo' : 'Bioactive Peptide');

        body.push([
          { content: String(rowIdx), styles: { halign: 'center', textColor: [100, 116, 139] } },
          { content: colPrinciple, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
          { content: parsedBlend.primaryDose || p.dosage || '—', styles: { halign: 'center', fontStyle: 'bold', textColor: [26, 115, 232] } },
          { content: therapeuticClass, styles: { textColor: [71, 85, 105] } },
          { content: formatMoney(p.unitPrice), styles: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] } },
          { content: `${formatMoney(p10)}\n(${formatMoney(perUnit)}/vial)`, styles: { halign: 'right', fontStyle: 'bold', textColor: [19, 115, 51] } },
          { content: `-${discountPct}%`, styles: { halign: 'center', fontStyle: 'bold', textColor: [22, 101, 52], fillColor: [240, 253, 244] } }
        ]);
      });
    });
  } else {
    // Continuous listing without categories
    products.forEach((p, idx) => {
      const rowIdx = idx + 1;
      const p10 = p.pack10Price || (Number(p.unitPrice || 0) * 10 * 0.85);
      const perUnit = p.tier10UnitPrice || (Number(p.unitPrice || 0) * 0.85);
      const discountPct = Math.max(10, Math.round((1 - (p10 / (Number(p.unitPrice || 0) * 10))) * 100));

      const parsedBlend = parsePeptideBlendDisplay(p.productName || p.name, p.dosage);
      const casNumber = resolveCasForPdf(p.productName || p.name, p.casNumber);
      const badge = p.fdaStatus?.shortBadge || (p.isFdaApproved ? 'FDA Approved' : null);

      let colPrinciple = parsedBlend.mainTitle;
      if (badge) colPrinciple += `  [${badge}]`;
      if (parsedBlend.compositionLine) colPrinciple += `\n${parsedBlend.compositionLine}`;
      if (casNumber) colPrinciple += `\nCAS: ${casNumber}`;

      const therapeuticClass = p.therapeuticClass || p.category || (isEs ? 'Péptido Bioactivo' : 'Bioactive Peptide');

      body.push([
        { content: String(rowIdx), styles: { halign: 'center', textColor: [100, 116, 139] } },
        { content: colPrinciple, styles: { fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: parsedBlend.primaryDose || p.dosage || '—', styles: { halign: 'center', fontStyle: 'bold', textColor: [26, 115, 232] } },
        { content: therapeuticClass, styles: { textColor: [71, 85, 105] } },
        { content: formatMoney(p.unitPrice), styles: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] } },
        { content: `${formatMoney(p10)}\n(${formatMoney(perUnit)}/vial)`, styles: { halign: 'right', fontStyle: 'bold', textColor: [19, 115, 51] } },
        { content: `-${discountPct}%`, styles: { halign: 'center', fontStyle: 'bold', textColor: [22, 101, 52], fillColor: [240, 253, 244] } }
      ]);
    });
  }

  // ── Render Dense Table with Repeating Headers ──
  autoTable(doc, {
    startY: 47,
    head,
    body,
    theme: 'grid',
    showHead: 'everyPage',
    margin: { left: 12, right: 12, bottom: 16 },
    styles: {
      fontSize: 7.2,
      cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 },
      valign: 'middle',
      overflow: 'linebreak',
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    headStyles: {
      fillColor: [0, 54, 102],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.2,
      cellPadding: { top: 2.8, bottom: 2.8, left: 2, right: 2 }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 62 },
      2: { cellWidth: 18 },
      3: { cellWidth: 34 },
      4: { cellWidth: 20 },
      5: { cellWidth: 28 },
      6: { cellWidth: 16 }
    }
  });

  // ── Running Page Footers ("Page X of Y" + Institutional Legal) ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(12, pageHeight - 12, pageWidth - 12, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      isEs
        ? 'ATLAS HEALTH SERVICES · SUMINISTRO CLÍNICO B2B · DOCUMENTO OFICIAL A4 VERIFICADO'
        : 'ATLAS HEALTH SERVICES · CLINICAL SUPPLY DIVISION · VERIFIED INSTITUTIONAL SCHEDULE · A4',
      12,
      pageHeight - 7.5
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - 12, pageHeight - 7.5, { align: 'right' });
  }

  return doc.output('blob');
}
