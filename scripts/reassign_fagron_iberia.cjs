const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  console.log('--- Starting Reassignment of Fagron Products ---');
  let movedToIberia = 0;
  let leftInGenomics = 0;

  // The IDs for the suppliers
  // Fagron: uYkzfFcs3s6YYBr0OFQP
  // Fagron Genomics: lw90ZNykQHeBcUgFLnDs
  // Fagron Iberica, S.A.U: zoho_1183263000025439003
  
  const FAGRON_IBERIA_NAME = 'Fagron Iberica, S.A.U';
  const FAGRON_GENOMICS_NAME = 'Fagron Genomics';

  // Find all products that might belong to Fagron or Fagron Genomics
  // Since we updated them to "Fagron" or "Fagron Genomics" as supplier name in the previous script,
  // let's query all products and check their supplier field.
  const productsSnap = await db.collection('products').get();
  
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const supplierName = data.supplier || '';
    
    // Check if it's currently assigned to a Fagron entity (but not already exactly Fagron Iberia if we ran it)
    if (supplierName.includes('Fagron') && supplierName !== FAGRON_IBERIA_NAME) {
      const nameLower = (data.name || '').toLowerCase();
      
      // Is it a test?
      const isTest = nameLower.includes('genomic') || 
                     nameLower.includes('genetic') || 
                     nameLower.includes('test') || 
                     nameLower.includes('nutrigen');
      
      if (isTest) {
        // Ensure it is Fagron Genomics
        if (data.supplier !== FAGRON_GENOMICS_NAME || data.supplierId !== 'lw90ZNykQHeBcUgFLnDs') {
          batch.update(doc.ref, {
            supplier: FAGRON_GENOMICS_NAME,
            supplierId: 'lw90ZNykQHeBcUgFLnDs'
          });
          batchCount++;
          console.log(`[TEST] Ensured in Genomics: ${data.name}`);
        }
        leftInGenomics++;
      } else {
        // Compounded product / API -> Move to Fagron Iberia
        batch.update(doc.ref, {
          supplier: FAGRON_IBERIA_NAME,
          supplierId: 'zoho_1183263000025439003'
        });
        batchCount++;
        console.log(`[COMPOUND] Moved to Iberia: ${data.name}`);
        movedToIberia++;
      }

      if (batchCount === 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('--- Summary ---');
  console.log(`Products moved to Fagron Iberica, S.A.U: ${movedToIberia}`);
  console.log(`Products kept in Fagron Genomics: ${leftInGenomics}`);
  console.log('Done.');
  process.exit(0);
}

run().catch(console.error);
