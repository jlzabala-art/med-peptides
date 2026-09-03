import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const pSnap = await db.collection('products').get();
  const batch = db.batch();
  let count = 0;

  pSnap.forEach(doc => {
    const data = doc.data();
    let updated = false;
    const updates = {};
    
    const supplier = data.supplier ? data.supplier.toLowerCase().trim() : '';
    const basePrice = data.canonical_price_usd;

    if (basePrice) {
      if (supplier.includes('lotus')) {
        // Lotusland gets discount at 10 units (and 50 units)
        updates.pricing_tiers = [
          { min_qty: 1, price_usd: basePrice },
          { min_qty: 10, price_usd: Math.round(basePrice * 0.9 * 100) / 100 },
          { min_qty: 50, price_usd: Math.round(basePrice * 0.8 * 100) / 100 }
        ];
        updated = true;
      } else {
        // Others get prepared tiers but NO price change
        updates.pricing_tiers = [
          { min_qty: 1, price_usd: basePrice },
          { min_qty: 10, price_usd: basePrice },
          { min_qty: 50, price_usd: basePrice }
        ];
        updated = true;
      }
    }

    if (updated) {
      batch.update(doc.ref, updates);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} products with pricing tiers.`);
  } else {
    console.log('No products needed updates.');
  }
}

run().catch(console.error);
