/**
 * datasheetExportService.js
 * 
 * Generates an official, high-quality Clinical & Technical Datasheet PDF
 * for individual peptides / products in the Atlas Health catalog.
 * Uses jsPDF and jspdf-autotable for pixel-perfect printable layout.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [15, 23, 42],       // slate-900
  accent: [37, 99, 235],       // blue-600
  accentTeal: [13, 148, 136],  // teal-600
  border: [226, 232, 240],     // slate-200
  lightBg: [248, 250, 252],    // slate-50
  text: [30, 41, 59],          // slate-800
  muted: [100, 116, 139],      // slate-500
  white: [255, 255, 255]
};

export async function generateProductDatasheetPdf(product, options = {}) {
  if (!product) throw new Error('Product is required to generate a datasheet');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const productName = product.canonicalName || product.displayName || product.name || 'Unknown Compound';
  const role = options.role || 'admin';
  const isDoctorRole = ['doctor', 'medical_director'].includes(role);

  // ── 1. Top Header Banner ──────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 26, 'F');

  // Top accent stripe
  doc.setFillColor(...(isDoctorRole ? COLORS.accentTeal : COLORS.accent));
  doc.rect(0, 26, PAGE_W, 2, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.white);
  doc.text('ATLAS HEALTH', MARGIN, 13);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('CLINICAL RESEARCH & PEPTIDE INTELLIGENCE', MARGIN, 19);

  // Document Title (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text('OFFICIAL TECHNICAL DATASHEET', PAGE_W - MARGIN, 13, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`REF: ${product.cas || product.id || 'N/A'} · ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`, PAGE_W - MARGIN, 19, { align: 'right' });

  let y = 36;

  // ── 2. Product Title & Category ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.text);
  doc.text(productName, MARGIN, y);

  if (product.category) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(isDoctorRole ? COLORS.accentTeal : COLORS.accent));
    doc.text(product.category.toUpperCase(), PAGE_W - MARGIN, y, { align: 'right' });
  }

  y += 6;

  // Description / Subtitle
  const desc = product.description || product.objective || product.summary || 'Investigational research compound.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  const splitDesc = doc.splitTextToSize(desc, CONTENT_W);
  doc.text(splitDesc.slice(0, 3), MARGIN, y);
  y += Math.min(splitDesc.length, 3) * 4.2 + 4;

  // ── 3. Section: Molecular & Analytical Profile ────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('1. MOLECULAR & CHEMICAL IDENTITY', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const chemSpecs = [
    ['CAS Number:', product.cas || product.casNumber || 'Investigational / N/A'],
    ['Purity (HPLC):', product.purity || '≥ 99.0%'],
    ['Molecular Formula:', product.molecularFormula || product.molecular_formula || 'Proprietary Sequence'],
    ['Molecular Weight:', product.molecularWeight ? `${product.molecularWeight} Da` : 'N/A'],
    ['Primary Target:', product.target || product.targetSystem || 'Metabolic / Peptide Receptor'],
    ['Sequence:', product.sequence ? (product.sequence.length > 40 ? `${product.sequence.slice(0, 38)}...` : product.sequence) : 'Synthetic Agonist']
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      [chemSpecs[0][0], chemSpecs[0][1], chemSpecs[1][0], chemSpecs[1][1]],
      [chemSpecs[2][0], chemSpecs[2][1], chemSpecs[3][0], chemSpecs[3][1]],
      [chemSpecs[4][0], chemSpecs[4][1], chemSpecs[5][0], chemSpecs[5][1]],
    ],
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 2, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 32 },
      1: { cellWidth: 58 },
      2: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 32 },
      3: { cellWidth: 58 }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── 4. Section: Mechanism of Action & Pharmacology ────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('2. MECHANISM OF ACTION & PHARMACOKINETICS', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const pk = product.pharmacology || {};
  const mechText = typeof product.mechanisms === 'string'
    ? product.mechanisms
    : (Array.isArray(product.mechanisms) ? product.mechanisms.join(', ') : (product.aiContent?.whatItIs || 'Triple receptor agonist binding with high affinity to target endocrine pathways.'));

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.text);
  const splitMech = doc.splitTextToSize(mechText, CONTENT_W);
  doc.text(splitMech.slice(0, 4), MARGIN, y);
  y += Math.min(splitMech.length, 4) * 3.8 + 3;

  // PK mini table
  const pkRows = [
    ['Half-life (t1/2):', pk.halfLife || 'approx. 6 days (SubQ)'],
    ['Bioavailability:', pk.bioavailability || '> 80% subcutaneous'],
    ['Receptor Profile:', Array.isArray(pk.receptors) ? pk.receptors.join(', ') : (pk.receptors || 'GLP-1 / GIP / Glucagon')]
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: pkRows,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 40 },
      1: { cellWidth: CONTENT_W - 40 }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── 5. Section: Available Variants & Commercial Specifications ───────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('3. AVAILABLE FORMATS & COMMERCIAL TIERS', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [{ dosage: 'Standard', presentation: 'Vial', stock: 'In Stock', price: product.price || 0 }];

  // Column definitions based on role
  const isB2B = ['admin', 'wholesaler'].includes(role);
  const tableHeaders = isB2B
    ? ['Dosage', 'Presentation', 'Supplier', 'Stock', 'Unit Cost', 'Wholesale', 'Retail PVP', '10-Kit Tier']
    : ['Dosage', 'Presentation', 'Specification', 'Purity', 'Stock Status', 'Clinical Price', 'Retail PVP'];

  const tableBody = variants.slice(0, 10).map((v) => {
    const cost = v.cost ?? v.unit_cost ?? v.pricing?.masterPrice?.base ?? v.pricing?.master?.perUnit;
    const wholesale = v.wholesalePrice ?? v.wholesale_price ?? v.pricing?.wholesalePrice?.base ?? v.pricing?.wholesale?.perUnit;
    const clinic = v.clinicPrice ?? v.clinic_price ?? v.pricing?.clinicPrice?.base ?? v.pricing?.clinic?.perUnit;
    const retail = v.unit_price ?? v.price ?? v.retailPrice ?? v.pricing?.retailPrice?.base ?? v.pricing?.retail?.perUnit;
    const tier10 = v.cost_tiers?.cost_10 ?? v.price_per_kit_10 ?? v.pricing?.wholesale?.kit;

    if (isB2B) {
      return [
        v.dosage || v.concentration || 'Standard',
        v.presentation || v.form || 'Vial',
        v.supplier || 'Atlas Verified',
        v.stock != null ? String(v.stock) : 'Available',
        cost != null ? `$${cost}` : '—',
        wholesale != null ? `$${wholesale}` : '—',
        retail != null ? `$${retail}` : '—',
        tier10 != null ? `$${tier10}` : '—'
      ];
    }

    return [
      v.dosage || v.concentration || 'Standard',
      v.presentation || v.form || 'Vial',
      'Lyophilized powder',
      v.purity || '≥ 99.0%',
      v.stock != null && v.stock > 0 ? 'In Stock' : 'Upon Request',
      clinic != null ? `$${clinic}` : '—',
      retail != null ? `$${retail}` : '—'
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: isDoctorRole ? COLORS.accentTeal : COLORS.accent,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'center'
    },
    styles: { fontSize: 7, cellPadding: 2, halign: 'center', textColor: COLORS.text },
    alternateRowStyles: { fillColor: COLORS.lightBg },
    margin: { left: MARGIN, right: MARGIN }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── 6. Section: Reconstitution & Storage Directives ───────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('4. RECONSTITUTION & STABILITY PROTOCOL', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const storageInfo = [
    ['Lyophilized Storage:', 'Store at -20°C for optimal long-term stability (up to 24 months). Protect from direct light.'],
    ['Reconstitution Solvent:', 'Bacteriostatic Water (0.9% Benzyl Alcohol) or Sterile Saline.'],
    ['Reconstituted Stability:', 'Store at 2°C to 8°C (Refrigerated). Do not freeze reconstituted solution. Stable 28 days.'],
    ['Handling Note:', 'Allow vial to reach room temperature before adding solvent. Gently swirl — do not vortex.']
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: storageInfo,
    theme: 'plain',
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: COLORS.text },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLORS.muted, cellWidth: 42 },
      1: { cellWidth: CONTENT_W - 42 }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = PAGE_H - 10;
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text('Atlas Health Clinical Research Group · For Licensed Research & Clinical Administration Only.', MARGIN, footerY);
  doc.text(`Page 1 of 1 · Generated ${new Date().toISOString().slice(0, 10)}`, PAGE_W - MARGIN, footerY, { align: 'right' });

  // Save / Trigger Download
  const filename = `Datasheet_${productName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
  return { success: true, filename };
}
