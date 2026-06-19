import { algoliasearch } from 'algoliasearch';

const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let searchClient = null;

if (appId && searchKey) {
  try {
    searchClient = algoliasearch(appId, searchKey);
  } catch (error) {
    console.error("Failed to initialize Algolia search client:", error);
  }
}

export { searchClient };
