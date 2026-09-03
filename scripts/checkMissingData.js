import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(readFileSync('/Users/joseluiszabala/.gemini/antigravity-ide/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

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
        missingDataProducts.add(`${productName} (Supplier: ${v.supplierName || v.supplier || 'Unknown'}) - Missing: ${missingFields.join(', ')}`);
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
      console.log(`- ${item}`);
    }
  }
}

checkMissingData().catch(console.error);
