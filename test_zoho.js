require('dotenv').config();
const { getZohoClient } = require('./functions/src/lib/zoho_client');

async function run() {
  const zoho = await getZohoClient("662274409");
  const items = await zoho.listAllItems({ per_page: 1 });
  console.log(JSON.stringify(items[0], null, 2));
}

run().catch(console.error);
