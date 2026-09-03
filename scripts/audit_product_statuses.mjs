import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function auditStatuses() {
  console.log('=== AUDITING PRODUCT AND VARIANT STATUSES IN FIRESTORE ===\n');

  const prodsSnap = await db.collection('products').get();
  console.log(`Total Products: ${prodsSnap.docs.length}`);

  const prodStatusCounts = {};
  const sampleByStatus = {};

  for (const doc of prodsSnap.docs) {
    const data = doc.data();
    const st = data.status || 'undefined';
    prodStatusCounts[st] = (prodStatusCounts[st] || 0) + 1;
    if (!sampleByStatus[st]) sampleByStatus[st] = [];
    if (sampleByStatus[st].length < 5) {
      sampleByStatus[st].push({ id: doc.id, name: data.canonicalName || data.name, isActive: data.isActive });
    }
  }

  console.log('\n--- Product Status Counts ---');
  for (const [st, count] of Object.entries(prodStatusCounts)) {
    console.log(`  • "${st}": ${count} products`);
  }

  console.log('\n--- Sample Products by Status ---');
  for (const [st, samples] of Object.entries(sampleByStatus)) {
    console.log(`\nStatus "${st}":`);
    samples.forEach(s => console.log(`  - [${s.id}] ${s.name} (isActive: ${s.isActive})`));
  }

  // Check subcollection variants
  console.log('\n=== AUDITING SUBCOLLECTION VARIANTS ===');
  const varSnap = await db.collectionGroup('variants').get();
  console.log(`Total Subcollection Variants: ${varSnap.docs.length}`);

  const varStatusCounts = {};
  for (const doc of varSnap.docs) {
    const data = doc.data();
    const st = data.status || 'undefined';
    varStatusCounts[st] = (varStatusCounts[st] || 0) + 1;
  }

  console.log('\n--- Variant Status Counts ---');
  for (const [st, count] of Object.entries(varStatusCounts)) {
    console.log(`  • "${st}": ${count} variants`);
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

auditStatuses().catch(console.error);
