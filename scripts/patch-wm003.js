/**
 * patch-wm003.js
 * Merges the supplementary wm_003 fields into the existing Firestore blueprint.
 * Usage: node scripts/patch-wm003.js
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: 'Med-Peptides-app' });
}

const db = getFirestore();

const patch = {
  bundleVersion: '1.1',

  eligibility_rules: {
    indications: [
      'Obesity with metabolic syndrome',
      'Insulin resistance',
      'Visceral adiposity',
      'Failure of single-agent weight-loss therapy',
    ],
    contraindications: [
      'Active malignancy',
      'Pregnancy or breastfeeding',
      'Uncontrolled diabetes (HbA1c > 9%)',
      'Severe hepatic impairment',
      'History of pancreatitis',
    ],
    baseline_requirements: [
      'Fasting glucose',
      'HbA1c',
      'IGF-1',
      'Lipid panel',
      'Thyroid profile',
      'Body composition (DXA or BIA)',
    ],
  },

  monitoring_plan: {
    baseline: ['Weight', 'Waist circumference', 'Fasting glucose', 'HbA1c', 'IGF-1', 'Lipid panel'],
    week_8: ['IGF-1', 'Fasting glucose', 'Body composition', 'Blood pressure'],
    week_16: ['Full metabolic panel', 'Body composition', 'HbA1c', 'IGF-1'],
    monthly: ['Weight', 'Waist circumference', 'Blood pressure'],
  },

  protocol_duration_weeks: 16,

  expected_outcomes: [
    'Visceral fat reduction',
    'Improved insulin sensitivity',
    'Enhanced mitochondrial function',
    'Body composition remodeling',
  ],

  // Metadata fields merged individually so we don't overwrite existing metadata
  'metadata.schema_version': 'antigravity_v2',
  'metadata.visibility': 'restricted_research',
  'metadata.shortCode': 'WMT-003',
  'metadata.scientificName': 'Integrated GLP-1 & Mitokine Metabolic–Longevity Protocol',
  'metadata.primary_goal': 'Weight Management / Obesity',
};

async function run() {
  const ref = db.collection('blueprints').doc('wm_003');
  const snap = await ref.get();

  if (!snap.exists) {
    console.error('❌  wm_003 does not exist in Firestore. Run the full upload first.');
    process.exit(1);
  }

  await ref.set(patch, { merge: true });
  console.log('✅  wm_003 patched successfully in Firestore.');

  // Quick verification
  const updated = (await ref.get()).data();
  console.log('\n📋  Verification snapshot:');
  console.log('  protocol_duration_weeks :', updated.protocol_duration_weeks);
  console.log('  bundleVersion           :', updated.bundleVersion);
  console.log('  eligibility_rules keys  :', Object.keys(updated.eligibility_rules ?? {}).join(', '));
  console.log('  monitoring_plan keys    :', Object.keys(updated.monitoring_plan ?? {}).join(', '));
  console.log('  metadata.shortCode      :', updated.metadata?.shortCode);
}

run().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
