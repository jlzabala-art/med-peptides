/**
 * audit_nplabs_embedded.mjs
 * Finds NP Labs products that have variants stored as an EMBEDDED ARRAY
 * instead of in the proper 'variants' subcollection.
 * These need to be migrated.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const NP_ID = 'supplier-nplabs';

async function run() {
  console.log('🔍 Scanning ALL products for embedded variants array with NP Labs...\n');
  const allProducts = await db.collection('products').get();
  
  const withEmbeddedNpVariants = [];
  const withSubcollectionNpVariants = [];
  const missingBoth = [];

  let checkedCount = 0;
  for (const doc of allProducts.docs) {
    const d = doc.data();
    const embeddedVariants = Array.isArray(d.variants) ? d.variants : [];
    const hasNpEmbedded = embeddedVariants.some(v => 
      v.supplierId === NP_ID || 
      v.supplier_id === NP_ID ||
      (v.supplier || '').toLowerCase().includes('np lab') ||
      (v.supplierId || '').toLowerCase().includes('np lab')
    );

    // Check subcollection
    const subSnap = await doc.ref.collection('variants').get();
    const hasNpSubcollection = subSnap.docs.some(vd => 
      vd.data().supplierId === NP_ID
    );

    if (hasNpEmbedded) {
      withEmbeddedNpVariants.push({
        productId: doc.id,
        name: d.canonicalName || d.name,
        status: d.status,
        embeddedVariantCount: embeddedVariants.length,
        subcollectionCount: subSnap.size,
        sampleVariant: embeddedVariants.find(v => 
          (v.supplierId || '').includes('np') || (v.supplier || '').toLowerCase().includes('np lab')
        )
      });
    }
    if (hasNpSubcollection) {
      withSubcollectionNpVariants.push({
        productId: doc.id,
        name: d.canonicalName || d.name,
        count: subSnap.size
      });
    }
    checkedCount++;
  }

  console.log(`Checked ${checkedCount} products\n`);
  console.log(`✅ Products with NP Labs variants in SUBCOLLECTION: ${withSubcollectionNpVariants.length}`);
  withSubcollectionNpVariants.forEach(p => console.log(`  ${p.productId} — ${p.name} (${p.count} variants)`));

  console.log(`\n⚠️  Products with NP Labs variants in EMBEDDED ARRAY (need migration): ${withEmbeddedNpVariants.length}`);
  withEmbeddedNpVariants.slice(0, 10).forEach(p => {
    console.log(`  ${p.productId} — "${p.name}" [status: ${p.status}]`);
    console.log(`    embedded variants: ${p.embeddedVariantCount}, subcollection: ${p.subcollectionCount}`);
    console.log(`    sample embedded variant: ${JSON.stringify(p.sampleVariant)}`);
  });

  // Also: products with ZERO subcollection variants and NO embedded variants — fully orphaned
  console.log('\n🔍 Scanning for products with 0 subcollection variants (any supplier)...');
  let zeroVariantProducts = 0;
  for (const doc of allProducts.docs) {
    const d = doc.data();
    const subSnap = await doc.ref.collection('variants').get();
    if (subSnap.size === 0 && d.status !== 'archived') {
      zeroVariantProducts++;
    }
  }
  console.log(`Products with 0 subcollection variants (non-archived): ${zeroVariantProducts}`);

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
