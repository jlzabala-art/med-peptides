/**
 * patientGuidePdf.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PDF Generator for Patient Guides and Administration Schedules.
 */

import { ROUTE_LABELS, ROUTE } from '../../constants/productEnums.js';
import { 
  PDF_COLORS, 
  formatDate, 
  formatPrice, 
  normalizeDosing, 
  getDaysForFrequency, 
  checkPageBreak, 
  addRunningFooter 
} from './pdfTheme.js';

const PHASE_COLORS = [
  [0, 54, 102],
  [8, 145, 178],
  [22, 163, 74],
  [124, 58, 237],
  [217, 119, 6]
];

const generateWeeklyPattern = (phase) => {
  const days = {
    'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [], 'Sat': [], 'Sun': []
  };

  (phase.drugs_used || []).forEach(d => {
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

export const generatePatientGuide = async (rawProtocol, formData, options = {}) => {
  const [jsPdfModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  const jsPDF = jsPdfModule.default || jsPdfModule.jsPDF || jsPdfModule;
  const autoTable = autoTableModule.default || autoTableModule;

  const protocol = rawProtocol || {};
  const doc = new jsPDF();
  const dateStr = formatDate(null);
  
  let yPos = 20;
  
  // Header bar
  doc.setFillColor(0, 54, 102);
  doc.rect(14, 10, 182, 3, 'F');
  
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
  doc.text(`Program: ${protocol.protocol_title || protocol.name || 'Personalized Protocol'}`, 14, yPos);
  doc.text(`Duration: ${protocol.protocol_duration_weeks || 12} Weeks total`, 140, yPos);
  yPos += 6;
  const startDateStr = formData?.startDate ? (new Date(formData.startDate)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pending';
  doc.text(`Protocol Start Date: ${startDateStr}`, 14, yPos);
  yPos += 8;

  const splitSummary = doc.splitTextToSize(protocol.overview_summary || protocol.description || "", 180);
  doc.text(splitSummary, 14, yPos);
  yPos += (splitSummary.length * 5) + 8;

  // 2 — Administration Schedule
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text("2. HOW TO TAKE YOUR BIOMODULATORS", 14, yPos);
  yPos += 8;

  (protocol.phases || []).forEach((phase, idx) => {
    yPos = checkPageBreak(doc, yPos, 100);
    
    // Stage Header
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, 182, 10, 'F');
    doc.setFontSize(10);
    doc.setTextColor(0, 54, 102);
    const splitPhaseStr = phase.computed_date_label ? 
       `(${phase.computed_date_label} / Wks ${phase.start_week}-${phase.end_week})` : 
       `(Weeks ${phase.start_week || 1}-${phase.end_week || 4})`;
    doc.text(`STAGE ${idx + 1}: ${phase.phase_title || phase.phase_name || `Phase ${idx + 1}`} ${splitPhaseStr}`, 18, yPos + 7);
    
    yPos += 15;

    // Instructions as sentences
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    (phase.drugs_used || []).forEach(d => {
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
