/**
 * protocolGuideExportService.js
 * 
 * Generates an official, high-quality Clinical Protocol Guide & Treatment Pathway PDF
 * for individual protocols in the Atlas Health catalog.
 * Also supports exporting a multi-protocol Compendium / Clinical Directory PDF.
 * Uses jsPDF and jspdf-autotable for pixel-perfect printable layout.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [15, 23, 42],       // slate-900
  accentTeal: [13, 148, 136],  // teal-600
  accentBlue: [37, 99, 235],   // blue-600
  border: [226, 232, 240],     // slate-200
  lightBg: [248, 250, 252],    // slate-50
  text: [30, 41, 59],          // slate-800
  muted: [100, 116, 139],      // slate-500
  white: [255, 255, 255],
  success: [22, 163, 74]       // green-600
};

/**
 * Generates an official single Clinical Protocol PDF Guide.
 * 
 * @param {object} protocol - Protocol document from Firestore
 * @param {object} options - Configuration options (role, clinicName, etc.)
 */
export async function generateProtocolGuidePdf(protocol, options = {}) {
  if (!protocol) throw new Error('Protocol is required to generate a protocol guide');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PAGE_W = 210;
  const PAGE_H = 297;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  const protocolName = protocol.name || protocol.displayName || 'Clinical Protocol';
  const role = options.role || 'admin';
  const isDoctorRole = ['doctor', 'medical_director'].includes(role);
  const accentColor = isDoctorRole ? COLORS.accentTeal : COLORS.accentBlue;

  // ── 1. Top Header Banner ──────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 26, 'F');

  // Accent stripe
  doc.setFillColor(...accentColor);
  doc.rect(0, 26, PAGE_W, 2, 'F');

  // Brand Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...COLORS.white);
  doc.text('ATLAS HEALTH', MARGIN, 13);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('CLINICAL PROTOCOL & PEPTIDE TREATMENT PATHWAY', MARGIN, 19);

  // Document Title (Right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.white);
  doc.text('CLINICAL PROTOCOL GUIDE', PAGE_W - MARGIN, 13, { align: 'right' });

  const totalWeeks = protocol.duration_weeks ||
    (protocol.phases || []).reduce((sum, p) => sum + (p.duration_weeks || p.durationWeeks || 0), 0) ||
    12;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`CODE: ${protocol.code || protocol.slug || protocol.id || 'N/A'} · ${totalWeeks} WEEKS · ${protocol.status?.toUpperCase() || 'ACTIVE'}`, PAGE_W - MARGIN, 19, { align: 'right' });

  let y = 36;

  // ── 2. Protocol Title & Clinical Goal ─────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(...COLORS.text);
  doc.text(protocolName, MARGIN, y);

  const goalText = (protocol.primary_goal || protocol.goal || protocol.category || 'Clinical Optimization').toUpperCase();
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text(goalText, PAGE_W - MARGIN, y, { align: 'right' });

  y += 6;

  // Description / Clinical Objective
  const desc = protocol.description || protocol.objective || protocol.summary || 'Evidence-based peptide therapy protocol designed for targeted clinical outcomes.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.muted);
  const splitDesc = doc.splitTextToSize(desc, CONTENT_W);
  doc.text(splitDesc.slice(0, 3), MARGIN, y);
  y += Math.min(splitDesc.length, 3) * 4.2 + 4;

  // ── 3. Quick Overview Key Metrics Box ────────────────────────────────────
  doc.setFillColor(...COLORS.lightBg);
  doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, 'F');
  doc.setDrawColor(...COLORS.border);
  doc.roundedRect(MARGIN, y, CONTENT_W, 14, 2, 2, 'S');

  const peptideCount = (protocol.peptideIds?.length || protocol.peptides?.length || 0);
  const phaseCount = (protocol.phases?.length || 1);
  const audience = protocol.target_audience || 'Adults / Clinical Evaluation';

  const colW = CONTENT_W / 4;
  const metrics = [
    { label: 'CYCLE DURATION', val: `${totalWeeks} Weeks` },
    { label: 'ACTIVE PHASES', val: `${phaseCount} Phases` },
    { label: 'PEPTIDES INCLUDED', val: `${peptideCount} Compounds` },
    { label: 'TARGET AUDIENCE', val: audience.length > 22 ? audience.slice(0, 20) + '...' : audience }
  ];

  metrics.forEach((m, idx) => {
    const xPos = MARGIN + idx * colW + 4;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(m.label, xPos, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.text);
    doc.text(m.val, xPos, y + 10.5);
  });

  y += 18;

  // ── 4. Phased Treatment Matrix Table ──────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('1. PHASED TREATMENT MATRIX & DOSING SCHEDULE', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 3;

  // Flatten phases and compounds for the table
  const tableRows = [];
  if (protocol.phases && protocol.phases.length > 0) {
    let weekCursor = 1;
    protocol.phases.forEach((phase, phaseIdx) => {
      const dur = phase.duration_weeks || phase.durationWeeks || phase.durationInWeeks || 4;
      const phaseName = phase.name || phase.phase_name || `Phase ${phaseIdx + 1}`;
      const weekRange = `W${weekCursor}–W${weekCursor + dur - 1} (${dur}w)`;
      const compounds = phase.peptides || phase.compounds || phase.items || [];

      if (compounds.length > 0) {
        compounds.forEach((c, cIdx) => {
          const name = c.name || c.canonicalName || c.peptideName || (typeof c === 'string' ? c : 'Peptide');
          const dose = c.dosage || c.dose || c.strength || 'Standard';
          const freq = c.frequency || c.timing || 'Daily';
          const route = c.route || c.administration || 'SubQ';
          const notes = c.notes || phase.notes || 'Targeted activation';

          tableRows.push([
            cIdx === 0 ? `${phaseName}\n${weekRange}` : '',
            name,
            dose,
            freq,
            route,
            notes.length > 30 ? notes.slice(0, 28) + '...' : notes
          ]);
        });
      } else {
        tableRows.push([`${phaseName}\n${weekRange}`, 'Custom protocol compounds', 'Per titration', 'Weekly', 'SubQ', phase.notes || '']);
      }
      weekCursor += dur;
    });
  } else if (protocol.peptides && protocol.peptides.length > 0) {
    protocol.peptides.forEach((p) => {
      const name = p.name || p.canonicalName || (typeof p === 'string' ? p : 'Peptide');
      tableRows.push([
        `Standard\n1–${totalWeeks}w`,
        name,
        p.dosage || 'Standard dose',
        p.frequency || 'Weekly',
        p.route || 'SubQ',
        p.objective || 'Primary therapeutic goal'
      ]);
    });
  } else {
    tableRows.push(['All Phases', 'Peptide compound schedule', 'Titrated', 'Scheduled', 'SubQ', 'Clinical monitoring']);
  }

  autoTable(doc, {
    startY: y,
    head: [['Phase & Weeks', 'Peptide Compound', 'Dose', 'Frequency', 'Route', 'Clinical Purpose']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.2
    },
    styles: {
      fontSize: 7.5,
      textColor: COLORS.text,
      cellPadding: 2,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold', textColor: accentColor },
      2: { cellWidth: 26 },
      3: { cellWidth: 26 },
      4: { cellWidth: 20 },
      5: { cellWidth: 'auto' }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── 5. Synergies, Clinical Mechanisms & Expected Outcomes ─────────────────
  if (y + 35 > PAGE_H - 22) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('2. CLINICAL MECHANISM, SYNERGY & EXPECTED OUTCOMES', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const outcomes = protocol.expected_outcomes || protocol.outcomes || [
    'Optimization of target receptor cascades and cellular repair pathways.',
    'Synergistic modulation of metabolism, hormonal balance, or tissue regeneration.',
    'Maintained lean tissue composition during calorie deficit or recovery phases.'
  ];
  const outcomesArr = Array.isArray(outcomes) ? outcomes : [outcomes];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.text);
  outcomesArr.slice(0, 4).forEach((outcome) => {
    const text = `• ${outcome}`;
    const split = doc.splitTextToSize(text, CONTENT_W);
    doc.text(split, MARGIN, y);
    y += split.length * 3.8;
  });

  y += 4;

  // ── 6. Clinical Monitoring & Recommended Biomarkers ───────────────────────
  if (y + 40 > PAGE_H - 22) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('3. RECOMMENDED BIOMARKERS & SAFETY MONITORING', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 3;

  const monitoringRows = [
    ['Baseline (Pre-Cycle)', 'Complete Metabolic Panel (CMP), CBC, Fasting Insulin, Lipid Profile, hs-CRP, IGF-1'],
    ['Mid-Cycle (Week 6-8)', 'Hepatic & Renal Panel, Fasting Glucose, Symptom tolerance evaluation'],
    ['Post-Cycle (Week 12+)', 'Follow-up CMP, Lipid Panel, Hormone panel evaluation, 4-week washout assessment']
  ];

  autoTable(doc, {
    startY: y,
    head: [['Timing Milestone', 'Recommended Biomarker Tests / Evaluation Criteria']],
    body: monitoringRows,
    theme: 'grid',
    headStyles: {
      fillColor: accentColor,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.5,
      textColor: COLORS.text,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  y = doc.lastAutoTable.finalY + 6;

  // ── 7. Contraindications & Precautionary Guidelines ───────────────────────
  if (y + 30 > PAGE_H - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.primary);
  doc.text('4. CONTRAINDICATIONS & CLINICAL PRECAUTIONS', MARGIN, y);
  y += 2;
  doc.setDrawColor(...COLORS.border);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 4;

  const precautions = protocol.contraindications || [
    'Active malignancy or unexplained elevated proliferative biomarkers.',
    'Pregnancy, lactation, or planning conception within the treatment window.',
    'Severe hepatic or renal impairment without specialized nephrology/hepatology oversight.',
    'Co-administration with unverified research peptides without cross-interaction review.'
  ];
  const precautionsArr = Array.isArray(precautions) ? precautions : [precautions];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28); // red-700
  precautionsArr.slice(0, 4).forEach((p) => {
    const text = `▲ ${p}`;
    const split = doc.splitTextToSize(text, CONTENT_W);
    doc.text(split, MARGIN, y);
    y += split.length * 3.6;
  });

  // ── Footer / Legal Disclaimer on every page ──────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, PAGE_H - 12, PAGE_W - MARGIN, PAGE_H - 12);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text(
      'FOR INVESTIGATIONAL & CLINICAL PRACTICE USE ONLY · ATLAS HEALTH PLATFORM · STRICT CLINICAL GOVERNANCE',
      MARGIN,
      PAGE_H - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 8, { align: 'right' });
  }

  const safeFilename = `${protocolName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_clinical_guide.pdf`;
  doc.save(safeFilename);
  return safeFilename;
}

/**
 * Generates a full Clinical Protocols Compendium / Directory PDF for all active protocols.
 * 
 * @param {Array} protocols - List of protocols
 * @param {object} options - Options (role, category filter, etc.)
 */
export async function generateProtocolCompendiumPdf(protocols = [], options = {}) {
  if (!protocols.length) throw new Error('No protocols provided to export');

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const PAGE_W = 297;
  const PAGE_H = 210;
  const MARGIN = 14;

  const role = options.role || 'admin';
  const isDoctorRole = ['doctor', 'medical_director'].includes(role);
  const accentColor = isDoctorRole ? COLORS.accentTeal : COLORS.accentBlue;

  // Header Banner
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 22, 'F');
  doc.setFillColor(...accentColor);
  doc.rect(0, 22, PAGE_W, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.white);
  doc.text('ATLAS HEALTH · CLINICAL PROTOCOLS COMPENDIUM', MARGIN, 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`TREATMENT DIRECTORY & PATHWAYS · ${protocols.length} PROTOCOLS INDEXED · ${new Date().toLocaleDateString()}`, MARGIN, 18);

  const tableBody = protocols.map((p, idx) => {
    const totalWeeks = p.duration_weeks ||
      (p.phases || []).reduce((sum, phase) => sum + (phase.duration_weeks || phase.durationWeeks || 0), 0) ||
      '--';

    const peptideNames = (p.peptides || []).map(pep => pep.name || pep.canonicalName || pep).filter(Boolean);
    if (!peptideNames.length && p.peptideIds?.length) peptideNames.push(...p.peptideIds);

    return [
      idx + 1,
      p.name || 'Untitled Protocol',
      (p.primary_goal || p.goal || p.category || 'General').toUpperCase(),
      `${totalWeeks} w`,
      p.phases?.length || 1,
      peptideNames.slice(0, 3).join(', ') + (peptideNames.length > 3 ? ` (+${peptideNames.length - 3})` : '') || 'Custom compounds',
      (p.status || 'active').toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: 28,
    head: [['#', 'Protocol Name', 'Clinical Goal / Area', 'Duration', 'Phases', 'Key Peptides', 'Status']],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2
    },
    styles: {
      fontSize: 7.5,
      textColor: COLORS.text,
      cellPadding: 2,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: COLORS.lightBg
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70, fontStyle: 'bold', textColor: accentColor },
      2: { cellWidth: 50 },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 18, halign: 'center' },
      5: { cellWidth: 75 },
      6: { cellWidth: 24, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: MARGIN, right: MARGIN }
  });

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.border);
    doc.line(MARGIN, PAGE_H - 10, PAGE_W - MARGIN, PAGE_H - 10);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.muted);
    doc.text('ATLAS HEALTH CLINICAL COMPENDIUM · STRICT RESEARCH & CLINICAL COMPLIANCE', MARGIN, PAGE_H - 6);
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: 'right' });
  }

  const filename = `atlas_protocols_compendium_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
}
