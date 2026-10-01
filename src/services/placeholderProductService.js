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
import { collection, addDoc, query, where, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import * as fb from '../firebase.js';
import { getFagronClinicalMonograph } from '../data/fagronClinicalMonographs.js';
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
      where('name', '==', baseName),
      limit(1)
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

  const mono = getFagronClinicalMonograph(baseName) || getFagronClinicalMonograph(rawName);

  const placeholderDoc = {
    name: mono?.canonicalName || baseName,
    displayName: mono?.canonicalName || baseName,
    cas: '',
    productType: 'small_molecule',
    status: mono ? 'published' : 'draft',
    slug: `${slug}-api`,
    isBlend: false,
    blendComponents: [],

    // Placeholder flags
    isApiPlaceholder: !mono,
    _needsCompletion: !mono,
    _createdFromImport: true,

    // Supplier and import hints for admin
    supplierHint,
    importSource,
    defaultConcentration: concentration,

    identity: {
      synonyms: mono?.aliases ? [...new Set([rawName, ...mono.aliases])] : [rawName],
      searchAliases: mono?.aliases ? [...new Set([baseName.toLowerCase(), ...mono.aliases.map(a => a.toLowerCase())])] : [baseName.toLowerCase()],
      semanticKeywords: ['api', 'compounding', 'active pharmaceutical ingredient', ...(mono?.geneTargets || [])],
    },
    science: {
      desc: mono?.mechanismOfAction || `[Compounding API] ${baseName} — imported from ${importSource}.`,
      objective: mono?.clinicalIndication || '',
      scientificName: mono?.canonicalName || baseName,
      molecularWeight: null,
      molecularFormula: '',
      pharmacokinetics: { halfLife: '', bioavailability: '', route: [], metabolism: '' },
      storageConditions: { temperature: '', light: '', shelfLife: '' },
      mechanisms: mono?.mechanismOfAction ? [{ title: mono.pharmacologicalClass || 'Mecanismo Celular', description: mono.mechanismOfAction }] : [],
      mechanismSummary: mono?.mechanismOfAction || '',
      geneTargets: mono?.geneTargets || [],
      pharmacologicalClass: mono?.pharmacologicalClass || '',
      clinicalIndication: mono?.clinicalIndication || '',
      compatibleVehicles: mono?.compatibleVehicles || [],
      standardDosages: mono?.standardDosages || '',
      researchFocus: mono?.geneTargets || [],
      researchStatus: 'Validated',
      referencePmids: [],
      safetyNote: '',
      contraindications: [],
    },
    classification: {
      goals: mono?.clinicalIndication ? [mono.clinicalIndication] : [],
      secondaryFactors: [],
      tags: ['api', 'compounding', ...(mono?.geneTargets || [])],
      categories: ['api', 'compounding', ...(mono?.fagronPrograms || [])],
    },
    aiContent: {
      faqModalEnabled: false,
      scientificModalEnabled: false,
      faqModalItems: [],
      summary: mono?.mechanismOfAction || '',
      beginnerExplanation: mono?.clinicalIndication || '',
      scientificSummary: mono?.mechanismOfAction || '',
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
