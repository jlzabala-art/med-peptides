/* eslint-disable no-unused-vars */
import { ROUTE_LABELS, ROUTE } from '../constants/productEnums.js';
import { normalizeProtocol, frequencyToInjectionsPerWeek, doseToObject } from '../utils/protocolSchemaAdapter.js';
import { resolveVariantPrice } from '../utils/resolvePrice.js';
import { storage, ref, uploadBytes, getDownloadURL } from '../firebase.js';

const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatPrice = (val) => {
  if (typeof val !== 'number') return val;
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Standardizes dosing output for clinical clarity
 */
const normalizeDosing = (d) => {
  const compound = d.product_title || d.name || d.product_slug?.charAt(0).toUpperCase() + d.product_slug?.slice(1).replace(/-/g, ' ') || 'Product';
  const strength = d.strength || d.selected_strength || d.vial_strength_used || 'Standard';
  const dose = d.weekly_dose || d.per_administration_dose || 'Titrated';
  
  let freq = d.dosing_frequency || d.frequency || 'As directed';
  if (freq.toLowerCase() === 'daily') freq = 'Daily';
  if (freq.toLowerCase() === 'weekly' || freq.toLowerCase() === 'once_weekly') freq = 'Weekly';
  if (freq.toLowerCase() === '3x_week' || freq.toLowerCase() === '3x week') freq = '3x/week';
  if (freq.toLowerCase() === '2x_week' || freq.toLowerCase() === '2x week') freq = '2x/week';
  if (freq.toLowerCase() === '5x_week' || freq.toLowerCase() === '5x/week') freq = '5x/week';

  const rawRoute = d.variantRef?.route ?? d.route ?? ROUTE.SC;
  const route = ROUTE_LABELS[rawRoute] ?? (rawRoute.charAt(0).toUpperCase() + rawRoute.slice(1).toLowerCase());
  
  return { compound, strength, dose, freq, route };
};

/**
 * Maps frequencies to daily pattern
 */
const getDaysForFrequency = (freq) => {
  const f = freq?.toLowerCase() || '';
  if (f.includes('daily') || f.includes('nightly')) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  if (f === '3x_week' || f.includes('3x week')) return ['Mon', 'Wed', 'Fri'];
  if (f === '2x_week' || f.includes('2x week')) return ['Tue', 'Thu'];
  if (f === '5x_week' || f.includes('5x/week') || f.includes('5 days')) return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  if (f === 'weekly' || f.includes('once weekly') || f === 'once_weekly') return ['Mon'];
  return ['Mon'];
};

/**
 * Generates the Weekly Pattern Block for a phase
 */
const generateWeeklyPattern = (phase) => {
  const days = {
    'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
  };

  phase.drugs_used.forEach(d => {
    const activeDays = getDaysForFrequency(d.dosing_frequency);
    const compound = d.product_title || d.name || d.product_slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Product';
    const strength = d.strength ? ` | ${d.strength}` : '';
    const dose = d.weekly_dose || d.per_administration_dose || '';
    const label = `${compound}${strength} (${dose})`;
    
    activeDays.forEach(day => {
      if (days[day]) days[day].push(label);
    });
  });

  return Object.entries(days).map(([day, meds]) => [
    day, 
    meds.length > 0 ? meds.join(', ') : '—'
  ]);
};

/**
 * Data Enrichment: Fixes mapping errors and computes missing values
 */
const validateAndEnrichProtocol = (p) => {
  if (!p) return {};
  
  const title = p.metadata?.scientificName
    || p.blueprint?.metadata?.scientificName
    || p.protocol_title
    || p.blueprint?.title
    || "Custom Clinical Protocol";

  const rawPhases = p.phases || p.blueprint?.phases || p.phase_blueprints || [];
  let cumulativeWeek = 0;
  const phases = rawPhases.map((ph) => {
    const rawDrugs = ph.drugs_used || ph.drugs || ph.compounds || [];
    const drugs_used = rawDrugs.map((d) => {
      // Use doseToObject for canonical parsing of dose values
      const weeklyDoseObj = doseToObject(d.weekly_dose || d.dose || d.per_administration_dose || 0);
      const perAdminDoseObj = doseToObject(d.per_administration_dose || d.dose || d.weekly_dose || 0);

      return {
        product_title: d.product_title || d.name || d.product_slug?.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Compound',
        name:          d.name || d.product_title || d.product_slug || '',
        product_slug:  d.product_slug || d.slug || d.name || '',
        strength:      d.strength || d.selected_strength || d.vial_strength_used || '',
        weekly_dose:   weeklyDoseObj.value > 0 ? `${weeklyDoseObj.value}${weeklyDoseObj.unit}` : (d.weekly_dose || d.dose || d.per_administration_dose || ''),
        per_administration_dose: perAdminDoseObj.value > 0 ? `${perAdminDoseObj.value}${perAdminDoseObj.unit}` : (d.per_administration_dose || d.dose || d.weekly_dose || ''),
        dosing_frequency: d.dosing_frequency || d.frequency || 'daily',
        route:         d.route || 'SC',
        variantRef:    d.variantRef || null,
        vial_strength_used: d.vial_strength_used || d.selected_strength || d.strength || '5mg',
        selected_strength:  d.selected_strength || d.strength || '5mg',
        // Preserve raw numeric values for reconstitution calculations (syringe/mL)
        _weekly_dose_parsed: weeklyDoseObj,
        _per_admin_dose_parsed: perAdminDoseObj,
        ...d,
      };
    });

    const durationWks = ph.duration_weeks || ph.default_duration_weeks || 0;
    const startWeek = ph.start_week ?? (cumulativeWeek + 1);
    const endWeek   = ph.end_week   ?? (cumulativeWeek + durationWks);
    cumulativeWeek  = endWeek;

    return {
      phase_title: ph.phase_title || ph.phase_name || ph.name || ph.title || `Phase ${rawPhases.indexOf(ph) + 1}`,
      phase_objectives: ph.phase_objectives || ph.objectives || [],
      computed_date_label: ph.computed_date_label || '',
      start_week: startWeek,
      end_week:   endWeek,
      drugs_used,
      ...ph,
      drugs_used,
      phase_title: ph.phase_title || ph.phase_name || ph.name || ph.title || `Phase ${rawPhases.indexOf(ph) + 1}`,
      start_week: startWeek,
      end_week:   endWeek,
    };
  });

  const numPhases = (p.number_of_phases && p.number_of_phases > 0) ? p.number_of_phases : phases.length;
  
  let duration = p.protocol_duration_weeks || 0;
  if (!duration && phases.length > 0) {
    duration = Math.max(...phases.map(ph => ph.end_week || 0));
  }
  
  const confidence = (p.confidence_score && p.confidence_score > 0) ? p.confidence_score : 85;
  
  return {
    ...p,
    protocol_title: title,
    number_of_phases: numPhases,
    protocol_duration_weeks: duration,
    confidence_score: confidence,
    phases
  };
};

const setupBrandingHeader = (doc, protocol = {}, user = null) => {
  doc.setFontSize(22);
  doc.setTextColor(0, 54, 102);
  doc.setFont('helvetica', 'bold');
  doc.text("Med-Peptides", 14, 22);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text("Precision Bioregulator Engineering", 14, 28);
  
  // Traceability block
  const version = protocol.version || '1.0.0';
  const genDate = protocol.generation_date ? new Date(protocol.generation_date).toLocaleDateString() : new Date().toLocaleDateString();
  doc.text(`Protocol Version: ${version} | Generated: ${genDate}`, 14, 32);
  
  if (user) {
    const userText = `Patient/Researcher: ${user.name || user.email || 'Internal'}`;
    doc.text(userText, 14, 36);
  }

  doc.setDrawColor(0, 54, 102);
  doc.setLineWidth(0.5);
  doc.line(14, 40, 196, 40);

  return 50;
};

const addRunningFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(247, 249, 252);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(0, pageHeight - 30, pageWidth, pageHeight - 30);
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text("CONFIDENTIAL CLINICAL RECORD - Generated by Med-Peptides Engine. Intended for research use.", 14, pageHeight - 15);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 15, { align: 'right' });
  }
};

const checkPageBreak = (doc, yPos, neededHeight = 50) => {
  if (yPos + neededHeight > doc.internal.pageSize.height - 35) {
    doc.addPage();
    return 20;
  }
  return yPos;
};

const renderStructuredReferences = (doc, yPos, evidence) => {
  const slugs = Object.keys(evidence);
  if (slugs.length === 0) return yPos;

  yPos = checkPageBreak(doc, yPos, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("SCIENTIFIC EVIDENCE & LITERATURE", 14, yPos);
  yPos += 8;

  Object.entries(evidence).forEach(([slug, items]) => {
    if (items.length === 0) return;
    
    items.slice(0, 3).forEach(item => {
      yPos = checkPageBreak(doc, yPos, 15);
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${slug.toUpperCase()}]`, 14, yPos);
      doc.setFont('helvetica', 'normal');
      const titleLines = doc.splitTextToSize(item.title, 160);
      doc.text(titleLines, 35, yPos);
      yPos += (titleLines.length * 4) + 2;
    });
  });

  return yPos;
};

/**
 * Helper to split text into bullet points
 */
const summarizeToBullets = (text, max = 5) => {
  if (!text) return [];
  const lines = text.split(/\n|•|(?<=\.)\s+/)
    .map(line => line.trim())
    .filter(line => line.length > 5);
  return lines.slice(0, max);
};

/**
 * Helper to draw a card-like block
 */
const drawCard = (doc, x, y, w, h, title, value) => {
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), x + 4, y + 6);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const splitValue = doc.splitTextToSize(String(value), w - 8);
  doc.text(splitValue, x + 4, y + 12);
};

/**
 * Role inference for compounds
 */
const inferClassification = (d) => {
  const slug = (d.product_slug || d.slug || d.name || d.product_title || '').toLowerCase();
  if (slug.includes('semaglutide') || slug.includes('tirzepatide') || slug.includes('glp')) return 'GLP-1 Receptor Agonist';
  if (slug.includes('bpc') || slug.includes('tb') || slug.includes('thymosin')) return 'Tissue Repair Catalyst';
  if (slug.includes('ipam') || slug.includes('ghrp') || slug.includes('sermorelin') || slug.includes('cjc') || slug.includes('tesa')) return 'Secretagogue / GH Axis';
  if (slug.includes('nad')) return 'NAD+ Precursor';
  if (slug.includes('testosterone') || slug.includes('enanthate') || slug.includes('cypionate')) return 'Androgenic Agent';
  if (slug.includes('kisspeptin') || slug.includes('gonado')) return 'Gonadotropin Modulator';
  if (slug.includes('selank') || slug.includes('semax') || slug.includes('dsip')) return 'Neuro-Modulator / Nootropic';
  if (slug.includes('epitalon') || slug.includes('epithalon') || slug.includes('pineal')) return 'Telomere Regulatory Peptide';
  if (slug.includes('kpv') || slug.includes('ll37')) return 'Immune Response Modulator';
  if (slug.includes('ta1') || slug.includes('thym')) return 'Immuno-Potentiator';
  return 'Clinical Research Compound';
};

/**
 * Build a week-by-week dose progression array from ANY protocol variant.
 * Uses normalizeProtocol() so it works with v1/v2/v3 Firestore formats.
 * Returns: [{ week, dose, doseUnit, label, phaseIdx, phaseName }]
 */
const buildDoseProgressionData = (protocol) => {
  // Normalize to canonical schema first
  const canonical = normalizeProtocol(protocol);
  const weeks = [];

  canonical.phases.forEach((phase, phaseIdx) => {
    const phaseName = phase.phase_name || `Phase ${phaseIdx + 1}`;

    // Take the primary compound for the dose chart
    const compound = (phase.compounds || [])[0];
    if (!compound) return;

    const allEntries = compound.schedule || [];
    if (allEntries.length === 0) return;

    // Collect all unique week numbers in this phase
    const phaseWeeks = [];
    for (let w = phase.start_week; w <= phase.end_week; w++) phaseWeeks.push(w);

    // Resolve first & last schedule entries for ramp calculation
    const firstEntry = allEntries[0];
    const lastEntry  = allEntries[allEntries.length - 1];
    const rawStart   = firstEntry.dose?.amount || 0;
    const rawEnd     = lastEntry.dose?.amount  || rawStart;
    const doseUnit   = firstEntry.dose?.unit   || 'mg';
    const dur        = phaseWeeks.length;

    phaseWeeks.forEach((weekNo, wi) => {
      const progress  = dur > 1 ? wi / (dur - 1) : 0;
      const dose      = rawStart + (rawEnd - rawStart) * progress;
      const doseRound = Math.round(dose * 10) / 10;
      weeks.push({
        week:      weekNo,
        dose:      doseRound,
        doseUnit,
        label:     `W${weekNo}`,
        phaseIdx,
        phaseName,
      });
    });
  });

  return weeks;
};

/** Phase accent colours matching InjectionDoseChart CSS tokens */
const PHASE_COLORS = [
  [0,   163, 224],   // phase-1 cyan
  [124,  58, 237],   // phase-2 violet
  [34,  197,  94],   // phase-3 green
  [251, 146,  60],   // phase-4 orange
  [239,  68,  68],   // phase-5 red
  [20,  184, 166],   // phase-6 teal
];

/**
 * Draw a native jsPDF bar-chart for dose escalation.
 * @param {jsPDF} doc
 * @param {number} startY  – top Y of the chart area
 * @param {Array}  weeks   – output of buildDoseProgressionData
 * @returns {number}       – new Y position after chart
 */
const drawNativeDoseChart = (doc, startY, weeks) => {
  if (!weeks || weeks.length === 0) return startY;

  const chartH   = 38;
  const chartX   = 14;
  const chartW   = 182;
  const barAreaH = 28; // px space for bars
  const barAreaY = startY + 6; // top of bar area
  const baseY    = barAreaY + barAreaH; // bottom baseline

  const maxDose = Math.max(...weeks.map(w => w.dose), 1);
  const barW    = Math.max(2, (chartW / weeks.length) - 1);

  // Background
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(chartX - 1, startY - 1, chartW + 2, chartH + 6, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(chartX - 1, startY - 1, chartW + 2, chartH + 6, 2, 2, 'D');

  // Grid lines (3 horizontal)
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  for (let g = 1; g <= 3; g++) {
    const gy = barAreaY + barAreaH - (barAreaH * g / 3);
    doc.line(chartX, gy, chartX + chartW, gy);
  }

  // Bars
  weeks.forEach((w, i) => {
    const barH  = maxDose > 0 ? (w.dose / maxDose) * barAreaH : 2;
    const bx    = chartX + i * (barW + 1);
    const by    = baseY - barH;
    const color = PHASE_COLORS[w.phaseIdx % PHASE_COLORS.length];

    doc.setFillColor(color[0], color[1], color[2]);
    // Slight gradient feel: draw a lighter top strip
    doc.rect(bx, by, barW, barH, 'F');
    // Overlay lighter alpha top
    doc.setFillColor(Math.min(255, color[0] + 60), Math.min(255, color[1] + 60), Math.min(255, color[2] + 60));
    doc.rect(bx, by, barW, Math.min(3, barH), 'F');
  });

  // Baseline
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(chartX, baseY, chartX + chartW, baseY);

  // Week labels (every 2nd to avoid crowding)
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  weeks.forEach((w, i) => {
    if (i % 2 === 0) {
      const lx = chartX + i * (barW + 1) + barW / 2;
      doc.text(w.label, lx, baseY + 4, { align: 'center' });
    }
  });

  // Dose max label — use the unit from the data
  const doseUnit = weeks[weeks.length - 1]?.doseUnit || 'mcg';
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(`${maxDose} ${doseUnit}`, chartX + chartW - 1, barAreaY + 3, { align: 'right' });

  // Phase legend
  const uniquePhases = [...new Map(weeks.map(w => [w.phaseIdx, w])).values()];
  let lx = chartX;
  const legendY = startY + chartH + 5;
  doc.setFontSize(6);
  uniquePhases.forEach(w => {
    const color = PHASE_COLORS[w.phaseIdx % PHASE_COLORS.length];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(lx, legendY - 2, 4, 3, 'F');
    doc.setTextColor(51, 65, 85);
    doc.text(w.phaseName, lx + 5.5, legendY);
    lx += Math.max(30, w.phaseName.length * 2.2 + 8);
  });

  return legendY + 6;
};

/**
 * CLINICAL PROTOCOL: Structured, Visual & Professional
 */
export const generateClinicalProtocol = async (rawProtocol, options = {}) => {
  const { formData = {}, chartPng = null, timelinePng = null, localTier = 'retail', user = null } = options;
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF || jsPdfModule;
  const autoTable = autoTableModule.default || autoTableModule;

  const protocol = validateAndEnrichProtocol(normalizeProtocol(rawProtocol));
  const doc = new jsPDF();
  const contentWidth = 182;
  const pageWidth = doc.internal.pageSize.width;
  
  // 1. HEADER & BRANDING
  let yPos = setupBrandingHeader(doc, protocol, user);
  
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const title = (protocol.protocol_title || 'Clinical Protocol').toUpperCase();
  doc.text(title, 14, yPos);
  yPos += 10;

  // Metadata Summary Cards
  const meta = protocol.metadata || {};
  const primaryGoal = protocol.primary_goal?.replace(/_/g, ' ') || 'Clinical Research';
  const durationText = `${protocol.protocol_duration_weeks || 12} Weeks`;
  const complexity = (meta.complexity_level || 'Standard').toUpperCase();
  
  const cardW = (contentWidth / 3) - 2;
  // Use a softer, more premium card design
  const drawPremiumCard = (x, y, w, h, label, val, color = [0, 163, 224]) => {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, w, h, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, w, h, 3, 3, 'D');
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text(label.toUpperCase(), x + 4, y + 6);
    
    doc.setFontSize(9);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'bold');
    const splitValue = doc.splitTextToSize(String(val), w - 8);
    doc.text(splitValue, x + 4, y + 12);
  };

  drawPremiumCard(14, yPos, cardW, 20, "Primary Objective", primaryGoal);
  drawPremiumCard(14 + cardW + 3, yPos, cardW, 20, "Total Duration", durationText);
  drawPremiumCard(14 + (cardW + 3) * 2, yPos, cardW, 20, "Complexity", complexity);
  yPos += 28;

  // 1.5 VISUAL DATA INTEGRATION (Charts)
  {
    yPos = checkPageBreak(doc, yPos, 88);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text("DOSAGE DYNAMICS & ESCALATION CURVE", 14, yPos);
    yPos += 4;

    let chartRendered = false;
    if (chartPng) {
      try {
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(13, yPos - 1, contentWidth + 2, 74, 2, 2, 'D');
        doc.addImage(chartPng, 'PNG', 14, yPos, contentWidth, 72);
        yPos += 80;
        chartRendered = true;
      } catch (e) {
        console.warn('PDF ChartPng failed — falling back to native chart', e);
      }
    }

    if (!chartRendered) {
      // Native jsPDF bar chart — uses normalizeProtocol for reliable data.
      const doseWeeks = buildDoseProgressionData(rawProtocol || protocol);
      if (doseWeeks.length > 0) {
        yPos = drawNativeDoseChart(doc, yPos, doseWeeks);
      } else {
        yPos += 5;
      }
    }
  }

  // 2. CLINICAL OUTCOMES & MECHANISMS
  yPos = checkPageBreak(doc, yPos, 45);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("EXPECTED CLINICAL OUTCOMES", 14, yPos);
  yPos += 8;

  const outcomes = meta.expected_outcomes || [
    "Normalization of bioregulatory signaling pathways",
    "Enhanced cellular homeostasis and repair mechanisms",
    "Optimization of systemic physiological coordination"
  ];
  
  outcomes.forEach(out => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text("•", 16, yPos);
    const splitOut = doc.splitTextToSize(out, contentWidth - 10);
    doc.text(splitOut, 20, yPos);
    yPos += (splitOut.length * 5);
  });
  yPos += 6;

  // 3. COMPOUND REGISTRY (Technical Data Sheet)
  yPos = checkPageBreak(doc, yPos, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("COMPOUND ARCHITECTURE & CLASSIFICATION", 14, yPos);
  yPos += 6;

  const uniqueCompounds = Array.from(new Map(protocol.phases.flatMap(p => p.drugs_used.map(d => [d.product_slug, d]))).values());

  const registryData = uniqueCompounds.map(d => {
    const classification = inferClassification(d);
    const mechanism = d.description ? summarizeToBullets(d.description, 2).join(". ") : "Bioregulatory signaling support.";
    return [
      d.product_title || d.name || 'Compound',
      classification,
      mechanism
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Research Compound', 'Clinical Classification', 'Primary Mechanism of Action']],
    body: registryData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 }, 1: { cellWidth: 45 }, 2: { cellWidth: 97 } }
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // 4. TREATMENT PHASES (The Core Protocol)
  yPos = checkPageBreak(doc, yPos, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("PHASE ARCHITECTURE & ADMINISTRATION", 14, yPos);
  yPos += 8;

  protocol.phases.forEach((phase, idx) => {
    yPos = checkPageBreak(doc, yPos, 60);
    
    // Phase header with accent color
    doc.setFillColor(idx % 2 === 0 ? 241 : 248, 245, 249);
    doc.roundedRect(14, yPos, contentWidth, 10, 1, 1, 'F');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`PHASE ${idx + 1}: ${phase.phase_title.toUpperCase()}`, 18, yPos + 7);
    doc.text(`WEEKS ${phase.start_week}–${phase.end_week}`, 162, yPos + 7);
    yPos += 15;

    // Compound Details in a clean grid/list
    phase.drugs_used.forEach((d, dIdx) => {
      const norm = normalizeDosing(d);
      const classification = inferClassification(d);
      
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 163, 224);
      doc.text(norm.compound, 18, yPos);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`[${classification}]`, 18 + doc.getTextWidth(norm.compound) + 4, yPos);
      yPos += 5;
      
      doc.setTextColor(51, 65, 85);
      const freqLabel = norm.freq.replace('x/week', ' administrations per week');
      doc.text(`Dosage: ${norm.dose} | Frequency: ${freqLabel} | Route: ${norm.route}`, 22, yPos);
      yPos += 5;

      // RECONSTITUTION MATH (Vial Explainer)
      const proc = d.procurement || {};
      if (proc.units_to_inject) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 184, 166);
        doc.text(`Reconstitution: Inject ${proc.units_to_inject} Units (U-100 syringe).`, 22, yPos);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(`Based on ${proc.vialCapacity}mg vial reconstituted with ${proc.reconstitutionVolume}ml diluent.`, 22, yPos + 4);
        yPos += 10;
      } else {
        yPos += 3;
      }
    });
    yPos += 4;
  });

  // 5. GUIDELINES & COMPLIANCE
  yPos = checkPageBreak(doc, yPos, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("INSTITUTIONAL ADMINISTRATION STANDARDS", 14, yPos);
  yPos += 8;

  const instructions = [
    ["Compounding:", "Ensure aseptic environment. Reconstitute with 0.9% Benzyl Alcohol Bacteriostatic Water. Direct diluent stream to vial wall; do not vortex."],
    ["Storage:", "Lyophilized: -20°C for long-term integrity. Reconstituted: Maintain at 2-8°C. Do not exceed 28 days post-reconstitution."],
    ["Safety:", "Monitor for localized sensitivity at injection site. Maintain consistent administration timing (±4h for daily, ±12h for weekly)."],
    ["Traceability:", "Verify Batch IDs before administration. Log all dosage events in the research verification checklist."]
  ];

  autoTable(doc, {
    startY: yPos,
    theme: 'plain',
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35, textColor: [15, 23, 42] }, 1: { cellWidth: 145 } },
    body: instructions
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // 5.5 CLINICAL MONITORING (Labs)
  if (protocol.monitoring && protocol.monitoring.labs.length > 0) {
    yPos = checkPageBreak(doc, yPos, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("CLINICAL MONITORING & FOLLOW-UP", 14, yPos);
    yPos += 6;

    const labData = protocol.monitoring.labs.map((lab, i) => [
      lab,
      protocol.monitoring.rationales[i] || "Baseline safety monitoring."
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Required Biomarker', 'Clinical Rationale']],
      body: labData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [100, 116, 139] }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // 6. PROCUREMENT SUMMARY — phase-grouped vial requirements
  {
    yPos = checkPageBreak(doc, yPos, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text("PROCUREMENT SUMMARY", 14, yPos);
    yPos += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Vial requirements per phase`, 14, yPos);
    yPos += 6;

    // Build procurement rows — one row per compound per phase
    const procRows = [];
    protocol.phases.forEach((phase, phIdx) => {
      const phLabel = `Phase ${phIdx + 1}: ${phase.phase_title || ''}`.trim();
      const dur = phase.duration_weeks || phase.default_duration_weeks ||
        ((phase.end_week || 0) - (phase.start_week || 1) + 1) || 4;

      phase.drugs_used.forEach(d => {
        const logic = d.dose_logic || {};
        const canonicalVials = logic.vials_required != null ? Number(logic.vials_required)
          : d.vials_required != null ? Number(d.vials_required)
          : null;

        let vialsNeeded;
        if (canonicalVials !== null && !isNaN(canonicalVials)) {
          vialsNeeded = canonicalVials;
        } else {
          // Fallback estimation — weekly dose × weeks ÷ vial size
          const freqNum = (f => {
            const fl = (f || '').toLowerCase();
            if (fl.includes('daily') || fl.includes('nightly')) return 7;
            if (fl.includes('3x') || fl.includes('3 x')) return 3;
            if (fl.includes('2x') || fl.includes('2 x')) return 2;
            if (fl.includes('5x') || fl.includes('5 x')) return 5;
            return 1;
          })(d.dosing_frequency || logic.administration_frequency);
          const doseAmt = parseFloat(logic.starting_weekly_dose || logic.dose_per_administration || d.weekly_dose || 0);
          const vialSz  = parseFloat(d.vial_size_mg || logic.vial_strength || 5) || 5;
          const total   = doseAmt * freqNum * dur;
          vialsNeeded   = total > 0 ? Math.ceil(total / vialSz) : 1;
        }

        const compoundName = d.product_title || d.name ||
          (d.product_slug || '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'Compound';
        const strength = d.strength || d.vial_strength_used || d.selected_strength || '';

        procRows.push([
          phLabel,
          strength ? `${compoundName} (${strength})` : compoundName,
          String(dur),
          String(vialsNeeded),
        ]);
      });
    });

    const procHead = [['Phase', 'Compound', 'Weeks', 'Vials Needed']];
    autoTable(doc, {
      startY: yPos,
      head: procHead,
      body: procRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 70 },
        2: { cellWidth: 31, halign: 'center' },
        3: { cellWidth: 31, halign: 'center' },
      },
    });
    yPos = doc.lastAutoTable.finalY + 8;
  }

  addRunningFooter(doc);
  
  const filename = getProtocolFilename(protocol);

  if (options?.returnBlob) {
    return doc.output('blob');
  }

  doc.save(filename);
};

/**
 * Returns the standardized filename for a protocol PDF
 */
export const getProtocolFilename = (protocol) => {
  const safeTitle = (protocol.protocol_title || 'protocol').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `med-peptides-protocol-${safeTitle}.pdf`;
};

/**
 * Caching layer for Protocols. 
 * Checks if a PDF already exists in Storage for this protocol version.
 */
export const getCachedProtocolPDF = async (protocol) => {
  if (!protocol || !protocol.id) return null;
  const version = protocol.metadata?.version || '1.0.0';
  const path = `protocols/${protocol.id}/${version}/protocol.pdf`;
  const storageRef = ref(storage, path);

  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    // 404 is expected if not cached
    return null;
  }
};

/**
 * Uploads a protocol PDF blob to Storage
 */
export const cacheProtocolPDF = async (protocol, blob) => {
  if (!protocol || !protocol.id || !blob) return null;
  const version = protocol.metadata?.version || '1.0.0';
  const path = `protocols/${protocol.id}/${version}/protocol.pdf`;
  const storageRef = ref(storage, path);

  try {
    await uploadBytes(storageRef, blob, { contentType: 'application/pdf' });
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (e) {
    console.error('[pdfService] Cache upload failed', e);
    return null;
  }
};


/**
 * PATIENT GUIDE: Simplified & Grouped
 */
export const generatePatientGuide = async (rawProtocol, formData, options = {}) => {
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF || jsPdfModule;
  const autoTable = autoTableModule.default || autoTableModule;

  const protocol = validateAndEnrichProtocol(rawProtocol);
  const doc = new jsPDF();
  const dateStr = formatDate(null);
  
  let yPos = setupBrandingHeader(doc);
  
  doc.setFontSize(16);
  doc.setTextColor(0, 54, 102);
  doc.setFont('helvetica', 'bold');
  doc.text("YOUR PERSONAL PROTOCOL GUIDE", 14, yPos);
  yPos += 10;

  // 1 — Overview
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. PROGRAM OVERVIEW", 14, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Program: ${protocol.protocol_title}`, 14, yPos);
  doc.text(`Duration: ${protocol.protocol_duration_weeks} Weeks total`, 140, yPos);
  yPos += 6;
  const startDateStr = formData?.startDate ? (new Date(formData.startDate)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pending';
  doc.text(`Protocol Start Date: ${startDateStr}`, 14, yPos);
  yPos += 8;

  const splitSummary = doc.splitTextToSize(protocol.overview_summary || "", 180);
  doc.text(splitSummary, 14, yPos);
  yPos += (splitSummary.length * 5) + 8;

  // 1.5 — Dosage escalation timeline / progress chart
  yPos = checkPageBreak(doc, yPos, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 54, 102);
  doc.text("PROGRAM TIMELINE & DOSING PROGRESSION", 14, yPos);
  yPos += 4;

  const doseWeeks = buildDoseProgressionData(rawProtocol || protocol);
  if (doseWeeks.length > 0) {
    yPos = drawNativeDoseChart(doc, yPos, doseWeeks);
  } else {
    yPos += 2;
  }
  yPos += 8;

  // 2 — Administration Schedule
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("2. HOW TO TAKE YOUR BIOMODULATORS", 14, yPos);
  yPos += 8;

  protocol.phases.forEach((phase, idx) => {
    yPos = checkPageBreak(doc, yPos, 100);
    
    // Stage Header
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, 182, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 54, 102);
    const splitPhaseStr = phase.computed_date_label ? 
       `(${phase.computed_date_label} / Wks ${phase.start_week}-${phase.end_week})` : 
       `(Weeks ${phase.start_week}-${phase.end_week})`;
    doc.text(`STAGE ${idx + 1}: ${phase.phase_title || phase.phase_name || `Phase ${idx + 1}`} ${splitPhaseStr}`, 18, yPos + 7);
    
    // ── STAGE TIMELINE PROGRESS BAR ──
    const totalW = protocol.protocol_duration_weeks || 12;
    const startW = phase.start_week || 1;
    const endW = phase.end_week || totalW;
    const progressX = 138;
    const progressY = yPos + 3.8;
    const progressW = 50;
    const progressH = 2.4;

    // Draw background track
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(progressX, progressY, progressW, progressH, 0.8, 0.8, 'F');

    // Draw filled active segment
    const startPct = Math.max(0, (startW - 1) / totalW);
    const endPct = Math.min(1, endW / totalW);
    const activeX = progressX + (startPct * progressW);
    const activeW = (endPct - startPct) * progressW;

    const color = PHASE_COLORS[idx % PHASE_COLORS.length] || [0, 54, 102];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(activeX, progressY, Math.max(1.5, activeW), progressH, 0.8, 0.8, 'F');

    yPos += 15;

    // Instructions as sentences
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    phase.drugs_used.forEach(d => {
      const freq = d.dosing_frequency?.toLowerCase() || '';
      const compound = d.product_title || d.name || 'Product';
      const strength = d.strength ? ` (${d.strength})` : '';
      const dose = d.weekly_dose || d.per_administration_dose || 'Titrated';
      const rawRoute = d.variantRef?.route ?? d.route ?? ROUTE.SC;
      const route = ROUTE_LABELS[rawRoute] ?? (rawRoute.charAt(0).toUpperCase() + rawRoute.slice(1).toLowerCase());
      
      let instruction = `Administer ${compound}${strength} at ${dose} once per week via ${route}.`;
      if (freq.includes('daily')) instruction = `Administer ${compound}${strength} (${dose}) daily via ${route} administration.`;
      if (freq.includes('3x')) instruction = `Administer ${compound}${strength} (${dose}) three times per week (Mon/Wed/Fri) via ${route}.`;
      if (freq.includes('2x')) instruction = `Administer ${compound}${strength} (${dose}) twice per week (Tue/Thu) via ${route}.`;
      if (freq.includes('nasal')) instruction = `Administer ${compound}${strength} daily via nasal spray as directed.`;

      doc.text(`• ${instruction}`, 18, yPos);
      yPos += 6;
    });
    yPos += 4;

    // Weekly Pattern Sub-table
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("Weekly Routine for this Stage:", 18, yPos);
    yPos += 4;

    autoTable(doc, {
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [248, 250, 252], textColor: [0, 54, 102], fontStyle: 'bold' },
      body: generateWeeklyPattern(phase),
      margin: { left: 18, right: 14 }
    });
    yPos = doc.lastAutoTable.finalY + 15;
  });

  // 3 - Supply Summary
  yPos = checkPageBreak(doc, yPos, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("3. FULL PROGRAM SUPPLY LIST", 14, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Ensure you have the following total supply ready for the full duration of your program:", 14, yPos);
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    head: [['Product', 'Strength', 'Total Vials Needed']],
    body: (protocol.computedCost?.aggregate || protocol.costData?.aggregateVials || []).map(i => [
      i.name, `${i.mgPerVial} mg`, `${i.totalVials}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [0, 54, 102] },
    margin: { bottom: 50 }
  });

  addRunningFooter(doc);
  if (options.returnBlob) {
    return doc.output('blob');
  }
  doc.save(`REGEN-PATIENT-GUIDE-${dateStr.replace(/ /g, '-')}.pdf`);
};

/**
 * generateClinicalPDF — canonical public API for clinical protocol PDFs.
 *
 * Signatures supported (all equivalent):
 *   generateClinicalPDF(protocol)
 *   generateClinicalPDF(protocol, formData)
 *   generateClinicalPDF(protocol, formData, localTier)
 *   generateClinicalPDF(protocol, formData, { localTier, returnBlob })
 *
 * Returns a Blob when options.returnBlob === true, otherwise downloads the PDF.
 */
export const generateClinicalPDF = async (protocol, formData = {}, optionsOrTier = {}) => {
  // Support legacy positional tier string: generateClinicalPDF(p, fd, 'retail')
  const opts = typeof optionsOrTier === 'string'
    ? { localTier: optionsOrTier }
    : optionsOrTier;

  const cacheKey = protocol.generated_protocol_id || protocol.protocol_id || protocol.id;

  if (cacheKey) {
    try {
      const cachedUrl = await getCachedProtocolPDF(protocol);
      if (cachedUrl) {
        console.log('[pdfService] Cache hit! Downloading cached PDF from Storage...', cachedUrl);
        if (opts.returnBlob) {
          const res = await fetch(cachedUrl);
          return await res.blob();
        } else {
          if (typeof window !== 'undefined') {
            const link = document.createElement('a');
            link.href = cachedUrl;
            link.target = '_blank';
            link.download = getProtocolFilename(protocol);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('[pdfService] Cache hit failed/skipped, falling back to client generation', e);
    }
  }

  console.log('[pdfService] Cache miss. Generating PDF on the client...');

  if (opts.returnBlob) {
    const blob = await generateClinicalProtocol(protocol, { formData, ...opts });
    if (blob && cacheKey) {
      cacheProtocolPDF(protocol, blob).catch(e => console.error('[pdfService] Caching failed', e));
    }
    return blob;
  } else {
    const blob = await generateClinicalProtocol(protocol, { formData, ...opts, returnBlob: true });
    if (blob) {
      if (cacheKey) {
        cacheProtocolPDF(protocol, blob).catch(e => console.error('[pdfService] Caching failed', e));
      }
      if (typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getProtocolFilename(protocol);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL DOSAGE & ADMINISTRATION SCHEDULE
// Pharma-grade document for patient/clinician use
// ─────────────────────────────────────────────────────────────────────────────



/**
 * Returns the recommended reconstitution volume (mL) based on vial strength.
 */
const getReconstitutionVolume = (strength) => {
  const mg = parseFloat(strength) || 5;
  if (mg <= 1)  return '0.5 mL';
  if (mg <= 5)  return '1.0 mL';
  if (mg <= 10) return '2.0 mL';
  return '2.0 mL';
};

/**
 * Returns ± dosing window tolerance based on administration frequency.
 */
const getDosingWindow = (freq) => {
  const f = (freq || '').toLowerCase();
  if (f.includes('daily') || f.includes('nightly')) return '±4 hours';
  if (f.includes('3x') || f.includes('2x') || f.includes('5x')) return '±6 hours';
  return '±24 hours'; // weekly default
};

/**
 * Renders the compliance-grade document header unique to the Dosage Guide.
 * Returns the updated yPos after rendering.
 */
const setupDosageGuideHeader = (doc, protocol, formData) => {
  const pageWidth = doc.internal.pageSize.width;
  const printDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const startDate = formData?.startDate
    ? new Date(formData.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'To Be Confirmed';

  // ── Branding ──────────────────────────────────────────────────────────────
  doc.setFontSize(22);
  doc.setTextColor(0, 54, 102);
  doc.setFont('helvetica', 'bold');
  doc.text('Med-Peptides', 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Precision Bioregulator Engineering', 14, 28);
  doc.text('Compounding & Bioregulator Protocol Platform v5.2', 14, 32);

  // Version & Print Date (top-right)
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Rev. 1.0 | Classification: CONFIDENTIAL`, pageWidth - 14, 22, { align: 'right' });
  doc.text(`Print Date: ${printDate}`, pageWidth - 14, 27, { align: 'right' });
  doc.text(`Issuing Authority: Med-Peptides Clinical Pharmacist Office`, pageWidth - 14, 32, { align: 'right' });

  // Divider
  doc.setDrawColor(0, 54, 102);
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  let yPos = 46;

  // ── Document Title ─────────────────────────────────────────────────────────
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('CLINICAL DOSAGE & ADMINISTRATION SCHEDULE', 14, yPos);
  yPos += 8;

  // ── Compliance Meta Block ──────────────────────────────────────────────────
  const protocolId = protocol.protocol_id || protocol.protocol_slug?.toUpperCase() || 'N/A';
  const subjectId  = formData?.subjectId || formData?.patientId || `SUBJ-${Date.now().toString().slice(-6)}`;
  const clinician  = protocol.protocol_author_name || formData?.clinician || 'Med-Peptides Clinical Team';

  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');

  // Two-column meta layout
  const leftX  = 14;
  const rightX = pageWidth / 2 + 5;
  const lineH  = 5.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Protocol ID:', leftX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(protocolId, leftX + 28, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Subject Identification:', rightX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(subjectId, rightX + 42, yPos);
  yPos += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Administr. Start Date:', leftX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(startDate, leftX + 43, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Issuing Clinician:', rightX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(clinician, rightX + 35, yPos);
  yPos += lineH;

  doc.setFont('helvetica', 'bold');
  doc.text('Program Duration:', leftX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${protocol.protocol_duration_weeks || '—'} Weeks`, leftX + 36, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Clinical Focus:', rightX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(protocol.primary_goal || formData?.primaryCondition || 'General Metabolic Optimization', rightX + 28, yPos);
  yPos += lineH + 4;

  // ── Regulatory Disclaimer Banner ───────────────────────────────────────────
  doc.setFillColor(255, 247, 237); // soft amber
  doc.setDrawColor(234, 179, 8);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, yPos, pageWidth - 28, 13, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(120, 80, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('⚠  REGULATORY NOTICE:', 18, yPos + 5);
  doc.setFont('helvetica', 'normal');
  const disclaimer = 'This document is intended exclusively for professional clinical use under licensed supervision. It does not constitute medical advice and must not be used for unsupervised self-administration.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 70);
  doc.text(splitDisclaimer, 62, yPos + 5);
  yPos += 20;

  // Section divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(14, yPos, pageWidth - 14, yPos);
  yPos += 8;

  return yPos;
};

/**
 * PHASE 1 DELIVERABLE — Function scaffold (header renders, rest to follow in phases 2-4)
 * CLINICAL DOSAGE & ADMINISTRATION SCHEDULE
 */
export const generateDosageGuide = async (rawProtocol, formData) => {
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const jsPDF     = jsPdfModule.default || jsPdfModule.jsPDF || jsPdfModule;
  const autoTable = autoTableModule.default || autoTableModule;

  // Use normalizeProtocol for the canonical data structure,
  // then bridge into the legacy validateAndEnrichProtocol shape for the
  // existing template rendering below (drugs_used, start_week, end_week etc.).
  const canonical = normalizeProtocol(rawProtocol);
  const protocol  = validateAndEnrichProtocol(rawProtocol);
  const doc      = new jsPDF();

  // ── PHASE 1: Compliance Header ─────────────────────────────────────────────
  let yPos = setupDosageGuideHeader(doc, protocol, formData);

  // ── PHASE 2: Section I — Compound Summary Table ───────────────────────────
  yPos = checkPageBreak(doc, yPos, 50);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('I. ACTIVE PHARMACEUTICAL INGREDIENTS & DOSING PARAMETERS', 14, yPos);
  yPos += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('The following compounded bioregulators have been prescribed under this protocol. All dosing parameters reflect the full-program schedule.', 14, yPos);
  yPos += 7;

  // Deduplicate compounds across all phases by slug
  const compoundMap = new Map();
  protocol.phases.forEach(phase => {
    phase.drugs_used.forEach(d => {
      const key = d.product_slug || d.name || d.product_title || 'unknown';
      if (!compoundMap.has(key)) {
        compoundMap.set(key, d);
      }
    });
  });

  const compoundRows = Array.from(compoundMap.values()).map(d => {
    const norm  = normalizeDosing(d);
    const cls   = inferClassification(d);
    const vial  = d.vial_strength_used || d.selected_strength || d.strength || 'Standard';
    const window = getDosingWindow(d.dosing_frequency || d.frequency);
    return [
      norm.compound,
      cls,
      vial,
      norm.dose,
      norm.freq,
      norm.route,
      window
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Compound', 'Classification', 'Vial Spec.', 'Per-Admin. Dose', 'Frequency', 'Route', 'Dosing Window']],
    body: compoundRows,
    theme: 'grid',
    headStyles: { fillColor: [0, 54, 102], fontSize: 7.5, fontStyle: 'bold', textColor: [255, 255, 255] },
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 38 },
      1: { cellWidth: 32 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 26, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });
  yPos = doc.lastAutoTable.finalY + 14;

  // ── PHASE 3: Section II — Titration Schedule & Dosing Windows ────────────
  yPos = checkPageBreak(doc, yPos, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('II. TITRATION SCHEDULE & DOSING WINDOWS', 14, yPos);
  yPos += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Each clinical stage specifies a defined dosing interval. Escalation to the next stage must not occur before the minimum observation period is completed.', 14, yPos);
  yPos += 9;

  protocol.phases.forEach((phase, idx) => {
    yPos = checkPageBreak(doc, yPos, 70);

    // Phase separator header row
    const pageWidth = doc.internal.pageSize.width;
    doc.setFillColor(0, 54, 102);
    doc.rect(14, yPos, pageWidth - 28, 8, 'F');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const phaseWeeks = phase.computed_date_label
      ? `${phase.computed_date_label} | Wks ${phase.start_week}–${phase.end_week}`
      : `Weeks ${phase.start_week}–${phase.end_week}`;
    doc.text(
      `STAGE ${idx + 1}: ${(phase.phase_title || phase.phase_name || `Phase ${idx + 1}`).toUpperCase()}    [${phaseWeeks}]`,
      18, yPos + 5.5
    );
    yPos += 12;

    // Per-compound rows for this phase
    const titrationRows = phase.drugs_used.map(d => {
      const norm      = normalizeDosing(d);
      const window    = getDosingWindow(d.dosing_frequency || d.frequency);
      const isFirst   = idx === 0;
      const prevPhase = idx > 0 ? protocol.phases[idx - 1] : null;
      const prevDrug  = prevPhase?.drugs_used?.find(
        pd => (pd.product_slug || pd.name) === (d.product_slug || d.name)
      );
      const escalation = prevDrug
        ? `Dose escalation ↑ from ${prevDrug.weekly_dose || prevDrug.per_administration_dose || '—'}`
        : isFirst ? 'Loading dose — initial administration' : 'Maintenance dose (continued)';

      return [
        norm.compound,
        norm.dose,
        norm.freq,
        window,
        escalation,
        phase.phase_objectives?.[0] || 'Pharmacodynamic tolerability assessment & biomarker monitoring'
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Compound', 'Titration Dose', 'Frequency', 'Dosing Window', 'Escalation Step', 'Clinical Objective']],
      body: titrationRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 58, 95], fontSize: 7, fontStyle: 'bold', textColor: [255, 255, 255] },
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 35 },
        1: { cellWidth: 24, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 26 },
        5: { cellWidth: 45 }
      },
      margin: { left: 14, right: 14, bottom: 35 }
    });
    yPos = doc.lastAutoTable.finalY + 10;
  });

  yPos += 4;

  // ── PHASE 4a: Section III — Reconstitution & Compounding Protocol ─────────
  yPos = checkPageBreak(doc, yPos, 80);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('III. RECONSTITUTION & COMPOUNDING PROTOCOL', 14, yPos);
  yPos += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('All lyophilized formulations must be reconstituted per the specifications below. Failure to adhere to these parameters may compromise formulation integrity.', 14, yPos);
  yPos += 8;

  // Build per-compound reconstitution table
  const reconRows = Array.from(compoundMap.values()).map(d => {
    const norm   = normalizeDosing(d);
    const vial   = d.vial_strength_used || d.selected_strength || d.strength || '5mg';
    const vol    = getReconstitutionVolume(vial);
    const mg     = parseFloat(vial) || 5;
    const doseVal = parseFloat(d.weekly_dose || d.per_administration_dose) || 0;
    const drawVol = doseVal > 0 ? `${((doseVal / mg) * parseFloat(vol)).toFixed(2)} mL` : 'Per calculation';
    return [
      norm.compound,
      vial,
      vol,
      'Bacteriostatic Water for Injection (BWfI) 0.9% Benzyl Alcohol',
      drawVol,
      'Direct diluent stream to vial wall; swirl gently ×10 s. Do NOT vortex or shake. Allow ≥60 s dissolution before aspirating.',
      'U-100 Insulin Syringe (31G × 6 mm needle, 0.5 mL capacity)'
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Compound', 'Vial Spec.', 'Reconstitution Vol.', 'Diluent', 'Draw Volume', 'Procedure', 'Recommended Syringe']],
    body: reconRows,
    theme: 'grid',
    headStyles: { fillColor: [15, 118, 110], fontSize: 7, fontStyle: 'bold', textColor: [255, 255, 255] },
    styles: { fontSize: 7, cellPadding: 2.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [240, 253, 250] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 36 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 38 },
      6: { cellWidth: 26 }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });
  yPos = doc.lastAutoTable.finalY + 14;

  // ── PHASE 4b: Section IV — Storage & Stability Specifications ─────────────
  yPos = checkPageBreak(doc, yPos, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('IV. STORAGE & STABILITY SPECIFICATIONS', 14, yPos);
  yPos += 8;

  autoTable(doc, {
    startY: yPos,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52, fillColor: [248, 250, 252] },
      1: { cellWidth: 60 },
      2: { cellWidth: 65 }
    },
    head: [['Parameter', 'Lyophilized (Unreconstituted)', 'Reconstituted Solution']],
    headStyles: { fillColor: [51, 65, 85], fontSize: 7.5, textColor: [255, 255, 255] },
    body: [
      ['Temperature',      '≤−20°C (long-term) | 2–8°C (short-term ≤30 days)', '2–8°C (refrigerated). Do NOT freeze.'],
      ['Light Exposure',   'Protect from UV. Store in original amber vial.',     'Use opaque syringe cap if storing drawn dose.'],
      ['Shelf Life',       'Per manufacturer label (typically 24 months)',       'Maximum 28 days post-reconstitution.'],
      ['Container',        'Original sealed vial under inert gas blanket.',      'Original vial. Cap tightly after each draw.'],
      ['Transport',        'Cold-chain shipment (2–8°C). Insulated packaging.', 'Do not transport reconstituted formulations.'],
      ['Discard Criteria', 'Discard if particulate matter visible or vial compromised.', 'Discard if cloudy, discolored, or >28 days post-reconstitution.']
    ]
  });
  yPos = doc.lastAutoTable.finalY + 14;

  // ── PHASE 4c: Section V — Subject Compliance Verification Checklist ───────
  yPos = checkPageBreak(doc, yPos, 80);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('V. SUBJECT COMPLIANCE VERIFICATION CHECKLIST', 14, yPos);
  yPos += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Subject or supervising clinician must verify each subcutaneous administration event. Mark ✓ upon confirmed completion. Leave cell blank if dose was intentionally withheld; document rationale in clinical progress notes.', 14, yPos);
  yPos += 9;

  // Generate week-by-week checklist rows from phases
  const checklistRows = [];
  protocol.phases.forEach((phase, phaseIdx) => {
    const weeksInPhase = (phase.end_week - phase.start_week) + 1;
    for (let w = phase.start_week; w <= phase.end_week; w++) {
      const compounds = phase.drugs_used
        .map(d => normalizeDosing(d).compound)
        .join(', ');
      checklistRows.push([
        `Week ${w}`,
        phase.phase_title || phase.phase_name || `Phase ${phaseIdx + 1}`,
        compounds,
        '☐ Dose Administered',
        '☐ Dose Withheld',
        ''  // Notes / Initials
      ]);
    }
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Week No.', 'Clinical Stage', 'Compounded API(s)', 'Dose Administered', 'Dose Withheld', 'Clinician Initials / Notes']],
    body: checklistRows,
    theme: 'grid',
    headStyles: { fillColor: [100, 116, 139], fontSize: 7.5, textColor: [255, 255, 255] },
    styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85], minCellHeight: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 16, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 48 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 42 }
    },
    margin: { left: 14, right: 14, bottom: 35 }
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // Signature block
  yPos = checkPageBreak(doc, yPos, 30);
  const pageW = doc.internal.pageSize.width;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, yPos, 95, yPos);
  doc.line(110, yPos, pageW - 14, yPos);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Supervising Clinician Signature', 14, yPos + 5);
  doc.text('Date of Review', 110, yPos + 5);
  yPos += 14;

  // ── SECTION VI: EXPECTED CLINICAL OUTCOMES ─────────────────────────────────
  const eo = rawProtocol?.expected_outcomes;
  if (eo) {
    const qualList   = Array.isArray(eo) ? eo : (eo.qualitative || []);
    const qRanges    = !Array.isArray(eo) ? (eo.quantitative_ranges || {}) : {};
    const responder  = !Array.isArray(eo) ? eo.responder_rate_pct   : null;
    const onsetWks   = !Array.isArray(eo) ? eo.time_to_onset_weeks  : null;

    if (qualList.length || Object.keys(qRanges).length) {
      yPos = checkPageBreak(doc, yPos, 60);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('VI. EXPECTED CLINICAL OUTCOMES', 14, yPos);
      yPos += 5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Outcomes are projections based on published evidence and clinical observations. Individual results may vary.', 14, yPos);
      yPos += 8;

      // Qualitative outcomes list
      if (qualList.length) {
        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Qualitative Outcome']],
          body: qualList.map((o, i) => [i + 1, o]),
          theme: 'striped',
          headStyles: { fillColor: [5, 150, 105], fontSize: 7.5, fontStyle: 'bold', textColor: [255, 255, 255] },
          styles: { fontSize: 8, cellPadding: 2.5, textColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [240, 253, 250] },
          columnStyles: { 0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 162 } },
          margin: { left: 14, right: 14, bottom: 35 }
        });
        yPos = doc.lastAutoTable.finalY + 8;
      }

      // Quantitative ranges
      if (Object.keys(qRanges).length) {
        yPos = checkPageBreak(doc, yPos, 40);
        autoTable(doc, {
          startY: yPos,
          head: [['Milestone', 'Quantitative Range / Target']],
          body: Object.entries(qRanges).map(([wk, val]) => [
            wk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            val
          ]),
          theme: 'grid',
          headStyles: { fillColor: [4, 120, 87], fontSize: 7.5, fontStyle: 'bold', textColor: [255, 255, 255] },
          styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [240, 253, 250] },
          columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' }, 1: { cellWidth: 117 } },
          margin: { left: 14, right: 14, bottom: 35 }
        });
        yPos = doc.lastAutoTable.finalY + 8;
      }

      // Responder rate + onset footer
      if (responder || onsetWks) {
        yPos = checkPageBreak(doc, yPos, 14);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        const parts = [];
        if (responder) parts.push(`Responder rate: ${responder}`);
        if (onsetWks)  parts.push(`Time to onset: ~${onsetWks} weeks`);
        doc.text(parts.join('    |    '), 14, yPos);
        yPos += 10;
      }
    }
  }

  // ── SECTION VII: CLINICAL MONITORING SCHEDULE ──────────────────────────────
  const mp = rawProtocol?.monitoring_plan || {};
  const ms = rawProtocol?.monitoringSchedule || [];
  const baselineLabs  = mp.baseline_required || [];
  const checkpoints   = mp.scheduled_checkpoints || ms;

  if (baselineLabs.length || checkpoints.length) {
    yPos = checkPageBreak(doc, yPos, 60);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('VII. CLINICAL MONITORING SCHEDULE', 14, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Scheduled laboratory evaluations and clinical checkpoints required for safe protocol execution.', 14, yPos);
    yPos += 8;

    // Baseline labs
    if (baselineLabs.length) {
      yPos = checkPageBreak(doc, yPos, 25);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(14, 116, 144);
      doc.text('Baseline Requirements (Week 0)', 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        body: [baselineLabs.map(l => l.replace(/_/g, ' '))],
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [51, 65, 85], fillColor: [240, 249, 255] },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    // Checkpoint table
    if (checkpoints.length) {
      yPos = checkPageBreak(doc, yPos, 40);
      const cpRows = checkpoints.map(cp => {
        const week  = cp.week ?? cp.week_number ?? '—';
        const label = cp.label || cp.type?.replace(/_/g, ' ') || `Week ${week} check-in`;
        const labs  = (cp.labs || cp.tests || []).join(', ') || '—';
        const note  = cp.purpose || cp.notes || cp.note || '—';
        return [`Wk ${week}`, label, labs, note];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Week', 'Checkpoint', 'Laboratory Tests', 'Clinical Purpose']],
        body: cpRows,
        theme: 'grid',
        headStyles: { fillColor: [8, 145, 178], fontSize: 7.5, fontStyle: 'bold', textColor: [255, 255, 255] },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [240, 249, 255] },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 42 },
          2: { cellWidth: 70 },
          3: { cellWidth: 46 }
        },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 12;
    }
  }

  // ── SECTION VIII: SAFETY PROFILE & RISK MANAGEMENT ─────────────────────────
  const rm           = rawProtocol?.riskManagement || rawProtocol?.risk_management || {};
  const sp           = rawProtocol?.safety_profile || {};
  const contraList   = rm.contraindications || sp.contraindications || rawProtocol?.eligibility_rules?.contraindications || [];
  const sideEffects  = rm.side_effects || rm.sideEffects || [];
  const escalation   = rm.escalation_criteria || rm.escalationCriteria || sp.adverse_events_serious || [];
  const drugInt      = sp.drug_interactions || [];

  if (contraList.length || sideEffects.length || escalation.length || drugInt.length) {
    yPos = checkPageBreak(doc, yPos, 60);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('VIII. SAFETY PROFILE & RISK MANAGEMENT', 14, yPos);
    yPos += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Contraindications, known adverse effects, drug interactions, and clinical escalation criteria.', 14, yPos);
    yPos += 8;

    // Contraindications
    if (contraList.length) {
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('CONTRAINDICATIONS', 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        body: [contraList.map(c => String(c).replace(/_/g, ' '))],
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [127, 29, 29], fillColor: [254, 242, 242] },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    // Side effects table
    if (sideEffects.length) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('KNOWN ADVERSE EFFECTS', 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        head: [['Adverse Effect', 'Frequency', 'Management / Mitigation']],
        body: sideEffects.map(se => [se.effect || '—', se.frequency || '—', se.management || '—']),
        theme: 'striped',
        headStyles: { fillColor: [180, 83, 9], fontSize: 7.5, fontStyle: 'bold', textColor: [255, 255, 255] },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [255, 251, 235] },
        columnStyles: {
          0: { cellWidth: 55, fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 87 }
        },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    // Drug interactions
    if (drugInt.length) {
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(124, 58, 237);
      doc.text('DRUG INTERACTIONS', 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        body: drugInt.map(d => ['⚠', d]),
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2, textColor: [51, 65, 85], fillColor: [250, 245, 255] },
        columnStyles: { 0: { cellWidth: 8, halign: 'center', textColor: [124, 58, 237] } },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }

    // Escalation / stop criteria
    if (escalation.length) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text('ESCALATION & STOP CRITERIA', 14, yPos);
      yPos += 5;

      autoTable(doc, {
        startY: yPos,
        body: escalation.map(e => ['⛔', e]),
        theme: 'plain',
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: [127, 29, 29], fillColor: [254, 242, 242] },
        columnStyles: { 0: { cellWidth: 8, halign: 'center' } },
        margin: { left: 14, right: 14, bottom: 35 }
      });
      yPos = doc.lastAutoTable.finalY + 12;
    }
  }

  // ── SECTION IX: SCIENTIFIC REFERENCES ──────────────────────────────────────
  const refs = rawProtocol?.metadata?.references || [];
  if (refs.length) {
    yPos = checkPageBreak(doc, yPos, 50);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('IX. SCIENTIFIC REFERENCES', 14, yPos);
    yPos += 8;

    refs.forEach((r, i) => {
      yPos = checkPageBreak(doc, yPos, 16);
      const citation = `[${i + 1}] ${r.citation || ''}`;
      const pmidTag  = r.pmid ? `  PMID: ${r.pmid}` : '';
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const pageWidth = doc.internal.pageSize.width;
      const wrapped   = doc.splitTextToSize(citation + pmidTag, pageWidth - 28);
      doc.text(wrapped, 14, yPos);
      yPos += wrapped.length * 4.5 + 3;
    });
    yPos += 4;
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  addRunningFooter(doc);

  // ── Save ───────────────────────────────────────────────────────────────────
  const slug    = (protocol.protocol_slug || 'CLINICAL').toUpperCase();
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`REGEN-DOS-ADM-${slug}-${dateTag}.pdf`);
};

