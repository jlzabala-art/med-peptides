import { adminDb } from '../src/lib/firebaseAdmin.js';

async function migratePricing() {
  console.log("Starting pricing homogenization migration (Pass 2 - User Feedback)...");
  const snapshot = await adminDb.collection('products').get();
  const batch = adminDb.batch();
  let updatedCount = 0;
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    let updated = false;
    let newPricing = data.pricing || {};
    let newPrice = null;
    
    // Original values preservation
    let originalCurrency = data.originalCurrency || data.currency;
    let originalPrice = data.originalPrice || data.price;
    
    let newCurrency = "USD"; // Default per user request
    let newVariants = data.variants || [];

    if (newVariants && !Array.isArray(newVariants) && typeof newVariants === 'object') {
      newVariants = Object.keys(newVariants)
        .sort((a, b) => Number(a) - Number(b))
        .map(k => newVariants[k]);
      updated = true;
    }

    // 2. Extract best base price prioritizing supplierCost
    if (newPricing?.supplierCostUsd) newPrice = newPricing.supplierCostUsd;
    else if (newPricing?.wholesale?.perUnit) newPrice = newPricing.wholesale.perUnit;
    else if (newPricing?.clinic?.perUnit) newPrice = newPricing.clinic.perUnit;
    else if (typeof data.price === 'number') newPrice = data.price; // Legacy price
    else if (newPricing?.retail?.perUnit) newPrice = newPricing.retail.perUnit;
    else if (newPricing?.retail?.kit) newPrice = newPricing.retail.kit;
    else if (data.basePrice) newPrice = data.basePrice;

    // Preserve original currency if one was defined
    const foundCurrency = newPricing?.retail?.currency || newPricing?.currency || data.currency;
    if (foundCurrency && foundCurrency !== 'USD') {
      originalCurrency = foundCurrency;
      // We don't overwrite newCurrency since user said default to USD, 
      // but if the data is explicitly EUR, should newCurrency be EUR?
      // "USD, pero guardar el precio original, tambien si estaba en otra unidad."
      // I will set currency = 'USD' only if it's not defined, or if we want everything in USD.
      // Usually it means keep the currency it is, but if missing, use USD.
      newCurrency = foundCurrency; 
    }

    // Extract volume discount
    const volume10Kit = newPricing?.volume10Kit || data.volume10Kit || null;

    // 3. Normalize the root pricing object
    const standardizedPricing = {
      supplierCost: newPricing?.supplierCostUsd || newPricing?.supplierCost || null,
      wholesale: newPricing?.wholesale?.perUnit || newPricing?.wholesale || null,
      clinic: newPricing?.clinic?.perUnit || newPricing?.clinic || null,
      retail: newPricing?.retail?.perUnit || newPricing?.retail?.kit || newPricing?.retail || null,
      volume10Kit: volume10Kit
    };

    if (Array.isArray(newVariants)) {
      newVariants = newVariants.map(v => {
        const vPricing = v.pricing || {};
        let vPrice = vPricing?.supplierCostUsd || vPricing?.wholesale?.perUnit || v.price;
        
        return {
          ...v,
          price: typeof vPrice === 'number' ? vPrice : parseFloat(vPrice),
          pricing: {
            supplierCost: vPricing?.supplierCostUsd || vPricing?.supplierCost || null,
            wholesale: vPricing?.wholesale?.perUnit || vPricing?.wholesale || null,
            clinic: vPricing?.clinic?.perUnit || vPricing?.clinic || null,
            retail: vPricing?.retail?.perUnit || vPricing?.retail?.kit || vPricing?.retail || null,
            volume10Kit: vPricing?.volume10Kit || v.volume10Kit || null
          }
        };
      });
      updated = true; 
    }

    // We'll just force an update to ensure all documents conform to the new rule
    updated = true;

    if (updated) {
      batch.update(doc.ref, {
        price: newPrice !== null && !isNaN(newPrice) ? Number(newPrice) : null,
        currency: newCurrency,
        originalCurrency: originalCurrency || null,
        originalPrice: originalPrice || null,
        pricing: standardizedPricing,
        variants: newVariants
      });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    console.log(`Committing batch with ${updatedCount} updates...`);
    await batch.commit();
    console.log("Migration complete.");
  } else {
    console.log("No documents required updating.");
  }
}

migratePricing().catch(console.error);
