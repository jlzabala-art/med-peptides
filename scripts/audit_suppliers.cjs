const admin = require('firebase-admin');

// Initialize Firebase Admin (assumes GOOGLE_APPLICATION_CREDENTIALS is set)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

async function auditSuppliers() {
  console.log('Auditing Suppliers...');

  try {
    // 1. Get all wholesellers
    const wholesellersSnapshot = await db.collection('wholesellers').get();
    const wholesellers = {};
    wholesellersSnapshot.forEach(doc => {
      const data = doc.data();
      wholesellers[doc.id] = {
        name: data.name,
        productsSupplied: data.productsSupplied || 0,
        status: data.status,
      };
    });

    console.log(`\nFound ${Object.keys(wholesellers).length} wholesellers in database.`);

    // 2. Aggregate products by supplierId
    const productsSnapshot = await db.collection('products').get();
    const productCountsBySupplier = {};
    
    productsSnapshot.forEach(doc => {
      const data = doc.data();
      const sId = data.supplierId || 'UNDEFINED';
      if (!productCountsBySupplier[sId]) {
        productCountsBySupplier[sId] = 0;
      }
      productCountsBySupplier[sId]++;
    });

    console.log(`\nFound ${productsSnapshot.size} total products.`);
    
    // 3. Compare
    console.log('\n--- Comparison ---');
    console.log(String('Supplier ID').padEnd(30) + ' | ' + String('Products in Catalog').padEnd(20) + ' | ' + String('Count in Wholeseller Doc').padEnd(25) + ' | ' + 'Status / Name');
    console.log('-'.repeat(120));

    const allSupplierIds = new Set([...Object.keys(wholesellers), ...Object.keys(productCountsBySupplier)]);

    for (const id of allSupplierIds) {
      const catalogCount = productCountsBySupplier[id] || 0;
      const wsDoc = wholesellers[id];
      const docCount = wsDoc ? wsDoc.productsSupplied : 'N/A (No Doc)';
      const name = wsDoc ? wsDoc.name : 'Unknown';
      const status = wsDoc ? wsDoc.status : 'Unknown';

      let mismatchIndicator = catalogCount !== (wsDoc ? wsDoc.productsSupplied : 0) ? '*' : ' ';
      
      console.log(`${mismatchIndicator} ${String(id).padEnd(28)} | ${String(catalogCount).padEnd(20)} | ${String(docCount).padEnd(25)} | [${status}] ${name}`);
    }

    console.log('\n* indicates a mismatch between actual catalog count and the count stored in the wholeseller document.');

  } catch (error) {
    console.error('Error auditing suppliers:', error);
  } finally {
    process.exit();
  }
}

auditSuppliers();
