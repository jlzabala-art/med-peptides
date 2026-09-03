import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./src/scripts/serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function updateStorage() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();
  
  let batch = db.batch();
  let count = 0;
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Check if storage_conditions is missing or has the extreme -80C value
    if (!data.storage_conditions || 
        data.storage_conditions.dry === '-20°C to -80°C' || 
        data.storage_conditions.dry === undefined) {
        
        batch.update(doc.ref, {
          storage_conditions: {
            dry: 'Store at -20°C (Freezer) or Room Temp (short term)',
            reconstituted: '2°C to 8°C (Refrigerated)'
          }
        });
        count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Updated ${count} products with correct storage conditions in the database.`);
  } else {
    console.log('No products needed updating.');
  }
}

updateStorage().catch(console.error);
