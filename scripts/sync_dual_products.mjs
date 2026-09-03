import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function syncDualProductsFast() {
  console.log('=== ULTRA-FAST SCAN USING COLLECTION GROUP ===');

  const varSnap = await db.collectionGroup('variants').get();
  console.log(`Fetched ${varSnap.docs.length} total variants across all products`);

  const prodVariantsMap = new Map();

  for (const doc of varSnap.docs) {
    const parentProdId = doc.ref.parent.parent?.id;
    if (!parentProdId) continue;

    if (!prodVariantsMap.has(parentProdId)) {
      prodVariantsMap.set(parentProdId, []);
    }
    prodVariantsMap.get(parentProdId).push({ id: doc.id, ...doc.data() });
  }

  let dualCount = 0;
  const batch = db.batch();

  for (const [prodId, variants] of prodVariantsMap.entries()) {
    if (variants.length < 2) continue;

    let hasRaw = false;
    let hasFinished = false;
    const formats = new Set();

    for (const v of variants) {
      const pStr = String(v.presentation || v.presentationName || v.format || '').toLowerCase();
      const isRaw = v.unitOfMeasure === 'g' || 
                    v.unitOfMeasure === 'kg' || 
                    v.supplierPricing?.unitOfMeasure === 'g' || 
                    pStr.includes('bulk') || 
                    pStr.includes('api') || 
                    pStr.includes('powder') || 
                    v.type === 'raw_material' ||
                    (typeof v.dosage === 'string' && v.dosage.toLowerCase().includes('moq'));

      const isFin = v.unitOfMeasure === 'unit' ||
                    v.unitOfMeasure === 'kit' ||
                    pStr.includes('pen') ||
                    pStr.includes('vial') ||
                    pStr.includes('spray') ||
                    pStr.includes('capsule') ||
                    v.type === 'finished_product';

      if (isRaw) {
        hasRaw = true;
        formats.add('bulk_powder_gram');
      }
      if (isFin && !isRaw) {
        hasFinished = true;
        if (pStr.includes('pen')) formats.add('pre_filled_pen');
        else if (pStr.includes('vial')) formats.add('vial');
        else if (pStr.includes('spray')) formats.add('nasal_spray');
        else formats.add('unit');
      }
    }

    if (hasRaw && hasFinished) {
      dualCount++;
      console.log(`  ⭐ Dual Product Identified: ${prodId} (Formats: ${[...formats].join(', ')})`);
      const prodRef = db.collection('products').doc(prodId);
      batch.update(prodRef, {
        productType: 'dual',
        nature: 'dual',
        hasFinishedVariants: true,
        hasRawVariants: true,
        availableNatures: ['finished_product', 'raw_material'],
        availableFormats: [...formats],
        updatedAt: new Date().toISOString()
      });
    }
  }

  if (dualCount > 0) {
    await batch.commit();
  }

  console.log(`=== SYNC COMPLETE: ${dualCount} dual products successfully committed ===`);
}

syncDualProductsFast().catch(console.error);
