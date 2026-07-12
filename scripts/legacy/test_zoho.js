const admin = require("firebase-admin");
admin.initializeApp();
const zoho = require("./functions/src/lib/zoho_client");

async function run() {
  try {
    const items = await zoho.listAllItems({ filter_by: "Status.Active" });
    const itemWithCat = items.find(i => i.category_name);
    console.log("Item with category:", itemWithCat ? { id: itemWithCat.item_id, category_name: itemWithCat.category_name, category_id: itemWithCat.category_id } : "None");
  } catch (e) {
    console.error(e);
  }
}
run();
