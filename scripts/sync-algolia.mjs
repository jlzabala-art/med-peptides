import { db } from './lib/firebase-admin.mjs';
import { algoliasearch } from 'algoliasearch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse .env.local
function parseEnv(filePath) {
  const env = {};
  if (fs.existsSync(filePath)) {
    const contents = fs.readFileSync(filePath, 'utf-8');
    contents.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        env[match[1].trim()] = match[2].trim();
      }
    });
  }
  return env;
}

const envVars = parseEnv(path.join(__dirname, '../.env.local'));
const APP_ID = envVars.VITE_ALGOLIA_APP_ID;
const ADMIN_KEY = envVars.ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error('❌ Missing VITE_ALGOLIA_APP_ID or ALGOLIA_ADMIN_KEY in .env.local');
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

async function syncProducts() {
  console.log('🔄 Fetching products from Firestore...');
  const snapshot = await db.collection('products').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    
    // Normalize goals, canonicalGoals, tags and category into a single array for faceted search
    const allGoals = [...(data.goals || []), ...(data.canonicalGoals || []), ...(data.tags || []), data.category]
      .filter(Boolean)
      .map(g => g.toLowerCase().replace(/_/g, '-'));

    // Only send fields necessary for search and display to avoid 10KB Algolia limit
    const searchableRecord = {
      objectID: doc.id,
      name: data.name || '',
      category: data.category || '',
      description: data.description ? data.description.substring(0, 500) : '',
      goals: data.goals || [],
      canonicalGoals: data.canonicalGoals || [],
      tags: data.tags || [],
      searchableGoals: [...new Set(allGoals)], // Unique normalized goals
      supplier: data.supplier || '',
      stock: data.stock || 0,
      price: data.price || 0,
      hasCoa: data.hasCoa || false,
      hasGmp: data.hasGmp || false,
      productType: data.productType || '',
      sku: data.sku || ''
    };

    records.push(searchableRecord);
  });

  console.log(`📦 Found ${records.length} products to sync.`);

  if (records.length === 0) {
    console.log('✅ Nothing to sync.');
    return;
  }

  try {
    console.log('🚀 Uploading to Algolia index: products...');
    
    // Configure settings for faceted search
    await client.setSettings({
      indexName: 'products',
      indexSettings: {
        attributesForFaceting: [
          'category',
          'searchableGoals',
          'supplier',
          'productType',
          'hasCoa',
          'hasGmp',
          'stock',
          'price'
        ]
      }
    });
    console.log('✅ Configured attributesForFaceting for Algolia index.');

    const responses = await client.saveObjects({
      indexName: 'products',
      objects: records
    });
    console.log(`✅ Successfully synced ${records.length} products to Algolia!`);
  } catch (error) {
    console.error('❌ Error syncing to Algolia:', error);
  }
}

syncProducts().then(() => process.exit(0)).catch(() => process.exit(1));
