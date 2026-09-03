import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const wSnap = await db.collection('wholesellers').get();
  
  wSnap.forEach(doc => {
    const data = doc.data();
    const name = (data.companyName || data.name || '').toLowerCase();
    
    if (name.includes('poland') || name.includes('polski') || data.country === 'Poland') {
      console.log('Found Polish supplier:', doc.id, data.companyName || data.name, 'Products Supplied:', data.productsSupplied);
    }
    
    if (name.includes('lotus')) {
        console.log('Found Lotus:', doc.id, data.companyName || data.name);
        db.collection('wholesellers').doc(doc.id).update({ country: 'China' });
    }
  });
}

run().catch(console.error);
