/**
 * heal_raw_materials_mass.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizes all raw_material / Bulk API products in Firestore:
 * - Ensures mass/weight fields (quantity, unit, weightGrams, packageWeight)
 * - Removes erroneous 'Standard Dose' or 'Lyophilized Vial' defaults on raw APIs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

async function healRawMaterials() {
  console.log(`\n======================================================`);
  console.log(`🧹 NORMALIZATION: Raw Materials & Bulk API Mass Schemas`);
  console.log(`======================================================\n`);

  const productsSnap = await db.collection('products').get();
  let healedCount = 0;

  for (const docSnap of productsSnap.docs) {
    const product = docSnap.data();
    let modified = false;

    const variants = Array.isArray(product.variants) ? [...product.variants] : [];
    const updatedVariants = variants.map(v => {
      const isRaw = v.type === 'raw_material' || v.productType === 'raw_material' || v.productType === 'api_raw_material' || product.type === 'raw_material' || product.primaryType === 'raw_material';
      
      if (isRaw) {
        let newV = { ...v, type: 'raw_material', productType: 'raw_material' };
        
        // Fix unit and mass
        if (!newV.unit) newV.unit = 'g';
        if (!newV.quantity && newV.dose) {
          const num = parseFloat(newV.dose);
          if (!isNaN(num)) newV.quantity = num;
        }
        if (!newV.quantity) newV.quantity = 1;
        if (!newV.weightGrams) newV.weightGrams = newV.unit === 'kg' ? newV.quantity * 1000 : newV.quantity;
        if (!newV.packageWeight) newV.packageWeight = `${newV.quantity}${newV.unit}`;

        // Fix presentation if it was erroneously set to 'Lyophilized Vial'
        if (newV.presentation === 'Lyophilized Vial' || !newV.presentation) {
          newV.presentation = `${newV.packageWeight} Bulk Raw Powder`;
          newV.format = 'powder';
          modified = true;
        }

        // Clean dosage if it was set to 'Standard Dose'
        if (newV.dosage === 'Standard Dose') {
          newV.dosage = `${newV.packageWeight} (Bulk)`;
          modified = true;
        }

        return newV;
      }
      return v;
    });

    if (modified) {
      await docSnap.ref.update({
        variants: updatedVariants,
        updatedAt: new Date().toISOString()
      });
      healedCount++;
    }
  }

  console.log(`✔ Normalization complete: Cleaned ${healedCount} raw material products in Firestore.`);
}

healRawMaterials().catch(console.error);
