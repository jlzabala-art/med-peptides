/**
 * placeholderProductService.js
 * Creates minimal "placeholder" products in Firestore when an API ingredient
 * extracted from a Fagron/Genemocis prescription cannot be matched to an
 * existing product in the catalog.
 *
 * These placeholder products:
 *  - status: 'draft'  → never shown to patients/doctors
 *  - isApiPlaceholder: true → visible in Admin "APIs pendientes" filter
 *  - productType: 'small_molecule' → correct for compounding APIs
 */
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import * as fb from '../firebase.js';
const db = fb?.db;

/**
 * Normalise a raw ingredient string to a clean product name.
 * "Latanoprost 0.005%" → "Latanoprost"
 */
export function extractApiBaseName(rawName = '') {
  const cleaned = rawName
    .trim()
    .replace(/\s+\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?.*/i, '')
    .replace(/\s+\(.*?\)/g, '')
    .trim();
  return cleaned || rawName.trim();
}

/**
 * Extract concentration hint from raw ingredient string.
 * "Latanoprost 0.005%" → "0.005%"
 */
export function extractConcentration(rawName = '') {
  const match = rawName.match(/(\d[\d.,]*\s*(%|mg|ml|mcg|ug|g|iu|µg)?)/i);
  return match ? match[0].trim() : '';
}

/**
 * Check if a placeholder for this API base name already exists.
 */
async function findExistingPlaceholder(baseName) {
  try {
    const q = query(
      collection(db, 'products'),
      where('isApiPlaceholder', '==', true),
      where('name', '==', baseName)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Create a placeholder product for an unmatched API ingredient.
 *
 * @param {Object} options
 * @param {string}  options.rawName        - Original AI-extracted name ("Latanoprost 0.005%")
 * @param {string}  [options.supplierHint] - Suggested supplier ("Fagron Iberia")
 * @param {string}  [options.importSource] - Import source context ("fagron_genemocis")
 * @returns {Promise<{ productId: string, isNew: boolean, name: string }>}
 */
export async function createPlaceholderApiProduct({
  rawName,
  supplierHint = 'Fagron Iberia',
  importSource = 'fagron_genemocis',
}) {
  const baseName = extractApiBaseName(rawName);
  const concentration = extractConcentration(rawName);

  // Re-use existing placeholder if already created from a previous import
  const existing = await findExistingPlaceholder(baseName);
  if (existing) {
    return { productId: existing.id, isNew: false, name: baseName };
  }

  const now = new Date().toISOString();
  const slug = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const placeholderDoc = {
    name: baseName,
    displayName: baseName,
    cas: '',
    productType: 'small_molecule',
    status: 'draft',
    slug: `${slug}-api-placeholder`,
    isBlend: false,
    blendComponents: [],

    // Placeholder flags
    isApiPlaceholder: true,
    _needsCompletion: true,
    _createdFromImport: true,

    // Supplier and import hints for admin
    supplierHint,
    importSource,
    defaultConcentration: concentration,

    identity: {
      synonyms: [rawName],
      searchAliases: [baseName.toLowerCase()],
      semanticKeywords: ['api', 'compounding', 'active pharmaceutical ingredient'],
    },
    science: {
      desc: `[Placeholder] ${baseName} — imported from ${importSource}. Requires completion.`,
      objective: '',
      scientificName: baseName,
      molecularWeight: null,
      molecularFormula: '',
      pharmacokinetics: { halfLife: '', bioavailability: '', route: [], metabolism: '' },
      storageConditions: { temperature: '', light: '', shelfLife: '' },
      mechanisms: [],
      mechanismSummary: '',
      researchFocus: [],
      researchStatus: 'Unknown',
      referencePmids: [],
      safetyNote: '',
      contraindications: [],
    },
    classification: {
      goals: [],
      secondaryFactors: [],
      tags: ['api', 'compounding', 'placeholder'],
      categories: ['api', 'compounding'],
    },
    aiContent: {
      faqModalEnabled: false,
      scientificModalEnabled: false,
      faqModalItems: [],
      summary: '',
      beginnerExplanation: '',
      scientificSummary: '',
    },
    typeData: {},
    ui: { image: '/assets/vials/generic-vial.png' },
    variants: [],
    meta: {
      schemaVersion: 2,
      source: 'fagron_import',
      supplierHint,
      seedVersion: 1,
      createdAt: now,
      updatedAt: now,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'products'), placeholderDoc);
  return { productId: docRef.id, isNew: true, name: baseName };
}
