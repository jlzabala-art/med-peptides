/**
 * seedSettings.mjs
 *
 * One-time seed: uploads static config (pathways, UI categories, dosage units)
 * into Firestore collection `settings/`.
 *
 * Documents written:
 *   settings/pathways       → { mapping: {...} }
 *   settings/ui             → { productCategories: [...] }
 *   settings/dosageUnits    → { units, defaultUnit, productUnitMap, categoryUnitMap }
 *
 * Usage:
 *   node --env-file=.env src/scripts/seedSettings.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';

// ─── Credentials ──────────────────────────────────────────────────────────────
let credential;
if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON));
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  throw new Error(
    'Missing credentials. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

// ─── Static Data (mirrored from local files) ──────────────────────────────────

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

const productCategories = [
  'Healing & Recovery',
  'Weight Management & Metabolic',
  'Anti-Aging & Longevity',
  'Cognitive & Neuro-Protection',
  'Muscle Growth & Performance',
  'Hormonal Support',
  'Research Supplies',
  'Other Research Peptides',
];

const dosageUnitsConfig = {
  units: { MG: 'mg', MCG: 'mcg', IU: 'IU', ML: 'ml', PERCENT: '%' },
  defaultUnit: 'mg',
  productUnitMap: {
    HCG:                   'IU',
    HMG:                   'IU',
    HGH:                   'IU',
    'FST-344':             'IU',
    Selank:                'mcg',
    Semax:                 'mcg',
    'Snap-8':              'mcg',
    'GHK-Cu (Copper Peptide)': 'mcg',
  },
  categoryUnitMap: {
    hormone:     'IU',
    gonadotropin:'IU',
    nasal:       'mcg',
    topical:     'mcg',
  },
};

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seedSettings() {
  console.log('\n⚙️   Seeding settings/ collection\n');

  const settingsRef = db.collection('settings');
  const batch = db.batch();

  batch.set(settingsRef.doc('pathways'), {
    mapping:    PATHWAY_MAPPING,
    seeded_at:  new Date().toISOString(),
  }, { merge: true });
  console.log('  ✔  settings/pathways');

  batch.set(settingsRef.doc('ui'), {
    productCategories,
    seeded_at: new Date().toISOString(),
  }, { merge: true });
  console.log('  ✔  settings/ui');

  batch.set(settingsRef.doc('dosageUnits'), {
    ...dosageUnitsConfig,
    seeded_at: new Date().toISOString(),
  }, { merge: true });
  console.log('  ✔  settings/dosageUnits');

  await batch.commit();
  console.log('\n✅  Settings seed complete\n');
}

seedSettings().catch(err => {
  console.error('❌  Settings seed failed:', err);
  process.exit(1);
});
