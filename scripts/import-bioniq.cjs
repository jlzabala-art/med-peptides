const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (adjust the service account path if needed, or use default)
// For local scripts, typically we use an env var or a local json file. 
// Assuming process.env.GOOGLE_APPLICATION_CREDENTIALS is set, or we can use the default credential.
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase Admin already initialized or missing credentials.');
}

const db = admin.firestore();

async function main() {
  console.log('--- Starting Bioniq Dry Run ---');
  
  // 1. Ensure Bioniq Supplier exists
  const suppliersRef = db.collection('suppliers');
  const bioniqQuery = await suppliersRef.where('name', '==', 'Bioniq').get();
  let bioniqSupplierId = null;

  if (bioniqQuery.empty) {
    console.log('Supplier "Bioniq" not found. Creating in dry-run mode (skipping actual DB write for now).');
    // If we wanted to create it:
    // const newDoc = await suppliersRef.add({ name: 'Bioniq', status: 'active', createdAt: admin.firestore.FieldValue.serverTimestamp() });
    // bioniqSupplierId = newDoc.id;
  } else {
    bioniqSupplierId = bioniqQuery.docs[0].id;
    console.log(`Supplier "Bioniq" found with ID: ${bioniqSupplierId}`);
  }

  // 2. Read the JSON file
  const jsonPath = path.join(__dirname, '../AI Prompts/Bioniq/Bioniq Master Price.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`JSON file not found at ${jsonPath}`);
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const bioniqData = JSON.parse(rawData);

  console.log(`Loaded ${bioniqData.records.length} records from JSON.`);

  // 3. Check for matching products/peptides
  const productsRef = db.collection('products');
  const allProductsSnapshot = await productsRef.get();
  const allProducts = allProductsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  const presentationsRef = db.collection('presentations');
  const allPresentationsSnapshot = await presentationsRef.get();
  const allPresentations = allPresentationsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  let matched = 0;
  let unresolved = 0;

  for (const record of bioniqData.records) {
    const peptideName = record.peptide?.display_name || record.source_label;
    const presentationName = record.presentation?.display_name || 'Single Use Pen';

    const matchProduct = allProducts.find(p => p.name && p.name.toLowerCase().includes(peptideName.toLowerCase()));
    const matchPresentation = allPresentations.find(p => p.name && p.name.toLowerCase().includes(presentationName.toLowerCase()));

    if (matchProduct && matchPresentation) {
      console.log(`[MATCH] ${record.source_label} -> Product: ${matchProduct.name} | Presentation: ${matchPresentation.name}`);
      matched++;
    } else {
      console.log(`[UNRESOLVED] ${record.source_label}`);
      if (!matchProduct) console.log(`  - Peptide not found: ${peptideName}`);
      if (!matchPresentation) console.log(`  - Presentation not found: ${presentationName}`);
      unresolved++;
    }
  }

  console.log(`\n--- Dry Run Summary ---`);
  console.log(`Matched: ${matched}`);
  console.log(`Unresolved: ${unresolved}`);
}

main().catch(console.error);
