const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize with application default credentials so it connects to the prod database
admin.initializeApp({
  projectId: "med-peptides-app"
});

const zoho = require("./functions/src/lib/zoho_client");

async function run() {
  try {
    const items = await zoho.listAllItems({ filter_by: "Status.Active" });
    const itemWithCat = items.find(i => i.category_name);
    console.log("Item with category:", itemWithCat ? { id: itemWithCat.item_id, category_name: itemWithCat.category_name, category_id: itemWithCat.category_id } : "None");
    
    // Attempt to list categories if the endpoint exists
    try {
        const token = await zoho.getAccessToken(); // wait, how to call a raw endpoint?
        // just print 
    } catch(e){}
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
run();
