const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
  });
} else {
  admin.initializeApp();
}

async function analyzeCategories() {
  const db = admin.firestore();
  
  const collectionsToCheck = ['products', 'protocols', 'supplements', 'testing', 'catalogProducts'];
  
  for (const collectionName of collectionsToCheck) {
    console.log(`\n--- Analyzing collection: ${collectionName} ---`);
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`Collection ${collectionName} is empty or does not exist.`);
      continue;
    }

    const categories = new Set();
    const subcategories = new Set();
    const noCategoryDocs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const cat = data.category || data.Category;
      const subcat = data.subcategory || data.subCategory;
      
      if (cat) {
        categories.add(cat);
      } else {
        noCategoryDocs.push({ id: doc.id, name: data.name || data.protocol_name || 'Unnamed' });
      }

      if (subcat) {
        subcategories.add(subcat);
      }
    });

    console.log(`Total documents: ${snapshot.size}`);
    console.log(`Distinct Categories:`, Array.from(categories));
    console.log(`Distinct Subcategories:`, Array.from(subcategories));
    console.log(`Documents without category: ${noCategoryDocs.length}`);
    
    if (noCategoryDocs.length > 0) {
      console.log('Examples of documents without category (up to 5):', noCategoryDocs.slice(0, 5));
    }
  }
}

const UPDATE_MODE = process.argv.includes('--update');
const COLLECTION_TO_UPDATE = process.argv[process.argv.indexOf('--collection') + 1];
const DEFAULT_CATEGORY = process.argv[process.argv.indexOf('--category') + 1];

async function updateMissingCategories(collectionName, defaultCategory) {
  const db = admin.firestore();
  const snapshot = await db.collection(collectionName).get();
  let updatedCount = 0;

  const batch = db.batch();
  let currentBatchSize = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data.category && !data.Category) {
      batch.update(doc.ref, { category: defaultCategory });
      updatedCount++;
      currentBatchSize++;
    }

    // simplistic batch handling (ignores >500 limits for very large updates, but good enough for small datasets)
    if (currentBatchSize >= 450) {
      console.warn('Batch limit approaching, this script only supports simple batching.');
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} documents in ${collectionName} with category "${defaultCategory}".`);
  } else {
    console.log(`No documents missing category in ${collectionName}.`);
  }
}

if (UPDATE_MODE && COLLECTION_TO_UPDATE && DEFAULT_CATEGORY) {
  updateMissingCategories(COLLECTION_TO_UPDATE, DEFAULT_CATEGORY).catch(console.error).then(() => process.exit(0));
} else {
  analyzeCategories().catch(console.error).then(() => process.exit(0));
}
