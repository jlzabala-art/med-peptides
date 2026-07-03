/* eslint-disable no-unused-vars */
/**
 * doctorPdfGenerator.js
 *
 * Doctor-facing protocol PDF generator.
 * Purpose: Clinical review format for physician reference.
 *
 * Does NOT include: pricing, cart, accessories, marketing copy.
 * Uses only existing protocol data. No invented clinical claims.
 *
 * Built on: jspdf + jspdf-autotable
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
  navy:        [15,  40,  80],   // Primary dark
  teal:        [0,   120, 130],  // Accent
  lightGray:   [245, 247, 250],  // Section backgrounds
  midGray:     [160, 170, 185],  // Secondary text
  darkGray:    [60,  70,  85],   // Body text
  white:       [255, 255, 255],
  divider:     [210, 215, 225],
  phaseColors: [
    [0,  100, 120],   // Phase 1 – teal
    [40, 80,  160],   // Phase 2 – blue
    [90, 50,  140],   // Phase 3 – indigo
    [0,  130, 100],   // Phase 4 – green
    [160, 70, 30],    // Phase 5 – amber
  ],
};

const FONTS = {
  title:    { size: 22, style: 'bold' },
  h1:       { size: 16, style: 'bold' },
  h2:       { size: 13, style: 'bold' },
  h3:       { size: 11, style: 'bold' },
  body:     { size: 10, style: 'normal' },
  small:    { size:  8, style: 'normal' },
  caption:  { size:  8, style: 'italic' },
};

const PAGE = {
  margin:      15,
  marginRight: 15,
  width:       210,  // A4
  height:      297,  // A4
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the usable content width.
 */
function contentWidth() {
  return PAGE.width - PAGE.margin - PAGE.marginRight;
}

/**
 * Set fill + text color together.
 */
function setColor(doc, rgb) {
  doc.setTextColor(...rgb);
}

function setFill(doc, rgb) {
  doc.setFillColor(...rgb);
}

/**
 * Draws a horizontal rule.
 */
function drawRule(doc, y, color = COLORS.divider) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  doc.line(PAGE.margin, y, PAGE.width - PAGE.marginRight, y);
}

/**
 * Draws a section heading with a left accent bar.
 * Returns new Y position after the heading.
 */
function drawSectionHeading(doc, title, y) {
  const accentW = 3;
  const accentH = 7;
  setFill(doc, COLORS.teal);
  doc.rect(PAGE.margin, y - 5, accentW, accentH, 'F');

  doc.setFont('helvetica', FONTS.h2.style);
  doc.setFontSize(FONTS.h2.size);
  setColor(doc, COLORS.navy);
  doc.text(title.toUpperCase(), PAGE.margin + accentW + 3, y);

  drawRule(doc, y + 3, COLORS.divider);
  return y + 10;
}

/**
 * Adds a new page and resets the cursor to the top margin.
 * Returns the new Y.
 */
function addPage(doc) {
  doc.addPage();
  return PAGE.margin + 5;
}

/**
 * Ensures there is enough room on the page; adds a new page if needed.
 * Returns current or new Y.
 */
function ensureSpace(doc, y, needed) {
  if (y + needed > PAGE.height - PAGE.margin) {
    return addPage(doc);
  }
  return y;
}

// ─── Data extraction helpers ──────────────────────────────────────────────────

/**
 * Safely reads a nested path from an object.
 */
function get(obj, path, fallback = null) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : null), obj) ?? fallback;
}

/**
 * Returns the phases array from the protocol, preferring phase_blueprints.
 */
function resolvePhases(protocol) {
  const blueprints = protocol.phase_blueprints;
  if (Array.isArray(blueprints) && blueprints.length > 0) return blueprints;
  if (Array.isArray(protocol.phases) && protocol.phases.length > 0) return protocol.phases;
  return [];
}

/**
 * Collects all unique compound names across all phases.
 */
function resolveCompounds(protocol) {
  const phases = resolvePhases(protocol);
  const seen = new Set();
  const compounds = [];
  for (const phase of phases) {
    const drugs = phase.drugs || phase.drugs_used || [];
    for (const drug of drugs) {
      const name = drug.product_title || drug.product_slug || drug.product_id || 'Unknown';
      if (!seen.has(name)) {
        seen.add(name);
        compounds.push(drug);
      }
    }
  }
  return compounds;
}

// ─── SECTION 1: COVER HEADER ──────────────────────────────────────────────────

/**
 * Renders the cover header block.
 * Returns the Y position after the header.
 */
function renderCoverHeader(doc, protocol) {
  let y = PAGE.margin;

  // ── Dark navy banner ──────────────────────────────────────────────────────
  setFill(doc, COLORS.navy);
  doc.rect(0, 0, PAGE.width, 52, 'F');

  // Teal accent strip at the top
  setFill(doc, COLORS.teal);
  doc.rect(0, 0, PAGE.width, 3, 'F');

  // Logo / brand name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  setColor(doc, COLORS.teal);
  doc.text('MED-PEPTIDES', PAGE.margin, y + 10);

  // "For Physician Review" badge
  const badgeText = 'FOR PHYSICIAN REVIEW';
  doc.setFontSize(7);
  setColor(doc, COLORS.midGray);
  doc.text(badgeText, PAGE.width - PAGE.marginRight, y + 10, { align: 'right' });

  // Protocol title
  const title = protocol.protocol_title || get(protocol, 'metadata.scientificName') || 'Protocol';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(doc, COLORS.white);

  const titleLines = doc.splitTextToSize(title, contentWidth() - 10);
  doc.text(titleLines, PAGE.margin, y + 22);

  // Primary goal
  const goal = protocol.primary_goal || get(protocol, 'metadata.primary_goal') || '';
  if (goal) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.midGray);
    doc.text(goal, PAGE.margin, y + 35);
  }

  y = 60; // Move below the banner

  // ── Quick-metrics strip ───────────────────────────────────────────────────
  const phases    = resolvePhases(protocol);
  const compounds = resolveCompounds(protocol);
  const duration  = protocol.protocol_duration_weeks
    ? `${protocol.protocol_duration_weeks} weeks`
    : 'N/A';
  const complexity = protocol.complexity_level
    || get(protocol, 'metadata.complexity_level')
    || 'N/A';
  const version  = protocol.protocol_version || 'N/A';
  const dateStr  = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const metrics = [
    { label: 'Duration',    value: duration },
    { label: 'Phases',      value: String(phases.length || protocol.number_of_phases || 'N/A') },
    { label: 'Compounds',   value: String(compounds.length) },
    { label: 'Complexity',  value: complexity.charAt(0).toUpperCase() + complexity.slice(1) },
    { label: 'Version',     value: version },
    { label: 'Generated',   value: dateStr },
  ];

  const cardW  = contentWidth() / metrics.length;
  const cardH  = 22;
  const cardY  = y;

  metrics.forEach((m, i) => {
    const x = PAGE.margin + i * cardW;

    // Card background (alternating tint)
    setFill(doc, i % 2 === 0 ? COLORS.lightGray : [235, 238, 245]);
    doc.rect(x, cardY, cardW, cardH, 'F');

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    setColor(doc, COLORS.navy);
    doc.text(m.value, x + cardW / 2, cardY + 10, { align: 'center' });

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, COLORS.midGray);
    doc.text(m.label.toUpperCase(), x + cardW / 2, cardY + 17, { align: 'center' });
  });

  y += cardH + 6;

  // ── Subtitle / short description ──────────────────────────────────────────
  const desc = get(protocol, 'metadata.description') || protocol.overview_summary || '';
  if (desc) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkGray);
    const descLines = doc.splitTextToSize(desc, contentWidth());
    doc.text(descLines, PAGE.margin, y);
    y += descLines.length * 5 + 4;
  }

  drawRule(doc, y);
  y += 6;

  return y;
}

// ─── SECTION 2: CLINICAL SUMMARY ────────────────────────────────────────────

/**
 * Renders the Clinical Summary section.
 * Short bullet-point overview of protocol purpose, target system, and rationale.
 * Returns new Y position.
 */
function renderClinicalSummary(doc, protocol, y) {
  y = ensureSpace(doc, y, 50);
  y = drawSectionHeading(doc, 'Clinical Summary', y);

  // Collect summary points from available data fields
  const points = [];

  const clinicalSummary = get(protocol, 'metadata.clinical_summary') || protocol.overview_summary;
  if (clinicalSummary) points.push(clinicalSummary);

  const longDesc = get(protocol, 'metadata.longDescription');
  if (longDesc) points.push(longDesc);

  const primaryCondition = get(protocol, 'metadata.primary_condition');
  if (primaryCondition) {
    const label = primaryCondition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    points.push(`Target condition: ${label}`);
  }

  const evidenceGrade = get(protocol, 'metadata.evidence_grade');
  if (evidenceGrade) points.push(`Evidence grade: ${evidenceGrade}`);

  const washout = protocol.washout_recommended_weeks;
  if (washout) points.push(`Recommended washout period: ${washout} weeks before repeat cycle.`);

  const physicianReq = protocol.physician_supervision_required;
  if (physicianReq) points.push('Physician supervision required throughout protocol.');

  if (points.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    setColor(doc, COLORS.midGray);
    doc.text('No clinical summary available for this protocol.', PAGE.margin, y);
    return y + 8;
  }

  const bulletX = PAGE.margin + 4;
  const textX   = PAGE.margin + 8;
  const maxW    = contentWidth() - 8;

  for (const point of points) {
    y = ensureSpace(doc, y, 10);

    // Bullet dot
    setFill(doc, COLORS.teal);
    doc.circle(bulletX - 1, y - 1.5, 1, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.darkGray);

    const lines = doc.splitTextToSize(point, maxW);
    doc.text(lines, textX, y);
    y += lines.length * 5 + 2;
  }

  // References row
  const refs = get(protocol, 'metadata.references');
  if (Array.isArray(refs) && refs.length > 0) {
    y = ensureSpace(doc, y, 14);
    drawRule(doc, y, COLORS.divider);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, COLORS.midGray);
    doc.text('Key References:', PAGE.margin, y);
    y += 4;

    for (const ref of refs) {
      y = ensureSpace(doc, y, 6);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      setColor(doc, COLORS.midGray);
      const refText = ref.pmid
        ? `PMID ${ref.pmid} — ${ref.citation}`
        : ref.citation || String(ref);
      const refLines = doc.splitTextToSize(refText, contentWidth() - 4);
      doc.text(refLines, PAGE.margin + 2, y);
      y += refLines.length * 4 + 1;
    }
  }

  y += 6;
  return y;
}

// ─── SECTION 3: PROTOCOL SNAPSHOT ────────────────────────────────────────────

/**
 * Renders a compact protocol snapshot table.
 * At-a-glance view of key protocol parameters.
 * Returns new Y position.
 */
function renderProtocolSnapshot(doc, protocol, y) {
  y = ensureSpace(doc, y, 60);
  y = drawSectionHeading(doc, 'Protocol Snapshot', y);

  const phases    = resolvePhases(protocol);
  const compounds = resolveCompounds(protocol);

  // Build frequency summary
  const freqSet = new Set();
  for (const phase of phases) {
    const drugs = phase.drugs || phase.drugs_used || [];
    for (const d of drugs) {
      const freq = get(d, 'dose_logic.administration_frequency') || d.dosing_frequency;
      if (freq) freqSet.add(freq);
    }
  }
  const freqSummary = freqSet.size > 0 ? [...freqSet].join(', ') : 'Not specified';

  // Build route summary
  const routeSet = new Set();
  for (const phase of phases) {
    const drugs = phase.drugs || phase.drugs_used || [];
    for (const d of drugs) {
      if (d.route) routeSet.add(d.route);
    }
  }
  const routeSummary = routeSet.size > 0 ? [...routeSet].join(', ') : 'Not specified';

  // Monitoring checkpoints count
  const checkpoints =
    (get(protocol, 'monitoring_plan.scheduled_checkpoints') || protocol.monitoringSchedule || []).length;

  const rows = [
    ['Duration',               protocol.protocol_duration_weeks ? `${protocol.protocol_duration_weeks} weeks` : 'N/A'],
    ['Number of Phases',       String(phases.length || protocol.number_of_phases || 'N/A')],
    ['Compounds',              compounds.map(c => c.product_title || c.product_slug || c.product_id).join(', ') || 'N/A'],
    ['Frequency Pattern',      freqSummary],
    ['Route(s)',               routeSummary],
    ['Monitoring Checkpoints', checkpoints > 0 ? `${checkpoints} scheduled` : 'Not specified'],
    ['Complexity',             (protocol.complexity_level || get(protocol, 'metadata.complexity_level') || 'N/A')],
    ['Risk Class',             (protocol.risk_class || 'N/A').replace(/_/g, ' ')],
    ['Evidence Grade',         get(protocol, 'metadata.evidence_grade') || 'N/A'],
    ['Physician Supervision',  protocol.physician_supervision_required ? 'Required' : 'Not specified'],
    ['Washout Period',         protocol.washout_recommended_weeks ? `${protocol.washout_recommended_weeks} weeks` : 'N/A'],
    ['Last Reviewed',          protocol.protocol_last_reviewed_at || 'N/A'],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin, right: PAGE.marginRight },
    tableWidth: contentWidth(),
    head: [['Parameter', 'Value']],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: COLORS.darkGray,
      lineColor: COLORS.divider,
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: COLORS.navy },
      1: { cellWidth: 'auto' },
    },
    didDrawPage: () => {},
  });

  y = doc.lastAutoTable.finalY + 8;
  return y;
}

// ─── SECTION 5: WEEKLY DOSING TABLE ────────────────────────────────────────────

/**
 * Extracts a flat list of weekly rows from the protocol.
 * Priority: phase_blueprints > phases.drugs_used > frequency-only fallback.
 *
 * Each row: { week, phase, compound, dose, frequency, route }
 */
function extractWeeklyRows(protocol) {
  const rows = [];

  // ── Priority 1: phase_blueprints with dose_logic ──────────────────────────
  if (Array.isArray(protocol.phase_blueprints) && protocol.phase_blueprints.length > 0) {
    for (const phase of protocol.phase_blueprints) {
      const startWeek = phase.default_start_week || 1;
      const duration  = phase.default_duration_weeks || 1;
      const drugs     = phase.drugs || [];

      for (let w = startWeek; w < startWeek + duration; w++) {
        for (const drug of drugs) {
          const dl   = drug.dose_logic || {};
          const name = drug.product_title || drug.product_id || 'Unknown';

          // Resolve dose value
          let dose = 'Not specified';
          if (dl.starting_weekly_dose != null) {
            dose = `${dl.starting_weekly_dose} ${dl.dose_unit || ''} (starting)`.trim();
          } else if (dl.default_weekly_dose != null) {
            dose = `${dl.default_weekly_dose} ${dl.dose_unit || ''}`.trim();
          } else if (dl.dose_per_administration != null) {
            dose = `${dl.dose_per_administration} ${dl.dose_unit || ''}/admin`.trim();
          }

          const freq  = dl.administration_frequency || 'Not specified';
          const route = drug.route || 'Not specified';

          rows.push({
            week:      `Week ${w}`,
            phase:     phase.phase_title || phase.phase_key || '',
            compound:  name,
            dose,
            frequency: freq,
            route,
          });
        }
      }
    }
    return rows;
  }

  // ── Priority 2: legacy phases.drugs_used ──────────────────────────────────
  if (Array.isArray(protocol.phases) && protocol.phases.length > 0) {
    for (const phase of protocol.phases) {
      const startWeek = phase.start_week || 1;
      const endWeek   = phase.end_week   || startWeek;
      const drugs     = phase.drugs_used || [];

      for (let w = startWeek; w <= endWeek; w++) {
        for (const drug of drugs) {
          const name = drug.product_slug || drug.product_id || 'Unknown';
          const dose = drug.weekly_dose || 'Not specified';
          const freq = drug.dosing_frequency || 'weekly';
          const route = drug.route || 'Not specified';

          rows.push({
            week:      `Week ${w}`,
            phase:     phase.phase_title || `Phase ${phase.phase_number}` || '',
            compound:  name,
            dose,
            frequency: freq,
            route,
          });
        }
      }
    }
    return rows;
  }

  return rows; // empty → caller will render fallback note
}

/**
 * Renders the Weekly Dosing Table section.
 * Falls back to a plain frequency note if no data is available.
 * Returns new Y position.
 */
function renderWeeklyDosingTable(doc, protocol, y) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, 'Weekly Dosing Schedule', y);

  const rows = extractWeeklyRows(protocol);

  if (rows.length === 0) {
    console.error(
      '[doctorPdfGenerator] renderWeeklyDosingTable: No dosing rows extracted.',
      'Protocol ID:', protocol.protocol_id,
      '\nCheck that phase_blueprints[].drugs[].dose_logic is populated',
      'or that phases[].drugs_used[] exists with weekly_dose fields.',
      '\nProtocol keys present:', Object.keys(protocol)
    );
    return y;
  }

  // Group rows by compound to detect dose changes across weeks
  // Collapse consecutive identical rows for readability
  const collapsed = [];
  for (const row of rows) {
    const prev = collapsed[collapsed.length - 1];
    if (
      prev &&
      prev.phase     === row.phase &&
      prev.compound  === row.compound &&
      prev.dose      === row.dose &&
      prev.frequency === row.frequency &&
      prev.route     === row.route
    ) {
      // Extend week range
      prev.weekEnd = row.week;
    } else {
      collapsed.push({ ...row, weekEnd: row.week });
    }
  }

  // Format week column: show range if collapsed
  const tableBody = collapsed.map(r => [
    r.week === r.weekEnd ? r.week : `${r.week} – ${r.weekEnd}`,
    r.phase,
    r.compound,
    r.dose,
    r.frequency,
    r.route,
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin, right: PAGE.marginRight },
    tableWidth: contentWidth(),
    head: [['Week(s)', 'Phase', 'Compound', 'Dose', 'Frequency', 'Route']],
    body: tableBody,
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: COLORS.darkGray,
      lineColor: COLORS.divider,
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', textColor: COLORS.navy },
      1: { cellWidth: 28 },
      2: { cellWidth: 40, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 26 },
      5: { cellWidth: 'auto' },
    },
    // Draw a phase-color left border on each row
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 0) {
        data.cell.styles.textColor = COLORS.teal;
      }
    },
  });

  y = doc.lastAutoTable.finalY + 4;

  // Caption note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  setColor(doc, COLORS.midGray);
  doc.text(
    'Doses shown reflect protocol blueprint defaults. Physician may adjust based on patient response.',
    PAGE.margin, y
  );
  y += 8;

  return y;
}

// ─── SECTION 6: PHASE BREAKDOWN ────────────────────────────────────────────────

/**
 * Renders one card-style block per phase, showing:
 * title, duration, goal, compounds, transition criteria.
 */
function renderPhaseBreakdown(doc, protocol, y) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, 'Phase-by-Phase Breakdown', y);

  const phases = resolvePhases(protocol);
  if (!phases || phases.length === 0) {
    console.error(
      '[doctorPdfGenerator] renderPhaseBreakdown: No phases resolved.',
      'Protocol ID:', protocol.protocol_id,
      '\nCheck phase_blueprints[] or phases[] exist in the protocol JSON.',
      '\nProtocol keys present:', Object.keys(protocol)
    );
    return y;
  }

  for (const phase of phases) {
    // Estimate block height: header + rows
    const estimatedH = 8 + 7 * 5 + 6;
    y = ensureSpace(doc, y, estimatedH);

    // Phase label bar
    const phaseNum   = phase.phase_number || phase.phase_order || '';
    const phaseTitle = phase.phase_title || phase.phase_key || `Phase ${phaseNum}`;
    const duration   = phase.default_duration_weeks
      ? `${phase.default_duration_weeks} week${phase.default_duration_weeks > 1 ? 's' : ''}`
      : (phase.duration_weeks ? `${phase.duration_weeks} weeks` : 'Not specified');

    setFill(doc, COLORS.navy);
    doc.roundedRect(PAGE.margin, y, contentWidth(), 7, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.white);
    doc.text(`Phase ${phaseNum}: ${phaseTitle}`, PAGE.margin + 3, y + 4.8);
    doc.text(duration, PAGE.margin + contentWidth() - 3, y + 4.8, { align: 'right' });
    y += 9;

    // Phase detail rows
    const details = [];

    const goal = phase.clinical_goal || phase.phase_goal || get(phase, 'metadata.goal') || '';
    if (goal) details.push(['Goal', goal]);

    const startW = phase.default_start_week || phase.start_week || '';
    const endW   = phase.default_end_week   || phase.end_week   || '';
    if (startW || endW) {
      details.push(['Weeks', [startW, endW].filter(Boolean).join(' – ')]);
    }

    // Compounds list
    const drugs = phase.drugs || phase.drugs_used || [];
    if (drugs.length > 0) {
      const names = drugs.map(d => d.product_title || d.product_slug || d.product_id || 'Unknown').join(', ');
      details.push(['Compounds', names]);
    }

    // Frequency summary
    const freqs = [];
    for (const d of drugs) {
      const f = get(d, 'dose_logic.administration_frequency') || d.dosing_frequency || '';
      if (f && !freqs.includes(f)) freqs.push(f);
    }
    if (freqs.length > 0) details.push(['Dosing Frequency', freqs.join('; ')]);

    // Transition criteria
    const transition = phase.transition_criteria || phase.exit_criteria || get(phase, 'metadata.transition_criteria') || '';
    if (transition) details.push(['Transition Criteria', transition]);

    // Notes
    const notes = phase.clinical_notes || phase.notes || '';
    if (notes) details.push(['Clinical Notes', notes]);

    if (details.length > 0) {
      autoTable(doc, {
        startY: y,
        margin: { left: PAGE.margin, right: PAGE.marginRight },
        tableWidth: contentWidth(),
        body: details,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          textColor: COLORS.darkGray,
          lineColor: COLORS.divider,
          lineWidth: 0.15,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 42, fontStyle: 'bold', textColor: COLORS.navy, fillColor: COLORS.lightGray },
          1: { cellWidth: 'auto' },
        },
        theme: 'plain',
      });
      y = doc.lastAutoTable.finalY + 3;
    }

    y += 4; // breathing room between phases
  }

  return y;
}

// ─── SECTION 7: COMPOUND OVERVIEW ─────────────────────────────────────────────

/**
 * Renders a per-compound overview table:
 * Name | Role | Route | Mechanism | Class | Notes
 */
function renderCompoundOverview(doc, protocol, y) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, 'Compound Overview', y);

  const compounds = resolveCompounds(protocol);
  if (!compounds || compounds.length === 0) {
    console.error(
      '[doctorPdfGenerator] renderCompoundOverview: No compounds resolved.',
      'Protocol ID:', protocol.protocol_id,
      '\nCheck phase_blueprints[].drugs[] or compounds[] exist.',
      '\nProtocol keys present:', Object.keys(protocol)
    );
    return y;
  }

  // Deduplicate by product_id / product_slug
  const seen = new Set();
  const unique = compounds.filter(c => {
    const key = c.product_id || c.product_slug || c.product_title || JSON.stringify(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const tableBody = unique.map(c => [
    c.product_title || c.product_slug || c.product_id || 'Unknown',
    c.clinical_role || c.role || get(c, 'dose_logic.clinical_role') || '—',
    c.route || get(c, 'dose_logic.route') || '—',
    c.mechanism_of_action || c.mechanism || get(c, 'metadata.mechanism') || '—',
    c.compound_class || c.drug_class || get(c, 'metadata.class') || '—',
    c.clinical_notes || c.notes || get(c, 'metadata.notes') || '—',
  ]);

  autoTable(doc, {
    startY: y,
    margin: { left: PAGE.margin, right: PAGE.marginRight },
    tableWidth: contentWidth(),
    head: [['Compound', 'Role', 'Route', 'Mechanism', 'Class', 'Notes']],
    body: tableBody,
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: COLORS.darkGray,
      lineColor: COLORS.divider,
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLORS.teal,
      textColor: COLORS.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    columnStyles: {
      0: { cellWidth: 36, fontStyle: 'bold' },
      1: { cellWidth: 24 },
      2: { cellWidth: 16 },
      3: { cellWidth: 40 },
      4: { cellWidth: 22 },
      5: { cellWidth: 'auto' },
    },
  });

  y = doc.lastAutoTable.finalY + 4;
  return y;
}

// ─── SECTION 8: MONITORING & SAFETY ─────────────────────────────────────────

/**
 * Renders contraindications, cautions, side-effect profile, and monitoring
 * checkpoints sourced from protocol.monitoring_plan and protocol.safety.
 */
function renderMonitoringAndSafety(doc, protocol, y) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, 'Clinical Monitoring & Safety', y);

  const safety  = protocol.safety  || protocol.safety_profile  || {};
  const monPlan = protocol.monitoring_plan || protocol.monitoring || {};
  const id      = protocol.protocol_id;

  // ── 1. Contraindications ────────────────────────────────────────────────
  const contraList = safety.contraindications || safety.absolute_contraindications || [];
  if (contraList.length === 0) {
    console.error('[doctorPdfGenerator] renderMonitoringAndSafety: safety.contraindications empty.', 'ID:', id);
  } else {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Contraindications', PAGE.margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      body: contraList.map(c => [typeof c === 'string' ? c : (c.condition || JSON.stringify(c))]),
      styles: { fontSize: 8, cellPadding: 2, textColor: [180, 30, 30], lineColor: COLORS.divider, lineWidth: 0.15, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 'auto' } },
      theme: 'plain',
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 2. Cautions / Relative Contraindications ────────────────────────────
  const cautionList = safety.cautions || safety.relative_contraindications || safety.precautions || [];
  if (cautionList.length > 0) {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Cautions & Precautions', PAGE.margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      body: cautionList.map(c => [typeof c === 'string' ? c : (c.condition || JSON.stringify(c))]),
      styles: { fontSize: 8, cellPadding: 2, textColor: [140, 90, 0], lineColor: COLORS.divider, lineWidth: 0.15, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 'auto' } },
      theme: 'plain',
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 3. Side-Effect Profile ──────────────────────────────────────────────
  const sideEffects = safety.side_effects || safety.adverse_effects || safety.adverse_reactions || [];
  if (sideEffects.length === 0) {
    console.error('[doctorPdfGenerator] renderMonitoringAndSafety: safety.side_effects empty.', 'ID:', id);
  } else {
    y = ensureSpace(doc, y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Side-Effect Profile', PAGE.margin, y);
    y += 5;

    // Normalise: item may be string or { effect, frequency, severity }
    const seRows = sideEffects.map(e => {
      if (typeof e === 'string') return [e, '—', '—'];
      return [
        e.effect || e.name || JSON.stringify(e),
        e.frequency || '—',
        e.severity  || '—',
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      head: [['Adverse Effect', 'Frequency', 'Severity']],
      body: seRows,
      styles: { fontSize: 8, cellPadding: 2.5, textColor: COLORS.darkGray, lineColor: COLORS.divider, lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' },
      },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 4. Monitoring Checkpoints ───────────────────────────────────────────
  const checkpoints = monPlan.checkpoints || monPlan.monitoring_checkpoints || monPlan.schedule || [];
  if (checkpoints.length === 0) {
    console.error('[doctorPdfGenerator] renderMonitoringAndSafety: monitoring_plan.checkpoints empty.', 'ID:', id);
  } else {
    y = ensureSpace(doc, y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Monitoring Checkpoints', PAGE.margin, y);
    y += 5;

    const cpRows = checkpoints.map(cp => {
      if (typeof cp === 'string') return [cp, '—', '—'];
      return [
        cp.checkpoint || cp.timepoint || cp.label || cp.week || JSON.stringify(cp),
        Array.isArray(cp.tests)    ? cp.tests.join(', ')    : (cp.tests    || cp.labs     || '—'),
        Array.isArray(cp.actions)  ? cp.actions.join(', ')  : (cp.actions  || cp.notes    || '—'),
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      head: [['Checkpoint / Timepoint', 'Tests / Labs', 'Actions / Notes']],
      body: cpRows,
      styles: { fontSize: 8, cellPadding: 2.5, textColor: COLORS.darkGray, lineColor: COLORS.divider, lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: COLORS.teal, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      columnStyles: {
        0: { cellWidth: 46, fontStyle: 'bold', textColor: COLORS.navy },
        1: { cellWidth: 60 },
        2: { cellWidth: 'auto' },
      },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  return y;
}

// ─── SECTION 9: DOCUMENTATION & PROVENANCE ──────────────────────────────────────

/**
 * Renders expected outcomes, evidence grade, key references, and
 * protocol version / generation metadata.
 */
function renderDocumentationAndProvenance(doc, protocol, y) {
  y = ensureSpace(doc, y, 40);
  y = drawSectionHeading(doc, 'Documentation & Provenance', y);

  const meta = protocol.metadata || {};
  const id   = protocol.protocol_id;

  // ── 1. Expected Outcomes ───────────────────────────────────────────────
  const outcomes =
    protocol.expected_outcomes ||
    meta.expected_outcomes ||
    meta.outcomes ||
    [];

  if (outcomes.length === 0) {
    console.error('[doctorPdfGenerator] renderDocumentationAndProvenance: expected_outcomes empty.', 'ID:', id);
  } else {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Expected Outcomes', PAGE.margin, y);
    y += 5;

    const outcomeRows = outcomes.map(o => {
      if (typeof o === 'string') return [o, '—'];
      return [
        o.outcome || o.label || o.name || JSON.stringify(o),
        o.timeframe || o.timeline || o.expected_by || '—',
      ];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      head: [['Outcome', 'Expected Timeframe']],
      body: outcomeRows,
      styles: { fontSize: 8, cellPadding: 2.5, textColor: COLORS.darkGray, lineColor: COLORS.divider, lineWidth: 0.2, overflow: 'linebreak' },
      headStyles: { fillColor: COLORS.navy, textColor: COLORS.white, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: COLORS.lightGray },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 45 },
      },
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 2. Evidence Grade & Notes ─────────────────────────────────────────
  const evidenceGrade    = meta.evidence_grade    || protocol.evidence_grade    || '';
  const evidenceNotes    = meta.evidence_notes    || protocol.evidence_notes    || '';
  const regulatoryStatus = meta.regulatory_status || protocol.regulatory_status || '';
  const washout          = meta.washout           || protocol.washout           || '';

  const evidenceRows = [
    evidenceGrade    && ['Evidence Grade',    evidenceGrade],
    evidenceNotes    && ['Evidence Notes',    evidenceNotes],
    regulatoryStatus && ['Regulatory Status', regulatoryStatus],
    washout          && ['Washout Period',     washout],
  ].filter(Boolean);

  if (evidenceRows.length > 0) {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Evidence & Regulatory', PAGE.margin, y);
    y += 5;

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      body: evidenceRows,
      styles: { fontSize: 8, cellPadding: 2, textColor: COLORS.darkGray, lineColor: COLORS.divider, lineWidth: 0.15, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: COLORS.navy, fillColor: COLORS.lightGray },
        1: { cellWidth: 'auto' },
      },
      theme: 'plain',
    });
    y = doc.lastAutoTable.finalY + 4;
  }

  // ── 3. Key References ─────────────────────────────────────────────────
  const refs =
    meta.key_references ||
    meta.references ||
    protocol.references ||
    [];

  if (refs.length === 0) {
    console.error('[doctorPdfGenerator] renderDocumentationAndProvenance: references empty.', 'ID:', id);
  } else {
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.navy);
    doc.text('Key References', PAGE.margin, y);
    y += 5;

    const refRows = refs.map((r, i) => {
      if (typeof r === 'string') return [`[${i + 1}]`, r];
      const citation = r.citation || r.title || r.text || JSON.stringify(r);
      const source   = r.journal || r.source || r.url || '';
      return [`[${i + 1}]`, source ? `${citation} — ${source}` : citation];
    });

    autoTable(doc, {
      startY: y,
      margin: { left: PAGE.margin, right: PAGE.marginRight },
      tableWidth: contentWidth(),
      body: refRows,
      styles: { fontSize: 7.5, cellPadding: 2, textColor: COLORS.darkGray, lineColor: COLORS.divider, lineWidth: 0.12, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 10, fontStyle: 'bold', textColor: COLORS.teal },
        1: { cellWidth: 'auto' },
      },
      theme: 'plain',
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ── 4. Version & Generation Metadata ───────────────────────────────────
  y = ensureSpace(doc, y, 28);

  const version   = meta.version       || protocol.version       || 'N/A';
  const lastRev   = meta.last_reviewed || protocol.last_reviewed || 'N/A';
  const createdBy = meta.created_by    || protocol.created_by    || 'Atlas Health Clinical Team';
  const genDate   = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Shaded provenance block
  setFill(doc, COLORS.lightGray);
  doc.roundedRect(PAGE.margin, y, contentWidth(), 22, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setColor(doc, COLORS.navy);
  doc.text('Protocol Provenance', PAGE.margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  setColor(doc, COLORS.darkGray);

  const col1x = PAGE.margin + 4;
  const col2x = PAGE.margin + contentWidth() / 2;

  doc.text(`Protocol ID: ${id || 'N/A'}`,       col1x, y + 10);
  doc.text(`Version: ${version}`,                col1x, y + 15);
  doc.text(`Last Reviewed: ${lastRev}`,          col2x, y + 10);
  doc.text(`Created by: ${createdBy}`,           col2x, y + 15);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  setColor(doc, COLORS.midGray);
  doc.text(
    `Generated: ${genDate}  |  For physician review only. Not for patient distribution.`,
    PAGE.margin + 4, y + 20
  );

  y += 26;
  return y;
}

// ─── SECTION 4: FOOTER ───────────────────────────────────────────────────────

/**
 * Draws page footer on every page.
 */
function drawFooter(doc, pageNumber, totalPages, protocolId) {
  const y = PAGE.height - 8;

  setFill(doc, COLORS.navy);
  doc.rect(0, PAGE.height - 12, PAGE.width, 12, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, COLORS.midGray);

  doc.text('Atlas Health — Confidential | For Physician Review Only', PAGE.margin, y);
  doc.text(`${protocolId || ''} | Page ${pageNumber} of ${totalPages}`, PAGE.width - PAGE.marginRight, y, { align: 'right' });
}

// ─── MAIN ENTRY POINT ────────────────────────────────────────────────────────

/**
 * Generates a doctor-facing PDF for a given protocol object.
 * Triggers a browser download.
 *
 * @param {Object} protocol - The full protocol data object from Firestore/local.
 */
export function generateDoctorPdf(protocol) {
  if (!protocol) {
    console.error('[doctorPdfGenerator] No protocol data provided.');
    return;
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  // ── Page 1: Cover Header ────────────────────────────────────────────────
  let y = renderCoverHeader(doc, protocol);

  // ── Section 2: Clinical Summary ─────────────────────────────────────────
  y = renderClinicalSummary(doc, protocol, y);

  // ── Section 3: Protocol Snapshot ────────────────────────────────────────
  y = renderProtocolSnapshot(doc, protocol, y);

  // ── Section 4: Weekly Dosing Table ─────────────────────────────────────
  y = renderWeeklyDosingTable(doc, protocol, y);

  // ── Section 5: Phase Breakdown ──────────────────────────────────────────
  y = renderPhaseBreakdown(doc, protocol, y);

  // ── Section 6: Compound Overview ─────────────────────────────────────────
  y = renderCompoundOverview(doc, protocol, y);

  // ── Section 7: Monitoring & Safety ──────────────────────────────────────
  y = renderMonitoringAndSafety(doc, protocol, y);

  // ── Section 8: Documentation & Provenance ───────────────────────────────
  y = renderDocumentationAndProvenance(doc, protocol, y);

  // ── Footer on all pages ─────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  const protocolId = protocol.protocol_id || protocol.metadata?.shortCode || '';

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages, protocolId);
  }

  // ── Filename & download ─────────────────────────────────────────────────
  const slug = protocol.protocol_slug || protocol.protocol_id || 'protocol';
  const filename = `atlas-health-${slug}-doctor-review.pdf`;
  doc.save(filename);
}

// ─── Named exports for use by future phases ───────────────────────────────────

export {
  // Constants
  COLORS,
  FONTS,
  PAGE,
  // Helpers
  contentWidth,
  setColor,
  setFill,
  drawRule,
  drawSectionHeading,
  addPage,
  ensureSpace,
  // Data helpers
  get,
  resolvePhases,
  resolveCompounds,
  // Sections
  renderCoverHeader,
  renderClinicalSummary,
  renderProtocolSnapshot,
  renderWeeklyDosingTable,
  renderPhaseBreakdown,
  renderCompoundOverview,
  renderMonitoringAndSafety,
  renderDocumentationAndProvenance,
  drawFooter,
};
