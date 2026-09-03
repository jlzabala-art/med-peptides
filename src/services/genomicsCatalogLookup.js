/**
 * genomicsCatalogLookup.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fast in-memory & Firestore cached lookup for Fagron Genomics Programs:
 * - TeloTest (fagron-genomics-telotest)
 * - TrichoTest (fagron-genomics-trichotest)
 * - NutriGen (fagron-genomics-nutrigen)
 *
 * Implements:
 * 1. Program-first matching (resolves incoming test APIs against canonical products)
 * 2. Aliases & synonym expansion (e.g. NAC, Cholecalciferol, Cyanocobalamin, ALA)
 * 3. Out-of-program alert generation when a test requests an unassigned API
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import * as fb from '../firebase.js';
const db = fb?.db;

// Cache holding canonical genomic products in memory
let genomicProductsCache = null;
let lastCacheFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Known synonym / alias dictionary for compounding APIs & nutrients
export const GENOMIC_SYNONYMS = {
  // Antioxidants & Cellular
  'nac': 'n-acetylcysteine',
  'n-acetyl-cysteine': 'n-acetylcysteine',
  'n-acetyl-l-cysteine': 'n-acetylcysteine',
  'acetylcysteine': 'n-acetylcysteine',
  'ala': 'alpha-lipoic-acid',
  'a-lipoic acid': 'alpha-lipoic-acid',
  'alpha lipoic acid': 'alpha-lipoic-acid',
  'alpha-lipoic acid': 'alpha-lipoic-acid',
  'glutathione': 'glutathione',
  'l-glutathione': 'glutathione',
  'gsh': 'glutathione',
  'coq10': 'ubiquinol',
  'coenzyme q10': 'ubiquinol',
  'ubiquinone': 'ubiquinol',
  
  // Vitamins & Minerals
  'cholecalciferol': 'vitamin-d3',
  'vitamin d': 'vitamin-d3',
  'vitamin d3': 'vitamin-d3',
  'vit d3': 'vitamin-d3',
  'tocopherol': 'vitamin-e',
  'vitamin e': 'vitamin-e',
  'alpha-tocopherol': 'vitamin-e',
  'ascorbic acid': 'vitamin-c',
  'vitamin c': 'vitamin-c',
  'cyanocobalamin': 'vitamin-b12',
  'methylcobalamin': 'vitamin-b12',
  'vitamin b12': 'vitamin-b12',
  'vit b12': 'vitamin-b12',
  'thiamine': 'thiamine-hcl',
  'thiamine hcl': 'thiamine-hcl',
  'vitamin b1': 'thiamine-hcl',
  'riboflavin': 'riboflavin',
  'vitamin b2': 'riboflavin',
  'niacin': 'niacin',
  'nicotinic acid': 'niacin',
  'niacinamide': 'nicotinamide',
  'nicotinamide': 'nicotinamide',
  'vitamin b3': 'nicotinamide',
  'pantothenic acid': 'calcium-pantothenate',
  'calcium pantothenate': 'calcium-pantothenate',
  'vitamin b5': 'calcium-pantothenate',
  'pyridoxine': 'pyridoxine-hcl',
  'pyridoxine hcl': 'pyridoxine-hcl',
  'vitamin b6': 'pyridoxine-hcl',
  'biotin': 'biotin',
  'vitamin b7': 'biotin',
  'vitamin h': 'biotin',
  'folic acid': 'methylfolate',
  'folate': 'methylfolate',
  'l-methylfolate': 'methylfolate',
  '5-mthf': 'methylfolate',
  'vitamin b9': 'methylfolate',
  'menaquinone': 'vitamin-k2',
  'menaquinone-7': 'vitamin-k2',
  'mk-7': 'vitamin-k2',
  'vitamin k2': 'vitamin-k2',
  'retinol': 'retinol-vitamin-a',
  'retinyl palmitate': 'retinol-vitamin-a',
  'vitamin a': 'retinol-vitamin-a',

  // Capillary & TrichoTest specific
  '17-a estradiol': '17-alpha-estradiol',
  '17-alpha estradiol': '17-alpha-estradiol',
  '17 alpha estradiol': '17-alpha-estradiol',
  '17a-estradiol': '17-alpha-estradiol',
  'ciclopirox': 'ciclopirox-olamine',
  'ciclopirox olamine': 'ciclopirox-olamine',
  'minoxidil base': 'minoxidil',
  'minoxidil sulfate': 'minoxidil',
  'finasteride': 'finasteride',
  'dutasteride': 'dutasteride',
  'latanoprost': 'latanoprost',
  'spironolactone': 'spironolactone',
  'clobetasol': 'clobetasol-propionate',
  'clobetasol propionate': 'clobetasol-propionate',
  'ketoconazole': 'ketoconazole',
  'melatonin': 'melatonin',
  'ginkgo': 'ginkgo-biloba',
  'ginkgo biloba': 'ginkgo-biloba',

  // Vehicles & Bases
  'trichosol': 'trichosol-fagron',
  'tricho-sol': 'trichosol-fagron',
  'trichooil': 'trichooil-fagron',
  'tricho-oil': 'trichooil-fagron',
  'trichofoam': 'trichofoam-fagron',
  'tricho-foam': 'trichofoam-fagron',
  'pentravan': 'pentravan-fagron',
  'oliogel': 'oliogel-fagron',
  'versatile': 'versatile-fagron',
};

/**
 * Normalizes a raw string into a searchable alphanumeric key.
 */
export function normalizeGenomicKey(str = '') {
  return String(str || '')
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Maps program name/string to canonical program slug.
 */
export function resolveProgramSlug(programInput = '') {
  if (!programInput) return null;
  const low = String(programInput).toLowerCase();
  if (low.includes('telo') || low.includes('telotest')) return 'fagron-genomics-telotest';
  if (low.includes('tricho') || low.includes('trichotest')) return 'fagron-genomics-trichotest';
  if (low.includes('nutri') || low.includes('nutrigen')) return 'fagron-genomics-nutrigen';
  if (low.includes('ultra') || low.includes('ultraperson')) return 'ultraperson';
  if (low.includes('eterna')) return 'eterna';
  return null;
}

/**
 * Maps program slug to human display name.
 */
export function getProgramDisplayName(slugOrName = '') {
  const slug = resolveProgramSlug(slugOrName);
  if (slug === 'fagron-genomics-telotest') return 'TeloTest';
  if (slug === 'fagron-genomics-trichotest') return 'TrichoTest';
  if (slug === 'fagron-genomics-nutrigen') return 'NutriGen';
  if (slug === 'ultraperson') return 'Ultraperson Test';
  if (slug === 'eterna') return 'ETERNA® Longevity Test';
  return String(slugOrName || 'Genomics Test');
}

/**
 * Invalidates the in-memory cache to force a fresh pull from Firestore.
 */
export function invalidateGenomicsCache() {
  genomicProductsCache = null;
  lastCacheFetchTime = 0;
  console.log('[genomicsCatalogLookup] Cache invalidated successfully.');
}

/**
 * Fetches and caches all canonical Fagron Genomics products from Firestore.
 */
export async function getGenomicProductsCache(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && genomicProductsCache && (now - lastCacheFetchTime < CACHE_TTL_MS)) {
    return genomicProductsCache;
  }

  if (!db) {
    return [];
  }

  try {
    const q = query(
      collection(db, 'products'),
      where('tags', 'array-contains', 'Fagron Genomics')
    );
    const snap = await getDocs(q);
    const list = [];
    snap.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() });
    });

    genomicProductsCache = list;
    lastCacheFetchTime = now;
    return list;
  } catch (err) {
    console.warn('[genomicsCatalogLookup] Failed to fetch genomics cache from Firestore:', err);
    return genomicProductsCache || [];
  }
}

/**
 * Finds a matching canonical product in the Fagron Genomics catalog.
 *
 * @param {string} rawName - Raw extracted ingredient name (e.g. "Minoxidil 5%", "NAC 600mg")
 * @param {string} [programFilter] - Program slug or name (e.g. "TrichoTest", "fagron-genomics-nutrigen")
 * @returns {Promise<{
 *   matchedProduct: Object|null,
 *   isProgramAssigned: boolean,
 *   priority: string|null,
 *   programSlug: string|null,
 *   programName: string|null,
 *   isUnassignedProgramApi: boolean,
 *   programAlert: string|null
 * }>}
 */
export async function lookupGenomicIngredient(rawName, programFilter = null) {
  const targetProgramSlug = resolveProgramSlug(programFilter);
  const targetProgramName = getProgramDisplayName(programFilter);

  const cleanBase = String(rawName || '')
    .replace(/\s+\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?.*/i, '')
    .replace(/\s+\(.*?\)/g, '')
    .trim();

  const normInput = normalizeGenomicKey(cleanBase);
  const synonymSlug = GENOMIC_SYNONYMS[cleanBase.toLowerCase()] || GENOMIC_SYNONYMS[normInput];

  const products = await getGenomicProductsCache();

  // 1. Check exact match or synonym match in cache
  let matchedProduct = null;

  for (const prod of products) {
    const prodId = prod.id;
    const prodSlug = prod.slug || prod.id;
    const prodName = prod.name || prod.displayName || prod.canonicalName || '';
    const normProdName = normalizeGenomicKey(prodName);
    const aliases = Array.isArray(prod.aliases) ? prod.aliases.map(a => normalizeGenomicKey(a)) : [];

    if (synonymSlug && (prodId === synonymSlug || prodSlug === synonymSlug)) {
      matchedProduct = prod;
      break;
    }

    if (normInput === normProdName || normInput === normalizeGenomicKey(prodId) || aliases.includes(normInput)) {
      matchedProduct = prod;
      break;
    }

    if (normProdName.includes(normInput) || normInput.includes(normProdName)) {
      matchedProduct = prod;
      break;
    }
  }

  // 2. Evaluate Program Assignment & Alerts
  if (matchedProduct) {
    const programs = Array.isArray(matchedProduct.programs) ? matchedProduct.programs : [];
    
    if (targetProgramSlug) {
      const progAssoc = programs.find(p => p.slug === targetProgramSlug || p.id === targetProgramSlug);
      
      if (progAssoc) {
        // Matched and assigned to this specific program
        return {
          matchedProduct,
          isProgramAssigned: true,
          priority: progAssoc.priority || 'A',
          programSlug: targetProgramSlug,
          programName: targetProgramName,
          isUnassignedProgramApi: false,
          programAlert: null
        };
      } else {
        // Product exists in genomics/canonical catalog, but NOT assigned to this test!
        return {
          matchedProduct,
          isProgramAssigned: false,
          priority: null,
          programSlug: targetProgramSlug,
          programName: targetProgramName,
          isUnassignedProgramApi: true,
          programAlert: `⚠️ Alerta: El API "${matchedProduct.name || cleanBase}" existe en el catálogo pero NO está en la lista oficial de ${targetProgramName} (Fagron Genomics).`
        };
      }
    }

    // No specific program requested, matched general genomics
    const firstProg = programs[0] || {};
    return {
      matchedProduct,
      isProgramAssigned: true,
      priority: firstProg.priority || null,
      programSlug: firstProg.slug || null,
      programName: firstProg.name || 'Fagron Genomics',
      isUnassignedProgramApi: false,
      programAlert: null
    };
  }

  // 3. Not found in Genomics catalog
  return {
    matchedProduct: null,
    isProgramAssigned: false,
    priority: null,
    programSlug: targetProgramSlug,
    programName: targetProgramName,
    isUnassignedProgramApi: !!targetProgramSlug,
    programAlert: targetProgramSlug 
      ? `⚠️ Alerta: El API "${cleanBase}" no se encuentra catalogado en la lista oficial de ${targetProgramName} (Fagron Genomics).`
      : null
  };
}
