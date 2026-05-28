/**
 * sync-clinicalai-rules.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * One-shot CLI script that reads the local clinicalAI_rules.json and writes
 * the relevant sections to Firestore so the backend Cloud Run service always
 * has the latest behavioral rules.
 *
 * Usage (from project root):
 *   node scripts/sync-clinicalai-rules.mjs
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service-account key
 *     OR run `firebase login` / `gcloud auth application-default login` first.
 *   - npm install firebase-admin  (or: pnpm / yarn add firebase-admin)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Firebase Admin SDK ───────────────────────────────────────────────────────
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load rules JSON ──────────────────────────────────────────────────────────
const rulesPath = resolve(__dirname, '../AI Prompts/clinicalAI_rules.json');
const rules     = JSON.parse(readFileSync(rulesPath, 'utf-8'));

// ── Init Admin (uses GOOGLE_APPLICATION_CREDENTIALS, serviceAccountKey, or ADC) ──
import { existsSync } from 'fs';
const PROJECT_ID = 'med-peptides-app';

if (!getApps().length) {
  const serviceAccountPath = resolve(__dirname, '../src/scripts/serviceAccountKey.json');
  if (existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID
    });
    log('Initialized Firebase Admin with serviceAccountKey.json');
  } else {
    initializeApp({ projectId: PROJECT_ID });
    log('Initialized Firebase Admin with default ADC');
  }
}
const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });
const COLLECTION = 'clinicalai_config';

// ── Helper ───────────────────────────────────────────────────────────────────
function log(msg) { console.log(`[sync] ${msg}`); }

// ── Build the behavioral_rules payload ───────────────────────────────────────
// Only include Firestore-appropriate fields (not hard_limits — those live in code).
function buildBehavioralRules(r) {
  return {
    _meta_version:   r._meta_version ?? r.meta?.version ?? 'unknown',
    _synced_at:      new Date().toISOString(),

    // Core query type rules with section_order + critical_rules
    query_types: Object.fromEntries(
      Object.entries(r.query_types ?? {})
        .filter(([k]) => k !== 'storage')
        .map(([k, v]) => [k, {
          id:             v.id,
          description:    v.description,
          section_order:  v.response_format?.section_order ?? [],
          critical_rules: v.critical_rules ?? [],
        }])
    ),

    // Safety rules array
    safety_rules: (r.safety_rules?.rules ?? []).map(s => ({
      id:                s.id,
      rule:              s.rule,
      closing_statement: s.closing_statement,
      fallback_phrase:   s.fallback_phrase,
    })),

    // Reconstitution rules
    reconstitution_rules: (r.reconstitution_rules?.rules ?? []).map(rc => ({
      id:              rc.id,
      rule:            rc.rule,
      default_solvent: rc.default_solvent,
      tag_format:      rc.tag_format,
    })),

    // Navigation rules + tags
    navigation_rules: {
      rules: (r.navigation_rules?.rules ?? []).map(n => ({ id: n.id, rule: n.rule })),
      tags:  r.navigation_rules?.tags ?? {},
    },

    // Language rules
    language_rules: (r.language_rules?.rules ?? []).map(l => ({ id: l.id, rule: l.rule })),

    // Behavioral principles (BP-01..BP-20)
    behavioral_principles: (r.behavioral_principles?.rules ?? []).map(bp => ({
      id:   bp.id,
      name: bp.name,
      rule: bp.rule ?? bp.goal ?? [bp.beginner, bp.advanced].filter(Boolean).join(' / '),
    })),

    // User mode detection
    user_mode_rules: {
      modes: r.user_mode_rules?.modes ?? {},
      rules: r.user_mode_rules?.rules ?? [],
    },

    // Similar compounds relationships
    similar_compounds: (r.similar_compounds_rules?.known_relationships ?? []),
    similar_compounds_rules: r.similar_compounds_rules?.response_section?.rules ?? [],

    // Commonly combined / stacks
    commonly_combined_with: (r.commonly_combined_with?.known_stacks ?? []),

    // Contextual next actions rules
    contextual_next_actions_rules: r.contextual_next_actions_rules?.rules ?? [],

    // Usage metadata labels
    usage_metadata_labels: r.usage_metadata_rules?.known_labels ?? [],
  };
}

// ── Build the few_shot_examples payload ──────────────────────────────────────
function buildFewShotExamples(r) {
  return {
    _meta_version: r._meta_version ?? r.meta?.version ?? 'unknown',
    _synced_at:    new Date().toISOString(),
    examples:      (r.few_shot_examples?.examples ?? []).map(ex => ({
      id:               ex.id,
      type:             ex.type,
      user_input:       ex.user_input,
      notes:            ex.notes,
      expected_response: ex.expected_response ?? {},
    })),
  };
}

// ── Write to Firestore ────────────────────────────────────────────────────────
async function sync() {
  const behavioralPayload  = buildBehavioralRules(rules);
  const fewShotPayload     = buildFewShotExamples(rules);

  log(`Writing behavioral_rules  (${Object.keys(behavioralPayload.query_types).length} query types, ${behavioralPayload.behavioral_principles.length} behavioral principles)…`);
  await db
    .collection(COLLECTION)
    .doc('behavioral_rules')
    .set(behavioralPayload, { merge: false });   // full overwrite — keeps Firestore in sync

  log(`Writing few_shot_examples  (${fewShotPayload.examples.length} examples)…`);
  await db
    .collection(COLLECTION)
    .doc('few_shot_examples')
    .set(fewShotPayload, { merge: false });

  log('✅  Firestore is now in sync with the latest clinicalAI_rules.json');
}

sync().catch(err => {
  console.error('[sync] ❌  Failed:', err.message);
  process.exit(1);
});
