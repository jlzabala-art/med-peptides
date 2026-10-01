/**
 * calculatePrescriptionCompleteness — calculates data quality & clinical completeness (0-100%) for a prescription.
 *
 * Scoring Schema (Total 100 points):
 * 1. APIs & Compounds Quality (35pts):
 *    - Each API has description or mechanism of action (20pts)
 *    - Each API has explicit dosage / concentration (15pts)
 * 2. Genomics & Clinical Targets (20pts):
 *    - HGNC gene targets linked or indicated (10pts)
 *    - Clinical indication / target pathology specified (10pts)
 * 3. Physician & License Segregation (15pts):
 *    - Treating doctor present with license/DHA or ID (15pts)
 * 4. Patient CRM Linkage (15pts):
 *    - Patient linked with CRM ID, email, or phone (15pts)
 * 5. Dates & Duration (10pts):
 *    - Valid issue date & duration / follow-up date (10pts)
 * 6. Galenic Vehicle & Instructions (5pts):
 *    - Formulation vehicle specified (e.g. TrichoSol, Liposomal, Capsules) (5pts)
 */

export function calculatePrescriptionCompleteness(rx) {
  if (!rx) {
    return {
      score: 0,
      color: '#dc2626',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      statusLabel: 'Incomplete',
      missingFields: [{ key: 'rx', label: 'Prescription Data Missing', weight: 100, category: 'General' }],
    };
  }

  const missing = [];
  let score = 0;

  const rawItems = rx.items || rx.compounds || rx.prescriptionLines || rx.products || [];
  const itemCount = rawItems.length;

  // ── 1. APIs & Compounds Quality (35pts) ──────────────────────────────────
  if (itemCount === 0) {
    missing.push({
      key: 'items',
      label: 'No active compounds / APIs added',
      weight: 35,
      category: 'Pharmacology',
    });
  } else {
    // Check descriptions & mechanisms
    const apisWithDesc = rawItems.filter(item => 
      !!(item.description || item.mechanismOfAction || item.aiDescription || item.scientificData?.mechanismOfAction || item.pharmacologicalClass)
    );
    const descRatio = apisWithDesc.length / itemCount;
    const descPoints = Math.round(descRatio * 20);
    score += descPoints;
    if (descPoints < 20) {
      missing.push({
        key: 'api_descriptions',
        label: `${itemCount - apisWithDesc.length} API(s) missing clinical mechanism / description`,
        weight: 20 - descPoints,
        category: 'Pharmacology',
      });
    }

    // Check dosage
    const apisWithDose = rawItems.filter(item => 
      !!(item.dosage || item.dose || item.strength || item.concentration || item.quantity)
    );
    const doseRatio = apisWithDose.length / itemCount;
    const dosePoints = Math.round(doseRatio * 15);
    score += dosePoints;
    if (dosePoints < 15) {
      missing.push({
        key: 'api_dosage',
        label: `${itemCount - apisWithDose.length} API(s) missing specific dosage / concentration`,
        weight: 15 - dosePoints,
        category: 'Pharmacology',
      });
    }
  }

  // ── 2. Genomics & Clinical Targets (20pts) ────────────────────────────────
  const hasGeneTargets = !!(
    (Array.isArray(rx.geneTargets) && rx.geneTargets.length > 0) ||
    (Array.isArray(rx.genes) && rx.genes.length > 0) ||
    (Array.isArray(rx.fagron?.geneticTargets) && rx.fagron.geneticTargets.length > 0) ||
    rawItems.some(i => (Array.isArray(i.geneTargets) && i.geneTargets.length > 0) || !!i.geneTargets || !!i.genes)
  );
  if (hasGeneTargets) {
    score += 10;
  } else {
    missing.push({
      key: 'genomics',
      label: 'HGNC genomic targets not linked',
      weight: 10,
      category: 'Genomics',
    });
  }

  const hasIndication = !!(
    rx.indication || rx.clinicalIndication || rx.diagnosis || rx.treatmentProgram || rx.protocolName || rx.fagron?.treatmentSummary || rx.notes
  );
  if (hasIndication) {
    score += 10;
  } else {
    missing.push({
      key: 'indication',
      label: 'Clinical indication or pathology not specified',
      weight: 10,
      category: 'Clinical',
    });
  }

  // ── 3. Physician & License Segregation (15pts) ───────────────────────────
  const hasDoctor = !!(
    (rx.doctor && (rx.doctor.name || rx.doctor.id)) ||
    rx.doctorName ||
    rx.doctorId ||
    rx.prescribingDoctor
  );
  if (hasDoctor) {
    score += 15;
  } else {
    missing.push({
      key: 'doctor',
      label: 'Treating physician not assigned',
      weight: 15,
      category: 'Medical Governance',
    });
  }

  // ── 4. Patient CRM Linkage (15pts) ────────────────────────────────────────
  const hasPatientLink = !!(
    (rx.patient && (rx.patient.id || rx.patient.email || rx.patient.phone)) ||
    rx.patientId ||
    rx.patientEmail ||
    rx.patientPhone ||
    (rx.patientName && rx.patientName !== 'Unknown Patient' && rx.patientName.trim().length > 3)
  );
  if (hasPatientLink) {
    score += 15;
  } else {
    missing.push({
      key: 'patient',
      label: 'Patient record unlinked or missing contact',
      weight: 15,
      category: 'CRM',
    });
  }

  // ── 5. Dates & Duration (10pts) ───────────────────────────────────────────
  const hasValidDate = !!(
    rx.createdAt || rx.dateIssued || rx.date || rx.fagron?.reportDate || rx.fagron?.importedAt
  );
  const hasDuration = !!(
    rx.duration || rx.durationWeeks || rx.durationMonths || rx.followUpDate || rx.followUp || rx.refillAlertDate
  );
  if (hasValidDate && hasDuration) {
    score += 10;
  } else if (hasValidDate || hasDuration) {
    score += 5;
    missing.push({
      key: 'dates_duration',
      label: 'Treatment duration or follow-up schedule missing',
      weight: 5,
      category: 'Administration',
    });
  } else {
    missing.push({
      key: 'dates_duration',
      label: 'Prescription issue date and duration missing',
      weight: 10,
      category: 'Administration',
    });
  }

  // ── 6. Galenic Vehicle & Instructions (5pts) ──────────────────────────────
  const hasVehicle = !!(
    rx.vehicle || rx.formulationVehicle || rx.galenicForm || rx.presentation ||
    rawItems.some(i => i.vehicle || i.format?.toLowerCase()?.includes('tricho') || i.format?.toLowerCase()?.includes('capsule'))
  );
  if (hasVehicle) {
    score += 5;
  } else {
    missing.push({
      key: 'vehicle',
      label: 'Compounding vehicle / galenic base not assigned',
      weight: 5,
      category: 'Formulation',
    });
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));

  // Color semantic bands
  let color = '#16a34a';
  let bgColor = '#f0fdf4';
  let borderColor = '#bbf7d0';
  let statusLabel = 'Verified & Complete';

  if (finalScore < 60) {
    color = '#dc2626';
    bgColor = '#fef2f2';
    borderColor = '#fecaca';
    statusLabel = 'Needs AI Enrichment';
  } else if (finalScore < 85) {
    color = '#d97706';
    bgColor = '#fffbeb';
    borderColor = '#fde68a';
    statusLabel = 'Minor Missing Data';
  }

  return {
    score: finalScore,
    color,
    bgColor,
    borderColor,
    statusLabel,
    missingFields: missing,
    itemCount,
  };
}
