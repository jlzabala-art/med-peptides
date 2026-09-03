require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function setCorrectPrices() {
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
      // Base
      const masterPrice = cost;
      const masterKit = kitCost;

      // Wholesaler: 20% markup over cost
      const wholesalePrice = Number((masterPrice * 1.20).toFixed(2));
      const wholesaleKit = masterKit ? Number((masterKit * 1.20).toFixed(2)) : undefined;
      
      // Clinic: 30% markup over cost
      const clinicPrice = Number((masterPrice * 1.30).toFixed(2));
      const clinicKit = masterKit ? Number((masterKit * 1.30).toFixed(2)) : undefined;

      // Retail (End Consumer): 30% markup over CLINIC
      const retailPrice = Number((clinicPrice * 1.30).toFixed(2));
      const retailKit = clinicKit ? Number((clinicKit * 1.30).toFixed(2)) : undefined;
      
      const pricingUpdate = {
        'pricing.master.perUnit': masterPrice,
        'pricing.master.currency': 'USD',
        'pricing.wholesale.perUnit': wholesalePrice,
        'pricing.wholesale.currency': 'USD',
        'pricing.clinic.perUnit': clinicPrice,
        'pricing.clinic.currency': 'USD',
        'pricing.retail.perUnit': retailPrice,
        'pricing.retail.currency': 'USD',
      };
      
      if (masterKit) pricingUpdate['pricing.master.kit'] = masterKit;
      if (wholesaleKit) pricingUpdate['pricing.wholesale.kit'] = wholesaleKit;
      if (clinicKit) pricingUpdate['pricing.clinic.kit'] = clinicKit;
      if (retailKit) pricingUpdate['pricing.retail.kit'] = retailKit;
      
      batch.update(doc.ref, pricingUpdate);
      count++;
    }
  });
  
  if (count > 0) {
    await batch.commit();
    console.log(`Updated pricing for ${count} Lotusland products: Wholesale (+20% cost), Clinic (+30% cost), Retail (+30% clinic).`);
  } else {
    console.log('No products updated.');
  }
}
setCorrectPrices().catch(console.error);
