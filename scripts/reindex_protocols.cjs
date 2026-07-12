const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { algoliasearch } = require('algoliasearch');
const serviceAccount = require('../serviceAccount-target.json');

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

// Initialize Algolia client
const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error("Missing Algolia credentials in environment.");
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);
const PROTOCOLS_INDEX = "protocols";

async function reindexProtocols() {
  console.log(`Fetching protocols from Firestore...`);
  const snapshot = await db.collection('protocols').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    records.push({
        objectID:    doc.id,
        name:        data.protocol_name || '',
        category:    data.therapeutic_category || '',
        status:      data.status || 'draft',
        goals:       Array.isArray(data.goals) ? data.goals.join(', ') : (data.goals || ''),
        tags:        Array.isArray(data.tags) ? data.tags : [],
        description: data.description ? data.description.substring(0, 200) : '',
        phaseCount:  Array.isArray(data.phases) ? data.phases.length : 0,
        slug:        data.slug || data.protocol_slug || '',
        version:     data.version || 1,
    });
  });

  if (records.length > 0) {
    try {
      await client.saveObjects({ indexName: PROTOCOLS_INDEX, objects: records });
      console.log(`Successfully reindexed ${records.length} protocols to Algolia.`);
    } catch (error) {
      console.error("Algolia saveObjects error:", error);
    }
  } else {
    console.log("No protocols found.");
  }
}

async function run() {
  try {
    await reindexProtocols();
    console.log("Reindex complete!");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    process.exit(0);
  }
}

run();
