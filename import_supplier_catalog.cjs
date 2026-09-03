const admin = require('firebase-admin');
const fs = require('fs');

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function importCatalog() {
  console.log('Reading JSON file...');
  const dataRaw = fs.readFileSync('./Europeptides/atlas_ai_firebase_suppliers_import.json', 'utf8');
  const data = JSON.parse(dataRaw);
  
  console.log('Importing Suppliers...');
  const batch = db.batch();
  
  // 1. Import suppliers
  if (data.suppliers) {
    for (const supplier of data.suppliers) {
      const ref = db.collection('suppliers').doc(supplier.supplier_id);
      batch.set(ref, {
        ...supplier,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    }
  }

  // Commit initial suppliers
  await batch.commit();
  console.log('Suppliers imported.');
  
  // 2. Process items
  const imports = data.supplier_imports || [];
  let count = 0;
  
  for (const importJob of imports) {
    console.log(`Processing import for: ${importJob.supplier_id}`);
    
    // Process items in chunks
    const BATCH_SIZE = 400;
    const items = importJob.items || [];
    
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const chunk = items.slice(i, i + BATCH_SIZE);
      const writeBatch = db.batch();
      
      for (const item of chunk) {
        // Master product candidate
        if (item.master_product_candidate) {
          const mp = item.master_product_candidate;
          const mpRef = db.collection('masterProducts').doc(mp.master_product_id);
          writeBatch.set(mpRef, {
            ...mp,
            product_id: mp.master_product_id,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        }
        
        // Supplier products
        const spRef = db.collection('supplierProducts').doc(`${importJob.supplier_id}_${item.source_raw_name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`);
        writeBatch.set(spRef, {
          supplier_id: importJob.supplier_id,
          supplier_raw_name: item.source_raw_name,
          master_product_id: item.master_product_candidate?.master_product_id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Offers
        if (item.offers) {
          for (const offer of item.offers) {
            // Safety: do not touch lotusland via external import unless explicitly requested, but this script is specific.
            const offerRef = db.collection('supplierOffers').doc(offer.supplier_offer_id);
            writeBatch.set(offerRef, {
              ...offer,
              master_product_id: item.master_product_candidate?.master_product_id,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            count++;
          }
        }
      }
      
      await writeBatch.commit();
      console.log(`Committed batch of ${chunk.length} items`);
    }
  }
  
  console.log(`Import completed. Total offers imported: ${count}`);
}

importCatalog().then(() => {
  console.log('Done.');
  process.exit(0);
}).catch(e => {
  console.error('Error during import:', e);
  process.exit(1);
});
