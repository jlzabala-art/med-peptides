const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
  console.log('Firebase Admin initialized from .env.local.');
}

const db = admin.firestore();

// A lightweight version of normalizeProductMeta adapted for the script
function extractProductPresentation(product) {
  if (!product) return 'Vial';
  const pres = product.presentationName || product.presentation || product.format || product.form || product.presentationType;
  if (pres && typeof pres === 'string' && pres.trim()) {
    const p = pres.trim().toLowerCase();
    if (/lyophilized|liofilizado|powder/i.test(p)) return 'Lyophilized Vial';
    if (/bulk|granel/i.test(p)) return 'Bulk API Powder';
    if (/pen/i.test(p)) return 'Pre-filled Pen';
    if (/nasal/i.test(p)) return 'Nasal Spray';
    if (/capsule/i.test(p)) return 'Oral Capsule';
    if (/sublingual/i.test(p)) return 'Sublingual';
    if (/cartridge/i.test(p)) return 'Refill Cartridge';
    if (/cream|topical/i.test(p)) return 'Topical Cream';
    if (/oil/i.test(p)) return 'Topical Oil';
    return 'Vial';
  }

  const str = `${product.objectID || ''} ${product.id || ''} ${product.name || ''} ${product.sku || ''}`.toLowerCase();
  if (/lyophilized|liofilizado|powder/i.test(str)) return 'Lyophilized Vial';
  if (/bulk|granel/i.test(str)) return 'Bulk API Powder';
  if (/pre-?filled-?pen|pen/i.test(str)) return 'Pre-filled Pen';
  if (/vial/i.test(str)) return 'Vial';
  if (/nasal/i.test(str)) return 'Nasal Spray';
  if (/capsule|oral/i.test(str)) return 'Oral Capsule';
  if (/sublingual/i.test(str)) return 'Sublingual';
  if (/cartridge/i.test(str)) return 'Refill Cartridge';
  if (/cream|topical/i.test(str)) return 'Topical Cream';
  if (/oil/i.test(str)) return 'Topical Oil';
  return 'Vial';
}

function extractProductDosage(product) {
  if (!product) return '';
  if (product.dose && typeof product.dose === 'string' && product.dose.trim()) return product.dose.trim();
  if (product.dosage && typeof product.dosage === 'string' && product.dosage.trim()) return product.dosage.trim();
  if (product.strength && typeof product.strength === 'string' && product.strength.trim()) return product.strength.trim();
  const str = `${product.label || ''} ${product.source_label || ''} ${product.objectID || ''} ${product.id || ''} ${product.name || ''} ${product.sku || ''}`;
  const doseMatch = str.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g|ml)(?:\s*(?:\+|\/)\s*\d+(?:\.\d+)?\s*(?:mg|mcg|iu|g|ml))?)/i);
  return doseMatch ? doseMatch[1].trim() : '';
}

function extractProductSupplier(product) {
  if (!product) return '';
  const name = product.supplierName || product.supplier || product.manufacturer || product.vendor;
  if (name && typeof name === 'string' && name.trim() && name.trim() !== '—' && name.trim() !== '-') return name.trim();
  const sId = product.supplierId || product.supplier_id;
  if (sId && typeof sId === 'string') {
    const sIdLower = sId.toLowerCase();
    if (sIdLower.includes('lotusland')) return 'Lotusland';
    if (sIdLower.includes('nplabs') || sIdLower.includes('np-labs') || sIdLower.includes('np_labs')) return 'NP LABS';
    if (sIdLower.includes('europeptides')) return 'Europeptides';
    if (sIdLower.includes('pod') || sIdLower.includes('poland')) return 'POD Poland';
    if (sIdLower.includes('magenta')) return 'Magenta';
    if (sIdLower.includes('fusion')) return 'Fusion';
    if (sIdLower.includes('bioniq')) return 'Bioniq';
    if (sIdLower.includes('vallida')) return 'Vallida Labs';
    if (sIdLower.includes('fagron')) return 'Fagron';
    if (sIdLower.includes('24genetics')) return '24Genetics';
    if (sIdLower.includes('eterna')) return 'Eterna Diagnostics';
  }
  return '';
}

async function run() {
  console.log('Starting historical variant enrichment script...');
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products. Processing variants...`);

  let totalVariantsProcessed = 0;
  let totalVariantsUpdated = 0;

  for (const pDoc of productsSnap.docs) {
    const variantsSnap = await pDoc.ref.collection('variants').get();
    if (variantsSnap.empty) continue;

    const batch = db.batch();
    let batchCount = 0;

    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      totalVariantsProcessed++;

      const pType = vData.type || '';
      const pStr = String(vData.presentation || vData.presentationName || vData.format || '').toLowerCase();
      const isRaw = vData.unitOfMeasure === 'g' || 
                    vData.unitOfMeasure === 'kg' || 
                    vData.supplierPricing?.unitOfMeasure === 'g' || 
                    pStr.includes('bulk') || 
                    pStr.includes('api') || 
                    pStr.includes('powder') || 
                    vData.type === 'raw_material' ||
                    (typeof vData.dosage === 'string' && vData.dosage.toLowerCase().includes('moq'));

      const inferredType = isRaw ? 'raw_material' : 'finished_product';
      const presentation = extractProductPresentation(vData);
      const dosage = extractProductDosage(vData);
      const supplier = extractProductSupplier(vData) || vData.supplier || vData.supplierName;

      const updatePayload = {
        presentation: presentation || vData.presentation,
        dosage: dosage || vData.dosage,
        type: inferredType,
        supplier: supplier
      };

      let needsUpdate = false;
      if (updatePayload.presentation !== vData.presentation ||
          updatePayload.dosage !== vData.dosage ||
          updatePayload.type !== vData.type ||
          updatePayload.supplier !== vData.supplier) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        batch.set(vDoc.ref, updatePayload, { merge: true });
        batchCount++;
        totalVariantsUpdated++;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`Updated ${batchCount} variants for product: ${pDoc.id}`);
    }
  }

  console.log(`\nScript finished.`);
  console.log(`Total variants processed: ${totalVariantsProcessed}`);
  console.log(`Total variants updated with correct formatting: ${totalVariantsUpdated}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
