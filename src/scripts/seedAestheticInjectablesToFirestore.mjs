/**
 * seedAestheticInjectablesToFirestore.mjs
 * Seeds the 40 Aesthetic Injectables products into Firestore /products
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { AESTHETIC_INJECTABLES_CATALOG } from '../data/aestheticInjectablesRegistry.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

function initAdmin() {
  if (getApps().length > 0) return getApps()[0];

  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

  if (privateKey && clientEmail) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });
  }
  return null;
}

const app = initAdmin();
if (!app) {
  console.log('Firebase Admin could not initialize (no credentials). Skipping direct script seed.');
  process.exit(0);
}

const db = getFirestore(app);

async function main() {
  console.log(`Seeding ${AESTHETIC_INJECTABLES_CATALOG.length} aesthetic injectables to Firestore /products...`);
  const batch = db.batch();
  let count = 0;

  for (const item of AESTHETIC_INJECTABLES_CATALOG) {
    const ref = db.collection('products').doc(item.id);
    batch.set(ref, {
      ...item,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }, { merge: true });
    count++;
  }

  await batch.commit();
  console.log(`✓ Successfully seeded ${count} products to Firestore /products.`);
}

main().catch(err => {
  console.error('Error seeding aesthetic injectables:', err);
  process.exit(1);
});
