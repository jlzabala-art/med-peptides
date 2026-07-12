require('dotenv').config({ path: '.env.local' });
const { algoliasearch } = require('algoliasearch');

// Initialize Algolia client
const APP_ID = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error("Missing Algolia credentials in environment (ALGOLIA_APP_ID and ALGOLIA_ADMIN_KEY).");
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

const PATIENTS_INDEX = "atlas_patients";

async function configureFacets() {
  console.log(`--- Configuring Facets for ${PATIENTS_INDEX} ---`);
  
  try {
    await client.setSettings({
      indexName: PATIENTS_INDEX,
      indexSettings: {
        attributesForFaceting: [
          'status',
          'physicianId',
          'wholesaler',
          'accountManager',
          'category',
          'goals'
        ]
      }
    });
    console.log("Successfully updated attributesForFaceting for atlas_patients.");
  } catch (error) {
    console.error("Error setting Algolia settings:", error);
  }
}

configureFacets();
