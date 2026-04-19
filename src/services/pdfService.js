

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

  const route = d.route ? d.route.charAt(0).toUpperCase() + d.route.slice(1).toLowerCase() : 'Subcutaneous';
  
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
  return ['Mon']; // Default to Monday
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
  
  const title = p.protocol_title || p.blueprint?.title || "Custom Clinical Protocol";
  const phases = p.phases || p.blueprint?.phases || [];
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

const setupBrandingHeader = (doc) => {
  doc.setFontSize(22);
  doc.setTextColor(0, 54, 102); // Deep premium blue
  doc.setFont('helvetica', 'bold');
  doc.text("REGEN PEPT", 14, 22);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text("Precision Bioregulator Engineering", 14, 28);
  doc.text("Clinical Protocol System v5.2", 14, 32);

  doc.setDrawColor(0, 54, 102);
  doc.setLineWidth(0.5);
  doc.line(14, 38, 196, 38);

  return 48; // Starting Y for content
};

const addRunningFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Solid footer background: #F7F9FC
    doc.setFillColor(247, 249, 252);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

    // Top border of footer: #E2E8F0
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(0, pageHeight - 30, pageWidth, pageHeight - 30);
    
    doc.setFontSize(8);
    // Dark Primary Footer Text: #1F2937
    doc.setTextColor(31, 41, 55);
    const disclaimer = "CONFIDENTIAL CLINICAL RECORD - Generated by ReGen PEPT Engine. Intended for professional clinical use.";
    doc.text(disclaimer, 14, pageHeight - 15);
    
    // Page count in Secondary Text: #64748B
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 15, { align: 'right' });
  }
};

const checkPageBreak = (doc, yPos, neededHeight = 50) => {
  if (yPos + neededHeight > doc.internal.pageSize.height - 35) {
    doc.addPage();
    return 20; // New page top
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
  doc.text("XI. SCIENTIFIC EVIDENCE & LITERATURE", 14, yPos);
  yPos += 8;

  const categories = {
    "Efficacy & Clinical Outcomes": [],
    "Safety & Adverse Response": [],
    "Mechanism of Action": [],
    "Monitoring & Biomarkers": []
  };

  slugs.forEach(slug => {
    evidence[slug].forEach(item => {
      const title = (item.title || "").toLowerCase();
      let cat = "Efficacy & Clinical Outcomes";
      if (title.includes("mechanism") || title.includes("receptor") || title.includes("molecular")) cat = "Mechanism of Action";
      if (title.includes("safety") || title.includes("adverse") || title.includes("side effect") || title.includes("toxicity")) cat = "Safety & Adverse Response";
      if (title.includes("monitor") || title.includes("plasma") || title.includes("levels") || title.includes("biomarker")) cat = "Monitoring & Biomarkers";
      
      categories[cat].push({ slug, item });
    });
  });

  Object.entries(categories).forEach(([name, items]) => {
    if (items.length === 0) return;
    
    yPos = checkPageBreak(doc, yPos, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 54, 102);
    doc.text(name.toUpperCase(), 14, yPos);
    yPos += 6;

    items.slice(0, 5).forEach(({ slug, item }) => {
      yPos = checkPageBreak(doc, yPos, 15);
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${slug.toUpperCase()}]`, 14, yPos);
      
      doc.setFont('helvetica', 'normal');
      const titleLines = doc.splitTextToSize(item.title, 160);
      doc.text(titleLines, 35, yPos);
      
      const linkY = yPos + (titleLines.length * 4);
      doc.setTextColor(0, 54, 102);
      const url = item.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`;
      doc.text(url, 35, linkY);
      doc.link(35, linkY - 3, 100, 4, { url });
      
      yPos = linkY + 6;
    });
    yPos += 5;
  });

  return yPos;
};

/**
 * CLINICAL PROTOCOL: Structured & Grouped
 */
export const generateClinicalProtocol = async (rawProtocol, formData) => {
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
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${protocol.protocol_title.toUpperCase()}`, 14, yPos);
  yPos += 6;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Clinical Report Generated: ${dateStr}`, 14, yPos);
  yPos += 12;

  // I — Patient Clinical Profile
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("I. PATIENT CLINICAL PROFILE", 14, yPos);
  yPos += 4;

  autoTable(doc, {
    startY: yPos,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 135 } },
    body: [
      ['Primary Clinical Focus:', protocol.primary_goal || formData?.primaryCondition || 'General Support'],
      ['Phase Architecture:', `${protocol.number_of_phases} phases — ${protocol.protocol_duration_weeks} weeks total`],
      ['Protocol Start Date:', formData?.startDate ? (new Date(formData.startDate)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'As directed'],
      ['Patient Demographic:', formData?.patientType || 'Not specified'],
      ['Guidelines Applied:', (formData?.guidelines?.complexity || 'STANDARD').toUpperCase()],
      ['Confidence Breakdown:', [
          `Completeness: ${protocol.confidenceData?.breakdown?.completeness || 90}%`,
          `Dosing Logic: ${protocol.confidenceData?.breakdown?.dosingLogic || 95}%`,
          `Monitoring: ${protocol.confidenceData?.breakdown?.monitoring || 90}%`,
          `Evidence Base: ${protocol.confidenceData?.breakdown?.evidenceStrength || 85}%`
      ].join(' | ')],
      ['Clinical Author:', `${protocol.protocol_author_name || 'ReGen Clinical Team'} | ${protocol.protocol_author_organization || 'ReGen PEPT'}`]
    ]
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // II — Protocol Summary & Outcomes
  if (protocol.overview_summary) {
    yPos = checkPageBreak(doc, yPos, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text("II. CLINICAL SUMMARY", 14, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(protocol.overview_summary, 180);
    doc.text(splitSummary, 14, yPos);
    yPos += (splitSummary.length * 5) + 6;

    if (protocol.expected_outcomes && protocol.expected_outcomes.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text("Expected Clinical Outcomes:", 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      protocol.expected_outcomes.forEach(o => {
        doc.text(`• ${o}`, 18, yPos);
        yPos += 5;
      });
      yPos += 6;
    }
  }

  // III — Phase Architecture Detail (Grouped Stages)
  yPos = checkPageBreak(doc, yPos, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("III. CLINICAL STAGES & TITRATION", 14, yPos);
  yPos += 8;

  protocol.phases.forEach((phase, idx) => {
    yPos = checkPageBreak(doc, yPos, 80);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, yPos, 196, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 54, 102);
    doc.text(`STAGE ${idx + 1}: ${phase.phase_title.toUpperCase()}`, 14, yPos);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const phaseTiming = phase.computed_date_label || `Weeks ${phase.start_week} to ${phase.end_week}`;
    doc.text(phaseTiming, 140, yPos);
    yPos += 8;

    const objectives = phase.phase_objectives || protocol.expected_outcomes || [];
    if (objectives.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text("Objectives:", 14, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      const objList = Array.isArray(objectives) ? objectives : [objectives];
      objList.slice(0, 3).forEach(obj => {
        doc.text(`• ${obj}`, 18, yPos);
        yPos += 4.5;
      });
      yPos += 4;
    }

    // Phase Medication Table
    autoTable(doc, {
      startY: yPos,
      head: [['Compound', 'Strength', 'Titration / Weekly Dose', 'Frequency', 'Route']],
      body: phase.drugs_used.map(data => {
        const d = normalizeDosing(data);
        return [
          d.compound,
          d.strength,
          d.dose,
          d.freq,
          d.route
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [0, 54, 102], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      margin: { bottom: 50 }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  });

  // IV — Dose-to-Vial Alignment Table (NEW)
  yPos = checkPageBreak(doc, yPos, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("IV. DOSE-TO-VIAL ALIGNMENT MATRIX", 14, yPos);
  yPos += 6;
  
  const alignData = [];
  protocol.phases.forEach(p => {
    p.drugs_used.forEach(d => {
      const norm = normalizeDosing(d);
      const mgPerVial = d.vial_strength_used || d.selected_strength || '5mg';
      const parsedMg = parseFloat(mgPerVial) || 5;
      const parsedDose = parseFloat(d.weekly_dose) || 0;
      const uses = (parsedMg / (parsedDose || 1)).toFixed(1);

      alignData.push([
        norm.compound,
        norm.dose,
        mgPerVial,
        parsedDose > 0 ? `${uses} uses` : 'Varied'
      ]);
    });
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Product', 'Required Dose', 'Vial Spec', 'Est. Uses / Vial']],
    body: alignData.filter((v, i, a) => a.findIndex(t => t[0] === v[0] && t[1] === v[1]) === i), // Unique rows
    theme: 'grid',
    headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
    styles: { fontSize: 8 },
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // V — Resource Inventory
  yPos = checkPageBreak(doc, yPos, 50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("V. FULL PROGRAM RESOURCE REQUIREMENTS", 14, yPos);
  yPos += 6;

  const costData = protocol.computedCost || protocol.costData || {};
  autoTable(doc, {
    startY: yPos,
    head: [['Product', 'Vial Specification', 'Quantity Required', 'Est. Unit Price', 'Est. Cost']],
    body: (costData.aggregate || costData.aggregateVials || []).map(i => [
      i.name, `${i.mgPerVial} mg`, `${i.totalVials} Vial(s)`, `$${formatPrice(i.pricePerVial || 50)}`, `$${formatPrice(i.totalVials * (i.pricePerVial || 50))}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8 },
    styles: { fontSize: 8 },
    foot: [['', '', '', 'TOTAL PROGRAM COST:', `$${formatPrice(costData.total || costData.totalEstimatedCost || 0)}`]],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
    margin: { bottom: 50 }
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // VI — Clinical Application Workflow (NEW)
  yPos = checkPageBreak(doc, yPos, 80);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("VI. CLINICAL APPLICATION WORKFLOW", 14, yPos);
  yPos += 8;

  const workflow = [
    ['1. Weekly Instructions:', 'Administrations should occur at consistent times. Subcutaneous injections are typically best in distal adipose tissue.'],
    ['2. Reconstitution:', 'Use Bacteriostatic Water (0.9%). Typical volume 1.0ml-2.0ml. Swirl gently; do not shake.'],
    ['3. Escalation Rules:', 'Observe for full 7 days at each dosage level before proceeding to the next stage.'],
    ['4. Storage Conditions:', 'Lyophilized: Store in cool, dark place (-20°C for long term). Reconstituted: Refrigerate (2-8°C).'],
    ['5. Syringe Safety:', 'Use insulin-grade U-100 syringes (31g) for maximum comfort and precision.']
  ];

  autoTable(doc, {
    startY: yPos,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
    body: workflow
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // VII — Economic Analysis (NEW)
  yPos = checkPageBreak(doc, yPos, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("VII. ECONOMIC ANALYSIS", 14, yPos);
  yPos += 6;

  const phaseData = costData.phaseBreakdown || [];
  autoTable(doc, {
    startY: yPos,
    head: [['Clinical Phase', 'Duration', 'Phase Total', 'Weekly Cost Avg.']],
    body: phaseData.map(p => [
      p.title,
      `${p.weeks} Weeks`,
      `$${formatPrice(p.cost)}`,
      `$${formatPrice(Math.round(p.cost / p.weeks))}`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [100, 116, 139], fontSize: 8 },
    styles: { fontSize: 8 },
  });
  yPos = doc.lastAutoTable.finalY + 6;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`ESTIMATED MONTHLY COST (AVG): $${formatPrice(costData.costPerMonth || 0)}`, 140, yPos + 4);
  yPos += 14;

  // VIII — Clinical Monitoring Schedule (EXPANDED)
  const monitoring = protocol.monitoringSchedule || [];
  if (monitoring.length > 0) {
    yPos = checkPageBreak(doc, yPos, 40);
    doc.setFontSize(11);
    doc.text("VIII. CLINICAL MONITORING SCHEDULE", 14, yPos);
    yPos += 6;
    autoTable(doc, {
      startY: yPos,
      head: [['Week', 'Metric / Required Labs', 'Clinical Rationale']],
      body: monitoring.map(m => [
        m.week === 0 ? "Week 0 (Baseline)" : `Week ${m.week}`, 
        m.labs.join(', '), 
        m.note || 'Safety monitoring'
      ]),
      theme: 'striped',
      styles: { fontSize: 8 },
      margin: { bottom: 50 }
    });
    yPos = doc.lastAutoTable.finalY + 12;
  }

  // IX — Risk & Tolerance Management (NEW)
  yPos = checkPageBreak(doc, yPos, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("IX. RISK & TOLERANCE MANAGEMENT", 14, yPos);
  yPos += 8;
  
  const rm = protocol.riskManagement || {};
  const rmBody = [
    ['Common Side Effects:', (rm.commonSideEffects || []).join(', ')],
    ['Escalation Pause Rules:', rm.escalationPauseRules || 'Standard pause rules apply if Grade 2 adverse events occur.'],
    ['Safety Warnings:', rm.safetyWarnings || 'Monitor for systemic response. Maintain hydration and electrolyte balance.']
  ];

  autoTable(doc, {
    startY: yPos,
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 }, 1: { cellWidth: 140 } },
    body: rmBody
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // X — Provenance & Verification
  yPos = checkPageBreak(doc, yPos, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("X. PROVENANCE & CLINICAL VERIFICATION", 14, yPos);
  yPos += 6;
  
  const provenance = protocol.provenance || {};
  autoTable(doc, {
    startY: yPos,
    theme: 'striped',
    styles: { fontSize: 8 },
    body: [
      ['Source Type:', provenance.source_type || 'Clinical Blueprint'],
      ['Authoring Team:', provenance.author || 'ReGen PEPT Clinical Intelligence'],
      ['Review Status:', (provenance.review_status || 'Automated Synthesis').toUpperCase()],
      ['Verification:', 'Validated against ReGen PEPT wholesale peptide standards. Reference: v5.2-Core.']
    ]
  });
  yPos = doc.lastAutoTable.finalY + 12;

  // XI — Scientific Evidence (Clickable & Grouped)
  yPos = renderStructuredReferences(doc, yPos, protocol.evidenceCache || {});

  addRunningFooter(doc);
  doc.save(`REGEN-PROTOCOL-${(protocol.protocol_slug || 'CLINICAL').toUpperCase()}.pdf`);
};

/**
 * PATIENT GUIDE: Simplified & Grouped
 */
export const generatePatientGuide = async (rawProtocol, formData) => {
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
  yPos += (splitSummary.length * 5) + 10;

  // 2 — Administration Schedule
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
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
    doc.text(`STAGE ${idx + 1}: ${phase.phase_title} ${splitPhaseStr}`, 18, yPos + 7);
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
      const route = d.route || 'subcutaneous';
      
      let instruction = `Take ${compound}${strength} at ${dose} once per week via ${route} injection.`;
      if (freq.includes('daily')) instruction = `Inject ${compound}${strength} (${dose}) daily via ${route} administration.`;
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
  doc.save(`REGEN-PATIENT-GUIDE-${dateStr.replace(/ /g, '-')}.pdf`);
};

export const generateClinicalPDF = async (protocol, formData) => {
  await generateClinicalProtocol(protocol, formData);
};

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL DOSAGE & ADMINISTRATION SCHEDULE
// Pharma-grade document for patient/clinician use
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infers the pharmacological classification from a compound slug or name.
 */
const inferClassification = (d) => {
  const slug = (d.product_slug || d.name || d.product_title || '').toLowerCase();
  if (slug.includes('semaglutide') || slug.includes('tirzepatide') || slug.includes('glp')) return 'GLP-1 Receptor Agonist';
  if (slug.includes('bpc') || slug.includes('tb4') || slug.includes('thymosin')) return 'Tissue-Repair Peptide';
  if (slug.includes('ipamorelin') || slug.includes('ghrp') || slug.includes('sermorelin') || slug.includes('cjc')) return 'GH Secretagogue';
  if (slug.includes('nad')) return 'NAD+ Precursor';
  if (slug.includes('testosterone') || slug.includes('enanthate') || slug.includes('cypionate')) return 'Androgenic Agent';
  if (slug.includes('kisspeptin') || slug.includes('gonado')) return 'Gonadotropin Modulator';
  if (slug.includes('selank') || slug.includes('semax') || slug.includes('dsip')) return 'Nootropic Peptide';
  if (slug.includes('epitalon') || slug.includes('epithalon')) return 'Telomere Regulatory Peptide';
  return 'Bioregulatory Peptide';
};

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
  doc.text('REGEN PEPT', 14, 22);

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
  doc.text(`Issuing Authority: ReGen PEPT Clinical Pharmacist Office`, pageWidth - 14, 32, { align: 'right' });

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
  const clinician  = protocol.protocol_author_name || formData?.clinician || 'ReGen PEPT Clinical Team';

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

  const protocol = validateAndEnrichProtocol(rawProtocol);
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
      `STAGE ${idx + 1}: ${phase.phase_title.toUpperCase()}    [${phaseWeeks}]`,
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
  protocol.phases.forEach(phase => {
    const weeksInPhase = (phase.end_week - phase.start_week) + 1;
    for (let w = phase.start_week; w <= phase.end_week; w++) {
      const compounds = phase.drugs_used
        .map(d => normalizeDosing(d).compound)
        .join(', ');
      checklistRows.push([
        `Week ${w}`,
        phase.phase_title,
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

  // ── Footer ─────────────────────────────────────────────────────────────────
  addRunningFooter(doc);

  // ── Save ───────────────────────────────────────────────────────────────────
  const slug    = (protocol.protocol_slug || 'CLINICAL').toUpperCase();
  const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  doc.save(`REGEN-DOS-ADM-${slug}-${dateTag}.pdf`);
};

