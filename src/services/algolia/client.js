import { liteClient as algoliasearch } from 'algoliasearch/lite';

const appId = (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID) : '') || 'G722EVODUJ';
const apiKey = (typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY) : '') || '609364d52903d7aefa3080d0fe63db2a';

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
