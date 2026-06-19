import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { pdfData, normalize, customMappings } from '../src/components/admin/catalog/regenpept_data.js';

let initialized = false;
try { initializeApp(); initialized = true; } catch (e) {}
if (!initialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) { initializeApp(); initialized = true; }

const db = getFirestore();

async function run() {
  console.log(`Looking for products from the PDF to set supplier to LotusLand...`);
  
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} total products`);

  let batch = db.batch();
  let updateCount = 0;
  let matchedProducts = 0;
  let matchedVariants = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    
    // Check if it matches PDF data
    let isPdfProduct = false;
    for (const item of pdfData) {
      const normName = normalize(item.name);
      const normDbName = normalize(data.name || '');
      if (normDbName.includes(normName) || normName.includes(normDbName) || customMappings[normName] === doc.id) {
        isPdfProduct = true;
        break;
      }
    }
    
    if (isPdfProduct) {
      if (data.supplier !== 'LotusLand') {
        batch.update(doc.ref, { supplier: 'LotusLand' });
        updateCount++;
        matchedProducts++;
        console.log(`Updated product: ${data.name || doc.id}`);
      }

      // Now check variants for this product
      const variantsSnap = await db.collection('products').doc(doc.id).collection('variants').get();
      for (const vDoc of variantsSnap.docs) {
        const vData = vDoc.data();
        if (vData.supplier !== 'LotusLand') {
          batch.update(vDoc.ref, { supplier: 'LotusLand' });
          updateCount++;
          matchedVariants++;
          console.log(`Updated variant: ${vData.name || vDoc.id}`);
        }
      }
    }
    
    if (updateCount >= 400) {
      await batch.commit();
      console.log('Batch committed');
      batch = db.batch();
      updateCount = 0;
    }
  }

  if (updateCount > 0) {
    await batch.commit();
    console.log('Final batch committed');
  }

  console.log('Migration complete');
  console.log(`Products updated: ${matchedProducts}`);
  console.log(`Variants updated: ${matchedVariants}`);
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
