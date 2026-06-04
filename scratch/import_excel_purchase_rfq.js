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
      itemName: name,
      quantity: quantity,
      unit: unit || 'g',
      expectedCost: 0,
      supplierUnitCost: 0,
      itemDiscount: 0
    });
  }

  console.log(`Parsed ${items.length} items from Excel.`);

  // Generate RFQ Number based on count
  const snapshot = await db.collection('purchase_rfqs').get();
  const rfqCount = snapshot.size;
  const nextNum = String(rfqCount + 1).padStart(3, '0');
  const rfqNumber = `RFQ-2026-${nextNum}`;

  const rfqDoc = {
    rfqNumber: rfqNumber,
    supplierName: 'Lotusland Chemicals Ltd',
    supplierEmail: 'sales@lotusland.com',
    status: 'DRAFT',
    items: items,
    globalDiscount: 0,
    notes: 'Imported from Sterile Lab Request raw materials list (no prices).',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [
      {
        status: 'DRAFT',
        changedAt: new Date().toISOString(),
        changedBy: 'System (Imported from temp_rfq.xlsx)'
      }
    ]
  };

  const docRef = await db.collection('purchase_rfqs').add(rfqDoc);
  console.log(`Successfully created RFQ ${rfqNumber} in purchase_rfqs collection! Doc ID: ${docRef.id}`);
}

run().catch(console.error);
