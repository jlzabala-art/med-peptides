import { db } from './lib/firebase-admin.mjs';

const shortCodes = [
  'wm_001', 'wm_002', 'skin_001', 'sleep_001', 'sleep_002',
  'rec_001', 'rec_002', 'neuro_001', 'lon_001', 'lon_002',
  'met_001', 'met_002'
];

async function checkSlugs() {
  console.log('=== Checking protocol_slug values for short codes ===');
  for (const id of shortCodes) {
    const docRef = db.collection('protocols').doc(id);
    const snap = await docRef.get();
    if (snap.exists) {
      console.log(`Doc ID: ${id} | Title: ${snap.data().protocol_title} | protocol_slug field: "${snap.data().protocol_slug}"`);
    } else {
      console.log(`⚠️ Short code doc "${id}" not found.`);
    }
  }
}

checkSlugs().catch(console.error);
