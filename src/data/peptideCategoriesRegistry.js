/**
 * peptideCategoriesRegistry.js
 *
 * Deterministic category classification and server-side facet computation
 * for the Clinical Peptides portfolio and related collections.
 *
 * Adheres strictly to Golden Rule #22 (Server-Side Calculations & Facets).
 */

export const PEPTIDE_CATEGORIES = [
  { id: 'recovery-repair', label: 'Recovery & Tissue Repair' },
  { id: 'metabolic', label: 'Metabolic & GLP-1/GIP' },
  { id: 'longevity', label: 'Longevity & Cellular' },
  { id: 'cognitive', label: 'Neuro & Cognitive' },
  { id: 'hormonal', label: 'Hormonal & GH Axis' }
];

/**
 * Deterministically resolves the primary category ID for any peptide or formulation.
 *
 * @param {Object} product
 * @returns {'recovery-repair' | 'metabolic' | 'longevity' | 'cognitive' | 'hormonal'}
 */
export function resolvePeptideCategory(product) {
  if (!product) return 'recovery-repair';
  const str = `${product.id || ''} ${product.name || ''} ${product.title || ''} ${product.category || ''} ${product.subcategory || ''} ${product.clinical_line || ''} ${product.description || ''} ${product.desc || ''} ${JSON.stringify(product.activeIngredients || [])}`.toLowerCase();

  // 1. Recovery & Tissue Repair
  if (
    str.includes('bpc') ||
    str.includes('tb-500') ||
    str.includes('tb500') ||
    str.includes('ghk') ||
    str.includes('copper peptide') ||
    str.includes('kpv') ||
    str.includes('ll-37') ||
    str.includes('thymosin beta') ||
    str.includes('cartalax') ||
    str.includes('prostamax') ||
    str.includes('cardiogen') ||
    str.includes('repair') ||
    str.includes('healing') ||
    str.includes('wound') ||
    str.includes('tissue') ||
    str.includes('tendon') ||
    str.includes('collagen')
  ) {
    return 'recovery-repair';
  }

  // 2. Metabolic & GLP-1/GIP
  if (
    str.includes('semaglutide') ||
    str.includes('tirzepatide') ||
    str.includes('retatrutide') ||
    str.includes('cagrilintide') ||
    str.includes('cagrisema') ||
    str.includes('aod') ||
    str.includes('tesofensine') ||
    str.includes('liraglutide') ||
    str.includes('5-amino') ||
    str.includes('amlexanox') ||
    str.includes('metabolic') ||
    str.includes('weight') ||
    str.includes('glp') ||
    str.includes('gip') ||
    str.includes('incretin') ||
    str.includes('adiposity') ||
    str.includes('lipolytic')
  ) {
    return 'metabolic';
  }

  // 3. Neuro & Cognitive
  if (
    str.includes('semax') ||
    str.includes('selank') ||
    str.includes('dsip') ||
    str.includes('cerebrolysin') ||
    str.includes('dihexa') ||
    str.includes('pe-22-28') ||
    str.includes('nootropic') ||
    str.includes('cognitive') ||
    str.includes('neuro') ||
    str.includes('brain') ||
    str.includes('sleep') ||
    str.includes('circadian') ||
    str.includes('mood')
  ) {
    return 'cognitive';
  }

  // 4. Hormonal & GH Axis
  if (
    str.includes('cjc') ||
    str.includes('ipamorelin') ||
    str.includes('sermorelin') ||
    str.includes('ghrp') ||
    str.includes('hexarelin') ||
    str.includes('tesamorelin') ||
    str.includes('mk-677') ||
    str.includes('mk677') ||
    str.includes('ibutamoren') ||
    str.includes('gonadorelin') ||
    str.includes('kisspeptin') ||
    str.includes('hcg') ||
    str.includes('hmg') ||
    str.includes('growth hormone') ||
    str.includes('gh') ||
    str.includes('igf') ||
    str.includes('hormon') ||
    str.includes('testagen')
  ) {
    return 'hormonal';
  }

  // 5. Longevity & Cellular
  if (
    str.includes('epithalon') ||
    str.includes('epithalamin') ||
    str.includes('mots') ||
    str.includes('humanin') ||
    str.includes('foxo') ||
    str.includes('ss-31') ||
    str.includes('elamipretide') ||
    str.includes('nad') ||
    str.includes('thymogen') ||
    str.includes('thymulin') ||
    str.includes('snap-8') ||
    str.includes('pt-141') ||
    str.includes('bremelanotide') ||
    str.includes('longevity') ||
    str.includes('cellular') ||
    str.includes('telomer') ||
    str.includes('bioregulator')
  ) {
    return 'longevity';
  }

  // Default fallback if unclassified
  return 'recovery-repair';
}

/**
 * Computes exact category counts on the server side for a list of products.
 *
 * @param {Array} products
 * @param {string} brandSlug
 * @returns {Record<string, number>} Map of categoryId -> count
 */
export function computeServerCategoryCounts(products = [], brandSlug = 'peptides') {
  const counts = {};

  if (brandSlug === 'peptides') {
    PEPTIDE_CATEGORIES.forEach(c => {
      counts[c.id] = 0;
    });

    products.forEach(p => {
      const cat = resolvePeptideCategory(p);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }

  // Generic fallback: match by category field or str
  products.forEach(p => {
    const cat = p.category || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return counts;
}
