import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to get access token from refresh token
async function getAccessToken() {
  const configPath = join(__dirname, '../.firebase-config/configstore/firebase-tools.json');
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('❌ Failed to read firebase-tools.json:', err.message);
    process.exit(1);
  }

  const refreshToken = config?.tokens?.refresh_token;
  if (!refreshToken) {
    console.error('❌ No refresh token found in firebase-tools.json.');
    process.exit(1);
  }

  console.log('🔄 Exchanging refresh token for access token...');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Token exchange failed:', errorText);
    process.exit(1);
  }

  const data = await response.json();
  return data.access_token;
}

// Fetch all documents from a Firestore collection via REST API
async function fetchAllDocuments(accessToken, projectId, collectionId) {
  let documents = [];
  let nextPageToken = null;
  let page = 1;

  console.log(`📥 Fetching products from projects/${projectId}/databases/(default)/documents/${collectionId}...`);

  do {
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionId}?pageSize=300`;
    if (nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Firestore REST API error: ${errText}`);
    }

    const data = await response.json();
    if (data.documents) {
      documents = documents.concat(data.documents);
      console.log(`   Page ${page}: fetched ${data.documents.length} docs (Total: ${documents.length})`);
    }

    nextPageToken = data.nextPageToken;
    page++;
  } while (nextPageToken);

  return documents;
}

// Convert Firestore document REST format to regular JSON
function cleanDocument(doc) {
  const fields = doc.fields || {};
  const cleaned = {
    id: doc.name.split('/').pop()
  };

  function parseValue(valueObj) {
    if (!valueObj) return null;
    const [type, val] = Object.entries(valueObj)[0];
    if (type === 'stringValue') return val;
    if (type === 'booleanValue') return val;
    if (type === 'integerValue') return parseInt(val, 10);
    if (type === 'doubleValue') return parseFloat(val);
    if (type === 'timestampValue') return val;
    if (type === 'arrayValue') {
      const values = val.values || [];
      return values.map(parseValue);
    }
    if (type === 'mapValue') {
      const mapFields = val.fields || {};
      const mapCleaned = {};
      for (const [k, v] of Object.entries(mapFields)) {
        mapCleaned[k] = parseValue(v);
      }
      return mapCleaned;
    }
    return null;
  }

  for (const [key, val] of Object.entries(fields)) {
    cleaned[key] = parseValue(val);
  }

  return cleaned;
}

async function analyze() {
  const token = await getAccessToken();
  const rawDocs = await fetchAllDocuments(token, 'nplab-catalog-530a', 'products');
  console.log(`✅ Fetched ${rawDocs.length} raw documents.`);

  const products = rawDocs.map(cleanDocument);

  // Exclude supplements
  const nonSupplements = products.filter(p => p.category !== 'Supplements');
  const supplements = products.filter(p => p.category === 'Supplements');

  console.log('\n📊 Document Counts:');
  console.log(`   - Total Products in DB: ${products.length}`);
  console.log(`   - Supplement Products (Excluded): ${supplements.length}`);
  console.log(`   - Non-Supplement Products (To Import): ${nonSupplements.length}`);

  // Analyze categories
  const categories = {};
  const uniqueGoals = new Set();
  const subcategories = {};

  for (const p of nonSupplements) {
    const cat = p.category || 'NO_CATEGORY';
    categories[cat] = (categories[cat] || 0) + 1;

    const sub = p.subcategory || 'NO_SUBCATEGORY';
    subcategories[sub] = (subcategories[sub] || 0) + 1;

    const goals = p.goals || [];
    for (const g of goals) {
      uniqueGoals.add(g);
    }
  }

  console.log('\n📂 Non-Supplement Categories:');
  for (const [cat, count] of Object.entries(categories)) {
    console.log(`   - ${cat}: ${count}`);
  }

  console.log('\n📂 Non-Supplement Subcategories:');
  for (const [sub, count] of Object.entries(subcategories)) {
    console.log(`   - ${sub}: ${count}`);
  }

  console.log('\n🎯 Unique Goals in Source DB (Non-Supplements):');
  console.log(Array.from(uniqueGoals).map(g => `   - "${g}"`).join('\n'));

  // Save parsed non-supplement products for inspection or import use
  const outPath = join(__dirname, '../scratch/nplab_non_supplements.json');
  writeFileSync(outPath, JSON.stringify(nonSupplements, null, 2));
  console.log(`\n💾 Saved cleaned non-supplement products to ${outPath}`);
}

analyze().catch(err => {
  console.error('❌ Analysis failed:', err);
});
