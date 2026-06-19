const admin = require('firebase-admin');
const { algoliasearch } = require('algoliasearch');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      value = value.replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Algolia
const appId = process.env.VITE_ALGOLIA_APP_ID;
const searchKey = process.env.ALGOLIA_ADMIN_KEY || process.env.VITE_ALGOLIA_ADMIN_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY; 
// Note: You need an ADMIN API key to write to Algolia, the search key won't work for writing!

if (!appId || !searchKey) {
  console.error("Missing Algolia App ID or API Key in .env.local");
  process.exit(1);
}

const client = algoliasearch(appId, searchKey);

async function syncToAlgolia() {
  console.log("Fetching products from Firestore...");
  const snapshot = await db.collection('products').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    // Algolia requires an objectID
    records.push({
      objectID: doc.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      // Add any other searchable fields here
    });
  });

  console.log(`Found ${records.length} products. Uploading to Algolia index 'products'...`);
  
  try {
    // In v5, we use saveObjects
    const { taskID } = await client.saveObjects({
        indexName: 'products',
        objects: records
    });
    console.log("Successfully uploaded to Algolia! Task ID:", taskID);
  } catch (err) {
    console.error("Error uploading to Algolia:", err.message);
    if (err.message.includes('Method Not Allowed') || err.message.includes('write')) {
      console.log("\n❌ IT LOOKS LIKE YOU ARE USING A SEARCH-ONLY KEY!");
      console.log("To upload data, you need to use the Algolia ADMIN API Key.");
      console.log("Please add VITE_ALGOLIA_ADMIN_KEY=your_admin_key to your .env.local file.");
    }
  }
}

syncToAlgolia().then(() => process.exit(0)).catch(console.error);
