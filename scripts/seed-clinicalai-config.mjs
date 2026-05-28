/**
 * seed-clinicalai-config.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Populates the Firestore `clinicalai_config` collection with:
 *   - behavioral_rules  (query_types, safety, reconstitution, navigation, language)
 *   - few_shot_examples
 *
 * Usage:
 *   node scripts/seed-clinicalai-config.mjs
 *
 * Requires:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON
 *     OR running inside a Google Cloud environment (Application Default Credentials)
 *   - firebase-admin installed (npm install firebase-admin --save-dev)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── 1. Init Firebase Admin ───────────────────────────────────────────────────
if (!getApps().length) {
  // Uses GOOGLE_APPLICATION_CREDENTIALS env var or ADC automatically
  initializeApp();
}
const db = getFirestore();

// ── 2. Load JSON rules ────────────────────────────────────────────────────────
const rulesPath = path.resolve(__dirname, '../AI Prompts/clinicalAI_rules.json');
const raw       = await readFile(rulesPath, 'utf-8');
const rules     = JSON.parse(raw);

// ── 3. Build `behavioral_rules` document ─────────────────────────────────────
//   The hook (useClinicalAIConfig.js) expects:
//     rules.query_types          → flat entries with { id, section_order[], critical_rules[] }
//     rules.safety_rules         → array
//     rules.reconstitution_rules → array
//     rules.navigation_rules     → { rules[], tags{} }
//     rules.language_rules       → array

function mapQueryTypes(qt) {
  const result = {};
  for (const [key, val] of Object.entries(qt)) {
    if (key === 'storage') continue;
    result[key] = {
      id:             val.id || key,
      description:    val.description || '',
      section_order:  val.response_format?.section_order
                        || val.response_format?.required_sections
                        || [],
      critical_rules: (val.critical_rules || []).map(r => ({ id: r.id, rule: r.rule })),
    };
  }
  return result;
}

const behavioralRules = {
  _version:            rules._meta_version || rules.meta?.version || '6.0.0',
  _updated_at:         new Date().toISOString(),

  query_types:         mapQueryTypes(rules.query_types || {}),

  safety_rules:        (rules.safety_rules?.rules || []).map(r => ({
    id:                r.id,
    rule:              r.rule,
    closing_statement: r.closing_statement || null,
    fallback_phrase:   r.fallback_phrase   || null,
  })),

  reconstitution_rules: (rules.reconstitution_rules?.rules || []).map(r => ({
    id:               r.id,
    rule:             r.rule,
    default_solvent:  r.default_solvent  || null,
    tag_format:       r.tag_format       || null,
  })),

  navigation_rules: {
    rules: (rules.navigation_rules?.rules || []).map(r => ({ id: r.id, rule: r.rule })),
    tags:  rules.navigation_rules?.tags || {},
  },

  language_rules: (rules.language_rules?.rules || []).map(r => ({ id: r.id, rule: r.rule })),
};

// ── 4. Build `few_shot_examples` document ────────────────────────────────────
const fewShotExamples = {
  _version:    rules._meta_version || '6.0.0',
  _updated_at: new Date().toISOString(),
  examples:    (rules.few_shot_examples?.examples || []).map(ex => ({
    id:                ex.id,
    type:              ex.type,
    user_input:        ex.user_input,
    notes:             ex.notes || '',
    expected_response: ex.expected_response || {},
  })),
};

// ── 5. Write to Firestore ────────────────────────────────────────────────────
const COLLECTION = 'clinicalai_config';

console.log('⏳  Uploading behavioral_rules…');
await db.collection(COLLECTION).doc('behavioral_rules').set(behavioralRules);
console.log('✅  behavioral_rules uploaded.');

console.log('⏳  Uploading few_shot_examples…');
await db.collection(COLLECTION).doc('few_shot_examples').set(fewShotExamples);
console.log('✅  few_shot_examples uploaded.');

console.log('\n🎉  clinicalai_config seeded successfully!');
process.exit(0);
