const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");

exports.updateCatalogStats = onDocumentWritten("products/{productId}", async (event) => {
  const db = getFirestore();
  const productsSnap = await db.collection("products").get();
  
  let totalProducts = 0;
  let missing_coa = 0;
  let regulatory_risk = 0;
  let missing_supplier = 0;
  let single_source = 0;
  let low_health = 0;
  let out_of_stock = 0;

  // We fetch variants once if possible, or we just rely on product level fields for the global counts.
  // To avoid fetching variants for 1400 products here (which would be 1400 extra subcollection reads),
  // we will aggregate based on the cached summary fields in the product document.
  // Best practice: The product document should contain cached stats of its variants.
  
  productsSnap.forEach((doc) => {
    totalProducts++;
    const p = doc.data();
    
    // Fallback/synthetic mock data check to mimic what the frontend was doing
    // In a real scenario, these fields should be properly seeded in the DB.
    // If they are missing, we default to a pessimistic view to prompt admin action.
    
    const coaStatus = p.hasCoa;
    if (coaStatus === false || coaStatus === undefined) missing_coa++;
    
    const regStatus = p.registrationStatus;
    if (regStatus !== 'Registered') regulatory_risk++;
    
    if (!p.supplier || p.supplier === 'Unassigned') missing_supplier++;
    
    if (p.suppliersCount === 1 || !p.suppliersCount) single_source++;
    
    if ((p.healthScore || 100) < 70) low_health++;
    
    if (p.stock === 0 || p.inventoryLevel === 0) out_of_stock++;
  });

  const statsRef = db.collection("catalog_metadata").doc("stats");
  await statsRef.set({
    totalProducts,
    globalKpis: {
      missing_coa,
      regulatory_risk,
      missing_supplier,
      single_source,
      low_health,
      out_of_stock,
    },
    updatedAt: new Date().toISOString()
  });

  console.log(`[updateCatalogStats] Updated stats: Total ${totalProducts}`);
});
