require('dotenv').config({ path: '.env.local' });
const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { algoliasearch } = require('algoliasearch');

// Initialize Firebase Admin (using local credentials for testing, or default)
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// Initialize Algolia client
const APP_ID = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || process.env.VITE_ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error("Missing Algolia credentials in environment.");
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

const PRODUCTS_INDEX = "products";
const PRESCRIPTIONS_INDEX = "prescriptions";

async function reindexProducts() {
  console.log("--- Reindexing Products ---");
  const snapshot = await db.collection('products').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    records.push({
      objectID: doc.id,
      name: data.name || '',
      category: data.category || '',
      tier: data.tier || '',
      tags: data.tags || [],
      description_short: data.description ? data.description.substring(0, 100) : '',
      slug: data.slug || '',
      sku: data.sku || '',
      supplier: data.supplier || '',
      dosage: data.dosage || '',
      warehouse: data.warehouse || '',
      isActive: data.isActive !== undefined ? data.isActive : (data.active !== undefined ? data.active : true),
      stock: data.stock || 0
    });
  });

  if (records.length > 0) {
    try {
      await client.saveObjects({ indexName: PRODUCTS_INDEX, objects: records });
      console.log(`Successfully reindexed ${records.length} products to Algolia.`);
    } catch (error) {
      console.error("Algolia saveObjects error:", error);
    }
  } else {
    console.log("No products found.");
  }
}

async function reindexPrescriptions() {
  console.log("--- Reindexing Prescriptions ---");
  const snapshot = await db.collection('prescriptions').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    records.push({
        objectID: doc.id,
        patientName: data.patient?.name || data.patientName || '',
        doctorName: data.doctor?.name || data.doctorName || '',
        protocolName: typeof data.protocol === 'object' ? (data.protocol?.name || '') : (data.protocol || ''),
        status: data.status || 'draft',
        source: data.source || data.type || '',
        createdAt_ts: data.createdAt ? new Date(data.createdAt).getTime() : Date.now()
    });
  });

  if (records.length > 0) {
    try {
      await client.saveObjects({ indexName: PRESCRIPTIONS_INDEX, objects: records });
      console.log(`Successfully reindexed ${records.length} prescriptions to Algolia.`);
    } catch (error) {
      console.error("Algolia saveObjects error:", error);
    }
  } else {
    console.log("No prescriptions found.");
  }
}

const PHYSICIANS_INDEX = "atlas_physicians";

async function reindexPhysicians() {
  console.log("--- Reindexing Physicians ---");
  const snapshot = await db.collection('users').where('roles', 'array-contains', 'doctor').get();
  
  const records = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    records.push({
        objectID: doc.id,
        name: data.displayName || data.firstName + ' ' + data.lastName || 'Unnamed',
        email: data.email || '',
        status: data.status || 'active',
        specialty: data.specialty || 'General',
        clinicName: data.clinicName || '',
        createdAt_ts: data.createdAt ? new Date(data.createdAt).getTime() : Date.now()
    });
  });

  if (records.length > 0) {
    try {
      await client.saveObjects({ indexName: PHYSICIANS_INDEX, objects: records });
      console.log(`Successfully reindexed ${records.length} physicians to Algolia.`);
    } catch (error) {
      console.error("Algolia saveObjects error:", error);
    }
  } else {
    console.log("No physicians found.");
  }
}

async function run() {
  try {
    await reindexProducts();
    await reindexPrescriptions();
    await reindexPhysicians();
    console.log("Reindex complete!");
  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    process.exit(0);
  }
}

run();
