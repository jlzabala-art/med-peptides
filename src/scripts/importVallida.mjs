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
  const data = JSON.parse(fs.readFileSync('./src/scripts/vallida_import.json', 'utf8'));
  const batch = db.batch();
  let count = 0;

  // 1. Upsert Supplier
  const supplierId = data.supplier.supplier_name.toLowerCase().trim();
  const supplierRef = db.collection('wholesellers').doc(supplierId);
  const supplierSnap = await supplierRef.get();
  
  if (!supplierSnap.exists) {
    batch.set(supplierRef, {
      name: data.supplier.supplier_name,
      status: data.supplier.status,
      country: data.supplier.country,
      type: data.supplier.supplier_type,
      defaultCurrency: data.supplier.default_source_currency,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Created new supplier: ${data.supplier.supplier_name}`);
  }

  // 2. Upsert Products
  for (const product of data.products) {
    // Unique Key: supplier_id + normalized component set + component strengths + dosage_form + presentation + container_volume_ml
    const componentsString = product.components.map(c => `${c.name}-${c.amount}${c.unit}`).join('_');
    const uniqueKeyString = `${supplierId}_${componentsString}_${product.dosage_form}_${product.presentation}_${product.container_volume_ml}ml`
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    
    const docRef = db.collection('products').doc(uniqueKeyString);
    const docSnap = await docRef.get();
    
    // Using canonical_price_usd for UI compatibility with recent updates
    const productData = {
      ...product,
      supplier: data.supplier.supplier_name,
      name: product.product_name, // Map for UI compatibility
      canonicalName: product.product_name,
      price: product.provisional_price_usd, // Base price in USD for comparison
      canonical_price_usd: product.provisional_price_usd, 
      price_per_mg_usd: product.provisional_price_usd_per_mg || (product.provisional_price_usd / product.total_combined_active_mg),
      currency: "USD",
      stockStatus: "In Stock",
      importBatch: "Vallida Import V1",
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (!docSnap.exists) {
      productData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      batch.set(docRef, productData);
      console.log(`Created new SKU: ${uniqueKeyString}`);
      count++;
    } else {
      const existingData = docSnap.data();
      if (existingData.canonical_price_usd !== productData.canonical_price_usd) {
        const historyRef = docRef.collection('price_history').doc();
        batch.set(historyRef, {
          previousPrice: existingData.canonical_price_usd,
          newPrice: productData.canonical_price_usd,
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
    console.log(`Successfully processed ${count} products for Vallida.`);
  }
}

run().catch(console.error);
