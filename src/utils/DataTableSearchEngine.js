import Fuse from 'fuse.js';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { liteClient as algoliasearch } from 'algoliasearch/lite';

/**
 * Universal DataTable Search Engine
 *
 * Provides three search strategies for DataTable:
 *
 * 1. 'local'    — Fuzzy local search via Fuse.js. Zero latency, handles typos.
 *                 Perfect for admin tables with up to ~1000 rows.
 *
 * 2. 'semantic' — AI-powered search via Firebase Function `tableSemanticSearch`
 *                 (Gemini 2.0 Flash). Understands natural language, synonyms,
 *                 bilingual queries (ES/EN), and status label variations.
 *                 Shows DataTable skeleton while the AI processes the request.
 *
 * 3. 'algolia'  — Reserved for large-scale catalog searches (thousands of records).
 *                 Plug in your Algolia client inside _algoliaSearch() when ready.
 *
 * All strategies expose the same interface: DataTableSearchEngine.execute()
 * returns either an Array (for local) or a Promise<Array> (for async strategies).
 */
export class DataTableSearchEngine {
  /**
   * Entry point — dispatches to the correct strategy.
   *
   * @param {Array}  data         - Full data array from the DataTable
   * @param {string} query        - Raw user query string
   * @param {Array}  columns      - Column definitions from the DataTable
   * @param {string} strategy     - 'local' | 'semantic' | 'algolia'
   * @param {Object} searchConfig - { keys?: string[], threshold?: number, fuseOptions?: {} }
   * @returns {Array | Promise<Array>}
   */
  static execute(data, query, columns, strategy = 'local', searchConfig = {}) {
    if (!query || !query.trim()) {
      return strategy === 'local' ? data : Promise.resolve(data);
    }

    switch (strategy) {
      case 'semantic':
        return this._semanticSearch(data, query, columns, searchConfig);
      case 'algolia':
        return this._algoliaSearch(data, query, searchConfig);
      case 'local':
      default:
        return this._localSearch(data, query, columns, searchConfig);
    }
  }

  // ─── Strategy 1: Local Fuzzy Search (Fuse.js) ─────────────────────────────

  static _localSearch(data, query, columns, searchConfig) {
    if (!data || data.length === 0) return [];

    // Determine searchable keys from searchConfig or column definitions
    let keys = searchConfig.keys;
    if (!keys || keys.length === 0) {
      keys = columns
        .filter(col => col.key && col.key !== 'actions')
        .map(col => col.key);
    }

    // Last-resort fallback: stringify all values
    if (keys.length === 0) {
      return data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    const fuseOptions = {
      keys,
      threshold: searchConfig.threshold ?? 0.35,  // 0.0 = exact, 1.0 = anything
      ignoreLocation: true,                         // match anywhere in string
      useExtendedSearch: false,
      includeScore: true,
      minMatchCharLength: 2,
      ...searchConfig.fuseOptions,
    };

    const fuse = new Fuse(data, fuseOptions);
    return fuse.search(query).map(result => result.item);
  }

  // ─── Strategy 2: Semantic AI Search (Gemini via Firebase Function) ─────────

  static async _semanticSearch(data, query, columns, searchConfig) {
    if (!data || data.length === 0) return [];

    try {
      // Determine which keys to send to the AI (limit context window)
      let keys = searchConfig.keys;
      if (!keys || keys.length === 0) {
        keys = columns
          .filter(col => col.key && col.key !== 'actions')
          .map(col => col.key);
      }

      const functions = getFunctions();
      const tableSemanticSearch = httpsCallable(functions, 'tableSemanticSearch');

      const response = await tableSemanticSearch({
        query,
        rows: data.slice(0, 200), // Safety cap: send at most 200 rows
        keys,
      });

      const { matchingIndices = [], error } = response.data;

      if (error) {
        console.warn('[DataTableSearchEngine] AI search warning:', error, '— falling back to local.');
        return this._localSearch(data, query, columns, searchConfig);
      }

      // Map matching indices back to actual row objects
      return matchingIndices
        .filter(i => i >= 0 && i < data.length)
        .map(i => data[i]);

    } catch (err) {
      // Graceful fallback: if Firebase Function fails (e.g. not deployed),
      // silently fall back to local Fuse.js search so the UI never breaks.
      console.warn('[DataTableSearchEngine] Semantic search failed, falling back to local:', err.message);
      return this._localSearch(data, query, columns, searchConfig);
    }
  }

  // ─── Strategy 3: Algolia (stub — wire up algolia client when ready) ─────────

  static async _algoliaSearch(data, query, searchConfig) {
    if (!process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || !process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY) {
      console.warn('[DataTableSearchEngine] Algolia keys missing. Falling back to local search.');
      return this._localSearch(data, query, [], searchConfig);
    }
    
    try {
      const algolia = algoliasearch(process.env.NEXT_PUBLIC_ALGOLIA_APP_ID, process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY);
      const index = algolia.initIndex(searchConfig.algoliaIndex);
      const { hits } = await index.search(query, { hitsPerPage: 100 });
      return hits;
    } catch (err) {
      console.error('[DataTableSearchEngine] Algolia search failed:', err.message);
      return this._localSearch(data, query, [], searchConfig);
    }
  }
}
