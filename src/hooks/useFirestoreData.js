import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getCatalog } from '../repositories/productRepository';
import { buildProtocolIndex } from '../utils/searchEngine';
import localProtocolIndex from '../data/protocol_search_index.json';

const SESSION_KEY_FAQS      = 'rp_cache_faqs';
const SESSION_KEY_PROTOCOLS = 'rp_cache_protocols_v2';

/** Read from sessionStorage; returns null if missing / parse error. */
function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Write to sessionStorage; silently ignores errors (private mode, quota, etc.). */
function writeCache(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

/**
 * Loads all core read-only Firestore data once per browser session.
 * - Products: fetched via getCatalog() (includes variants subcollection).
 * - FAQs, Protocol Templates: getDocs + sessionStorage cache
 *   (these collections don't change mid-session; no real-time listener needed).
 *
 * @returns {{ products, setProducts, allFaqs, protocolIndex, loadingProducts }}
 */
export function useFirestoreData() {
  const [products, setProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [allFaqs, setAllFaqs]             = useState([]);
  const [protocolIndex, setProtocolIndex] = useState([]);

  // ── Products: one-time fetch via repository (includes variants subcollection) ──
  useEffect(() => {
    let cancelled = false;
    setLoadingProducts(true);

    getCatalog()
      .then((catalog) => { if (!cancelled) setProducts(catalog); })
      .catch((err)    => { console.error('[useFirestoreData] getCatalog error:', err); })
      .finally(()     => { if (!cancelled) setLoadingProducts(false); });

    return () => { cancelled = true; };
  }, []);

  // ── FAQs (cached per session) ─────────────────────────────────────────────
  useEffect(() => {
    const cached = readCache(SESSION_KEY_FAQS);
    if (cached) { setAllFaqs(cached); return; }

    getDocs(collection(db, 'peptide_faq'))
      .then((snap) => {
        const data = snap.docs.map((d) => ({ ...d.data(), faqId: d.id }));
        writeCache(SESSION_KEY_FAQS, data);
        setAllFaqs(data);
      })
      .catch((err) => console.warn('[useFirestoreData] FAQs error:', err.code));
  }, []);



  // ── Protocol Index for Search ─────────────────────────────────────────────
  // Uses the lightweight local index (protocol_search_index.json, ~7KB) as the
  // primary source. This is pre-built from protocolBlueprintsV2.json and contains
  // the clinically accurate protocol names. Firestore blueprints are loaded
  // separately only when a full protocol detail is needed (protocolEngine.js).
  useEffect(() => {
    if (localProtocolIndex && localProtocolIndex.length > 0) {
      // Use static local index — fast, no network request, always up-to-date names
      setProtocolIndex(localProtocolIndex);
      return;
    }

    // Fallback: fetch from Firestore and build index dynamically
    const cached = readCache(SESSION_KEY_PROTOCOLS);
    if (cached) { setProtocolIndex(buildProtocolIndex(cached)); return; }

    const q = query(collection(db, 'protocols'), where('active', '==', true));
    getDocs(q)
      .then((snap) => {
        const templates = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        writeCache(SESSION_KEY_PROTOCOLS, templates);
        setProtocolIndex(buildProtocolIndex(templates));
      })
      .catch((err) => console.warn('[useFirestoreData] Protocols fallback error:', err.code));
  }, []);

  return { products, setProducts, allFaqs, protocolIndex, loadingProducts };
}
