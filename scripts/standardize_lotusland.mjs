import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

async function standardizeLotusland() {
  console.log('--- Standardizing Lotusland Canonical Supplier ID ---');

  const oldDocSnap = await db.collection('suppliers').doc('OLlBbQjgrj6tY7GmM2Jo').get();
  if (oldDocSnap.exists) {
    const oldData = oldDocSnap.data();
    
    // Create supplier-lotusland
    await db.collection('suppliers').doc('supplier-lotusland').set({
      ...oldData,
      id: 'supplier-lotusland',
      supplier_id: 'supplier-lotusland',
      legacyDocId: 'OLlBbQjgrj6tY7GmM2Jo',
      updatedAt: new Date().toISOString()
    });
    console.log('✅ Created supplier-lotusland document in Firestore.');

    // Update products with supplierId = 'supplier-lotusland'
    const prodsSnap = await db.collection('products').where('supplierName', '==', 'Lotusland Limited').get();
    const batch = db.batch();
    prodsSnap.docs.forEach(doc => {
      batch.update(doc.ref, {
        supplierId: 'supplier-lotusland',
        supplierName: 'Lotusland Limited'
      });
    });
    await batch.commit();
    console.log(`✅ Updated ${prodsSnap.size} Lotusland products to use supplierId: supplier-lotusland.`);
  }

  process.exit(0);
}

standardizeLotusland().catch(console.error);
