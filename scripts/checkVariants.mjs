/**
 * checkVariants.mjs
 * Diagnoses the variants subcollection for each product in Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/checkVariants.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');

if (!getApps().length) {
  initializeApp({ credential: cert(svcAcct) });
}
const db = getFirestore();

async function main() {
  const productsSnap = await db.collection('products').get();
  console.log(`\n📦 Total products: ${productsSnap.size}\n`);

  const report = [];

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const variantsSnap = await db.collection('products').doc(doc.id).collection('variants').get();

    const entry = {
      id:            doc.id,
      name:          data.name ?? '(no name)',
      variantCount:  variantsSnap.size,
      hasFlatPrices: !!(data.guestVialPrice || data.proVialPrice || data.perVialPriceUSD),
      hasNewPricing: !!data.pricing,
      variants:      [],
    };

    for (const vDoc of variantsSnap.docs) {
      const v = vDoc.data();
      entry.variants.push({
        id:         vDoc.id,
        label:      v.label ?? v.size ?? '(no label)',
        isDefault:  v.isDefault ?? false,
        hasPricing: !!v.pricing,
        pricingKeys: v.pricing ? Object.keys(v.pricing) : [],
        legacyFields: {
          guestVialPrice: v.guestVialPrice ?? null,
          proVialPrice:   v.proVialPrice   ?? null,
        },
      });
    }

    report.push(entry);
    
    // Console summary per product
    const status = entry.variantCount === 0 ? '❌ EMPTY variants' : '✅';
    console.log(`${status} [${doc.id}] "${entry.name}"`);
    console.log(`   variants subcollection: ${entry.variantCount} doc(s)`);
    console.log(`   flat prices on root: ${entry.hasFlatPrices}`);
    console.log(`   new pricing obj on root: ${entry.hasNewPricing}`);
    if (entry.variants.length > 0) {
      entry.variants.forEach(v => {
        console.log(`   └─ variant "${v.label}" | has pricing obj: ${v.hasPricing} | keys: [${v.pricingKeys.join(', ')}]`);
      });
    }
    console.log('');
  }

  // Summary
  const empty  = report.filter(r => r.variantCount === 0).length;
  const filled = report.filter(r => r.variantCount > 0).length;
  console.log('─────────────────────────────────────────');
  console.log(`✅ Products with variants: ${filled}`);
  console.log(`❌ Products with empty variants subcollection: ${empty}`);
  console.log('─────────────────────────────────────────\n');
}

main().catch(e => { console.error(e); process.exit(1); });
