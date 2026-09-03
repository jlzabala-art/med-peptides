import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/joseluiszabala/regenpept-web.nosync/.env.local' });

if (!process.env.FIREBASE_PRIVATE_KEY) {
  console.error("Missing FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function fixDosage() {
  const productsRef = db.collection('products');
  const productsSnapshot = await productsRef.get();
  
  let totalFixed = 0;

  for (const doc of productsSnapshot.docs) {
    const variantsRef = doc.ref.collection('variants');
    const variantsSnapshot = await variantsRef.get();
    
    for (const variantDoc of variantsSnapshot.docs) {
      const data = variantDoc.data();
      const dosage = data.dosage || data.dose;
      
      if (typeof dosage === 'string' && dosage.includes('|')) {
        // e.g. "10 mg | 10 mg" -> extract the first part
        const cleanDosage = dosage.split('|')[0].trim();
        console.log(`Fixing ${doc.id} / variant ${variantDoc.id}: "${dosage}" -> "${cleanDosage}"`);
        
        const updateData = {};
        if (data.dosage) updateData.dosage = cleanDosage;
        if (data.dose) updateData.dose = cleanDosage;
        
        await variantDoc.ref.update(updateData);
        totalFixed++;
      }
    }
  }
  
  console.log(`Fixed ${totalFixed} variants.`);
  process.exit(0);
}

fixDosage().catch(console.error);
