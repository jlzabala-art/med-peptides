import admin from 'firebase-admin';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function run() {
  const data = JSON.parse(fs.readFileSync('./src/scripts/supplier_import.json', 'utf8'));
  const batch = db.batch();
  let count = 0;

  for (const product of data.products) {
    const componentsString = product.components.map(c => `${c.name}-${c.amount}${c.unit}`).join('_');
    // Create a unique hash/slug for the unique key
    const uniqueKeyString = `${product.supplier}_${componentsString}_${product.dosage_form}_${product.container_volume}${product.container_volume_unit}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    
    // We will save this as a product document with this ID
    const docRef = db.collection('products').doc(uniqueKeyString);
    
    // Check if doc exists to not overwrite historical prices, or just upsert since batch.set with merge: true will update
    const docSnap = await docRef.get();
    
    const productData = {
      ...product,
      supplier: product.supplier,
      name: product.product_name, // Map for UI compatibility
      price: product.net_price_usd, // Base price in USD for comparison
      currency: "USD",
      stockStatus: "In Stock", // Default assumption unless known otherwise
      importBatch: "Supplier Normalized Pricing V1",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!docSnap.exists) {
      productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      batch.set(docRef, productData);
      console.log(`Created new SKU: ${uniqueKeyString}`);
      count++;
    } else {
      // Upsert: Create a new supplier-price version if price differs (or just update)
      // "Do not overwrite historical prices. Create a new supplier-price version when an existing SKU already has a different price."
      const existingData = docSnap.data();
      if (existingData.net_price_usd !== product.net_price_usd) {
        // Save history in a subcollection or array
        const historyRef = docRef.collection('price_history').doc();
        batch.set(historyRef, {
          previousPrice: existingData.net_price_usd,
          newPrice: product.net_price_usd,
          changedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Updated price for SKU: ${uniqueKeyString}`);
      } else {
        console.log(`Unchanged SKU: ${uniqueKeyString}`);
      }
      batch.set(docRef, productData, { merge: true });
      count++;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Successfully processed ${count} products.`);
  }
}

run().catch(console.error);
