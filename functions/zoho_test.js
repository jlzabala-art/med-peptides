const admin = require("firebase-admin");
admin.initializeApp({ projectId: "mediluxeme" });

const zoho = require("./src/lib/zoho_client");

async function run() {
  try {
    const items = await zoho.listAllItems({ per_page: 2 });
    console.log("Item Summary Fields:", Object.keys(items[0]));
    console.log("Sample:", items[0]);
  } catch (e) {
    console.error(e);
  }
}

run();
