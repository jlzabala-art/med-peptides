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

const indicesConfig = {
  "atlas_users": ['roles', 'status'],
  "atlas_products": ['category', 'supplierName', 'visibility'],
  "atlas_patients": ['status', 'physicianId', 'wholesaler', 'accountManager', 'category', 'goals'],
  "atlas_protocols": ['status', 'category'],
  "atlas_physicians": ['status', 'specialty'],
  "atlas_clinics": ['status'],
  "atlas_leads": ['status', 'type'],
  "atlas_suppliers": ['status', 'type', 'tags'],
  "atlas_rfqs": ['status', 'supplierId'],
  "prescriptions": ['status'],
  "orders": ['status', 'type']
};

async function configureFacets() {
  for (const [indexName, attributes] of Object.entries(indicesConfig)) {
    console.log(`--- Configuring Facets for ${indexName} ---`);
    try {
      await client.setSettings({
        indexName,
        indexSettings: {
          attributesForFaceting: attributes
        }
      });
      console.log(`Successfully updated attributesForFaceting for ${indexName}.`);
    } catch (error) {
      console.error(`Error setting Algolia settings for ${indexName}:`, error);
    }
  }
}

configureFacets();
