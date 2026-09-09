import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function checkSynonyms() {
  try {
    const syns = await client.searchSynonyms({
      indexName: 'products',
      searchSynonymsParams: { query: '' }
    });
    console.log("Synonyms in products index:", syns.hits?.length || 0);
    if (syns.hits?.length > 0) {
      console.log("Sample synonyms:", syns.hits.slice(0, 5));
    }
  } catch (err) {
    console.error("Synonym check error:", err.message);
  }
}

checkSynonyms();
