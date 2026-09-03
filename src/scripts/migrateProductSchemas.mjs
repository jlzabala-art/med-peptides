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

function extractAmountAndUnit(str) {
  if (!str) return { amount: null, unit: null };
  const match = str.toString().match(/^([\d.]+)\s*([a-zA-Z%]+)$/);
  if (match) {
    return { amount: parseFloat(match[1]), unit: match[2].trim() };
  }
  return { amount: parseFloat(str) || null, unit: 'unknown' };
}

async function run() {
  const pSnap = await db.collection('products').get();
  const batch = db.batch();
  let count = 0;

  pSnap.forEach(doc => {
    const data = doc.data();
    let updated = false;
    const updates = {};
    
    // Convert baseName to canonicalName if it's there
    const canonicalName = data.baseName || data.name || data.scientificName;
    if (canonicalName && !data.canonicalName) {
      updates.canonicalName = canonicalName;
      updated = true;
    }

    if (data.supplier === 'NPLAB') {
      // 1. Components & total_active_mg
      if (!data.components && data.dosage) {
        const { amount, unit } = extractAmountAndUnit(data.dosage);
        if (amount) {
          updates.components = [{
            name: canonicalName || data.name,
            amount: amount,
            unit: unit
          }];
          updates.total_active_mg = amount; // assuming unit is mg for now
          updated = true;
        }
      }
      
      // 2. Pricing
      if (!data.canonical_price_usd && data.pricing && data.pricing.wholesale) {
        updates.canonical_price_usd = data.pricing.wholesale.perUnit;
        if (updates.total_active_mg) {
          updates.price_per_mg_usd = updates.canonical_price_usd / updates.total_active_mg;
        }
        updated = true;
      }
      
      // 3. Dosage form
      if (!data.dosage_form) {
        if (data.route === 'oral_capsule' || data.typeData?.supplement?.dosageForm === 'capsule') {
          updates.dosage_form = 'oral_capsule';
        } else if (data.productType === 'lyophilized_peptide') {
          updates.dosage_form = 'vial'; // assuming vial
        }
        updated = true;
      }
    } 
    else if (data.supplier === 'pod-poland') {
      // 1. Components & total_active_mg
      if (!data.components && data.dose) {
        const { amount, unit } = extractAmountAndUnit(data.dose);
        if (amount) {
          updates.components = [{
            name: canonicalName || data.name,
            amount: amount,
            unit: unit
          }];
          updates.total_active_mg = amount; // assuming unit is mg
          updated = true;
        }
      }

      // 2. Pricing (AED to USD)
      if (!data.canonical_price_usd && data.pricing && data.pricing.internalCostAed) {
        const usd = data.pricing.internalCostAed / 3.6725;
        updates.canonical_price_usd = Math.round(usd * 100) / 100;
        if (updates.total_active_mg) {
          updates.price_per_mg_usd = updates.canonical_price_usd / updates.total_active_mg;
        }
        updated = true;
      }
      
      // 3. Dosage form
      if (!data.dosage_form) {
        if (data.presentation === 'Prefilled Pen' || data.productType === 'Prefilled Pen') {
          updates.dosage_form = 'pre_filled_pen';
        } else {
          updates.dosage_form = 'vial';
        }
        updated = true;
      }
    }

    if (updated) {
      batch.update(doc.ref, updates);
      count++;
      console.log(`Prepared update for ${data.supplier} - ${data.name}`);
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully migrated ${count} products.`);
  } else {
    console.log('No products needed migration.');
  }
}

run().catch(console.error);
