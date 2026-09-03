import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const wSnap = await db.collection('wholesellers').get();
  const batch = db.batch();
  let count = 0;

  wSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.name || '').toLowerCase();
    
    let updates = {};
    let updated = false;

    if (name.includes('magenta')) {
      updates.lead_time_days = 3;
      updates.flat_shipping_cost_usd = 25;
      updated = true;
    } else if (name.includes('vallida')) {
      updates.lead_time_days = 1;
      updates.flat_shipping_cost_usd = 15;
      updated = true;
    } else if (name.includes('poland') || name.includes('pod')) {
      updates.lead_time_days = 14;
      updates.flat_shipping_cost_usd = 85;
      updated = true;
    } else if (name.includes('nplab')) {
      updates.lead_time_days = 5;
      updates.flat_shipping_cost_usd = 40;
      updated = true;
    } else if (name.includes('fusion')) {
      updates.lead_time_days = 2;
      updates.flat_shipping_cost_usd = 20;
      updated = true;
    } else {
      updates.lead_time_days = 7;
      updates.flat_shipping_cost_usd = 50;
      updated = true;
    }

    if (updated) {
      batch.update(doc.ref, updates);
      count++;
    }
  });

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully updated ${count} wholesellers with Phase 2 logistics data.`);
  } else {
    console.log('No wholesellers needed Phase 2 updates.');
  }
}

run().catch(console.error);
