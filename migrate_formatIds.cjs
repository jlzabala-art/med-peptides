require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

const app = getApps().length === 0 ? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
}) : getApps()[0];

const db = getFirestore(app);

function inferFormatId(obj) {
  let text = [obj.formatId, obj.format, obj.presentation, obj.dosage_form].filter(Boolean).join(' ').toLowerCase();
  
  if (text.includes('pen')) return 'pen';
  if (text.includes('nasal') || text.includes('spray')) return 'nasal_spray';
  if (text.includes('caps') || text.includes('tablet')) return 'capsule';
  if (text.includes('cream')) return 'cream';
  if (text.includes('topical')) return 'topical';
  if (text.includes('vial')) return 'vial';
  
  return null; // fallback to null if nothing matched
}

async function run() {
  const productsSnap = await db.collection('products').get();
  
  let batch = db.batch();
  let count = 0;
  
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let updated = false;
    let updates = {};
    
    // Check main product
    const newFormatId = inferFormatId(data);
    if (newFormatId && data.formatId !== newFormatId) {
      updates.formatId = newFormatId;
      updated = true;
    }
    
    // Check variants in array
    if (Array.isArray(data.variants)) {
      const newVariants = [...data.variants];
      let variantsUpdated = false;
      
      for (let i = 0; i < newVariants.length; i++) {
        let v = newVariants[i];
        let vFormatId = inferFormatId(v) || newFormatId || 'vial'; // fallback to vial
        if (v.formatId !== vFormatId) {
          v.formatId = vFormatId;
          variantsUpdated = true;
        }
      }
      
      if (variantsUpdated) {
        updates.variants = newVariants;
        updated = true;
      }
    }
    
    if (updated) {
      batch.update(doc.ref, updates);
      count++;
    }
    
    // Check subcollections
    const variantsSnap = await doc.ref.collection('variants').get();
    for (const vDoc of variantsSnap.docs) {
      const vData = vDoc.data();
      let vFormatId = inferFormatId(vData) || newFormatId || 'vial';
      
      if (vData.formatId !== vFormatId) {
        batch.update(vDoc.ref, { formatId: vFormatId });
        count++;
      }
    }
    
    // Commit batch if large
    if (count > 400) {
      await batch.commit();
      batch = db.batch();
      console.log(`Committed batch...`);
      count = 0;
    }
  }
  
  if (count > 0) {
    await batch.commit();
    console.log(`Final batch committed.`);
  }
  
  console.log('FormatId migration complete.');
}

run().catch(console.error).then(() => process.exit(0));
