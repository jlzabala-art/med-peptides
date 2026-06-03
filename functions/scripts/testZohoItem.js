const admin = require("firebase-admin");
try { admin.initializeApp({ credential: admin.credential.cert(require("../../serviceAccountKey.json")) }); } catch(e) { admin.initializeApp(); }

process.env.ZOHO_CLIENT_ID = "1000.NAHBCCYF5C9B3Z3YS2URAQ4TG7O76V";
process.env.ZOHO_CLIENT_SECRET = "088b65381f7f30dfb801ff3f901e1af2c7adef11e5";
process.env.ZOHO_REFRESH_TOKEN = "1000.5e78cbdff88ecfe2797a758cb0d2bdb1.2a1750778aa0ca90ec9c9123632fee14";

const zoho = require("../src/lib/zoho_client");

async function run() {
  try {
    const itemData = {
      name: "TEST_PEPTIDE_001",
      sku: "TEST-PEP-001",
      rate: 150.00,
      description: "Test product for syncing",
      item_type: "inventory", // or non_inventory
      purchase_rate: 50.00,
      is_taxable: false,
      product_type: "goods" // goods or service
    };

    const created = await zoho.createItem(itemData);
    console.log("Created successfully!", created.item_id);
  } catch (error) {
    console.error("Error creating item:", error.message);
  }
}
run();
