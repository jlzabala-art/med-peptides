/**
 * syncAllColwayInciToFirestore.mjs
 * 
 * Synchronizes complete, authoritative INCI composition data to Firestore
 * for all 8 Colway cosmeceuticals and nutricosmetics.
 * Sets both `ingredients` and `inci_list` as SSOT.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { COLWAY_PRODUCTS_INCI_REGISTRY } from '../src/data/colwayInciRegistry.js';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  console.log('🧪 Starting Full Colway INCI Sync to Firestore...\n');

  const entries = Object.entries(COLWAY_PRODUCTS_INCI_REGISTRY);

  for (const [slug, data] of entries) {
    const ref = db.collection('products').doc(slug);
    const doc = await ref.get();

    if (!doc.exists) {
      console.log(`⚠️ Document ${slug} does not exist in Firestore. Creating baseline document...`);
    }

    const ingredients = data.ingredients || [];
    const updatePayload = {
      ingredients: ingredients,
      inci_list: ingredients,
      inci_complete: true,
      key_actives_summary: data.key_actives_summary || '',
      updated_at: FieldValue.serverTimestamp()
    };

    if (data.hero_stats) {
      updatePayload.hero_stats = data.hero_stats;
    }
    if (data.active_complexes) {
      updatePayload.active_complexes = data.active_complexes;
    }

    await ref.set(updatePayload, { merge: true });
    console.log(`✅ ${slug}: Synchronized ${ingredients.length} declared ingredients (ingredients & inci_list) ✓`);
  }

  console.log('\n🎉 Finished syncing all 8 Colway products in Firestore!');
}

run().catch(err => {
  console.error('❌ Error during INCI sync:', err);
  process.exit(1);
});
