import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { COLWAY_SAFETY_REGISTRY } from '../src/data/colwayInciRegistry.js';

const sa = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

// Safety specifications for the 2 Colway composite bundles
const BUNDLE_SAFETY = {
  'bundle-blue-diamond-ritual': {
    categoryBadge: 'EPIGENETIC RITUAL SAFETY & PRECAUTIONS',
    title: 'Dual-Phase Cellular Rejuvenation Safety & Tolerance Guide',
    warnings: [
      'For external facial and cutaneous use only. Strictly avoid direct contact with ocular conjunctiva and orbital socket.',
      'Sequential safety: Use Blue Diamond Peeling 1–2× weekly prior to Blue Diamond Cream. Never apply peeling on irritated or sunburned skin.',
      'Photoprotection safeguard: Daily broad-spectrum SPF 50+ is mandatory following diamond micro-peeling treatment.',
      'Perform a 24-hour patch test on the inner forearm prior to first use in patients with sensitive, reactive, or thin couperose skin.',
      'Keep out of reach of children. Store in a cool, dry place (15°C – 25°C) away from direct sunlight.'
    ],
    protocolTitle: 'CHRONOBIOLOGICAL PROTOCOL (PEELING + CREAM)',
    protocolSteps: [
      'Phase 1 (Weekly): Cleanse face with Collagen Wash Gel, apply Blue Diamond Peeling, micro-massage for 1–2 min, leave enzymes for 3–5 min, rinse thoroughly with cool water.',
      'Phase 2 (Daily): Apply Blue Diamond Cream morning and evening to clean, dry skin with gentle upward lymphatic press motions.',
      'Photoprotection: Apply broad-spectrum mineral or chemical SPF 50+ every morning.'
    ],
    disclaimer: 'Professional-grade dual-action cosmeceutical protocol certified under EU Cosmetic Regulation (EC) 1223/2009. Dermatologically evaluated.'
  },
  'bundle-inside-out-collagen': {
    categoryBadge: 'DUAL-ACTION SYSTEMIC & TOPICAL SAFETY',
    title: 'Inside-Out Complete Protocol Safety & Administration Guide',
    warnings: [
      'Synergistic regimen combining oral dietary supplementation (Colvita) and external topical bioactive collagen.',
      'Allergen warning (Oral Colvita): Contains freeze-dried marine fish collagen and Baltic marine algae (Fucus vesiculosus). Strictly contraindicated in individuals with known hypersensitivity to fish, seafood, or iodine.',
      'Thyroid precaution (Oral Colvita): Individuals with thyroid disorders (Hashimoto, hyperthyroidism) should consult an endocrinologist prior to use due to natural iodine content.',
      'Topical phase: For external cutaneous use only. Avoid contact with ocular conjunctiva.',
      'Storage: Store capsules and topical gels in a cool, dry place (<25°C) away from moisture and direct heat. Keep out of reach of children.'
    ],
    protocolTitle: 'SYSTEMIC & TOPICAL ADMINISTRATION PROTOCOL',
    protocolSteps: [
      'Morning: Ingest 1 Colvita capsule with 250 mL water during breakfast; apply topical bioactive collagen gel to damp skin.',
      'Evening: Ingest 1 Colvita capsule during dinner; apply topical nocturnal collagen layer before bedtime.',
      'Chronobiology: Maintain daily compliance for a minimum 90–120 day window to synchronize with human fibroblast neocollagenesis turnover.'
    ],
    disclaimer: 'Clinical protocol combining EU registered dietary food supplement (ISO 22716 GMP) and native tropocollagen cosmeceuticals.'
  }
};

async function syncColwaySafety() {
  console.log('🔄 Syncing Colway Safety & Precautions to Firestore...\n');

  const allTargets = {
    ...COLWAY_SAFETY_REGISTRY,
    ...BUNDLE_SAFETY
  };

  const productIds = Object.keys(allTargets);
  let updatedCount = 0;

  for (const docId of productIds) {
    const safetyData = allTargets[docId];
    const docRef = db.collection('products').doc(docId);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.warn(`⚠️ Document not found in Firestore: ${docId}`);
      continue;
    }

    const current = snap.data();
    console.log(`📦 Updating [${docId}] — ${current.name || current.title}`);

    await docRef.update({
      warnings: safetyData.warnings,
      safety_precautions: safetyData,
      updatedAt: new Date().toISOString()
    });

    console.log(`   ✅ Written: ${safetyData.warnings.length} warnings | Badge: "${safetyData.categoryBadge}"`);
    updatedCount++;
  }

  console.log(`\n🎉 Successfully synchronized ${updatedCount} Colway products in Firestore!`);
}

syncColwaySafety().catch(err => {
  console.error('❌ Error syncing Colway safety:', err);
  process.exit(1);
});
