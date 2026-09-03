const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }
const db = admin.firestore();

async function checkMissingData() {
  console.log('Fetching all products and variants from Firestore...');
  const productsSnapshot = await db.collection('products').get();
  
  let missingDosageCount = 0;
  let missingPresentationCount = 0;
  
  // Set to collect unique peptide names that have missing data
  const missingDataProducts = new Set();
  
  for (const productDoc of productsSnapshot.docs) {
    const productName = productDoc.data().name || productDoc.data().canonicalName || productDoc.id;
    const variantsRef = productDoc.ref.collection('variants');
    const variantsSnapshot = await variantsRef.get();
    
    for (const variantDoc of variantsSnapshot.docs) {
      const v = variantDoc.data();
      
      const hasDosage = v.dosage || v.dose || v.strength || v.dosage_per_vial;
      const hasPresentation = v.presentation || v.format || v.presentationType;
      
      let isMissing = false;
      let missingFields = [];
      
      if (!hasDosage) {
        missingDosageCount++;
        missingFields.push('Dosage');
        isMissing = true;
      }
      
      if (!hasPresentation) {
        missingPresentationCount++;
        missingFields.push('Presentation');
        isMissing = true;
      }
      
      if (isMissing) {
        missingDataProducts.add(`- ${productName} (Supplier: ${v.supplierName || v.supplier || 'Unknown'}) - Missing: ${missingFields.join(', ')}`);
      }
    }
  }
  
  console.log('\n--- Missing Data Report ---');
  console.log(`Variants missing Dosage: ${missingDosageCount}`);
  console.log(`Variants missing Presentation: ${missingPresentationCount}`);
  console.log('\nDetailed list of peptides/variants with missing data:');
  
  if (missingDataProducts.size === 0) {
    console.log('All variants have dosage and presentation!');
  } else {
    for (const item of missingDataProducts) {
      console.log(item);
    }
  }
  process.exit(0);
}

checkMissingData().catch(e => { console.error(e); process.exit(1); });
