require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function setPrices() {
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
      // Wholesaler: 20% markup
      const wholesalePrice = Number((cost * 1.20).toFixed(2));
      const wholesaleKit = kitCost ? Number((kitCost * 1.20).toFixed(2)) : undefined;
      
      // Clinic / Retail: 30% markup
      const retailPrice = Number((cost * 1.30).toFixed(2));
      const retailKit = kitCost ? Number((kitCost * 1.30).toFixed(2)) : undefined;
      
      const pricingUpdate = {
        'pricing.wholesale.perUnit': wholesalePrice,
        'pricing.wholesale.currency': 'USD',
        'pricing.retail.perUnit': retailPrice,
        'pricing.retail.currency': 'USD',
      };
      
      if (wholesaleKit) pricingUpdate['pricing.wholesale.kit'] = wholesaleKit;
      if (retailKit) pricingUpdate['pricing.retail.kit'] = retailKit;
      
      batch.update(doc.ref, pricingUpdate);
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Updated pricing for ${count} Lotusland products (20% wholesale, 30% retail).`);
  } else {
    console.log('No products updated.');
  }
}
setPrices().catch(console.error);
