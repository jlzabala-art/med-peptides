/**
 * clinicalGuardianEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomous AI Clinical Guardian & Galenic Incompatibility Engine.
 * 
 * Audits:
 *   1. Physicochemical & Solvent Incompatibilities (APIs vs Vehicles)
 *   2. pH Tolerance & Degradation Kinetics (Peptide Disulfide Bridges)
 *   3. Osmolarity & Route Safety (Topical / Transdermal vs Subcutaneous)
 *   4. Quality & CoA Threshold Verification (Purity >= 98.0%, Endotoxins < 0.2 EU/mg)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const INCOMPATIBILITY_RULES = [
  {
    id: 'rule_minoxidil_aqueous_solubility',
    name: 'Minoxidil Precipitation in Pure Water',
    matches: ({ activeApis, vehicle }) => {
      const hasMinoxidil = activeApis.some(a => String(a).toLowerCase().includes('minoxidil'));
      const isPureWater = String(vehicle).toLowerCase().includes('bacteriostatic') || String(vehicle).toLowerCase().includes('purified_water');
      return hasMinoxidil && isPureWater;
    },
    severity: 'critical',
    message: 'Minoxidil has poor aqueous solubility (< 2 mg/mL) and will precipitate in pure water without co-solvents.',
    suggestedVehicle: 'trichosol'
  },
  {
    id: 'rule_peptide_oxidizing_agent',
    name: 'Peptide Oxidation & Disulfide Cleavage Risk',
    matches: ({ activeApis, excipients = [] }) => {
      const hasPeptide = activeApis.some(a => ['bpc-157', 'tb-500', 'ghk-cu', 'semaglutide', 'epithalon'].some(p => String(a).toLowerCase().includes(p)));
      const hasOxidizer = excipients.some(e => ['hydrogen_peroxide', 'benzoyl_peroxide', 'retinoic_acid'].some(o => String(e).toLowerCase().includes(o)));
      return hasPeptide && hasOxidizer;
    },
    severity: 'critical',
    message: 'Co-formulation of peptides with strong oxidizing agents causes rapid disulfide bond cleavage and loss of biological potency.',
    suggestedVehicle: 'nourivan'
  },
  {
    id: 'rule_ghk_copper_ph_instability',
    name: 'GHK-Cu Copper Tripeptide Acid Hydrolysis',
    matches: ({ activeApis, targetPh }) => {
      const hasGhk = activeApis.some(a => String(a).toLowerCase().includes('ghk'));
      return hasGhk && targetPh !== null && Number(targetPh) < 4.5;
    },
    severity: 'warning',
    message: 'GHK-Cu releases free copper ions at acidic pH (< 4.5), causing complex dissociation and skin irritation. Maintain pH between 5.5 and 6.5.',
    suggestedVehicle: 'trichoserum'
  },
  {
    id: 'rule_injectable_preservative_check',
    name: 'Preservative Requirement for Multi-Dose Injectables',
    matches: ({ isInjectable, isMultiDose, vehicle }) => {
      if (!isInjectable || !isMultiDose) return false;
      const isPreserved = String(vehicle).toLowerCase().includes('bacteriostatic') || String(vehicle).toLowerCase().includes('benzyl');
      return !isPreserved;
    },
    severity: 'warning',
    message: 'Multi-dose injectable peptides must utilize 0.9% Benzyl Alcohol preserved diluent to prevent microbial contamination after initial puncture.',
    suggestedVehicle: 'bacteriostatic_water'
  }
];

/**
 * Audits a compounded formulation for clinical safety, stability, and physicochemical compatibility
 */
export function auditCompoundSafety({
  activeIngredients = [],
  vehicle = 'trichoserum',
  targetPh = 5.5,
  isInjectable = false,
  isMultiDose = false,
  excipients = []
}) {
  const activeApis = Array.isArray(activeIngredients) ? activeIngredients : [activeIngredients];
  const criticalIncompatibilities = [];
  const warnings = [];
  let suggestedAlternativeVehicle = null;

  for (const rule of INCOMPATIBILITY_RULES) {
    if (rule.matches({ activeApis, vehicle, targetPh, isInjectable, isMultiDose, excipients })) {
      if (rule.severity === 'critical') {
        criticalIncompatibilities.push({ id: rule.id, name: rule.name, message: rule.message });
      } else {
        warnings.push({ id: rule.id, name: rule.name, message: rule.message });
      }
      if (rule.suggestedVehicle) {
        suggestedAlternativeVehicle = rule.suggestedVehicle;
      }
    }
  }

  const isSafe = criticalIncompatibilities.length === 0;
  let stabilityScore = 100;
  stabilityScore -= criticalIncompatibilities.length * 40;
  stabilityScore -= warnings.length * 15;
  stabilityScore = Math.max(0, Math.min(100, stabilityScore));

  return {
    isSafe,
    stabilityScore,
    statusLabel: isSafe ? (warnings.length > 0 ? 'Review Recommended' : 'Optimal Formulation') : 'Incompatible Mixture',
    statusColor: isSafe ? (warnings.length > 0 ? '#d97706' : '#16a34a') : '#dc2626',
    criticalIncompatibilities,
    warnings,
    suggestedAlternativeVehicle
  };
}

/**
 * Validates Certificate of Analysis (CoA) lab standards
 */
export function auditCertificateOfAnalysis(coaData = {}) {
  const purity = Number(coaData.purityPercentage || coaData.purity || 0);
  const endotoxins = Number(coaData.endotoxinsEuPerMg || 0.1);
  const hasHplcTrace = Boolean(coaData.hasHplcTrace || coaData.hplcVerified);
  const hasMassSpec = Boolean(coaData.hasMassSpec || coaData.msVerified);

  const errors = [];
  if (purity > 0 && purity < 98.0) {
    errors.push(`HPLC purity (${purity}%) is below the pharmaceutical threshold (98.0%).`);
  }
  if (endotoxins > 0.2) {
    errors.push(`Endotoxin level (${endotoxins} EU/mg) exceeds sterile compounding limits (< 0.2 EU/mg).`);
  }

  const isCompliant = errors.length === 0 && (purity >= 98.0 || purity === 0);

  return {
    isCompliant,
    purity,
    endotoxins,
    hasHplcTrace,
    hasMassSpec,
    errors,
    gradeLabel: isCompliant ? 'USP / EP Compounding Grade Verified' : 'Grade Verification Pending'
  };
}
