import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);

async function patchProtocolSettings() {
  await client.setSettings({
    indexName: 'protocols',
    indexSettings: {
      attributesForFaceting: [
        'category',
        'status',
        'goals',
        'primary_goal',
        'difficulty'
      ]
    }
  });
  console.log('✅ Added goals and difficulty to protocols attributesForFaceting');
}

patchProtocolSettings();
