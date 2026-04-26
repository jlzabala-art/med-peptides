/**
 * auditVariantPricing.mjs
 * Shows pricing structure of variants to diagnose kit price = perUnit price issue
 */
import { readFileSync } from 'fs';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const sa = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const snap = await db.collection('products').limit(5).get();

for (const doc of snap.docs) {
  const product = doc.data();
  console.log(`\n📦 Product: ${product.name || doc.id}`);

  // Check variants subcollection
  const variantsSnap = await db.collection('products').doc(doc.id).collection('variants').limit(3).get();
  
  if (variantsSnap.empty) {
    // Check inline variants
    if (product.variants && Array.isArray(product.variants)) {
      console.log(`  📌 Inline variants: ${product.variants.length}`);
      product.variants.slice(0, 2).forEach((v, i) => {
        console.log(`  Variant ${i}: dosage=${v.dosage || v.strength}`);
        console.log(`    pricing keys:`, Object.keys(v.pricing || {}));
        const retail = v.pricing?.retail;
        if (retail) {
          console.log(`    retail.perUnit=${retail.perUnit}, retail.kit=${retail.kit}`);
        }
      });
    } else {
      console.log('  ⚠️  No variants found');
    }
  } else {
    console.log(`  📌 Subcollection variants: ${variantsSnap.size}`);
    variantsSnap.docs.slice(0, 2).forEach((vDoc, i) => {
      const v = vDoc.data();
      console.log(`  Variant ${i}: dosage=${v.dosage || v.strength}`);
      console.log(`    pricing keys:`, Object.keys(v.pricing || {}));
      const retail = v.pricing?.retail;
      const master = v.pricing?.master;
      if (retail) console.log(`    retail.perUnit=${retail.perUnit}, retail.kit=${retail.kit}`);
      if (master) console.log(`    master.perUnit=${master.perUnit}, master.kit=${master.kit}`);
    });
  }
}

process.exit(0);
