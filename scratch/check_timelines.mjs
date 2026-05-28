import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function run() {
  const snap = await db.collection('protocols').get();
  snap.forEach(doc => {
    const data = doc.data();
    const hasTimeline = 'clinical_timeline' in data && Array.isArray(data.clinical_timeline) && data.clinical_timeline.length > 0;
    const hasPhases = 'phases' in data && Array.isArray(data.phases) && data.phases.length > 0;
    console.log(`Doc ID: ${doc.id} | title: ${data.protocol_title} | clinical_timeline: ${hasTimeline} | phases: ${hasPhases}`);
  });
}

run().catch(console.error);
