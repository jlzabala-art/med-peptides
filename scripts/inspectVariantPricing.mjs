/**
 * inspectVariantPricing.mjs
 * Dumps the raw pricing object of the first 3 variants found in Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/inspectVariantPricing.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

async function main() {
  const productsSnap = await db.collection('products').get();
  let shown = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();

    // Check sub-collection variants
    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();

    if (varSnap.size > 0) {
      for (const vDoc of varSnap.docs) {
        const v = vDoc.data();
        console.log(`\n━━━ ${doc.id} / variants/${vDoc.id} ━━━`);
        console.log('Full variant doc:');
        console.log(JSON.stringify(v, null, 2));
        if (++shown >= 3) return;
      }
    }

    // Check embedded variants[] array
    if (Array.isArray(data.variants) && data.variants.length > 0) {
      for (const v of data.variants.slice(0, 2)) {
        console.log(`\n━━━ ${doc.id} [embedded variant: ${v.id ?? v.dosage}] ━━━`);
        console.log('Full variant:');
        console.log(JSON.stringify(v, null, 2));
        if (++shown >= 3) return;
      }
    }

    // Check root-level pricing (single-variant products)
    if (!varSnap.size && !Array.isArray(data.variants) && (data.pricing || data.guestVialPrice)) {
      console.log(`\n━━━ ${doc.id} [root-level pricing] ━━━`);
      console.log(JSON.stringify({
        pricing: data.pricing,
        guestVialPrice: data.guestVialPrice,
        proVialPrice: data.proVialPrice,
      }, null, 2));
      if (++shown >= 3) return;
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
