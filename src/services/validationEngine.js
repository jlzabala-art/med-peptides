/**
 * REGEN PEPT - Multi-Layer Clinical Validation Engine
 * Assesses protocol safety, coherence, and completeness.
 */

const VALIDATION_WEIGHTS = {
  completeness: 40,
  contraindications: 20,
  dosing: 15,
  interactions: 15,
  monitoring: 10
};

/**
 * 1. COMPLETENESS ENGINE
 * Checks for mandatory clinical data points.
 */
const validateCompleteness = (protocol, formData) => {
  const alerts = [];
  let score = VALIDATION_WEIGHTS.completeness;
  
  const required = [
    { field: 'primaryCondition', label: 'Primary Clinical Focus' },
    { field: 'ageGroup', label: 'Age Range' },
    { field: 'patientType', label: 'Patient Demographic' }
  ];

  required.forEach(req => {
    if (!formData[req.field]) {
      alerts.push(`Missing mandatory field: ${req.label}`);
      score = 0; // If any mandatory field is missing, completeness is 0
    }
  });

  if (!protocol.protocol_duration_weeks) {
    alerts.push("Protocol duration not defined");
    score = Math.max(0, score - 10);
  }

  // Check if product strengths are normalized
  const allMeds = (protocol.phases?.flatMap(p => p.drugs_used) || []).filter(Boolean);
  const missingStrength = allMeds.some(m => m && (!m.strength || m.strength === 'Standard'));
  if (missingStrength) {
    alerts.push("Non-standardized product strengths detected");
    score = Math.max(0, score - 10);
  }

  return {
    name: 'Completeness',
    score,
    max: VALIDATION_WEIGHTS.completeness,
    alerts,
    status: score === VALIDATION_WEIGHTS.completeness ? 'PASS' : (score === 0 ? 'FAIL' : 'WARNING')
  };
};

/**
 * 2. CONTRAINDICATION ENGINE
 * Checks patient clinical sensitivities against substances.
 */
const validateContraindications = (protocol, formData) => {
  const alerts = [];
  let score = VALIDATION_WEIGHTS.contraindications;
  
  const allMeds = (protocol.phases?.flatMap(p => p.drugs_used) || []).filter(Boolean);
  const sensitivities = formData.guidelines?.clinical || [];
  
  // Logic: pancreatitis/thyroid risks for GLPs
  const hasGlp = allMeds.some(m => 
    ['tirzepatide', 'semaglutide', 'retatrutide'].includes(m.product_slug?.toLowerCase()) ||
    m.name?.toLowerCase().includes('tirzepatide')
  );

  if (hasGlp) {
    if (sensitivities.includes('pancreatitis_history') || sensitivities.includes('thyroid_risk')) {
      alerts.push("CRITICAL: GLP-1 therapy contraindicated with patient history");
      score = 0;
    }
    
    if (formData.primaryCondition === 'Weight Management / Obesity' && sensitivities.includes('severe_gi_intolerance')) {
      alerts.push("High risk of GI adverse events with escalation");
      score = Math.max(0, score - 10);
    }
  }

  return {
    name: 'Contraindications',
    score,
    max: VALIDATION_WEIGHTS.contraindications,
    alerts,
    status: score === VALIDATION_WEIGHTS.contraindications ? 'PASS' : (score === 0 ? 'REVIEW_REQUIRED' : 'WARNING')
  };
};

/**
 * 3. DOSING ENGINE
 * Validates escalation logic and phase architecture.
 */
const validateDosing = (protocol) => {
  const alerts = [];
  let score = VALIDATION_WEIGHTS.dosing;
  
  const phases = protocol.phases || [];
  
  // Rule: Initiation -> Escalation -> Maintenance
  if (phases.length < 2) {
    alerts.push("Incomplete phase architecture: simple initiation only");
    score = Math.max(0, score - 5);
  }

  // Check for rapid escalation steps
  phases.forEach((phase, idx) => {
    if (idx > 0) {
      const prevPhase = phases[idx - 1];
      (phase.drugs_used || []).forEach(drug => {
        const prevDrug = (prevPhase.drugs_used || []).find(d => d.product_slug === drug.product_slug);
        if (prevDrug && drug.weekly_dose && prevDrug.weekly_dose) {
          // Semi-numeric comparison for escalation
          const currentVal = parseFloat(drug.weekly_dose);
          const prevVal = parseFloat(prevDrug.weekly_dose);
          if (currentVal > prevVal * 2.5) {
            alerts.push(`Aggressive dose jump detected for ${drug.name || drug.product_slug}`);
            score = Math.max(0, score - 5);
          }
        }
      });
    }
  });

  return {
    name: 'Dosing Logic',
    score,
    max: VALIDATION_WEIGHTS.dosing,
    alerts,
    status: score === VALIDATION_WEIGHTS.dosing ? 'PASS' : 'WARNING'
  };
};

/**
 * 4. INTERACTION ENGINE
 * Detects overlapping metabolic modulators.
 */
const validateInteractions = (protocol) => {
  const alerts = [];
  let score = VALIDATION_WEIGHTS.interactions;
  
  const allMeds = (protocol.phases?.flatMap(p => p.drugs_used) || []).filter(Boolean);
  const uniqueMeds = [...new Set(allMeds.map(m => m.product_slug?.toLowerCase()))];
  
  // Risk: Multiple GLP/GIP agonists
  const glps = uniqueMeds.filter(m => ['tirzepatide', 'semaglutide', 'retatrutide'].includes(m));
  if (glps.length > 1) {
    alerts.push("Interaction Risk: Overlapping incretin analogs active simultaneously");
    score = Math.max(0, score - 10);
  }

  // Risk: Multiple stimulants / metabolic accelerators
  const metabolic = uniqueMeds.filter(m => ['tesofensine', 'frag-176-191'].includes(m));
  if (metabolic.length > 1) {
    alerts.push("Metabolic Stacking: Enhanced sympathetic load detected");
    score = Math.max(0, score - 5);
  }

  return {
    name: 'Interactions',
    score,
    max: VALIDATION_WEIGHTS.interactions,
    alerts,
    status: score === VALIDATION_WEIGHTS.interactions ? 'PASS' : 'WARNING'
  };
};

/**
 * 5. MONITORING ENGINE
 * Verifies labs alignment with therapy.
 */
const validateMonitoring = (protocol, formData) => {
  const alerts = [];
  let score = VALIDATION_WEIGHTS.monitoring;
  
  const monitoring = protocol.monitoringSchedule || [];
  const allMeds = (protocol.phases?.flatMap(p => p.drugs_used) || []).filter(Boolean);
  
  const hasGlp = allMeds.some(m => ['tirzepatide', 'semaglutide', 'retatrutide'].includes(m.product_slug?.toLowerCase()));
  
  if (hasGlp) {
    const hasMetabolicLabs = monitoring.some(m => 
      (m.labs || []).some(l => ['HbA1c', 'Fasting Glucose', 'Lipid Panel'].includes(l))
    );
    
    if (!hasMetabolicLabs) {
      alerts.push("Monitoring Deficiency: Metabolic labs missing for GLP therapy");
      score = Math.max(0, score - 10);
    }
  }

  return {
    name: 'Monitoring',
    score,
    max: VALIDATION_WEIGHTS.monitoring,
    alerts,
    status: score === VALIDATION_WEIGHTS.monitoring ? 'PASS' : 'FAIL'
  };
};

/**
 * MAIN VALIDATION ENTRY POINT
 */
export const runClinicalValidation = (protocol, formData) => {
  try {
    const modules = [
      validateCompleteness(protocol, formData),
      validateContraindications(protocol, formData),
      validateDosing(protocol),
      validateInteractions(protocol),
      validateMonitoring(protocol, formData)
    ];

    const totalScore = modules.reduce((acc, m) => acc + m.score, 0);
    const areBasicsPresent = modules.find(m => m.name === 'Completeness').score > 0;
    
    let state = 'PASSED';
    if (!areBasicsPresent) {
      state = 'NOT_EVALUATED';
    } else if (totalScore < 80 || modules.some(m => m.status === 'REVIEW_REQUIRED')) {
      state = 'REVIEW_REQUIRED';
    }

    const validationSummary = {
      timestamp: new Date().toISOString(),
      confidence_score: areBasicsPresent ? totalScore : null,
      state,
      modules,
      allAlerts: modules.flatMap(m => m.alerts),
      summary_badges: modules.map(m => ({
        label: m.name,
        status: m.status,
        passed: m.status === 'PASS'
      }))
    };

    // Store log for traceability (can be persisted to Firestore later)
    console.log("Validation Log Generated:", validationSummary);

    return validationSummary;
  } catch (err) {
    console.error("Validation Engine Failure:", err);
    return {
      state: 'ERROR',
      error: "Validation unavailable. Retry validation."
    };
  }
};
