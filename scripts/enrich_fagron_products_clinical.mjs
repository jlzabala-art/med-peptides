import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { FAGRON_CLINICAL_MONOGRAPHS } from '../src/data/fagronClinicalMonographs.js';
import { algoliasearch } from 'algoliasearch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;
let algoliaClient = null;
if (APP_ID && ADMIN_KEY) {
  algoliaClient = algoliasearch(APP_ID, ADMIN_KEY);
}

async function runEnrichment() {
  console.log('🚀 Starting Fagron Clinical Monographs Firestore & Algolia Enrichment...');
  console.log(`Found ${Object.keys(FAGRON_CLINICAL_MONOGRAPHS).length} clinical monographs to apply.`);

  const productsSnap = await db.collection('products').get();
  console.log(`Retrieved ${productsSnap.size} total products from Firestore.`);

  let updatedCount = 0;
  const algoliaRecordsToUpdate = [];

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const docId = doc.id.toLowerCase();
    const slug = (data.slug || '').toLowerCase();
    const name = (data.name || data.title || '').toLowerCase();
    const canonicalName = (data.canonicalName || '').toLowerCase();

    // Check if any monograph key matches this product
    let matchedKey = null;
    let matchedMono = null;

    for (const [key, mono] of Object.entries(FAGRON_CLINICAL_MONOGRAPHS)) {
      const keyLower = key.toLowerCase();
      const monoNameLower = mono.canonicalName.toLowerCase();

      if (
        docId === keyLower ||
        docId.includes(keyLower) ||
        slug === keyLower ||
        slug.includes(keyLower) ||
        name.includes(keyLower) ||
        canonicalName.includes(keyLower) ||
        name.includes(monoNameLower) ||
        canonicalName.includes(monoNameLower)
      ) {
        matchedKey = key;
        matchedMono = mono;
        break;
      }
    }

    if (matchedMono) {
      console.log(`✨ Matched product "${data.name || doc.id}" with monograph "${matchedMono.canonicalName}"`);
      
      const updatePayload = {
        geneTargets: matchedMono.geneTargets || [],
        pharmacologicalClass: matchedMono.pharmacologicalClass || '',
        clinicalIndication: matchedMono.clinicalIndication || '',
        mechanismOfAction: matchedMono.mechanismOfAction || '',
        compatibleVehicles: matchedMono.compatibleVehicles || [],
        standardDosages: matchedMono.standardDosages || '',
        fagronPrograms: matchedMono.fagronPrograms || ['TrichoTest'],
        fagronClinicalEnriched: true,
        updatedAt: new Date().toISOString()
      };

      await doc.ref.update(updatePayload);
      updatedCount++;

      if (algoliaClient) {
        algoliaRecordsToUpdate.push({
          objectID: doc.id,
          id: doc.id,
          name: data.name || data.title || matchedMono.canonicalName,
          canonicalName: data.canonicalName || matchedMono.canonicalName,
          category: data.category || 'Compounding API',
          geneTargets: matchedMono.geneTargets || [],
          pharmacologicalClass: matchedMono.pharmacologicalClass || '',
          clinicalIndication: matchedMono.clinicalIndication || '',
          mechanismOfAction: matchedMono.mechanismOfAction ? matchedMono.mechanismOfAction.substring(0, 500) : '',
          compatibleVehicles: matchedMono.compatibleVehicles || [],
          standardDosages: matchedMono.standardDosages || '',
          goals: data.goals || [],
          tags: [...new Set([...(data.tags || []), ...(matchedMono.geneTargets || []), matchedMono.pharmacologicalClass])],
          fagronClinicalEnriched: true,
          updatedAt_ts: Date.now()
        });
      }
    }
  }

  console.log(`\n✅ Successfully enriched ${updatedCount} products in Firestore.`);

  if (algoliaClient && algoliaRecordsToUpdate.length > 0) {
    try {
      await algoliaClient.partialUpdateObjects({
        indexName: 'products',
        objects: algoliaRecordsToUpdate,
        createIfNotExists: true
      });
      console.log(`⚡ Synced ${algoliaRecordsToUpdate.length} enriched products to Algolia 'products' index.`);
    } catch (algErr) {
      console.warn('⚠️ Algolia update warning:', algErr.message);
    }
  }

  process.exit(0);
}

runEnrichment().catch(err => {
  console.error('Fatal error during enrichment:', err);
  process.exit(1);
});
