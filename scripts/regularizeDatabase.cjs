const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'med-peptides-app',
    clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
    privateKey: privateKey
  })
});

const db = admin.firestore();

async function globalTierAndVolumeRegularization() {
  const varsSnap = await db.collectionGroup('variants').get();
  console.log(`Analyzing ${varsSnap.size} total variants across all suppliers...`);

  let updatedCount = 0;
  let batch = db.batch();
  let batchSize = 0;

  for (const vDoc of varsSnap.docs) {
    const v = vDoc.data();
    let needsUpdate = false;
    const updates = {};

    // 1. Tier Pricing Normalization: ensure cost_tiers object exists
    if (!v.cost_tiers || Object.keys(v.cost_tiers).length === 0) {
      const basePrice = v.price_aed || v.price_aed_inc_vat || v.unit_price || v.b2b_price || v.price || null;
      if (basePrice) {
        updates.cost_tiers = { cost_10: parseFloat(basePrice) };
        needsUpdate = true;
      }
    }

    // 2. Dosage Normalization: sync dose field into dosage if missing
    if (!v.dosage && v.dose) {
      updates.dosage = v.dose;
      needsUpdate = true;
    } else if (!v.dose && v.dosage) {
      updates.dose = v.dosage;
      needsUpdate = true;
    }

    // 3. Extract volume from label/source if present (e.g. "5ml", "3ml", "10ml")
    if (!v.fill_volume && !v.pack_size && v.label) {
      const volMatch = v.label.match(/(\d+(?:\.\d+)?\s*(?:ml|capsules|tablets|puffs|vials|tubes))/i);
      if (volMatch) {
        updates.fill_volume = volMatch[1];
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
      batch.set(vDoc.ref, updates, { merge: true });
      updatedCount++;
      batchSize++;

      if (batchSize >= 450) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`SUCCESS: Regularized and updated ${updatedCount} variants across Firestore.`);
}

globalTierAndVolumeRegularization().catch(console.error);
