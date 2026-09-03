import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

const app = initializeApp({ credential });
const db = getFirestore(app);

async function migrate() {
  const snap = await db.collection('products').get();
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;
  const batches = [];

  snap.forEach(doc => {
    const data = doc.data();
    let updated = false;
    let variants = Array.isArray(data.variants) ? [...data.variants] : [];

    // If variants array is empty but we have a price, generate a default variant
    if (variants.length === 0 && (data.price || data.canonical_price_usd || data.cost_per_gram)) {
      variants.push({
        variantId: `${doc.id}-default`,
        label: 'Default Variant',
        supplierId: data.supplierId || null,
        supplier: data.supplierName || data.supplier || null,
        price: data.price || 0
      });
      updated = true;
    }

    // Process all variants to enforce the Golden Rule
    const newVariants = variants.map(v => {
      const vUpdated = { ...v };

      // 1. supplierId & supplier
      if (!vUpdated.supplierId) vUpdated.supplierId = data.supplierId || null;
      if (!vUpdated.supplier) vUpdated.supplier = data.supplierName || data.supplier || null;

      // 2. strength / dosage
      if (!vUpdated.strength) {
        vUpdated.strength = v.strength || (v.attributes?.dosageMg ? `${v.attributes.dosageMg}mg` : (v.dosage || data.dosage || ''));
      }

      // 3. presentation
      if (!vUpdated.presentation) {
        let pres = v.presentation || v.attributes?.format || data.dosage_form || 'vial';
        if (pres.toLowerCase() === 'lyophilized') pres = 'vial';
        vUpdated.presentation = pres.toLowerCase();
      }

      // 4. unit_price
      if (vUpdated.unit_price === undefined) {
        vUpdated.unit_price = v.unit_price || v.price || v.pricing?.retail || data.price || data.canonical_price_usd || 0;
      }

      // Remove old price field if unit_price exists
      if ('price' in vUpdated && vUpdated.unit_price !== undefined) {
        delete vUpdated.price;
      }

      // 5. cost_tiers
      if (!vUpdated.cost_tiers) {
        vUpdated.cost_tiers = {
          cost_10: null,
          cost_20: null,
          cost_50: null,
          cost_100: null,
        };
      }

      return vUpdated;
    });

    if (JSON.stringify(variants) !== JSON.stringify(newVariants) || updated) {
      batch.update(doc.ref, { variants: newVariants });
      count++;
      batchCount++;
    }
    
    if (batchCount >= 400) {
      batches.push(batch.commit());
      batch = db.batch();
      batchCount = 0;
    }
  });

  if (batchCount > 0) {
    batches.push(batch.commit());
  }

  await Promise.all(batches);
  console.log(`Migrated ${count} products.`);
}

migrate().catch(console.error);
