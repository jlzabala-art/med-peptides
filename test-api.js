require('dotenv').config({path: '.env.local'});
const { algoliasearch } = require('algoliasearch');
const admin = require('firebase-admin');

if (!admin.apps.length) {
    admin.initializeApp({
        projectId: 'regenpept',
    });
}
const db = admin.firestore();

async function run() {
  const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
  const { results } = await client.search([{ indexName: 'products', query: 'retatrutide', hitsPerPage: 5 }]);
  const hits = results[0].hits;
  const productIds = hits.map(hit => hit.objectID).filter(Boolean);
  
  console.log('Algolia IDs:', productIds);
  
  const supplierIds = new Set();
  
  // Need to use service account for admin SDK?
  // Let's just try to read the products
  if (productIds.length > 0) {
     // I don't have auth for firestore admin SDK here locally unless I use GOOGLE_APPLICATION_CREDENTIALS or it's implicitly authenticated.
     // Wait, earlier I got permission denied. So I can't read Firestore from this script directly without credentials.
  }
}
run();
