import 'dotenv/config';
import { algoliasearch } from 'algoliasearch';

const client = algoliasearch(
  process.env.VITE_ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

async function main() {
  try {
    const res = await client.search({
      requests: [
        { indexName: 'products', query: '' }
      ]
    });
    console.log("Hits in products index:", res.results[0].nbHits);
  } catch (err) {
    console.error(err);
  }
}

main();
