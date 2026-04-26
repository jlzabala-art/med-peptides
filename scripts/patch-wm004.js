/**
 * patch-wm004.js
 * Merges supplementary wm_004 fields into the existing Firestore blueprint.
 * Usage: node scripts/patch-wm004.js
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({ projectId: 'med-peptides-app' });
}

const db = getFirestore();

const patch = {
  bundleVersion: '1.1',

  eligibility_rules: {
    indications: [
      'Weight maintenance after active fat-loss phase',
      'Metabolic stabilization',
      'Prevention of rebound weight gain',
    ],
    contraindications: [
      'History of medullary thyroid carcinoma',
      'MEN2 syndrome',
      'Pregnancy',
      'Active pancreatitis',
    ],
    baseline_requirements: [
      'Weight',
      'Waist circumference',
      'Fasting glucose',
      'Insulin',
      'Lipid panel',
    ],
  },

  monitoring_plan: {
    monthly: ['Weight', 'Waist circumference', 'Blood pressure'],
    every_12_weeks: ['Fasting glucose', 'Insulin', 'HbA1c'],
    every_6_months: ['Lipid panel'],
    if_symptoms: ['Amylase', 'Lipase'],
  },

  protocol_duration_weeks: 12,

  expected_outcomes: [
    'Weight stabilization',
    'Prevention of metabolic rebound',
    'Maintenance of fat-loss outcomes',
    'Improved metabolic flexibility',
  ],

  'metadata.schema_version': 'antigravity_v2',
  'metadata.visibility': 'public',
  'metadata.shortCode': 'WMT-004',
  'metadata.scientificName': 'Tirzepatide + AOD-9604 + MOTS-c Maintenance Protocol',
  'metadata.primary_goal': 'Weight Maintenance',
};

async function run() {
  const ref = db.collection('blueprints').doc('wm_004');
  const snap = await ref.get();

  if (!snap.exists) {
    console.error('❌  wm_004 does not exist in Firestore. Run the full upload first.');
    process.exit(1);
  }

  await ref.set(patch, { merge: true });
  console.log('✅  wm_004 patched successfully in Firestore.');

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
