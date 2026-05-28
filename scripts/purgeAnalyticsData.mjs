import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// ── CONFIGURATION ────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json';

const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function purgeAnalytics() {
  console.log('🚀 Starting Analytics Data Purge...');

  const collectionsToReset = ['peptides', 'products'];
  
  for (const collName of collectionsToReset) {
    console.log(`\n📦 Processing collection: ${collName}`);
    const snap = await db.collection(collName).get();
    
    if (snap.empty) {
      console.log(`   - No documents found in ${collName}.`);
      continue;
    }

    const batch = db.batch();
    let count = 0;
    
    snap.forEach(doc => {
      batch.update(doc.ref, {
        analytics_usage_score: 0,
        view_count: 0,
        analytics_synced_at: null,
        trending_score: 0
      });
      count++;
    });

    await batch.commit();
    console.log(`   ✅ Reset ${count} documents in ${collName}.`);
  }

  console.log('\n✨ Firestore cleanup complete.');
  console.log('\n────────────────────────────────────────────────────────────────');
  console.log('📢 IMPORTANT: DASHBOARD MOCK DATA');
  console.log('The Admin Dashboard Analytics tab fetches data from the Cloud Function:');
  console.log('   /api/analytics-overview');
  console.log('\nIf you still see "Visitors: 1,250", it is because the function');
  console.log('is falling back to MOCK DATA. To fix this, you must:');
  console.log('1. Set GA4_PROPERTY_ID secret:');
  console.log('   firebase functions:secrets:set GA4_PROPERTY_ID');
  console.log('2. Redeploy the function:');
  console.log('   firebase deploy --only functions:analyticsOverview');
  console.log('────────────────────────────────────────────────────────────────\n');
}

purgeAnalytics().catch(err => {
  console.error('❌ Error during purge:', err);
  process.exit(1);
});
