require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);

const legacyFields = ['price_per_kit_10', 'kitCost', 'supplierKitCostUSD', 'perKitPriceUSD', 'kitPriceUSD', 'price', 'retailPrice', 'supplierCost', 'supplierUnitCostUSD', 'perVialPriceUSD', 'perUnit'];

async function migrate() {
  console.log('Migrating products collection (variants array) and variants subcollections...');
  let updatedCount = 0;
  
  // 1. Process all products to fix their nested variants array
  const productsSnap = await db.collection('products').get();
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    let needsUpdate = false;
    let newVariants = [];
    
    if (data.variants && Array.isArray(data.variants)) {
       for (let i = 0; i < data.variants.length; i++) {
          let v = { ...data.variants[i] };
          let variantUpdated = false;
          
          const kitPrice = v.price_per_kit_10 ?? v.kitCost ?? v.supplierKitCostUSD ?? v.perKitPriceUSD ?? v.kitPriceUSD ?? v.cost_tiers?.cost_10;
          if (kitPrice !== undefined && kitPrice !== null) {
            if (!v.cost_tiers || v.cost_tiers.cost_10 === undefined) {
               v.cost_tiers = { ...(v.cost_tiers || {}), cost_10: Number(kitPrice) };
               variantUpdated = true;
            }
          }
          
          const unitPrice = v.unit_price ?? v.price ?? v.retailPrice ?? v.supplierCost ?? v.supplierUnitCostUSD ?? v.perVialPriceUSD ?? v.perUnit;
          if (unitPrice !== undefined && unitPrice !== null && v.unit_price === undefined) {
             v.unit_price = Number(unitPrice);
             variantUpdated = true;
          }
          
          for (const lf of legacyFields) {
             if (v[lf] !== undefined) {
                delete v[lf];
                variantUpdated = true;
             }
          }
          
          if (variantUpdated) needsUpdate = true;
          newVariants.push(v);
       }
    }
    
    if (needsUpdate) {
       await doc.ref.update({ variants: newVariants });
       updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} product documents with variant array fixes.`);
  updatedCount = 0;
  
  // 2. Process all variant subcollections
  const variantsSnap = await db.collectionGroup('variants').get();
  for (const doc of variantsSnap.docs) {
     const v = doc.data();
     let needsUpdate = false;
     let updates = {};
     
     const kitPrice = v.price_per_kit_10 ?? v.kitCost ?? v.supplierKitCostUSD ?? v.perKitPriceUSD ?? v.kitPriceUSD ?? v.cost_tiers?.cost_10;
     if (kitPrice !== undefined && kitPrice !== null) {
        if (!v.cost_tiers || v.cost_tiers.cost_10 === undefined) {
           updates['cost_tiers.cost_10'] = Number(kitPrice);
           needsUpdate = true;
        }
     }
     
     const unitPrice = v.unit_price ?? v.price ?? v.retailPrice ?? v.supplierCost ?? v.supplierUnitCostUSD ?? v.perVialPriceUSD ?? v.perUnit;
     if (unitPrice !== undefined && unitPrice !== null && v.unit_price === undefined) {
        updates.unit_price = Number(unitPrice);
        needsUpdate = true;
     }
     
     for (const lf of legacyFields) {
        if (v[lf] !== undefined) {
           updates[lf] = FieldValue.delete();
           needsUpdate = true;
        }
     }
     
     if (needsUpdate) {
        await doc.ref.update(updates);
        updatedCount++;
     }
  }
  
  console.log(`Updated ${updatedCount} documents in variants subcollections.`);
}
migrate().then(() => {
  console.log("Done.");
  process.exit(0);
}).catch(console.error);
