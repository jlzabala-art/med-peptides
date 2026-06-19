
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin
initializeApp();

async function run() {
  const db = getFirestore();
  const productsSnap = await db.collection("products").get();
  
  let totalProducts = 0;
  let missing_coa = 0;
  let regulatory_risk = 0;
  let missing_supplier = 0;
  let single_source = 0;
  let low_health = 0;
  let out_of_stock = 0;

  productsSnap.forEach((doc) => {
    totalProducts++;
    const p = doc.data();
    
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

  console.log(`Updated stats: Total ${totalProducts}`);
}

run().catch(console.error).then(() => process.exit(0));
