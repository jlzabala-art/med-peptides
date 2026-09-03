import admin from 'firebase-admin';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function runUpsert() {
  const data = JSON.parse(fs.readFileSync('./src/scripts/data/pod_poland_import.json', 'utf8'));
  
  const supplierId = 'pod-poland';
  const supplierName = 'POD Poland';
  
  let count = 0;
  
  // Need to process in batches of 500 for Firestore
  let batch = db.batch();
  
  for (const item of data.products) {
    const docRef = db.collection('products').doc(); // Auto ID
    
    const productData = {
      name: item.product_name,
      supplier: supplierName,
      status: 'active',
      
      supplier_sku: item.supplier_sku,
      components: item.components,
      
      // Default attributes
      dosage_form: data.default_product_attributes.dosage_form,
      presentation: data.default_product_attributes.presentation,
      device_type: data.default_product_attributes.device_type,
      supply_state: data.default_product_attributes.supply_state,
      
      // Prices and Currency
      canonical_price_usd: item.net_price_usd,
      currency: data.source.source_currency,
      gross_price_aed: item.gross_price_aed,
      net_price_aed: item.net_price_aed,
      vat_rate: item.vat_rate,
      
      // Totals
      total_active_mg: item.total_active_mg || item.total_combined_active_mg || 0,
      
      createdAt: new Date().toISOString()
    };
    
    batch.set(docRef, productData);
    count++;
  }
  
  // Update Supplier productsSupplied count
  const supplierRef = db.collection('wholesellers').doc(supplierId);
  
  // First fetch the current count to increment properly
  const sSnap = await supplierRef.get();
  const currentCount = sSnap.exists ? (sSnap.data().productsSupplied || 0) : 0;
  
  batch.update(supplierRef, { productsSupplied: currentCount + count });
  
  await batch.commit();
  console.log(`Successfully imported ${count} new products for POD Poland.`);
  console.log(`Updated pod-poland productsSupplied to ${currentCount + count}.`);
}

runUpsert().catch(console.error);
