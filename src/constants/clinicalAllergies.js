/**
 * clinicalAllergies.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Taxonomy for Clinical Allergies & Compounding Excipients.
 * Single source of truth for patient safety checks during compounding and
 * peptide reconstitution protocols.
 */

export const NKDA_KEY = 'NKDA';
export const NKDA_LABEL = 'No Known Drug Allergies (NKDA)';

export const COMMON_ALLERGIES = [
  // ── Compounding & Peptide Excipients (Critical Safety) ───────────────────
  {
    id: 'benzyl_alcohol',
    name: 'Benzyl Alcohol',
    category: 'excipient',
    severity: 'critical',
    warning: 'Do NOT reconstitute peptides with Bacteriostatic Water (contains 0.9% Benzyl Alcohol). Use sterile 0.9% NaCl saline instead.',
  },
  {
    id: 'mannitol',
    name: 'Mannitol',
    category: 'excipient',
    severity: 'high',
    warning: 'Common bulking agent in lyophilized peptide vials. Check compounding CoA.',
  },
  {
    id: 'polysorbate_80',
    name: 'Polysorbate 80 / Tween 80',
    category: 'excipient',
    severity: 'medium',
    warning: 'Surfactant used in some injectable formulations and biologics.',
  },
  {
    id: 'phenol',
    name: 'Phenol / Cresol',
    category: 'excipient',
    severity: 'high',
    warning: 'Antimicrobial preservative in select multidose cartridges.',
  },

  // ── Common Pharmacological Drug Classes ──────────────────────────────────
  {
    id: 'penicillins',
    name: 'Penicillins & Beta-Lactams',
    category: 'drug',
    severity: 'high',
    warning: 'Beta-lactam antibiotic hypersensitivity.',
  },
  {
    id: 'sulfonamides',
    name: 'Sulfonamides (Sulfa Drugs)',
    category: 'drug',
    severity: 'high',
    warning: 'Potential cross-reactivity with sulfur-containing compounds.',
  },
  {
    id: 'nsaids',
    name: 'NSAIDs / Aspirin',
    category: 'drug',
    severity: 'medium',
    warning: 'Caution with cox-inhibitors; monitor mucosal and GI healing.',
  },
  {
    id: 'cephalosporins',
    name: 'Cephalosporins',
    category: 'drug',
    severity: 'high',
    warning: 'Second/third-generation cephalosporin hypersensitivity.',
  },
  {
    id: 'local_anesthetics',
    name: 'Local Anesthetics (Lidocaine / Benzocaine)',
    category: 'drug',
    severity: 'high',
    warning: 'Check transdermal or pre-injection topical formulations.',
  },

  // ── Environmental & Material Allergens ────────────────────────────────────
  {
    id: 'latex',
    name: 'Latex',
    category: 'material',
    severity: 'high',
    warning: 'Must use latex-free syringe stoppers and injection equipment.',
  },
  {
    id: 'iodine_contrast',
    name: 'Iodine / Radiocontrast Media',
    category: 'agent',
    severity: 'medium',
    warning: 'Check topical antiseptic prep (use chlorhexidine instead of povidone-iodine).',
  },
  {
    id: 'gluten_celiac',
    name: 'Gluten / Celiac Disease',
    category: 'dietary',
    severity: 'medium',
    warning: 'Verify oral capsule binders and excipients are gluten-free.',
  },
  {
    id: 'soy_lecithin',
    name: 'Soy / Soy Lecithin',
    category: 'dietary',
    severity: 'medium',
    warning: 'Emulsifier present in liposomal and oral preparations.',
  },
];

export const ALLERGY_NAMES_MAP = new Map(
  COMMON_ALLERGIES.map((a) => [a.name.toLowerCase(), a])
);

export default COMMON_ALLERGIES;
