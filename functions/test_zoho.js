import dotenv from 'dotenv';
dotenv.config();

import admin from 'firebase-admin';

// Initialize Firebase Admin (mock or real)
if (!admin.apps.length) {
  admin.initializeApp();
}

import { getZohoClient } from './src/lib/zoho_client.js';

async function run() {
  const zoho = await getZohoClient("662274409");
  const items = await zoho.listAllItems({ per_page: 1 });
  console.log(JSON.stringify(items[0], null, 2));
}

run().catch(console.error);
