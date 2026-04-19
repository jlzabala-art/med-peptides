import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getCatalog } from '../repositories/productRepository';
import { buildProtocolIndex } from '../utils/searchEngine';

const SESSION_KEY_FAQS      = 'rp_cache_faqs';
const SESSION_KEY_MAPPINGS  = 'rp_cache_mappings';
const SESSION_KEY_PROTOCOLS = 'rp_cache_protocols';

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
 * - FAQs, Mappings, Protocol Templates: getDocs + sessionStorage cache
 *   (these collections don't change mid-session; no real-time listener needed).
 *
 * @returns {{ products, setProducts, allFaqs, allMappings, protocolIndex, loadingProducts }}
 */
export function useFirestoreData() {
  const [products, setProducts]           = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [allFaqs, setAllFaqs]             = useState([]);
  const [allMappings, setAllMappings]     = useState([]);
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

  // ── FAQ ↔ Peptide Mappings (cached per session) ───────────────────────────
  useEffect(() => {
    const cached = readCache(SESSION_KEY_MAPPINGS);
    if (cached) { setAllMappings(cached); return; }

    getDocs(collection(db, 'faq_peptide_mapping'))
      .then((snap) => {
        const data = snap.docs.map((d) => d.data());
        writeCache(SESSION_KEY_MAPPINGS, data);
        setAllMappings(data);
      })
      .catch((err) => console.warn('[useFirestoreData] Mappings error:', err.code));
  }, []);

  // ── Protocol Templates (cached per session) ────────────────────────────────
  useEffect(() => {
    const cached = readCache(SESSION_KEY_PROTOCOLS);
    if (cached) { setProtocolIndex(buildProtocolIndex(cached)); return; }

    getDocs(collection(db, 'protocol_templates'))
      .then((snap) => {
        const templates = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        writeCache(SESSION_KEY_PROTOCOLS, templates);
        setProtocolIndex(buildProtocolIndex(templates));
      })
      .catch((err) => console.warn('[useFirestoreData] Protocols error:', err.code));
  }, []);

  return { products, setProducts, allFaqs, allMappings, protocolIndex, loadingProducts };
}
