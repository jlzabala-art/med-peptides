const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { createItem, searchItems } = require("../lib/zoho_client");

/**
 * Trigger: Fires when a new document is created in the 'products' collection.
 * Purpose: If a product is created in Firebase manually (e.g. via Admin Panel) 
 * and doesn't have a zoho_item_id, it immediately creates the corresponding 
 * Item in Zoho Books and saves the ID back to Firebase.
 */
exports.onProductCreated = onDocumentCreated("products/{productId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const product = snapshot.data();

  // If the product already has a Zoho ID, it was likely created by the 
  // Zoho -> Firebase cron job, so we skip to avoid infinite loops.
  if (product.zoho_item_id) {
    console.log(`[onProductCreated] Product ${event.params.productId} already has zoho_item_id. Skipping.`);
    return;
  }

  console.log(`[onProductCreated] New product detected: ${product.name}. Syncing to Zoho...`);

  try {
    const sku = product.zoho_sku || product.variants?.[0]?.sku || "";
    const rate = product.price || product.variants?.[0]?.price_aed || 0;
    const name = product.displayName || product.name;

    // 1. Check if it already exists in Zoho to prevent duplicates
    let existingItem = null;
    
    // First try searching by SKU (most precise)
    if (sku) {
      const skuMatches = await searchItems(sku);
      existingItem = skuMatches.find(item => item.sku === sku);
    }
    
    // If no SKU match, try searching by Name
    if (!existingItem && name) {
      const nameMatches = await searchItems(name);
      existingItem = nameMatches.find(item => item.name.toLowerCase() === name.toLowerCase());
    }

    let finalItemId = null;
    let finalSku = sku;

    if (existingItem) {
      console.log(`[onProductCreated] Found existing Zoho item ${existingItem.item_id} matching Firebase product ${event.params.productId}. Linking instead of creating.`);
      finalItemId = existingItem.item_id;
      finalSku = existingItem.sku || sku;
    } else {
      console.log(`[onProductCreated] No match found in Zoho. Creating new item...`);
      const zohoPayload = {
        name: name,
        rate: rate,
        sku: sku,
        description: product.clinical_summary || product.description || "",
        item_type: "inventory", 
      };

      const newItem = await createItem(zohoPayload);
      finalItemId = newItem.item_id;
      finalSku = newItem.sku || sku;
      console.log(`[onProductCreated] Successfully created Zoho item ${finalItemId}.`);
    }
    
    // Save the Zoho ID and SKU back to the Firebase product
    await snapshot.ref.update({
      zoho_item_id: finalItemId,
      zoho_sku: finalSku
    });

  } catch (err) {
    console.error(`[onProductCreated] Failed to create Zoho item for product ${event.params.productId}:`, err);
  }
});
