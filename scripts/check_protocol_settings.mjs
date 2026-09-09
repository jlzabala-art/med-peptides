import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function checkProtocolSettings() {
  const settings = await client.getSettings({ indexName: 'protocols' });
  console.log("Protocols index settings:");
  console.log("attributesForFaceting:", settings.attributesForFaceting);
}

checkProtocolSettings();
