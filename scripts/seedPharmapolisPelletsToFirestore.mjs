// scripts/seedPharmapolisPelletsToFirestore.mjs
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
  rawPk = rawPk.slice(1, -1);
}
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

if (!privateKey || !clientEmail) {
  console.error('❌ Missing Firebase Admin credentials');
  process.exit(1);
}

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

// Import pellets data
import { PHARMAPOLIS_PELLETS } from '../src/data/pharmapolisPelletsRegistry.js';

async function seed() {
  console.log('🚀 Seeding 4 Pharmapolis Hormone Pellets to Firestore...');
  const batch = db.batch();

  for (const [key, pellet] of Object.entries(PHARMAPOLIS_PELLETS)) {
    const docRef = db.collection('products').doc(pellet.id);
    const dataToSave = {
      ...pellet,
      status: 'active',
      isActive: true,
      updatedAt: new Date().toISOString()
    };
    batch.set(docRef, dataToSave, { merge: true });
    console.log(`Prepared doc: ${pellet.id}`);
  }

  await batch.commit();
  console.log('✅ Successfully committed 4 Hormone Pellets to Firestore `products` collection!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
