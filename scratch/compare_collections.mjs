import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  console.log('--- Collection: protocols ---');
  const snapProto = await db.collection('protocols').limit(3).get();
  snapProto.forEach(doc => {
    const data = doc.data();
    console.log(`Doc ID: ${doc.id}`);
    console.log(`  Keys:`, Object.keys(data));
    console.log(`  protocol_title: ${data.protocol_title}`);
    console.log(`  has clinical_timeline: ${'clinical_timeline' in data}`);
    console.log(`  has phases: ${'phases' in data}`);
  });

  console.log('\n--- Collection: protocol_templates ---');
  const snapTemplate = await db.collection('protocol_templates').limit(3).get();
  snapTemplate.forEach(doc => {
    const data = doc.data();
    console.log(`Doc ID: ${doc.id}`);
    console.log(`  Keys:`, Object.keys(data));
  });
}

run().catch(console.error);
