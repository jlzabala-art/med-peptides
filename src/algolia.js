import { algoliasearch } from 'algoliasearch';

const appId = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || process.env.VITE_ALGOLIA_APP_ID) : '';
const searchKey = typeof process !== 'undefined' ? (process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || process.env.VITE_ALGOLIA_SEARCH_KEY) : '';

let searchClient = null;

if (appId && searchKey) {
  try {
    searchClient = algoliasearch(appId, searchKey);
  } catch (error) {
    console.error("Failed to initialize Algolia search client:", error);
  }
}

export { searchClient };
