import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import { db } from './lib/firebase-admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to load JSON
const loadJson = (filePath) => {
  try {
    const raw = readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Failed to parse ${filePath}:`, err.message);
    return [];
  }
};

// Helper to make a doc ID consistent with previous script
const makeDocId = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const syncCollection = async (items, collectionName, idField, isProduct = false) => {
  let success = 0;
  let failures = 0;

  console.log(`\nSyncing ${items.length} items to '${collectionName}'...`);

  for (const item of items) {
    // If it's a product/supplement, we historically used a sanitized 'name' as docId
    // If it's a protocol, we use 'protocol_id' or 'protocol_slug'.
    let docId;
    if (isProduct) {
      docId = makeDocId(item.name);
    } else {
      docId = item[idField];
    }

    if (!docId) {
      console.error(`  ❌ Failed: Missing ID for item`, item);
      failures++;
      continue;
    }

    const docRef = db.collection(collectionName).doc(docId);

    const payload = {
      ...item,
      syncedAt: new Date().toISOString()
    };

    if (isProduct) {
      payload.docId = docId;
    }

    try {
      await docRef.set(payload, { merge: true });
      process.stdout.write('.');
      success++;
    } catch (err) {
      console.error(`\n  ❌ Failed: ${docId} — ${err.message}`);
      failures++;
    }
  }

  console.log(`\n  ✅ Synced: ${success} | ❌ Failed: ${failures}`);
  return failures;
};

async function main() {
  console.log('Loading V2 Datasets...');
  
  const products = loadJson(join(__dirname, '../src/data/v2/products.v2.json'));
  const supplements = loadJson(join(__dirname, '../src/data/v2/supplements.v2.json'));
  const protocols = loadJson(join(__dirname, '../src/data/protocolBlueprintsV2.json'));

  console.log(`- Peptides: ${products.length}`);
  console.log(`- Supplements: ${supplements.length}`);
  console.log(`- Protocols: ${protocols.length}`);

  let totalFailures = 0;

  // Sync Peptides to 'products' collection
  totalFailures += await syncCollection(products, 'products', 'id', true);
  
  // Sync Supplements to 'products' collection
  totalFailures += await syncCollection(supplements, 'products', 'id', true);

  // Sync Protocols to 'protocols' collection
  totalFailures += await syncCollection(protocols, 'protocols', 'protocol_id', false);

  console.log(`\n── Full V2 Sync Complete ──────────────────────────────`);
  if (totalFailures > 0) {
    console.warn(`Completed with ${totalFailures} errors.`);
    process.exit(1);
  } else {
    console.log('All data synced successfully.');
    process.exit(0);
  }
}

main().catch(console.error);
