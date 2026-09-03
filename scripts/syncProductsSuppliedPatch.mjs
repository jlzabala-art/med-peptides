import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();

async function run() {
  try {
    const batch = db.batch();
    let count = 0;

    const mappings = {
      'Lotusland Limited': 98, // Lotusland + LotusLand
      'Fagron Iberica, S.A.U': 93,
      'Fagron Genomics Labs': 5,
      '24Genetics SL': 8,
      'NP Labs International Compounding Pharmacy': 58,
    };

    const snapshot = await db.collection('wholesellers').get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const companyName = data.companyName || data.name;
      
      if (mappings[companyName] !== undefined) {
        batch.update(doc.ref, { productsSupplied: mappings[companyName] });
        count++;
        console.log(`Setting ${companyName} to ${mappings[companyName]}`);
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log('Fixed supplier counts manually.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
