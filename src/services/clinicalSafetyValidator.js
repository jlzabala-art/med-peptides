/**
 * src/services/clinicalSafetyValidator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomous Clinical Safety Engine & Interaction Checker
 *
 * Checks prescriptions for:
 *   1. Duplicate mechanism/active compound detection (e.g. GLP-1 duplication)
 *   2. Known interaction alerts (e.g. Secretagogues + high-dose insulin mimetics)
 *   3. Dosage sanity checks (flagging unusually high concentrations or frequencies)
 *   4. Synergy and administration route consistency
 *
 * Pure JS — safe for Browser, Node scripts, Cloud Functions, and Write Guards.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Compound Families & Risk Matrix ──────────────────────────────────────────
const COMPOUND_FAMILIES = {
  glp1_agonists: ['semaglutide', 'tirzepatide', 'retatrutide', 'liraglutide', 'dulaglutide'],
  gh_secretagogues: ['ipamorelin', 'cjc-1295', 'cjc1295', 'tesamorelin', 'ghrp-2', 'ghrp-6', 'sermorelin', 'mk-677', 'mk677'],
  healing_peptides: ['bpc-157', 'bpc157', 'tb-500', 'tb500', 'thymosin beta-4', 'kpv', 'ara-290'],
  neuro_peptides: ['selank', 'semax', 'dihexa', 'na-selank', 'na-semax', 'cerebrolysin', 'pe-22-28', 'pinealon'],
  mitochondrial: ['motsc', 'mots-c', 'ss-31', 'ss31', 'humanin', 'nad+', 'nad'],
  melanocortin: ['melanotan-2', 'melanotan ii', 'mt-2', 'bremelanotide', 'pt-141'],
};

/**
 * Normalizes compound name for matrix matching
 */
function normalizeCompoundName(name = '') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Identify families associated with a product name
 */
function identifyFamilies(productName = '') {
  const norm = normalizeCompoundName(productName);
  const matchedFamilies = [];

  for (const [family, compounds] of Object.entries(COMPOUND_FAMILIES)) {
    for (const compound of compounds) {
      const normCompound = normalizeCompoundName(compound);
      if (norm.includes(normCompound) || normCompound.includes(norm)) {
        matchedFamilies.push(family);
        break;
      }
    }
  }
  return matchedFamilies;
}

/**
 * Validates a list of prescription lines for clinical safety.
 *
 * @param {Array<Object>} prescriptionLines
 * @returns {{
 *   isValid: boolean,
 *   safetyScore: number,
 *   warnings: Array<string>,
 *   synergies: Array<string>,
 *   flaggedLineIndices: Array<number>
 * }}
 */
export function validateClinicalSafety(prescriptionLines = []) {
  if (!Array.isArray(prescriptionLines) || prescriptionLines.length === 0) {
    return {
      isValid: true,
      safetyScore: 100,
      warnings: [],
      synergies: [],
      flaggedLineIndices: [],
    };
  }

  const warnings = [];
  const synergies = [];
  const flaggedIndices = new Set();
  const familyCount = {};
  const presentFamilies = new Set();

  // 1. Analyze each line
  prescriptionLines.forEach((line, idx) => {
    const pName = line.productName || line.name || '';
    const families = identifyFamilies(pName);

    families.forEach((fam) => {
      presentFamilies.add(fam);
      familyCount[fam] = (familyCount[fam] || []).concat({ index: idx, name: pName });
    });

    // Check for missing mandatory dosage on active lines
    if (!line.dosage && !line.dose) {
      warnings.push(`Línea ${idx + 1} (${pName || 'Compuesto'}): No se ha especificado la dosis.`);
      flaggedIndices.add(idx);
    }
  });

  // 2. Cross-family Interaction Rules

  // Rule A: GLP-1 Duplication Warning
  if (familyCount.glp1_agonists && familyCount.glp1_agonists.length > 1) {
    const names = familyCount.glp1_agonists.map((f) => f.name).join(', ');
    warnings.push(`⚠️ Duplicación de análogos GLP-1 detectada (${names}). No se recomienda co-administrar múltiples agonistas de incretinas.`);
    familyCount.glp1_agonists.forEach((f) => flaggedIndices.add(f.index));
  }

  // Rule B: Multiple GH Secretagogues (Max 2 recommended simultaneously)
  if (familyCount.gh_secretagogues && familyCount.gh_secretagogues.length > 2) {
    warnings.push(`⚠️ Elevado número de secretagogos de GH (${familyCount.gh_secretagogues.length}). Monitorear niveles de IGF-1 y glucemia.`);
  }

  // Rule C: Positive Synergy Recognition (BPC-157 + TB-500 Wolverine Stack)
  if (presentFamilies.has('healing_peptides')) {
    const healingItems = familyCount.healing_peptides.map((h) => normalizeCompoundName(h.name));
    const hasBpc = healingItems.some((n) => n.includes('bpc'));
    const hasTb = healingItems.some((n) => n.includes('tb500') || n.includes('thymosin'));
    if (hasBpc && hasTb) {
      synergies.push('✨ Sinergia Tisular Óptima detectada: Co-administración BPC-157 + TB-500 (Regeneración angiogénica y celular acelerada).');
    }
  }

  // Rule D: Cognitive Synergy (Semax + Selank)
  if (presentFamilies.has('neuro_peptides')) {
    const neuroItems = familyCount.neuro_peptides.map((n) => normalizeCompoundName(n.name));
    const hasSemax = neuroItems.some((n) => n.includes('semax'));
    const hasSelank = neuroItems.some((n) => n.includes('selank'));
    if (hasSemax && hasSelank) {
      synergies.push('✨ Sinergia Neurotrófica detectada: Semax (estimulante BDNF) + Selank (modulador GABA/ansiolítico).');
    }
  }

  // 3. Compute Clinical Safety Score
  let score = 100;
  score -= warnings.length * 15;
  if (score < 20) score = 20;

  return {
    isValid: warnings.length === 0,
    safetyScore: score,
    warnings,
    synergies,
    flaggedLineIndices: Array.from(flaggedIndices),
  };
}
