 
/**
 * recentViews.js — Phase 4-D
 *
 * Tiny localStorage-based tracker for recently visited items.
 *
 * Usage (in ProductDetail, ProtocolTemplate, etc.):
 *   import { trackRecentView } from '../utils/recentViews';
 *   trackRecentView({ type: 'peptide', slug: 'bpc-157', name: 'BPC-157' });
 *
 * The RecentlyExplored section reads 'rp_recent_views' and listens for
 * the 'rp_recent_updated' custom event to re-render without a page reload.
 */

const STORAGE_KEY = 'rp_recent_views';
const MAX_STORED  = 20; // keep at most 20 in localStorage

/**
 * @typedef {{ type: 'peptide'|'protocol'|'supplement', slug: string, name: string, ts: number }} RecentItem
 */

/**
 * Record a view. Deduplicates by type+slug (newest wins).
 * Fires a 'rp_recent_updated' event so same-tab listeners refresh.
 *
 * @param {{ type: string, slug: string, name: string }} item
 */
export function trackRecentView({ type, slug, name }) {
  if (!slug || !name || !type) return;

  try {
    const raw    = localStorage.getItem(STORAGE_KEY);
    const stored = raw ? JSON.parse(raw) : [];
    const list   = Array.isArray(stored) ? stored : [];

    // Remove stale entry for the same type+slug
    const filtered = list.filter((e) => !(e.type === type && e.slug === slug));

    // Prepend newest
    filtered.unshift({ type, slug, name, ts: Date.now() });

    // Trim to cap
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_STORED)));

    // Notify same-tab listeners (storage event fires only across tabs)
    window.dispatchEvent(new Event('rp_recent_updated'));
  } catch {
    // localStorage may be unavailable (private mode, quota exceeded, etc.) — fail silently.
  }
}

/**
 * Read the list of recent views (newest first).
 * @returns {RecentItem[]}
 */
export function getRecentViews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
