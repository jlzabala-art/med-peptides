import { adminDb } from './src/lib/firebaseAdmin.js';
import { PRODUCT_FORMATS } from './src/config/formats.js';

const formatMap = {
  'Vial': 'vial',
  'vial': 'vial',
  'Pre-filled Pen': 'prefilled_pen',
  'Prefilled Pen': 'prefilled_pen',
  'Capsule': 'capsule',
  'capsule': 'capsule',
  'Tablet': 'tablet',
  'tablet': 'tablet',
  'Cream': 'cream',
  'cream': 'cream',
  'Nasal Spray': 'nasal_spray',
  'nasal spray': 'nasal_spray',
  'Troche': 'troche',
  'troche': 'troche'
};

async function migrateVariantSubcollections() {
  console.log('Migrating variants subcollections...');
  
  // Fetch suppliers to map name to id
  const suppliersSnap = await adminDb.collection('suppliers').get();
  const supplierIdMap = {};
  suppliersSnap.forEach(s => {
    supplierIdMap[s.data().name?.toLowerCase()] = s.id;
    if (s.data().companyName) {
      supplierIdMap[s.data().companyName.toLowerCase()] = s.id;
    }
  });

  const variantsSnap = await adminDb.collectionGroup('variants').get();
  const batch = adminDb.batch();
  let updatedCount = 0;
  let batchCount = 0;

  for (const doc of variantsSnap.docs) {
    const data = doc.data();
    let updates = {};

    // Format
    if (data.presentation && formatMap[data.presentation]) {
      if (data.presentation !== formatMap[data.presentation]) {
        updates.presentation = formatMap[data.presentation];
      }
    }

    // Supplier
    if (!data.supplierId && data.supplier) {
      const sName = data.supplier.toLowerCase().trim();
      let foundId = null;
      if (supplierIdMap[sName]) {
        foundId = supplierIdMap[sName];
      } else if (sName.includes('lotus')) {
        foundId = 'OLlBbQjgrj6tY7GmM2Jo';
      }
      
      if (foundId) {
        updates.supplierId = foundId;
      }
    } else if (data.supplierId === 'zoho_1183263000025439003') {
       // Correcting wrong supplier ID if needed, wait, let's just map all lotus to OLlBbQjgrj6tY7GmM2Jo
       if (data.supplier && data.supplier.toLowerCase().includes('lotus')) {
         updates.supplierId = 'OLlBbQjgrj6tY7GmM2Jo';
       }
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      updatedCount++;
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        console.log(`Committed ${batchCount} updates`);
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`Committed final ${batchCount} updates`);
  }

  console.log(`Successfully migrated ${updatedCount} variants in subcollections.`);
}

migrateVariantSubcollections();
