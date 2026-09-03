import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.warn("No FIREBASE_SERVICE_ACCOUNT in env. Assuming default credentials or emulator.");
}

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : undefined;

if (serviceAccount) {
  initializeApp({ credential: cert(serviceAccount) });
} else {
  initializeApp(); // Use application default credentials
}

const db = getFirestore();

async function run() {
  console.log("Searching for Kasia...");
  const kasiaQuery = await db.collection('users').where('firstName', '==', 'Kasia').get();
  
  let kasiaId = null;
  if (!kasiaQuery.empty) {
    kasiaId = kasiaQuery.docs[0].id;
    console.log(`Found Kasia: ${kasiaId}`);
  } else {
    console.log("Kasia not found by firstName! Let's search displayName...");
    const kasiaDisplayQuery = await db.collection('users').get();
    const kasiaDoc = kasiaDisplayQuery.docs.find(d => {
        const data = d.data();
        return (data.firstName && data.firstName.includes('Kasia')) || 
               (data.displayName && data.displayName.includes('Kasia')) ||
               (data.email && data.email.includes('kasia'));
    });
    if (kasiaDoc) {
      kasiaId = kasiaDoc.id;
      console.log(`Found Kasia by full search: ${kasiaId}`);
    } else {
      console.log("Kasia completely not found.");
    }
  }

  console.log("\nSearching for PharmaPolis...");
  let pharmaPolisId = null;
  const supplierQuery = await db.collection('users').where('role', '==', 'supplier').get();
  
  const pharmaDoc = supplierQuery.docs.find(d => {
    const data = d.data();
    return (data.companyName && data.companyName.toLowerCase().includes('pharmapolis')) ||
           (data.firstName && data.firstName.toLowerCase().includes('pharmapolis')) ||
           (data.displayName && data.displayName.toLowerCase().includes('pharmapolis'));
  });

  if (pharmaDoc) {
    pharmaPolisId = pharmaDoc.id;
    console.log(`Found PharmaPolis: ${pharmaPolisId}`);
  } else {
    console.log("PharmaPolis not found. Creating it...");
    pharmaPolisId = uuidv4();
    await db.collection('users').doc(pharmaPolisId).set({
      id: pharmaPolisId,
      role: 'supplier',
      companyName: 'PharmaPolis',
      displayName: 'PharmaPolis B2B',
      email: 'contact@pharmapolis.com',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log(`Created PharmaPolis: ${pharmaPolisId}`);
  }
  
  console.log("\n--- RESULT ---");
  console.log(`KASIA_ID="${kasiaId}"`);
  console.log(`PHARMAPOLIS_ID="${pharmaPolisId}"`);

  // Cleanup duplicates from previous import
  console.log("\nCleaning up previous import duplicates...");
  const oldImports = await db.collection('users').where('tags', 'array-contains', 'Imported').get();
  if (!oldImports.empty) {
    const batch = db.batch();
    oldImports.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Deleted ${oldImports.size} previous imported records.`);
  }

}

run().catch(console.error);
