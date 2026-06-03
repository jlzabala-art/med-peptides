const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }

process.env.ZOHO_CLIENT_ID = "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
process.env.ZOHO_CLIENT_SECRET = "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";
process.env.ZOHO_REFRESH_TOKEN = "1000.5e78cbdff88ecfe2797a758cb0d2bdb1.2a1750778aa0ca90ec9c9123632fee14";

const zoho = require("../src/lib/zoho_client");
const db = admin.firestore();

async function syncCollection(collectionName, typeMapper) {
  console.log(`Starting sync for ${collectionName}...`);
  const snapshot = await db.collection(collectionName).get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.zoho_item_id) {
      console.log(`[${collectionName}] ${doc.id} already synced: ${data.zoho_item_id}`);
      continue;
    }

    const { item_type, price, costPrice, name, description, is_taxable } = typeMapper(data, doc.id);
    const sku = data.sku || doc.id;

      let finalItemId = null;
      // check if it exists by SKU first
      const existingItems = await zoho.searchItems(sku);
      // Wait, zoho search by SKU is usually via searchItems with sku query, but our searchItems uses name_contains.
      // Let's just create. If it fails with "already exists", we parse the error or we can search by sku.
      // Better yet, append ID to name to ensure uniqueness.
      const uniqueName = name + " - " + doc.id;
      
      try {
        const created = await zoho.createItem({
          name: uniqueName.substring(0, 100),
          sku: sku,
          rate: price || 0,
          purchase_rate: costPrice || 0,
          description: (description || "").substring(0, 500),
          item_type: item_type,
          is_taxable: is_taxable,
          product_type: item_type === "inventory" ? "goods" : (item_type === "service" ? "service" : "goods")
        });
        finalItemId = created.item_id;
      } catch (createErr) {
        if (createErr.message.includes("already exists") || createErr.message.includes("code\":1001")) {
           console.warn(`[${collectionName}] ${doc.id} creation failed, sku or name exists. Fetching by SKU...`);
           try {
             const data = await zoho.requestInventory("GET", "/items", { params: { sku: sku } });
             if (data.items && data.items.length > 0) {
               finalItemId = data.items[0].item_id;
               console.log(`[${collectionName}] Fetched existing item: ${finalItemId}`);
             }
           } catch(e) {
             console.error(`[${collectionName}] Failed to fetch by sku: ${e.message}`);
           }
        } else {
           console.error(`[${collectionName}] Failed to sync ${doc.id}: ${createErr.message}`);
        }
      }

      if (finalItemId) {
        await doc.ref.update({ zoho_item_id: finalItemId });
        console.log(`[${collectionName}] Synced ${doc.id} -> ${finalItemId}`);
      }
  }
}

async function syncProtocols() {
  console.log("Starting sync for protocols (Composite Items)...");
  const snapshot = await db.collection("protocols").get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.zoho_item_id) {
      console.log(`[protocols] ${doc.id} already synced: ${data.zoho_item_id}`);
      continue;
    }

    const mapped_items = [];
    const missing_items = [];
    
    // Gather all products in all phases
    if (data.phases) {
      for (const phase of data.phases) {
        if (phase.drugs_used) {
          for (const drug of phase.drugs_used) {
            const pId = drug.productId;
            if (!pId) continue;
            
            // fetch product to get zoho_item_id
            const pDoc = await db.collection("products").doc(pId).get();
            if (pDoc.exists && pDoc.data().zoho_item_id) {
              const qty = drug.vials_required_for_phase || 1;
              
              // check if already added to mapped_items
              const existing = mapped_items.find(m => m.item_id === pDoc.data().zoho_item_id);
              if (existing) {
                existing.quantity += qty;
              } else {
                mapped_items.push({
                  item_id: pDoc.data().zoho_item_id,
                  quantity: qty
                });
              }
            } else {
              missing_items.push(pId);
            }
          }
        }
      }
    }

    if (missing_items.length > 0) {
      console.warn(`[protocols] ${doc.id} missing zoho_item_ids for products: ${missing_items.join(",")}. Skipping composite creation.`);
      continue;
    }

    if (mapped_items.length === 0) {
      console.warn(`[protocols] ${doc.id} has no valid products. Skipping.`);
      continue;
    }

    try {
      const created = await zoho.createCompositeItem({
        name: data.metadata?.scientificName || data.name || doc.id,
        sku: data.metadata?.shortCode || doc.id,
        rate: data.price || 500, 
        description: (data.metadata?.description || "").substring(0, 500),
        item_type: "inventory",
        mapped_items: mapped_items
      });
      await doc.ref.update({ zoho_item_id: created.composite_item_id });
      console.log(`[protocols] Synced ${doc.id} -> ${created.composite_item_id}`);
    } catch (e) {
      console.error(`[protocols] Failed to sync ${doc.id}: ${e.message}`);
    }
  }
}

async function runAll() {
  await syncCollection("products", (data, id) => ({
    name: data.name || data.title || id,
    price: data.price,
    costPrice: data.costPrice,
    description: data.description || data.subtitle,
    item_type: "inventory",
    is_taxable: true
  }));

  await syncCollection("supplements", (data, id) => ({
    name: data.name || data.title || id,
    price: data.price,
    costPrice: data.costPrice,
    description: data.description,
    item_type: "inventory",
    is_taxable: true
  }));

  await syncCollection("api_materials", (data, id) => ({
    name: data.name || id,
    price: data.price,
    costPrice: data.costPrice,
    description: data.description,
    item_type: "inventory",
    is_taxable: true
  }));

  await syncCollection("testing", (data, id) => ({
    name: data.name || data.title || id,
    price: data.price,
    costPrice: data.costPrice,
    description: data.description,
    item_type: "service", // Non-physical testing kits or services
    is_taxable: false
  }));

  await syncProtocols();
  console.log("All sync completed.");
}

runAll();
