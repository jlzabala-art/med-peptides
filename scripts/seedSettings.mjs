/**
 * seedSettings.mjs
 *
 * Uploads application-level configuration into the Firestore `settings/`
 * collection. Creates or merges three documents:
 *
 *   settings/pathways      → PATHWAY_MAPPING (normalised slug → canonical slug)
 *   settings/ui            → productCategories (ordered list of UI category labels)
 *   settings/dosageUnits   → dosage unit configuration object
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json node scripts/seedSettings.mjs
 *   -- OR --
 *   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}' node scripts/seedSettings.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { resolve, dirname }    from 'path';
import { fileURLToPath }       from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Firebase Admin Init ───────────────────────────────────────────────────────
let credential;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const raw = readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
  credential = cert(JSON.parse(raw));
} else {
  try {
    const raw = readFileSync(resolve(__dirname, '../serviceAccount.json'), 'utf8');
    credential = cert(JSON.parse(raw));
  } catch {
    console.error('❌  No Firebase credentials found.');
    process.exit(1);
  }
}

initializeApp({ credential });
const db = getFirestore();

// ── Data ──────────────────────────────────────────────────────────────────────

const PATHWAY_MAPPING = {
  'healing-repair':                  'healing-recovery',
  'healing-amp-recovery':            'healing-recovery',
  'healing-recovery':                'healing-recovery',
  'metabolic-optimization':          'weight-management-metabolic',
  'weight-management-metabolic':     'weight-management-metabolic',
  'weight-management-amp-metabolic': 'weight-management-metabolic',
  'neuro-cognitive':                 'cognitive-neuro-protection',
  'cognitive-neuro-protection':      'cognitive-neuro-protection',
  'cognitive-amp-neuro-protection':  'cognitive-neuro-protection',
  'longevity-vitality':              'anti-aging-longevity',
  'anti-aging-longevity':            'anti-aging-longevity',
  'anti-aging-amp-longevity':        'anti-aging-longevity',
  'somatic-research':                'muscle-growth-performance',
  'muscle-growth-performance':       'muscle-growth-performance',
  'muscle-growth-amp-performance':   'muscle-growth-performance',
  'hormonal-pathways':               'hormonal-support',
  'hormonal-support':                'hormonal-support',
};

const PRODUCT_CATEGORIES = [
  'Healing & Recovery',
  'Weight Management & Metabolic',
  'Anti-Aging & Longevity',
  'Cognitive & Neuro-Protection',
  'Muscle Growth & Performance',
  'Hormonal Support',
  'Research Supplies',
  'Other Research Peptides',
];

const DOSAGE_CONFIG = {
  units: { MG: 'mg', MCG: 'mcg', IU: 'IU', ML: 'ml', PERCENT: '%' },
  defaultUnit: 'mg',
  productUnitMap: {
    HCG: 'IU', HMG: 'IU', HGH: 'IU', 'FST-344': 'IU',
    Selank: 'mcg', Semax: 'mcg', 'Snap-8': 'mcg', 'GHK-Cu (Copper Peptide)': 'mcg',
  },
  categoryUnitMap: { hormone: 'IU', gonadotropin: 'IU', nasal: 'mcg', topical: 'mcg' },
};

// ── Write ─────────────────────────────────────────────────────────────────────

async function seed() {
  const batch = db.batch();
  const ts    = new Date().toISOString();

  batch.set(db.collection('settings').doc('pathways'), {
    mapping: PATHWAY_MAPPING,
    updatedAt: ts,
  }, { merge: true });
  console.log('  ↑  settings/pathways');

  batch.set(db.collection('settings').doc('ui'), {
    productCategories: PRODUCT_CATEGORIES,
    updatedAt: ts,
  }, { merge: true });
  console.log('  ↑  settings/ui');

  batch.set(db.collection('settings').doc('dosageUnits'), {
    ...DOSAGE_CONFIG,
    updatedAt: ts,
  }, { merge: true });
  console.log('  ↑  settings/dosageUnits');

  await batch.commit();
  console.log('\n✅  Settings seeded successfully.');
}

seed().catch(err => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
