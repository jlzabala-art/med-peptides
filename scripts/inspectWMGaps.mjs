import { db } from './lib/firebase-admin.mjs';

async function inspect() {
  const docRef = db.collection('protocols').doc('wm_002');
  const snap = await docRef.get();
  if (!snap.exists) {
    console.log('❌ wm_002 not found');
    return;
  }
  const data = snap.data();
  console.log('wm_002 Document top-level keys:', Object.keys(data));
  if (data.phases) {
    console.log('Number of elements in data.phases:', data.phases.length);
    console.log('First phase object JSON:', JSON.stringify(data.phases[0], null, 2));
  }
}

inspect().catch(console.error);
