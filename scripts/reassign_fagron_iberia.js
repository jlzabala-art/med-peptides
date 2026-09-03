import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

async function run() {
  console.log('--- Starting Reassignment of Products ---');
  let movedToIberia = 0;
  let leftInGenomics = 0;
  let skippedPeptides = 0;

  const FAGRON_IBERIA_NAME = 'Fagron Iberica, S.A.U';
  const FAGRON_IBERIA_ID = 'zoho_1183263000025439003';
  const FAGRON_GENOMICS_NAME = 'Fagron Genomics';
  const FAGRON_GENOMICS_ID = 'lw90ZNykQHeBcUgFLnDs';

  const productsSnap = await db.collection('products').get();
  
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const supplierName = data.supplier || '';
    const category = data.category || '';
    
    // Solo modificar si NO tiene proveedor (UNKNOWN), o si estaba asignado erróneamente a un "Fagron"
    // No tocamos cosas que ya sean NP LABS, POD Poland, etc.
    if (!supplierName || supplierName === 'UNKNOWN' || supplierName.includes('Fagron')) {
      // Excepción crítica: Nada de péptidos a Fagron Iberia
      if (category.toLowerCase().includes('peptide')) {
          if (supplierName === 'UNKNOWN' || supplierName === '') {
             skippedPeptides++;
          }
          continue;
      }

      const nameLower = (data.name || '').toLowerCase();
      
      const isTest = nameLower.includes('genomic') || 
                     nameLower.includes('genetic') || 
                     nameLower.includes('test') || 
                     nameLower.includes('nutrigen');
      
      if (isTest) {
        if (data.supplier !== FAGRON_GENOMICS_NAME || data.supplierId !== FAGRON_GENOMICS_ID) {
          batch.update(doc.ref, {
            supplier: FAGRON_GENOMICS_NAME,
            supplierId: FAGRON_GENOMICS_ID
          });
          batchCount++;
          console.log(`[TEST] Assigned to Genomics: ${data.name}`);
          leftInGenomics++;
        }
      } else {
        if (data.supplier !== FAGRON_IBERIA_NAME) {
          batch.update(doc.ref, {
            supplier: FAGRON_IBERIA_NAME,
            supplierId: FAGRON_IBERIA_ID
          });
          batchCount++;
          console.log(`[COMPOUND] Assigned to Iberia: ${data.name}`);
          movedToIberia++;
        }
      }

      if (batchCount === 400) {
        await batch.commit();
        batchCount = 0;
        batch = db.batch();
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('--- Summary ---');
  console.log(`Products assigned to Fagron Iberica, S.A.U: ${movedToIberia}`);
  console.log(`Test Products assigned to Fagron Genomics: ${leftInGenomics}`);
  console.log(`Peptides intentionally skipped (no supplier assigned): ${skippedPeptides}`);
  console.log('Done.');
  process.exit(0);
}

run().catch(console.error);
