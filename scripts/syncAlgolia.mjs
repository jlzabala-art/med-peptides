import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { algoliasearch } from 'algoliasearch';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      }
    });
}

const APP_ID = process.env.VITE_ALGOLIA_APP_ID;
// We need the admin API key for writing, search key is only for reading
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY; 

if (!APP_ID || !ADMIN_KEY) {
  console.error("❌ Missing VITE_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env.local");
  console.error("Make sure your .env.local looks like this:");
  console.error("VITE_ALGOLIA_APP_ID=YOUR_APP_ID");
  console.error("VITE_ALGOLIA_SEARCH_KEY=YOUR_SEARCH_KEY");
  console.error("ALGOLIA_ADMIN_KEY=YOUR_ADMIN_KEY");
  process.exit(1);
}

// 1. Initialize Firebase Admin
// Make sure you have your firebase-adminsdk credentials JSON downloaded.
// Or we can rely on GOOGLE_APPLICATION_CREDENTIALS if it is set.
// For local execution, if you don't have it set, we'll ask for it.
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn("⚠️ GOOGLE_APPLICATION_CREDENTIALS not set. The script will attempt to use default application credentials.");
}

try {
  initializeApp();
} catch (e) {
  console.error("Firebase Initialization Failed:", e.message);
  process.exit(1);
}

const db = getFirestore();

// 2. Initialize Algolia
const client = algoliasearch(APP_ID, ADMIN_KEY);

async function syncProducts() {
  console.log("🚀 Starting sync to Algolia...");
  
  try {
    const snapshot = await db.collection('products').get();
    const products = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      // Only index active/visible products if desired
      if (data.status !== 'deprecated') {
        products.push({
          objectID: doc.id,
          id: doc.id,
          name: data.name,
          displayName: data.displayName,
          productType: data.productType,
          status: data.status,
          sku: data.sku,
          category: data.classification?.categories || [],
          tags: data.classification?.tags || [],
          variants: Array.isArray(data.variants) ? data.variants.map(v => ({
            id: v.id,
            sku: v.sku,
            route: v.route,
            strengthLabel: v.strength?.dosageLabel || '',
            kitLabel: v.kit?.label || ''
          })) : []
        });
      }
    });

    if (products.length === 0) {
      console.log("⚠️ No products found to index.");
      return;
    }

    console.log(`Found ${products.length} products. Uploading to Algolia index 'products'...`);
    
    // Save objects to index
    await client.saveObjects({ indexName: 'products', objects: products });
    
    // Configure searchable attributes so Algolia knows variants are important
    await client.setSettings({
      indexName: 'products',
      indexSettings: {
        searchableAttributes: [
          'name',
          'displayName',
          'sku',
          'variants.sku',
          'variants.strengthLabel',
          'category',
          'tags'
        ],
        customRanking: [
          'desc(status)'
        ]
      }
    });

    console.log("✅ Sync Complete!");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
}

syncProducts();
