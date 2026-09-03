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
  const floatMatch = str.toString().match(/^([\d.]+)/);
  return { amount: floatMatch ? parseFloat(floatMatch[1]) : null, unit: 'unknown' };
}

async function run() {
  const pSnap = await db.collection('products').get();
  const batch = db.batch();
  let count = 0;

  pSnap.forEach(doc => {
    const data = doc.data();
    let updated = false;
    const updates = {};
    
    const supplier = data.supplier ? data.supplier.toLowerCase().trim() : '';

    // 1. VAT Fix for Vallida and Fusion
    if (supplier === 'vallida' || supplier === 'fusion') {
      if (data.requires_vat_confirmation !== false) {
        updates.requires_vat_confirmation = false;
        updates.vat_included = false; // Assuming it doesn't include VAT as requested
        updated = true;
      }
    }

    // 2. Migration for LotusLand and Fagron
    if (supplier === 'lotusland' || supplier === 'fagron') {
      const canonicalName = data.baseName || data.name || data.scientificName;
      if (canonicalName && !data.canonicalName) {
        updates.canonicalName = canonicalName;
        updated = true;
      }

      // Format & Container
      let inferredDosageForm = 'vial';
      if (data.format) {
        const fmt = data.format.toLowerCase();
        if (fmt.includes('pen')) inferredDosageForm = 'pre_filled_pen';
        else if (fmt.includes('capsule')) inferredDosageForm = 'oral_capsule';
        else if (fmt.includes('cream')) inferredDosageForm = 'cream';
      }
      
      if (!data.dosage_form) {
        updates.dosage_form = inferredDosageForm;
        updated = true;
      }

      // Components and Total Active Mg
      if (!data.components && data.dose) {
        const { amount, unit } = extractAmountAndUnit(data.dose);
        if (amount) {
          updates.components = [{
            name: canonicalName || data.name,
            amount: amount,
            unit: unit
          }];
          updates.total_active_mg = amount;
          updated = true;
        }
      }

      // Price mapping
      if (!data.canonical_price_usd) {
        // Lotusland uses pricing.internalCostAed
        if (supplier === 'lotusland' && data.pricing && data.pricing.internalCostAed) {
           const usd = data.pricing.internalCostAed / 3.6725;
           updates.canonical_price_usd = Math.round(usd * 100) / 100;
           updated = true;
        }
        // Fagron might use pricing.wholesale.perUnit
        else if (data.pricing && data.pricing.wholesale && data.pricing.wholesale.perUnit) {
           updates.canonical_price_usd = data.pricing.wholesale.perUnit;
           updated = true;
        }
      }

      // Price per mg
      const finalPriceUsd = updates.canonical_price_usd || data.canonical_price_usd;
      const finalActiveMg = updates.total_active_mg || data.total_active_mg;

      if (finalPriceUsd && finalActiveMg && !data.price_per_mg_usd) {
        updates.price_per_mg_usd = finalPriceUsd / finalActiveMg;
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
    console.log(`Successfully updated ${count} products.`);
  } else {
    console.log('No products needed migration.');
  }
}

run().catch(console.error);
