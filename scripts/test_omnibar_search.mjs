import { liteClient as algoliasearch } from 'algoliasearch/lite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);

async function testLiteSearch() {
  const query = 'bpc';
  const responses = await client.search({
    requests: [
      { indexName: 'atlas_patients', query, hitsPerPage: 3 },
      { indexName: 'atlas_users', query, hitsPerPage: 3 },
      { indexName: 'products', query, hitsPerPage: 5 },
      { indexName: 'protocols', query, hitsPerPage: 3 }
    ]
  });

  console.log("Omnibar Multi-Index results:");
  responses.results.forEach((r, idx) => {
    console.log(`Index ${idx} hits:`, r.hits.length, r.hits.map(h => h.name || h.title || h.code));
  });
}

testLiteSearch();
