/**
 * patch-bloodo-reports.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Uploads Bloodo sample PDF reports to Firebase Storage and patches
 * each diagnostic_test product in Firestore with the public download URL.
 *
 * Reports in "AI Prompts/Reports Bloodo/":
 *   NAD_General-2.pdf          → bloodo-nad-level-test
 *   TESTplus male protocol-1.pdf   → testosterone-test (male variant)
 *   TESTplus female protocol-1.pdf → testosterone-test (female variant)
 *   HbA1c protocol_EN.pdf      → hemoglobin-a1c-hba1c-test
 *   Omega Ratio advanced_EN.pdf → omega-ratio-test
 *   Vitamin D protocol_EN.pdf   → vitamin-d-test
 *   4_Morning Normal_Evening Lower.pdf → cortisol-test (cortisol circadian)
 *
 * Run:
 *   node scripts/patch-bloodo-reports.cjs
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

if (!admin.apps.length) {
  const sa = require('../serviceAccount-target.json');
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db     = admin.firestore();
const bucket = admin.storage().bucket('med-peptides-app.firebasestorage.app');

const REPORTS_DIR = path.join(__dirname, '..', 'AI Prompts', 'Reports Bloodo');

const UPLOADS = [
  {
    file:      'NAD_General-2.pdf',
    storagePath: 'bloodo-reports/nad-level-test.pdf',
    productId: 'bloodo-nad-level-test',
    patch: {
      sample_report_url_key: 'sample_report_url',   // single report
    },
  },
  {
    file:      'HbA1c protocol_EN.pdf',
    storagePath: 'bloodo-reports/hba1c-test.pdf',
    productId: 'hemoglobin-a1c-hba1c-test',
    patch: { sample_report_url_key: 'sample_report_url' },
  },
  {
    file:      'Omega Ratio advanced_EN.pdf',
    storagePath: 'bloodo-reports/omega-ratio-test.pdf',
    productId: 'omega-ratio-test',
    patch: { sample_report_url_key: 'sample_report_url' },
  },
  {
    file:      'Vitamin D protocol_EN.pdf',
    storagePath: 'bloodo-reports/vitamin-d-test.pdf',
    productId: 'vitamin-d-test',
    patch: { sample_report_url_key: 'sample_report_url' },
  },
  {
    file:      '4_Morning Normal_Evening Lower.pdf',
    storagePath: 'bloodo-reports/cortisol-circadian-test.pdf',
    productId: 'cortisol-test',
    patch: { sample_report_url_key: 'sample_report_url' },
  },
  // Testosterone — TWO PDFs → gender_variants
  {
    file:      'TESTplus male protocol-1.pdf',
    storagePath: 'bloodo-reports/testosterone-test-male.pdf',
    productId: 'testosterone-test',
    patch: { sample_report_url_key: 'sample_report_url_male' },
  },
  {
    file:      'TESTplus female protocol-1.pdf',
    storagePath: 'bloodo-reports/testosterone-test-female.pdf',
    productId: 'testosterone-test',
    patch: { sample_report_url_key: 'sample_report_url_female' },
  },
];

// ── Upload helper ─────────────────────────────────────────────────────────────
async function uploadAndGetUrl(localFile, storagePath) {
  const localPath = path.join(REPORTS_DIR, localFile);
  if (!fs.existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }
  const fileRef = bucket.file(storagePath);
  await fileRef.save(fs.readFileSync(localPath), {
    metadata: {
      contentType: 'application/pdf',
      cacheControl: 'public, max-age=86400',
    },
  });
  // Make public
  await fileRef.makePublic();
  const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  return url;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n📄  Uploading Bloodo sample reports to Firebase Storage…\n');

  // Group patches by productId
  const patches = {};

  for (const item of UPLOADS) {
    console.log(`  ⬆️   Uploading ${item.file}…`);
    let url;
    try {
      url = await uploadAndGetUrl(item.file, item.storagePath);
      console.log(`  ✅  ${item.storagePath} → ${url}`);
    } catch (err) {
      console.error(`  ❌  ${item.file}: ${err.message}`);
      continue;
    }

    if (!patches[item.productId]) patches[item.productId] = {};
    patches[item.productId][item.patch.sample_report_url_key] = url;
  }

  // Apply Firestore patches
  console.log('\n🔧  Patching Firestore products…\n');
  for (const [productId, data] of Object.entries(patches)) {
    const updateData = {
      ...data,
      has_sample_report: true,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // For testosterone — add gender_variants flag
    if (productId === 'testosterone-test') {
      updateData.gender_variants = true;
      updateData.male_report_available = true;
      updateData.female_report_available = true;
    }

    await db.collection('products').doc(productId).update(updateData);
    console.log(`  ✅  ${productId} patched`, Object.keys(data).join(', '));
  }

  console.log('\n✅  Done!\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
