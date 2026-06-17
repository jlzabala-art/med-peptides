import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── Init Firebase Admin ────────────────────────────────────────────────────────
const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];

let initialized = false;
for (const p of SA_PATHS) {
  if (existsSync(p)) {
    const sa = JSON.parse(readFileSync(p, 'utf-8'));
    initializeApp({ credential: cert(sa) });
    initialized = true;
    console.log(`✅ Firebase initialized with: ${p}`);
    break;
  }
}
if (!initialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  initializeApp();
  initialized = true;
}
if (!initialized) {
  console.error('❌ No service account found.');
  process.exit(1);
}

const db = getFirestore();

// Calculate threshold: 3 hours ago
const threshold = new Date(Date.now() - 3 * 60 * 60 * 1000);

async function run() {
  console.log(`🔍 Looking for items created after ${threshold.toISOString()}`);
  
  const productsSnap = await db.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} total products`);

  let batch = db.batch();
  let updateCount = 0;
  const BATCH_LIMIT = 400;

  async function commitBatchIfNeeded() {
    if (updateCount >= BATCH_LIMIT) {
      await batch.commit();
      console.log('  💾 Batch committed');
      batch = db.batch();
      updateCount = 0;
    }
  }

  let matchedProducts = 0;
  let matchedVariants = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    
    // Check if created recently
    let isRecent = false;
    if (data.createdAt) {
      const createdDate = new Date(data.createdAt);
      if (createdDate > threshold) isRecent = true;
    }
    
    // Only update if it's recent and doesn't already have Lotusland
    if (isRecent && data.supplier !== 'Lotusland') {
      batch.update(doc.ref, { supplier: 'Lotusland' });
      updateCount++;
      matchedProducts++;
      console.log(`  ✏️ Updated product: ${data.name || doc.id}`);
      await commitBatchIfNeeded();
    }

    // Now check variants for this product
    const variantsSnap = await db.collection('products').doc(doc.id).collection('variants').get();
    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      
      let vIsRecent = false;
      if (vData.createdAt) {
        const vDate = new Date(vData.createdAt);
        if (vDate > threshold) vIsRecent = true;
      }
      // Fallback: if product is recent, we can assume variants are recent too
      if (isRecent) vIsRecent = true;
      
      if (vIsRecent && vData.supplier !== 'Lotusland') {
        batch.update(vDoc.ref, { supplier: 'Lotusland' });
        updateCount++;
        matchedVariants++;
        console.log(`    ✏️ Updated variant: ${vData.name || vDoc.id}`);
        await commitBatchIfNeeded();
      }
    }
  }

  if (updateCount > 0) {
    await batch.commit();
    console.log('  💾 Final batch committed');
  }

  console.log('\n✅ Migration complete');
  console.log(`Products updated: ${matchedProducts}`);
  console.log(`Variants updated: ${matchedVariants}`);
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
