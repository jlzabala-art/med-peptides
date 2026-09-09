import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

if (!APP_ID || !ADMIN_KEY) {
  console.error("Missing credentials:", { APP_ID, hasAdminKey: !!ADMIN_KEY });
  process.exit(1);
}

const client = algoliasearch(APP_ID, ADMIN_KEY);

async function checkIndices() {
  console.log("Checking Algolia App:", APP_ID);
  try {
    const indices = await client.listIndices();
    console.log("Indices found:", indices.items.map(i => ({ name: i.name, entries: i.entries, updatedAt: i.updatedAt })));
  } catch (err) {
    console.error("Error listing indices:", err.message);
  }
}

checkIndices();
