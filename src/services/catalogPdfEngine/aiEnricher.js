/**
 * aiEnricher.js — Cache-first AI enrichment for catalog products.
 *
 * LOGIC: Before calling the Gemini backend, always check:
 *   1. In-memory session cache (Map) → fastest, zero network
 *   2. Firestore `productEnrichments` collection → free if already generated
 *   3. Only if both miss → call catalogAIService backend (Gemini)
 *
 * This respects the principle: "Enrich only if data doesn't exist yet."
 */

import { db } from '../../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  'https://europe-west1-med-peptides-app.cloudfunctions.net';

// ── Session-level memory cache ─────────────────────────────────────────────
const SESSION_CACHE = new Map();

// ── Firestore collection for persistent enrichment cache ───────────────────
const ENRICHMENT_COLLECTION = 'productEnrichments';

/**
 * Normalize a product name into a stable cache key.
 * e.g. "BPC-157 (5mg)" → "bpc157"
 */
function toCacheKey(productName) {
  return productName
    .toLowerCase()
    .replace(/[\s\-_().]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 60);
}

/**
 * Attempt to retrieve enrichment from Firestore.
 * Returns null if not found or data is older than 90 days.
 */
async function fromFirestore(cacheKey) {
  try {
    const ref = doc(db, ENRICHMENT_COLLECTION, cacheKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data();
    // Invalidate if older than 90 days
    const ageMs = Date.now() - (data.generatedAt?.toMillis?.() || 0);
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    if (ageMs > ninetyDaysMs) return null;

    return data.enrichment;
  } catch {
    return null; // Gracefully degrade on permission errors
  }
}

/**
 * Persist enrichment result to Firestore for future use.
 */
async function toFirestore(cacheKey, enrichment) {
  try {
    const ref = doc(db, ENRICHMENT_COLLECTION, cacheKey);
    await setDoc(ref, {
      enrichment,
      generatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('[aiEnricher] Could not cache to Firestore:', e.message);
  }
}

/**
 * Call the Gemini backend to generate clinical enrichment for a product.
 * Uses the existing `catalogAiAssistant` Cloud Function.
 */
async function fromGemini(productName, authToken) {
  const response = await fetch(`${BASE_URL}/catalogAiAssistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({
      mode: 'enrich_product',
      productName,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI enrichment failed: ${response.status}`);
  }

  const json = await response.json();
  return {
    summary: json.summary || '',
    mechanism: json.mechanism || '',
    indications: json.indications || [],
    contraindications: json.contraindications || [],
    dosageReference: json.dosageReference || '',
    references: json.references || [],
    generatedBy: 'gemini',
  };
}

/**
 * Main export: enrich a single product with clinical data.
 * Follows strict cache-first logic.
 *
 * @param {string} productName - Name/title of the compound
 * @param {string|null} authToken - Firebase auth token for backend calls
 * @param {{ force?: boolean }} options - Set force:true to bypass cache
 * @returns {Promise<Object>} enrichment object
 */
export async function enrichProduct(productName, authToken = null, options = {}) {
  const cacheKey = toCacheKey(productName);

  // 1️⃣ Session cache hit?
  if (!options.force && SESSION_CACHE.has(cacheKey)) {
    console.debug(`[aiEnricher] Session cache hit: ${productName}`);
    return SESSION_CACHE.get(cacheKey);
  }

  // 2️⃣ Firestore cache hit?
  if (!options.force) {
    const cached = await fromFirestore(cacheKey);
    if (cached) {
      console.debug(`[aiEnricher] Firestore cache hit: ${productName}`);
      SESSION_CACHE.set(cacheKey, cached);
      return cached;
    }
  }

  // 3️⃣ Call Gemini — only if nothing is cached
  console.info(`[aiEnricher] Generating enrichment via AI for: ${productName}`);
  const enrichment = await fromGemini(productName, authToken);

  // Save to both caches
  SESSION_CACHE.set(cacheKey, enrichment);
  toFirestore(cacheKey, enrichment); // fire-and-forget

  return enrichment;
}

/**
 * Enrich a batch of products concurrently (max 3 parallel to avoid rate limits).
 * Already-cached products are resolved instantly.
 *
 * @param {Array<{name: string}>} products
 * @param {string|null} authToken
 * @param {(progress: number) => void} onProgress - callback with 0-100
 */
export async function enrichProductBatch(products, authToken = null, onProgress = null) {
  const results = {};
  const CONCURRENCY = 3;
  let done = 0;

  const chunks = [];
  for (let i = 0; i < products.length; i += CONCURRENCY) {
    chunks.push(products.slice(i, i + CONCURRENCY));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(async (product) => {
      const name = product.name || product.title || product.productTitle || '';
      if (!name) return;
      try {
        results[name] = await enrichProduct(name, authToken);
      } catch (e) {
        console.warn(`[aiEnricher] Failed to enrich "${name}":`, e.message);
        results[name] = null;
      }
      done++;
      if (onProgress) onProgress(Math.round((done / products.length) * 100));
    }));
  }

  return results;
}
