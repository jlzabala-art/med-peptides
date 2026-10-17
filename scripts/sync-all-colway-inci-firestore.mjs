import { readFileSync } from 'fs';
import admin from 'firebase-admin';
import { COLWAY_PRODUCTS_INCI_REGISTRY } from '../src/data/colwayInciRegistry.js';

let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync('./serviceAccount-target.json', 'utf8'));
} catch (e) {
  serviceAccount = JSON.parse(readFileSync('./scripts/serviceAccountKey.json', 'utf8'));
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function syncAllColwayInci() {
  console.log('🔄 Starting full sync of Colway INCI & Active Ingredients to Firestore...');

  const entries = Object.entries(COLWAY_PRODUCTS_INCI_REGISTRY);

  for (const [slug, data] of entries) {
    console.log(`\n📦 Processing product: ${slug}`);
    const docRef = db.collection('products').doc(slug);
    const snap = await docRef.get();

    const updatePayload = {
      ingredients: data.ingredients,
      inci_list: data.ingredients, // backward compatibility
      clinical_evidence: data.clinical_evidence,
      key_actives_summary: data.key_actives_summary,
      hero_stats: data.hero_stats,
      mechanisms: data.mechanisms,
      updatedAt: new Date().toISOString()
    };

    if (snap.exists) {
      await docRef.set(updatePayload, { merge: true });
      console.log(`✅ Updated existing product ${slug} with ${data.ingredients.length} declared ingredients.`);
    } else {
      // Also check if canonical doc has another ID or create
      await docRef.set({
        id: slug,
        slug: slug,
        title: data.title,
        brand: 'Colway',
        category: slug.includes('colvita') ? 'nutricosmetics' : 'cosmetics',
        status: 'published',
        ...updatePayload
      }, { merge: true });
      console.log(`✅ Created/set product ${slug} with ${data.ingredients.length} declared ingredients.`);
    }
  }

  console.log('\n🎉 Finished syncing all 8 Colway products to Firestore successfully!');
  process.exit(0);
}

syncAllColwayInci().catch(err => {
  console.error('❌ Error syncing to Firestore:', err);
  process.exit(1);
});
