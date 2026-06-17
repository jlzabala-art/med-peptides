import { liteClient as algoliasearch } from 'algoliasearch/lite';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const apiKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let client = null;

if (appId && apiKey) {
  try {
    client = algoliasearch(appId, apiKey);
  } catch (err) {
    console.error('Failed to initialize Algolia client:', err);
  }
} else {
  console.warn('Algolia is not configured. Missing VITE_ALGOLIA_APP_ID or VITE_ALGOLIA_SEARCH_KEY in environment variables.');
}

export const searchClient = client;
