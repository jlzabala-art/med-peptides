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

    // Apply mock data to Vallida and Magenta for Phase 1 demo
    if (supplier === 'vallida' || supplier === 'magenta') {
      const basePrice = data.canonical_price_usd;
      
      if (basePrice && !data.pricing_tiers) {
        // Generate realistic pricing tiers
        // Tier 1: 1-9 (base price)
        // Tier 2: 10-49 (10% discount)
        // Tier 3: 50+ (20% discount)
        updates.pricing_tiers = [
          { min_qty: 1, price_usd: basePrice },
          { min_qty: 10, price_usd: Math.round(basePrice * 0.9 * 100) / 100 },
          { min_qty: 50, price_usd: Math.round(basePrice * 0.8 * 100) / 100 }
        ];
        updated = true;
      }

      // Add a Certificate of Analysis (CoA) randomly, mostly for Vallida
      if (data.has_coa_verified === undefined) {
        const isPremium = supplier === 'vallida' ? Math.random() > 0.2 : Math.random() > 0.7; // Vallida has mostly verified CoAs
        if (isPremium) {
          updates.has_coa_verified = true;
          updates.purity_percentage = 99.4 + (Math.random() * 0.5); // 99.4 to 99.9
        } else {
          updates.has_coa_verified = false;
        }
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
    console.log(`Successfully updated ${count} products with Phase 1 demo data.`);
  } else {
    console.log('No products needed Phase 1 updates.');
  }
}

run().catch(console.error);
