import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function runVerification() {
  console.log('--- Testing Algolia Live Search Results ---');

  // 1. atlas_patients: general patient search
  const patRes = await client.searchSingleIndex({
    indexName: 'atlas_patients',
    searchParams: { query: 'a', hitsPerPage: 5 }
  });
  console.log(`✅ atlas_patients query 'a': ${patRes.nbHits} total hits found.`);
  if (patRes.hits[0]) {
    console.log(`   Sample hit: ${patRes.hits[0].name} (Status: ${patRes.hits[0].status})`);
  }

  // 2. prescriptions: query with numeric date filter
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const rxRes = await client.searchSingleIndex({
    indexName: 'prescriptions',
    searchParams: {
      query: '',
      hitsPerPage: 5,
      numericFilters: [`createdAt_ts >= ${thirtyDaysAgo}`]
    }
  });
  console.log(`✅ prescriptions with 30d filter: ${rxRes.nbHits} total hits found.`);
  if (rxRes.hits[0]) {
    console.log(`   Sample Rx: ${rxRes.hits[0].code} - ${rxRes.hits[0].patientName} (Status: ${rxRes.hits[0].status})`);
  }

  // 3. atlas_users: query
  const usersRes = await client.searchSingleIndex({
    indexName: 'atlas_users',
    searchParams: { query: 'doc', hitsPerPage: 5 }
  });
  console.log(`✅ atlas_users query 'doc': ${usersRes.nbHits} total hits found.`);
  if (usersRes.hits[0]) {
    console.log(`   Sample User: ${usersRes.hits[0].name} - Role: ${usersRes.hits[0].role}`);
  }

  // 4. products: query
  const prodRes = await client.searchSingleIndex({
    indexName: 'products',
    searchParams: { query: 'bpc', hitsPerPage: 3 }
  });
  console.log(`✅ products query 'bpc': ${prodRes.nbHits} total hits found.`);
  if (prodRes.hits[0]) {
    console.log(`   Sample Product: ${prodRes.hits[0].name}`);
  }

  // 5. atlas_suppliers: query
  const suppRes = await client.searchSingleIndex({
    indexName: 'atlas_suppliers',
    searchParams: { query: '', hitsPerPage: 3 }
  });
  console.log(`✅ atlas_suppliers: ${suppRes.nbHits} total hits found.`);
}

runVerification();
