 
import { db } from '../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const API_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

/**
 * SINGLETON MEMORY CACHE
 * Avoids multiple queries to Firebase/API in the same user session.
 */
const MEMORY_CACHE = new Map();

/**
 * PHARMA-CLEANER: Aggressive normalization of product names.
 * Ported from scripts/prewarm-pubmed-cache.mjs for alignment.
 */
const getPharmaBaseName = (name) => {
  if (!name) return '';
  
  let clean = name;
  
  // 1. Parentheses handling
  const parenMatch = clean.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const content = parenMatch[1].trim();
    if (content.includes('/') || content.includes('+')) {
      const parts = content.split(/[\/+]/);
      clean = parts[0].trim();
    } else {
      // Use parenthetical synonym if chemical/pharmacological name
      if (content.toLowerCase() === 'copper peptide') {
        clean = 'GHK-Cu';
      } else {
        clean = content;
      }
    }
  }
  
  // Remove parenthetical stuff if we didn't use it
  clean = clean.replace(/\s*\([^)]*\)/g, '');
  
  // 2. Separate blends (keep only first compound name)
  if (clean.includes('+')) {
    clean = clean.split('+')[0].trim();
  }
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }
  
  // 3. Remove "with DAC" / "without DAC" and other commercial suffixes
  clean = clean.replace(/\s+with\s+DAC\b/gi, '');
  clean = clean.replace(/\s+without\s+DAC\b/gi, '');
  clean = clean.replace(/\s+DAC\b/gi, '');
  
  // 4. Specific product mappings to maximize matches
  const upper = clean.toUpperCase().trim();
  if (upper.includes('5-AMINO 1 MQ') || upper.includes('5-AMINO-1-MQ')) {
    return '5-amino-1-methylquinolinium';
  }
  if (upper === 'LDN') {
    return 'low dose naltrexone';
  }
  if (upper === 'SNAP-8' || upper === 'SNAP 8') {
    return 'acetyl octapeptide 3';
  }
  
  // 5. Remove dosage/unit qualifiers cleanly
  clean = clean.replace(/\s*\d+(?:,\d+)*(?:\.\d+)?\s*(?:mg|mcg|ml|g|iu|ui|spu)\b/gi, '');
  
  // 6. General commercial noise
  clean = clean.replace(/\/?\s?vial\b/gi, '');
  clean = clean.replace(/\b(pure|grade|research|grade|lyophilized|acetate)\b/gi, '');
  
  return clean.trim();
};

/**
 * PUBMED SERVICE - ANTIGRAVITY VERSION
 * Implements 'Stale-While-Revalidate' for instant mobile loading.
 */
export async function getPubMedLiterature(product) {
  if (!product?.name) return [];

  const slug = product.slug || product.name.toLowerCase().replace(/\s+/g, '-');
  const baseName = getPharmaBaseName(product.name);

  // 1. MEMORY CACHE LOOKUP (Instant)
  if (MEMORY_CACHE.has(slug)) return MEMORY_CACHE.get(slug);

  let cachedDoc = null;

  try {
    // 2. FIREBASE CACHE LOOKUP - Direct document get by slug ID
    const docRef = doc(db, 'pubmed_cache', slug);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      cachedDoc = docSnap.data();

      const now = new Date();
      const expiresAt = cachedDoc.expiresAt instanceof Timestamp
        ? cachedDoc.expiresAt.toDate()
        : new Date(cachedDoc.expiresAt);

      // STRATEGY: Stale-While-Revalidate
      // If cache exists, return it immediately to avoid making mobile wait
      if (cachedDoc.articles) {
        // If expired, trigger background update (asynchronous)
        if (now > expiresAt) {
          refreshPubMedCache(slug, baseName);
        }
        MEMORY_CACHE.set(slug, cachedDoc.articles);
        return cachedDoc.articles;
      }
    }

    // 3. FETCH IF NO CACHE (First access)
    return await refreshPubMedCache(slug, baseName);

  } catch (error) {
    console.error('PubMed Service Error:', error);
    return cachedDoc?.articles || [];
  }
}

/**
 * Internal function to update the cache without blocking the main thread.
 */
async function refreshPubMedCache(slug, searchQuery) {
  try {
    // AbortController for mobile network optimization
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const searchUrl = `${API_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(searchQuery)}&retmode=json&retmax=3`;
    const searchRes = await fetch(searchUrl, { signal: controller.signal });
    const searchData = await searchRes.json();
    clearTimeout(timeoutId);

    const ids = searchData.esearchresult?.idlist || [];
    if (ids.length === 0) {
      // Cache empty result to avoid hitting PubMed API repeatedly
      const articles = [];
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      
      try {
        const docRef = doc(db, 'pubmed_cache', slug);
        await setDoc(docRef, {
          productSlug: slug,
          queryUsed: searchQuery,
          articles,
          expiresAt: expires,
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (writeErr) {
        console.warn('Failed to write empty pubmed_cache to Firestore:', writeErr);
      }
      MEMORY_CACHE.set(slug, articles);
      return articles;
    }

    const summaryUrl = `${API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const summaryRes = await fetch(summaryUrl);
    const summaryData = await summaryRes.json();

    const articles = ids.map(id => {
      const info = summaryData.result?.[id];
      if (!info) return null;
      return {
        pmid: id,
        title: (info.title || 'Scientific Publication').replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags
        journal: (info.fulljournalname || info.source || 'Medical Journal').toUpperCase(),
        year: info.pubdate ? parseInt(info.pubdate.substring(0, 4)) : 'N/D',
        pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
      };
    }).filter(Boolean);

    // Save to Firestore (7-day validity)
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    try {
      const docRef = doc(db, 'pubmed_cache', slug);
      await setDoc(docRef, {
        productSlug: slug,
        queryUsed: searchQuery,
        articles,
        expiresAt: expires,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (writeErr) {
      console.warn('Failed to write pubmed_cache to Firestore:', writeErr);
    }

    MEMORY_CACHE.set(slug, articles);
    return articles;

  } catch (err) {
    console.warn('Background Refresh Failed', err);
    return [];
  }
}