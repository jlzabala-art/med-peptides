import admin from 'firebase-admin';
import XLSX from 'xlsx';

admin.initializeApp({
  credential: admin.credential.cert('./serviceAccountKey.json'),
});
const db = admin.firestore();

const localDest = './scratch/temp_rfq.xlsx';

async function run() {
  const workbook = XLSX.readFile(localDest);
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

  const items = [];
  for (const row of rows) {
    const name = row["STERILE LAB REQUEST FOR RAW MATERIALS"];
    const qtyRaw = row["__EMPTY_2"];
    const unit = row["__EMPTY_3"];
    
    // Skip header or empty rows
    if (!name || name === 'List of Raw Materials' || name.toLowerCase().includes('sterile lab request')) {
      continue;
    }
    
    const quantity = parseFloat(qtyRaw) || 0;
    if (quantity === 0) continue; // Skip zero/empty quantities
    
    items.push({
      peptide_name: name,
      dosage: '', // Default/extracted dosage (none in these raw material lists)
      quantity: quantity,
      units: unit || 'vials',
      supplierUnitCost: 0,
      marginPercent: 20,
      clientUnitPrice: 0
    });
  }

  console.log(`Parsed ${items.length} items from Excel.`);

  // Create the RFQ doc
  // Document ca5LreTEmEA721eIKYId had timestamp seconds: 1780262371
  const originalTimestamp = admin.firestore.Timestamp.fromMillis(1780262371 * 1000);
  
  const rfqDoc = {
    clientName: 'Magenta Compounding Pharmacy',
    supplierName: 'LotusLand',
    items: items,
    marginType: 'global',
    globalMargin: 20,
    poAttached: false,
    poFileUrl: null,
    sharedWithSupplier: false,
    status: 'NEW',
    createdAt: originalTimestamp
  };

  const docRef = await db.collection('agency_rfqs').add(rfqDoc);
  console.log(`Successfully created retroactive RFQ lead in Firestore! Doc ID: ${docRef.id}`);
}

run().catch(console.error);
