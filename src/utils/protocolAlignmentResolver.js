/**
 * protocolAlignmentResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cross-references clinical prescriptions against Atlas standard reference protocols.
 * Detects whether a prescription is:
 *   1. Exact 100% Literature Match
 *   2. Physician-Calibrated Titration (e.g. 200 mcg vs 250-500 mcg)
 *   3. Custom Synergistic Stack (e.g. Retatrutide + Enclomiphene)
 *   4. Custom Magistral Formulation
 * 
 * Non-judgmental & respectful: Celebrates physician personalization and autonomy.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const KNOWN_PROTOCOL_STANDARDS = {
  selank: {
    protocolSlug: 'cognitive-support-protocol',
    protocolCode: 'cog_001',
    protocolName: 'Cognitive Support & Neuro-Restoration Protocol',
    standardDose: '7,500 mcg/ml (7.5 mg/ml)',
    standardRoute: 'Nasal Spray (1-2 sprays/nostril daily)',
    defaultCycle: '4–8 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('7500') || d.includes('7.5 mg') || d.includes('7.5mg')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Prescribed concentration exactly aligns with published European neuro-peptide clinical monographs.'
        };
      }
      if (d.includes('30 mg') || d.includes('30mg')) {
        return {
          isExact: false,
          isHighTitration: true,
          standardDose: '7,500 mcg/ml (7.5 mg/ml)',
          label: 'Physician High-Concentration Titration',
          note: 'Physician-calibrated intensive titration (4x concentration): Tailored for acute cognitive exhaustion or refractory neuro-adrenal recovery.'
        };
      }
      return {
        isExact: false,
        standardDose: '7,500 mcg/ml (7.5 mg/ml)',
        label: 'Physician-Calibrated Concentration',
        note: `Customized concentration (${prescribedDose}) calibrated to patient sensitivity.`
      };
    }
  },
  semax: {
    protocolSlug: 'focus-and-resilience-protocol',
    protocolCode: 'cog_002',
    protocolName: 'Focus, BDNF & Neural Resilience Protocol',
    standardDose: '7,500 mcg/ml (7.5 mg/ml)',
    standardRoute: 'Nasal Spray',
    defaultCycle: '4 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('7500') || d.includes('7.5 mg') || d.includes('7.5mg') || d.includes('0.1%') || d.includes('1%')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Standard BDNF and TrkB receptor agonist dosage.'
        };
      }
      return {
        isExact: false,
        standardDose: '7,500 mcg/ml (7.5 mg/ml)',
        label: 'Physician-Calibrated Concentration',
        note: `Customized Semax dosage (${prescribedDose}) calibrated by physician.`
      };
    }
  },
  bpc157: {
    protocolSlug: 'immune-reset-protocol',
    protocolCode: 'immune_002',
    protocolName: 'Immune Reset & Gut Mucosal Recovery Protocol',
    standardDose: '250 mcg – 500 mcg daily',
    standardRoute: 'Oral Capsule or SubQ',
    defaultCycle: '6–8 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('250') || d.includes('500')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Dosage aligns with standard gastrointestinal mucosal repair and angiogenesis protocols.'
        };
      }
      if (d.includes('200')) {
        return {
          isExact: false,
          isMicroDose: true,
          standardDose: '250 mcg – 500 mcg daily',
          label: 'Physician Micro-Titration (Gentle Induction)',
          note: 'Calibrated induction micro-dose (200 mcg): Optimized to evaluate individual gastric tolerance and prevent initial motility shifts before Phase 2 dose escalation.'
        };
      }
      if (d.includes('5 mg') || d.includes('5mg')) {
        return {
          isExact: true,
          standardDose: '5 mg vial (250–500 mcg/day)',
          label: 'Lyophilized SubQ Multi-Dose Vial',
          note: 'Standard 5 mg reconstituted vial providing a multi-week SubQ restorative cycle.'
        };
      }
      return {
        isExact: false,
        standardDose: '250 mcg – 500 mcg daily',
        label: 'Physician-Calibrated Dose',
        note: `Calibrated dose of ${prescribedDose} adjusted for patient weight and symptom severity.`
      };
    }
  },
  kpv: {
    protocolSlug: 'immune-reset-protocol',
    protocolCode: 'immune_002',
    protocolName: 'Immune Reset & Gut Mucosal Recovery Protocol',
    standardDose: '250 mcg – 500 mcg daily',
    standardRoute: 'Oral Capsule',
    defaultCycle: '6–8 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('250') || d.includes('500')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Standard NF-κB mucosal down-regulation dose.'
        };
      }
      if (d.includes('200')) {
        return {
          isExact: false,
          isMicroDose: true,
          standardDose: '250 mcg – 500 mcg daily',
          label: 'Physician Micro-Titration',
          note: 'Gentle induction dose of 200 mcg calibrated for mucosal adaptation.'
        };
      }
      return {
        isExact: false,
        standardDose: '250 mcg – 500 mcg daily',
        label: 'Physician-Calibrated Dose',
        note: `Calibrated KPV dosage (${prescribedDose}) tailored by physician.`
      };
    }
  },
  retatrutide: {
    protocolSlug: 'metabolic-retatrutide-motsc-12w',
    protocolCode: 'wm_003',
    protocolName: 'Triple Agonist Metabolic Intensification Protocol',
    standardDose: '2 mg – 5 mg SubQ weekly',
    standardRoute: 'Subcutaneous Weekly Injection',
    defaultCycle: '12 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('5 mg') || d.includes('5mg') || d.includes('4 mg') || d.includes('2 mg')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Standard Phase 2 therapeutic escalation dose for GLP-1/GIP/Glucagon triple receptor activation.'
        };
      }
      return {
        isExact: false,
        standardDose: '2 mg – 5 mg SubQ weekly',
        label: 'Physician Escalation Titration',
        note: `Escalation dose (${prescribedDose}) calibrated by physician.`
      };
    }
  },
  epithalon: {
    protocolSlug: 'longevity-foundation-12w',
    protocolCode: 'lon_001',
    protocolName: 'Longevity Foundation & Telomerase Activation Protocol',
    standardDose: '10 mg – 30 mg per cycle',
    standardRoute: 'SubQ Cartridge Pen or Injections',
    defaultCycle: '10–20 days',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('30 mg') || d.includes('30mg') || d.includes('10 mg')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Standard clinical cycle dose for pineal bioregulation and telomeric protection.'
        };
      }
      return {
        isExact: false,
        standardDose: '10 mg – 30 mg per cycle',
        label: 'Physician-Calibrated Cycle',
        note: `Calibrated Epithalon dose of ${prescribedDose}.`
      };
    }
  },
  dihexa: {
    protocolSlug: 'neuro-restoration-advanced',
    protocolCode: 'neuro_001',
    protocolName: 'Advanced Neuro-Restoration & Synaptogenesis Protocol',
    standardDose: '5 mg daily or alternate days',
    standardRoute: 'Oral Capsule',
    defaultCycle: '4–8 weeks',
    resolveCalibration: (prescribedDose) => {
      const d = String(prescribedDose || '').toLowerCase();
      if (d.includes('5 mg') || d.includes('5mg')) {
        return {
          isExact: true,
          label: 'Exact Literature Match',
          note: 'Standard HGF/c-Met allosteric agonist dose for dendritic arborization.'
        };
      }
      return {
        isExact: false,
        standardDose: '5 mg daily',
        label: 'Physician-Calibrated Dose',
        note: `Customized Dihexa dose (${prescribedDose}) tailored for neural recovery.`
      };
    }
  }
};

/**
 * Resolves the protocol alignment and calibrations for any given prescription.
 */
export function resolvePrescriptionProtocolAlignment(rx = {}, doctor = {}) {
  const items = Array.isArray(rx.items) ? rx.items : [];
  const rawParts = Array.isArray(rx.parts) ? rx.parts : [];
  
  // Extract all active ingredients
  const extracted = [];
  items.forEach(it => {
    const name = it.activeIngredient || it.name || it.drugName || '';
    const dose = it.dosage || it.dose || it.concentration || '';
    if (name) extracted.push({ name, dose, raw: it });
  });
  rawParts.forEach(p => {
    (p.apis || []).forEach(a => {
      const name = a.name || a.activeIngredient || '';
      const dose = a.dose || a.dosage || '';
      if (name && !extracted.some(e => e.name.toLowerCase() === name.toLowerCase())) {
        extracted.push({ name, dose, raw: a });
      }
    });
  });

  const fullText = `${rx.treatmentTitle || ''} ${rx.title || ''} ${extracted.map(e => e.name).join(' ')}`.toLowerCase();

  // 1. Identify primary active principle
  let matchedKey = null;
  if (fullText.includes('selank')) matchedKey = 'selank';
  else if (fullText.includes('semax')) matchedKey = 'semax';
  else if (fullText.includes('bpc-157') || fullText.includes('bpc 157') || fullText.includes('bpc157')) matchedKey = 'bpc157';
  else if (fullText.includes('kpv')) matchedKey = 'kpv';
  else if (fullText.includes('retatrutide')) matchedKey = 'retatrutide';
  else if (fullText.includes('epithalon')) matchedKey = 'epithalon';
  else if (fullText.includes('dihexa')) matchedKey = 'dihexa';

  if (!matchedKey) {
    return {
      hasProtocolMatch: false,
      protocolName: rx.treatmentTitle || 'Personalized Compounded Regimen',
      protocolCode: rx.code || 'CUSTOM',
      status: 'magistral_custom',
      statusBadge: 'Custom Magistral Formulation',
      badgeColor: '#475569',
      badgeBg: '#f1f5f9',
      borderColor: '#cbd5e1',
      calibrations: [],
      clinicalNote: 'Formulación magistral individualizada diseñada a medida por el facultativo.'
    };
  }

  const standard = KNOWN_PROTOCOL_STANDARDS[matchedKey];
  const targetItem = extracted.find(e => e.name.toLowerCase().includes(matchedKey)) || extracted[0] || {};
  const calibrationInfo = standard.resolveCalibration(targetItem.dose);

  // Check if there are synergistic adjuncts (e.g. Enclomiphene with Retatrutide, or KPV with BPC-157)
  const adjuncts = extracted.filter(e => !e.name.toLowerCase().includes(matchedKey));
  const hasSynergisticAdjuncts = adjuncts.length > 0;

  let status = 'exact_match';
  let statusBadge = '100% Protocol Reference Match';
  let badgeColor = '#15803d';
  let badgeBg = '#f0fdf4';
  let borderColor = '#bbf7d0';

  if (!calibrationInfo.isExact) {
    status = 'physician_calibrated';
    statusBadge = 'Physician-Calibrated Titration';
    badgeColor = '#0369a1';
    badgeBg = '#f0f9ff';
    borderColor = '#bae6fd';
  } else if (hasSynergisticAdjuncts) {
    status = 'custom_synergy';
    statusBadge = 'Standard Base + Synergistic Adjuncts';
    badgeColor = '#6d28d9';
    badgeBg = '#f5f3ff';
    borderColor = '#ddd6fe';
  }

  // Construct deep URL with active calibrations query params
  const doctorName = doctor.name || rx.doctorName || 'Treating Physician';
  const doctorSlug = doctor.nameSlug || doctor.id || 'dr';
  const patientName = rx.patientName || rx.patient?.name || 'Patient';
  const rxCode = rx.code || rx.prescriptionNumber || rx.id || '';

  const params = new URLSearchParams({
    calibrated_by: doctorSlug,
    doctor_name: doctorName,
    calibrated_api: targetItem.name || matchedKey.toUpperCase(),
    calibrated_dose: targetItem.dose || 'Calibrated',
    standard_dose: standard.standardDose,
    patient: patientName,
    rx: rxCode,
    status: status
  });

  const protocolUrl = `/proto/${standard.protocolSlug}?${params.toString()}`;

  return {
    hasProtocolMatch: true,
    protocolSlug: standard.protocolSlug,
    protocolCode: standard.protocolCode,
    protocolName: standard.protocolName,
    standardDose: standard.standardDose,
    standardRoute: standard.standardRoute,
    defaultCycle: standard.defaultCycle,
    prescribedApi: targetItem.name || matchedKey.toUpperCase(),
    prescribedDose: targetItem.dose || 'Standard',
    status,
    statusBadge,
    badgeColor,
    badgeBg,
    borderColor,
    isExactMatch: calibrationInfo.isExact && !hasSynergisticAdjuncts,
    calibrationNote: calibrationInfo.note,
    adjuncts,
    protocolUrl
  };
}
