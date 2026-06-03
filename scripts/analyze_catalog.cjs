const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

async function analyze() {
  console.log("--- Analyzing Products ---");
  const productsSnap = await db.collection("products").get();
  const categories = new Set();
  const sampleProducts = [];
  productsSnap.forEach(doc => {
    const data = doc.data();
    categories.add(data.category || "Uncategorized");
    if (sampleProducts.length < 5) {
      sampleProducts.push({ name: data.name, category: data.category, sku: data.sku, type: data.type });
    }
  });
  console.log("Product Categories:", Array.from(categories));
  console.log("Sample Products:", sampleProducts);

  console.log("\n--- Analyzing Protocols ---");
  const protocolsSnap = await db.collection("protocols").get();
  console.log(`Total Protocols: ${protocolsSnap.size}`);
  const protocolCategories = new Set();
  protocolsSnap.forEach(doc => {
    const data = doc.data();
    if (data.category) protocolCategories.add(data.category);
    if (data.tags) data.tags.forEach(t => protocolCategories.add(t));
  });
  console.log("Protocol Categories/Tags:", Array.from(protocolCategories));

  console.log("\n--- Checking for Supplements & Testing ---");
  const collections = await db.listCollections();
  const collectionNames = collections.map(c => c.id);
  console.log("All Collections in Firestore:", collectionNames);
}

analyze().catch(console.error);
