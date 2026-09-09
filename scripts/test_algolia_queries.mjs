import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function testSearch() {
  console.log("Testing search on atlas_patients for 'elena rostova'...");
  const resElena = await client.searchSingleIndex({
    indexName: 'atlas_patients',
    searchParams: { query: 'elena rostova' }
  });
  console.log("Elena hits (unfiltered):", resElena.hits.length, resElena.hits.map(h => ({ name: h.name, status: h.status, doctorIds: h.doctorIds })));

  console.log("Testing search on atlas_patients for 'carlos mendez'...");
  const resCarlos = await client.searchSingleIndex({
    indexName: 'atlas_patients',
    searchParams: { query: 'carlos mendez' }
  });
  console.log("Carlos hits (unfiltered):", resCarlos.hits.length, resCarlos.hits.map(h => ({ name: h.name, status: h.status, doctorIds: h.doctorIds })));

  // Test what UniversalPatientsTable was doing: with facetFilters
  console.log("Testing search with physicianId facet filter...");
  try {
    const resFiltered = await client.searchSingleIndex({
      indexName: 'atlas_patients',
      searchParams: { query: 'elena rostova', facetFilters: ['physicianId:doc-1'] }
    });
    console.log("Elena hits with physicianId:", resFiltered.hits.length);
  } catch (e) {
    console.log("Filter error:", e.message);
  }

  // Check prescriptions index
  console.log("Sample prescription records in Algolia:");
  const rxRes = await client.searchSingleIndex({
    indexName: 'prescriptions',
    searchParams: { query: '', hitsPerPage: 3 }
  });
  console.log("Prescriptions sample:", rxRes.hits);
}

testSearch();
