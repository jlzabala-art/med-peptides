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

// Helper to extract dosage strength from label or ID strings
function extractDosageFromText(text) {
  if (!text) return null;
  const match = text.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml))/i);
  return match ? match[1].toLowerCase() : null;
}

async function fixAllMissingPricesAndDosages() {
  console.log('--- STARTING COMPREHENSIVE DATA GAPS REPAIR ---');

  const vSnap = await db.collectionGroup('variants').get();
  console.log(`Auditing ${vSnap.size} total variants across all suppliers...`);

  let batch = db.batch();
  let batchSize = 0;
  let updatedCount = 0;

  for (const doc of vSnap.docs) {
    const v = doc.data();
    const parentRef = doc.ref.parent.parent;
    const pId = parentRef ? parentRef.id : doc.id;
    const sId = v.supplier_id || v.supplierId || '';
    const nameStr = `${v.name || ''} ${v.presentation || ''} ${doc.id} ${pId}`;

    const updates = {};
    let needsUpdate = false;

    // 1. Repair Dosage if missing
    if (!v.dosage && !v.dose) {
      const extractedDosage = extractDosageFromText(nameStr);
      if (extractedDosage) {
        updates.dosage = extractedDosage;
        updates.dose = extractedDosage;
        needsUpdate = true;
      } else if (v.presentation === 'blood_test' || v.presentation === 'dna_test' || v.presentation === 'digital' || v.presentation === 'kit') {
        updates.dosage = '1 test / kit';
        updates.dose = '1 test / kit';
        needsUpdate = true;
      }
    }

    // 2. Repair Missing Prices & Cost Tiers (e.g. 24Genetics, EternaDx, Bloodo, Fagron)
    const existingPrice = v.unit_price || v.price_aed || v.price || null;

    if (!existingPrice) {
      // Set reasonable default B2B / retail pricing based on supplier category
      let estimatedPriceUsd = 99.0;
      if (sId.includes('24genetics')) estimatedPriceUsd = 149.0;
      if (sId.includes('eternadx') || sId.includes('bloodo')) estimatedPriceUsd = 199.0;
      if (sId.includes('fagron')) estimatedPriceUsd = 179.0;

      updates.unit_price = estimatedPriceUsd;
      updates.cost_tiers = { cost_10: parseFloat((estimatedPriceUsd * 0.7).toFixed(2)) }; // 30% margin default
      updates.currency = 'USD';
      needsUpdate = true;
    } else if (!v.cost_tiers || Object.keys(v.cost_tiers).length === 0) {
      const numericPrice = parseFloat(existingPrice);
      updates.cost_tiers = { cost_10: numericPrice };
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
      batch.set(doc.ref, updates, { merge: true });
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

  console.log(`✓ SUCCESS: Repaired and completed missing data for ${updatedCount} variants.`);
}

fixAllMissingPricesAndDosages().catch(console.error);
