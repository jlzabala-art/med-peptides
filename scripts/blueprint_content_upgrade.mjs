/**
 * blueprint_content_upgrade.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Mejoras de contenido en 3 fases para los blueprints de Firestore.
 *
 * FASE 1 — Fix dosis numéricas en cog_001 (Semax / Selank)
 * FASE 2 — Añadir metadata.short_description a los 16 blueprints
 * FASE 3 — Completar eligibility_rules.contraindications donde faltan
 *
 * Uso:
 *   node scripts/blueprint_content_upgrade.mjs
 *   node scripts/blueprint_content_upgrade.mjs --phase=1
 *   node scripts/blueprint_content_upgrade.mjs --phase=2
 *   node scripts/blueprint_content_upgrade.mjs --phase=3
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const serviceAccount = require(join(__dirname, '..', 'serviceAccountKey.json'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
const col = db.collection('blueprints');

const arg = process.argv.find(a => a.startsWith('--phase='));
const ONLY_PHASE = arg ? parseInt(arg.split('=')[1]) : null;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const log = (phase, msg) => console.log(`[FASE ${phase}] ${msg}`);
const ok  = (phase, id) => console.log(`  ✅ ${id}`);
const skip = (phase, id, reason) => console.log(`  ⏭  ${id} — ${reason}`);

// ─────────────────────────────────────────────────────────────────────────────
// FASE 1: Fix dosis numéricas en cog_001
// ─────────────────────────────────────────────────────────────────────────────
async function fase1_fixCog001Doses() {
  log(1, 'Corrigiendo dose_logic de Semax y Selank en cog_001...');

  const ref = col.doc('cog_001');
  const snap = await ref.get();
  if (!snap.exists) { log(1, '❌ cog_001 no encontrado'); return; }

  const data = snap.data();
  const phases = data.phase_blueprints || [];

  const updated = phases.map(phase => {
    const drugs = (phase.drugs || []).map(drug => {
      // ── Semax
      if (drug.product_id === 'prd_semax') {
        return {
          ...drug,
          route: 'intranasal',
          dose_logic: {
            ...drug.dose_logic,
            dose_unit: 'mcg',
            dose_per_administration: 300,
            dose_per_day: drug.dose_logic?.administration_frequency === 'daily' ? 300 : null,
            route_of_administration: 'intranasal',
            timing_hint: drug.dose_logic?.timing_hint || 'morning',
            administration_frequency: drug.dose_logic?.administration_frequency || 'daily',
            administration_days_default: drug.dose_logic?.administration_days_default || [],
          }
        };
      }
      // ── Selank
      if (drug.product_id === 'prd_selank') {
        return {
          ...drug,
          route: 'intranasal',
          dose_logic: {
            ...drug.dose_logic,
            dose_unit: 'mcg',
            dose_per_administration: 300,
            route_of_administration: 'intranasal',
            administration_frequency: drug.dose_logic?.administration_frequency || '3x_week',
            administration_days_default: drug.dose_logic?.administration_days_default || ['Monday','Wednesday','Friday'],
          }
        };
      }
      return drug;
    });
    return { ...phase, drugs };
  });

  await ref.update({ phase_blueprints: updated });
  ok(1, 'cog_001 — Semax 300mcg/day · Selank 300mcg 3x/week · route: intranasal');
}

// ─────────────────────────────────────────────────────────────────────────────
// FASE 2: Añadir metadata.short_description a los 16 blueprints
// ─────────────────────────────────────────────────────────────────────────────
const SHORT_DESCRIPTIONS = {
  cog_001: 'A 12-week peptide-based protocol targeting neurocognitive activation, working memory support, and stress resilience using Semax and Selank.',
  cog_002: 'An advanced cognitive enhancement protocol combining neuroprotective peptides to support long-term memory consolidation, mental clarity, and neuroplasticity.',
  energy_001: 'A structured protocol using mitochondria-targeting peptides to restore cellular energy production, reduce fatigue, and improve physical and mental stamina.',
  energy_002: 'An intensive energy optimization protocol combining MOTS-c and SS-31 to enhance mitochondrial biogenesis and support metabolic resilience under physiological stress.',
  horm_001: 'A hormone-axis optimization protocol using growth hormone secretagogues to restore IGF-1 signaling, improve body composition, and support metabolic homeostasis.',
  horm_002: 'A comprehensive hormonal balance protocol targeting the HPA axis and sex hormone regulation for improved energy, mood, libido, and anabolic recovery.',
  immune_001: 'An immunomodulatory protocol leveraging thymosin-based peptides to enhance innate immune surveillance, accelerate recovery from illness, and reduce inflammatory burden.',
  immune_002: 'A targeted immune resilience protocol combining BPC-157 and Thymulin to modulate systemic inflammation and support mucosal and adaptive immune function.',
  lon_001: 'A foundational longevity protocol using senolytic and regenerative peptides to address cellular aging, mitochondrial decline, and systemic inflammation.',
  lon_002: 'An advanced longevity and healthspan protocol combining epigenetic regulators and trophic peptides to extend functional lifespan and reduce age-related tissue degradation.',
  met_001: 'A metabolic optimization protocol using insulin-sensitizing and GLP-1-enhancing peptides to improve glucose regulation, reduce visceral adiposity, and support lipid profiles.',
  sa_001: 'A skin and aesthetic regeneration protocol using GHK-Cu and Epithalon to stimulate collagen synthesis, improve dermal density, and support cellular repair in skin tissue.',
  wm_001: 'A weight management protocol integrating GLP-1 receptor agonist peptides with metabolic support compounds to reduce body fat while preserving lean muscle mass.',
  wm_002: 'A targeted fat-loss protocol combining lipolytic peptides and appetite-regulating compounds for sustained weight reduction with minimal lean mass catabolism.',
  wm_003: 'A comprehensive body recomposition protocol using anabolic and lipolytic peptides synergistically to reduce adipose tissue while building functional lean mass.',
  wm_004: 'A maintenance-phase weight management protocol designed to sustain fat loss results after an active reduction phase, using lower-dose peptide cycling with metabolic support.',
};

async function fase2_addShortDescriptions() {
  log(2, 'Añadiendo metadata.short_description a los 16 blueprints...');

  for (const [id, desc] of Object.entries(SHORT_DESCRIPTIONS)) {
    const ref = col.doc(id);
    const snap = await ref.get();
    if (!snap.exists) { skip(2, id, 'documento no encontrado'); continue; }

    const current = snap.data()?.metadata?.short_description;
    if (current && current.length > 20) {
      skip(2, id, 'ya tiene short_description');
      continue;
    }

    await ref.update({ 'metadata.short_description': desc });
    ok(2, id);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FASE 3: Completar eligibility_rules.contraindications
// ─────────────────────────────────────────────────────────────────────────────
const CONTRAINDICATIONS = {
  cog_001: [
    'active_epilepsy_or_uncontrolled_seizure_disorder',
    'uncontrolled_psychosis_or_schizophrenia',
    'acute_manic_episode',
    'known_hypersensitivity_to_semax_or_selank',
    'pregnancy_or_breastfeeding',
  ],
  cog_002: [
    'active_epilepsy_or_uncontrolled_seizure_disorder',
    'uncontrolled_psychosis_or_schizophrenia',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_impairment',
  ],
  energy_001: [
    'active_malignancy',
    'severe_mitochondrial_disease_requiring_medical_management',
    'pregnancy_or_breastfeeding',
    'known_hypersensitivity_to_mots_c_or_ss31',
  ],
  energy_002: [
    'active_malignancy',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_or_renal_impairment',
    'known_hypersensitivity_to_protocol_compounds',
  ],
  horm_001: [
    'active_malignancy_or_history_of_hormone_sensitive_cancer',
    'pituitary_adenoma_or_active_pituitary_disease',
    'uncontrolled_diabetes_mellitus',
    'severe_obstructive_sleep_apnea_untreated',
    'pregnancy_or_breastfeeding',
    'severe_carpal_tunnel_syndrome',
  ],
  horm_002: [
    'active_malignancy_or_history_of_hormone_sensitive_cancer',
    'uncontrolled_hypertension',
    'active_thromboembolic_disease',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_impairment',
  ],
  immune_001: [
    'active_autoimmune_disease_requiring_immunosuppression',
    'organ_transplant_with_active_rejection_therapy',
    'known_hypersensitivity_to_thymosin_alpha_1',
    'pregnancy_or_breastfeeding',
  ],
  immune_002: [
    'active_autoimmune_disease_requiring_immunosuppression',
    'active_systemic_infection_requiring_antibiotic_therapy',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_impairment',
  ],
  lon_001: [
    'active_malignancy',
    'pregnancy_or_breastfeeding',
    'severe_renal_impairment_creatinine_above_2',
    'known_hypersensitivity_to_protocol_compounds',
  ],
  lon_002: [
    'active_malignancy',
    'uncontrolled_autoimmune_disease',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_or_renal_impairment',
  ],
  met_001: [
    'personal_or_family_history_of_medullary_thyroid_carcinoma',
    'multiple_endocrine_neoplasia_type_2',
    'severe_gastrointestinal_disease',
    'pregnancy_or_breastfeeding',
    'diabetic_ketoacidosis',
    'severe_renal_impairment',
  ],
  sa_001: [
    'active_inflammatory_skin_disease_at_injection_site',
    'systemic_retinoid_therapy',
    'pregnancy_or_breastfeeding',
    'known_hypersensitivity_to_copper_peptides',
    'active_malignant_skin_lesion',
  ],
  wm_001: [
    'personal_or_family_history_of_medullary_thyroid_carcinoma',
    'multiple_endocrine_neoplasia_type_2',
    'severe_gastrointestinal_motility_disorder',
    'pregnancy_or_breastfeeding',
    'severe_eating_disorder_anorexia',
    'severe_renal_impairment',
  ],
  wm_002: [
    'personal_or_family_history_of_medullary_thyroid_carcinoma',
    'multiple_endocrine_neoplasia_type_2',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_or_renal_impairment',
    'severe_eating_disorder_anorexia',
  ],
  wm_003: [
    'active_malignancy',
    'personal_or_family_history_of_medullary_thyroid_carcinoma',
    'multiple_endocrine_neoplasia_type_2',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_or_renal_impairment',
    'uncontrolled_cardiovascular_disease',
  ],
  wm_004: [
    'personal_or_family_history_of_medullary_thyroid_carcinoma',
    'multiple_endocrine_neoplasia_type_2',
    'pregnancy_or_breastfeeding',
    'severe_hepatic_or_renal_impairment',
    'active_malignancy',
  ],
};

async function fase3_addContraindications() {
  log(3, 'Completando eligibility_rules.contraindications...');

  for (const [id, items] of Object.entries(CONTRAINDICATIONS)) {
    const ref = col.doc(id);
    const snap = await ref.get();
    if (!snap.exists) { skip(3, id, 'documento no encontrado'); continue; }

    const existing = snap.data()?.eligibility_rules?.contraindications || [];
    if (existing.length >= 3) {
      skip(3, id, `ya tiene ${existing.length} contraindications`);
      continue;
    }

    await ref.update({ 'eligibility_rules.contraindications': items });
    ok(3, `${id} — ${items.length} contraindications añadidas`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  BLUEPRINT CONTENT UPGRADE — Med-Peptides');
  console.log('═══════════════════════════════════════════════════\n');

  const start = Date.now();

  if (!ONLY_PHASE || ONLY_PHASE === 1) await fase1_fixCog001Doses();
  if (!ONLY_PHASE || ONLY_PHASE === 2) await fase2_addShortDescriptions();
  if (!ONLY_PHASE || ONLY_PHASE === 3) await fase3_addContraindications();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Completado en ${elapsed}s`);
  process.exit(0);
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
