require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function fixMasterPrices() {
  const SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  
  const snap = await db.collection('products')
    .where('supplierId', '==', SUPPLIER_ID)
    .where('isActive', '==', true)
    .get();
    
  let count = 0;
  const batch = db.batch();
  
  snap.docs.forEach(doc => {
    const data = doc.data();
    const cost = data.supplierUnitCostUSD;
    const kitCost = data.supplierKitCostUSD;
    
    if (cost != null) {
      const pricingUpdate = {
        'pricing.master.perUnit': cost,
        'pricing.master.currency': 'USD',
      };
      
      if (kitCost) pricingUpdate['pricing.master.kit'] = kitCost;
      
      batch.update(doc.ref, pricingUpdate);
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Set master pricing for ${count} Lotusland products.`);
  } else {
    console.log('No products updated.');
  }
}
fixMasterPrices().catch(console.error);
