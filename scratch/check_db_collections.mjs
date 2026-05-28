import { db } from '../scripts/lib/firebase-admin.mjs';

async function main() {
  console.log("Checking Firestore collections...");

  const productsSnap = await db.collection("products").get();
  const supplementsSnap = await db.collection("supplements").get();

  console.log(`\nProducts Collection Count: ${productsSnap.size}`);
  const productTypes = {};
  productsSnap.forEach(doc => {
    const data = doc.data();
    const type = data.productType || data.type || "unknown";
    productTypes[type] = (productTypes[type] || 0) + 1;
  });
  console.log("Product types in 'products' collection:", productTypes);

  console.log(`\nSupplements Collection Count: ${supplementsSnap.size}`);
  const supplementTypes = {};
  supplementsSnap.forEach(doc => {
    const data = doc.data();
    const type = data.productType || data.type || "unknown";
    supplementTypes[type] = (supplementTypes[type] || 0) + 1;
  });
  console.log("Product types in 'supplements' collection:", supplementTypes);

  // Check sample document fields
  console.log("\nSample Peptide doc ('products' collection):");
  const samplePeptide = productsSnap.docs.find(d => {
    const type = d.data().productType || d.data().type;
    return type === 'peptide';
  });
  if (samplePeptide) {
    console.log(`ID: ${samplePeptide.id}`);
    console.log(`Name: ${samplePeptide.data().name}`);
    console.log(`Has typeData: ${!!samplePeptide.data().typeData}`);
    console.log(`typeData structure:`, JSON.stringify(samplePeptide.data().typeData, null, 2));
  } else {
    console.log("No peptide doc found");
  }

  console.log("\nSample Supplement doc ('supplements' collection):");
  const sampleSupp = supplementsSnap.docs[0];
  if (sampleSupp) {
    console.log(`ID: ${sampleSupp.id}`);
    console.log(`Name: ${sampleSupp.data().name}`);
    console.log(`Has typeData: ${!!sampleSupp.data().typeData}`);
    console.log(`typeData structure:`, JSON.stringify(sampleSupp.data().typeData, null, 2));
  } else {
    console.log("No supplement doc found in 'supplements' collection");
  }

  process.exit(0);
}

main().catch(console.error);
