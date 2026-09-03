import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ projectId: 'med-peptides-app' });
const db = getFirestore();

async function run() {
  try {
    console.log('Starting productsSupplied backfill...');
    
    // 1. Fetch all products and count by supplier
    const productsSnapshot = await db.collection('products').get();
    console.log(`Fetched ${productsSnapshot.size} products.`);
    
    const supplierCounts = {};
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      // Use 'supplier' which is what Lotusland seems to use, or supplierName
      const supplierName = data.supplier || data.supplierName || 'Unknown';
      if (supplierName && supplierName !== 'Unknown') {
        supplierCounts[supplierName] = (supplierCounts[supplierName] || 0) + 1;
      }
    });

    console.log('Product counts by supplier:', supplierCounts);

    // 2. Fetch all wholesellers
    const wholesellersSnapshot = await db.collection('wholesellers').get();
    console.log(`Fetched ${wholesellersSnapshot.size} wholesellers.`);

    const batch = db.batch();
    let updatesCount = 0;

    wholesellersSnapshot.forEach(doc => {
      const data = doc.data();
      const companyName = data.companyName || data.name;
      
      let actualCount = supplierCounts[companyName] || 0;
      
      if (data.productsSupplied !== actualCount) {
        console.log(`Updating ${companyName}: ${data.productsSupplied} -> ${actualCount}`);
        batch.update(doc.ref, { productsSupplied: actualCount });
        updatesCount++;
      }
    });

    if (updatesCount > 0) {
      console.log(`Committing ${updatesCount} updates...`);
      await batch.commit();
      console.log('Successfully updated wholesellers.');
    } else {
      console.log('No updates needed. Everything is in sync.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
}

run();
