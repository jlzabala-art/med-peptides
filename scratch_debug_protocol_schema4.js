import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const q = await db.collection('protocols').where('protocol_name', '==', 'Advanced Weight Management & Metabolic Longevity Protocol').get();
  if (!q.empty) {
    const data = q.docs[0].data();
    console.log("Root fields:", Object.keys(data));
    console.log("duration:", data.duration);
    console.log("durationWeeks:", data.durationWeeks);
    console.log("duration_weeks:", data.duration_weeks);
    console.log("phases:", JSON.stringify(data.phases, null, 2));
  }
}
check();
