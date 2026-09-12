/**
 * src/utils/canonicalProductRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Canonical Peptide & Product Registry
 *
 * Provides deterministic mapping of raw supplier names, import variations,
 * and presentation titles to:
 * 1. canonicalKey: Clean, slugified unique identifier (e.g. "klow", "glow", "bpc-157")
 *    Used by Algolia as `attributeForDistinct` to collapse identical peptides
 *    across suppliers (Magenta, Lotusland, Fagron, etc.).
 * 2. canonicalName: Standardized clinical display title (e.g. "KLOW (BPC-157 / TB-500 / GHK-Cu / KPV)").
 *
 * Golden Rule: Never rely on substring matches without exact token boundaries
 * to avoid misclassifications (e.g. "nadolol" should NEVER be classified as "NAD+").
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Explicit definitions for primary peptides and known proprietary blends
export const KNOWN_CANONICAL_PEPTIDES = {
  // Blends
  'klow': {
    canonicalKey: 'klow',
    canonicalName: 'KLOW (BPC-157 / TB-500 / GHK-Cu / KPV)',
    aliases: ['klow', 'klow peptide', 'klow (bpc-157 / tb-500 / ghkcu / kpv)', 'klow (bpc-157 + tb-500 + ghk-cu + kpv)'],
    category: 'Peptide Blend'
  },
  'glow': {
    canonicalKey: 'glow',
    canonicalName: 'GLOW (BPC-157 / TB-500 / GHK-Cu)',
    aliases: ['glow', 'glow triple peptide', 'glow stack', 'glow (bpc-157 + tb-500 + ghk)', 'glow (ghk-cu + bpc-157 + tb-500)'],
    category: 'Peptide Blend'
  },
  'bpc-157-tb-500': {
    canonicalKey: 'bpc-157-tb-500',
    canonicalName: 'BPC-157 + TB-500 Blend',
    aliases: ['bpc-157 + tb-500', 'bpc-157 + tb-500 blend', 'bpc-157 + tb-500 stack', 'bpc-10mg-tb-10mg', 'bpc-5-mgtb-5-mg'],
    category: 'Peptide Blend'
  },
  'bpc-157-tb-500-ghk-cu': {
    canonicalKey: 'bpc-157-tb-500-ghk-cu',
    canonicalName: 'BPC-157 + TB-500 + GHK-Cu Stack',
    aliases: ['bpc-157 + tb-500 + ghk-cu', 'bpc-157/tb-500/ghk-cu'],
    category: 'Peptide Blend'
  },
  'cagrilintide-semaglutide': {
    canonicalKey: 'cagrilintide-semaglutide',
    canonicalName: 'Cagrilintide + Semaglutide (CagriSema)',
    aliases: ['cagrisema', 'cagrilintide + semaglutide', 'cagrilintide + semaglutide (cagrisema)'],
    category: 'Peptide Blend'
  },

  // Single Peptides
  'bpc-157': {
    canonicalKey: 'bpc-157',
    canonicalName: 'BPC-157 (Body Protection Compound)',
    aliases: ['bpc-157', 'bpc157', 'bpc 157'],
    category: 'Recovery & Healing'
  },
  'tb-500': {
    canonicalKey: 'tb-500',
    canonicalName: 'TB-500 (Thymosin Beta-4)',
    aliases: ['tb-500', 'tb500', 'tb 500', 'thymosin beta-4', 'thymosin beta 4', 'thymosin β4', 'thymosin β4 (tb-500)', 'thymosin beta (tb-500)'],
    category: 'Recovery & Healing'
  },
  'tirzepatide': {
    canonicalKey: 'tirzepatide',
    canonicalName: 'Tirzepatide',
    aliases: ['tirzepatide', 'tirzepatide dual glp-1/gip agonist', 'tirzepatide api'],
    category: 'Metabolic & Weight'
  },
  'semaglutide': {
    canonicalKey: 'semaglutide',
    canonicalName: 'Semaglutide',
    aliases: ['semaglutide', 'semaglutide glp-1 receptor agonist', 'semaglutide api'],
    category: 'Metabolic & Weight'
  },
  'retatrutide': {
    canonicalKey: 'retatrutide',
    canonicalName: 'Retatrutide',
    aliases: ['retatrutide', 'retatrutide triple agonist', 'retatrutide api'],
    category: 'Metabolic & Weight'
  },
  'nad-plus': {
    canonicalKey: 'nad-plus',
    canonicalName: 'NAD+ (Nicotinamide Adenine Dinucleotide)',
    aliases: ['nad+', 'nad', 'nad +', 'nicotinamide adenine dinucleotide'],
    category: 'Longevity & Cellular'
  },
  'ghk-cu': {
    canonicalKey: 'ghk-cu',
    canonicalName: 'GHK-Cu (Copper Peptide)',
    aliases: ['ghk-cu', 'ghkcu', 'ghk cu', 'copper peptide ghk-cu'],
    category: 'Regenerative & Skin'
  },
  'kpv': {
    canonicalKey: 'kpv',
    canonicalName: 'KPV Peptide',
    aliases: ['kpv', 'kpv peptide'],
    category: 'Anti-Inflammatory'
  },
  'ipamorelin': {
    canonicalKey: 'ipamorelin',
    canonicalName: 'Ipamorelin',
    aliases: ['ipamorelin'],
    category: 'Growth Hormone Secretagogue'
  },
  'cjc-1295': {
    canonicalKey: 'cjc-1295',
    canonicalName: 'CJC-1295 (No DAC)',
    aliases: ['cjc-1295', 'cjc 1295', 'cjc-1295 without dac', 'cjc-1295 no dac', 'modified grf 1-29'],
    category: 'Growth Hormone Secretagogue'
  },
  'cjc-ipamorelin': {
    canonicalKey: 'cjc-ipamorelin',
    canonicalName: 'CJC-1295 + Ipamorelin Blend',
    aliases: ['cjc-1295 + ipamorelin', 'cjc-1295 + ipamorelin blend', 'cjc 1295 + ipamorelin'],
    category: 'Peptide Blend'
  },
  'tesamorelin': {
    canonicalKey: 'tesamorelin',
    canonicalName: 'Tesamorelin',
    aliases: ['tesamorelin'],
    category: 'Growth Hormone Secretagogue'
  },
  'sermorelin': {
    canonicalKey: 'sermorelin',
    canonicalName: 'Sermorelin',
    aliases: ['sermorelin'],
    category: 'Growth Hormone Secretagogue'
  },
  'mots-c': {
    canonicalKey: 'mots-c',
    canonicalName: 'MOTS-c',
    aliases: ['mots-c', 'motsc'],
    category: 'Mitochondrial & Metabolic'
  },
  'ss-31': {
    canonicalKey: 'ss-31',
    canonicalName: 'SS-31 (Elamipretide)',
    aliases: ['ss-31', 'ss31', 'elamipretide'],
    category: 'Mitochondrial & Metabolic'
  },
  'pt-141': {
    canonicalKey: 'pt-141',
    canonicalName: 'PT-141 (Bremelanotide)',
    aliases: ['pt-141', 'pt141', 'bremelanotide'],
    category: 'Neuro & Libido'
  },
  'selank': {
    canonicalKey: 'selank',
    canonicalName: 'Selank',
    aliases: ['selank'],
    category: 'Neuro & Nootropic'
  },
  'semax': {
    canonicalKey: 'semax',
    canonicalName: 'Semax',
    aliases: ['semax'],
    category: 'Neuro & Nootropic'
  },
  'epithalon': {
    canonicalKey: 'epithalon',
    canonicalName: 'Epithalon (Epitalon)',
    aliases: ['epithalon', 'epitalon'],
    category: 'Longevity & Cellular'
  },
  'bacteriostatic-water': {
    canonicalKey: 'bacteriostatic-water',
    canonicalName: 'Bacteriostatic Water (BAC)',
    aliases: ['bacteriostatic water', 'bac water', 'sterile diluent'],
    category: 'Supplies & Diluents'
  }
};

// Fast lookup table from alias string -> canonicalKey
const ALIAS_TO_KEY = new Map();

for (const [key, def] of Object.entries(KNOWN_CANONICAL_PEPTIDES)) {
  ALIAS_TO_KEY.set(key, key);
  ALIAS_TO_KEY.set(def.canonicalName.toLowerCase(), key);
  for (const alias of def.aliases) {
    ALIAS_TO_KEY.set(alias.toLowerCase().trim(), key);
  }
}

// Words/compounds that must NOT be matched via partial prefixes
const EXCLUSIONS = new Map([
  ['nadolol', { canonicalKey: 'nadolol', canonicalName: 'Nadolol' }],
  ['nad level test', { canonicalKey: 'bloodo-nad-level-test', canonicalName: 'Bloodo NAD Level Test' }],
  ['bloodo nad level test', { canonicalKey: 'bloodo-nad-level-test', canonicalName: 'Bloodo NAD Level Test' }],
]);

/**
 * Derives canonical identity for any product record.
 * Returns { canonicalKey: string, canonicalName: string, isRecognized: boolean }
 *
 * @param {Object} product
 * @param {string} [product.name]
 * @param {string} [product.canonicalName]
 * @param {string} [product.canonicalKey]
 * @param {string} [product.title]
 * @param {string} [product.id]
 */
export function deriveCanonicalIdentity(product = {}) {
  if (!product) {
    return { canonicalKey: 'unknown', canonicalName: 'Unknown Product', isRecognized: false };
  }

  // 1. Check explicit canonicalKey already defined
  if (product.canonicalKey && typeof product.canonicalKey === 'string' && product.canonicalKey.trim()) {
    const key = product.canonicalKey.trim().toLowerCase();
    if (KNOWN_CANONICAL_PEPTIDES[key]) {
      return {
        canonicalKey: key,
        canonicalName: product.canonicalName || KNOWN_CANONICAL_PEPTIDES[key].canonicalName,
        isRecognized: true
      };
    }
  }

  const rawName = (product.name || product.title || product.canonicalName || product.id || '').trim();
  const lower = rawName.toLowerCase();

  // 2. Check exclusions table first (avoids "nadolol" -> "nad-plus")
  if (EXCLUSIONS.has(lower)) {
    const ex = EXCLUSIONS.get(lower);
    return {
      canonicalKey: ex.canonicalKey,
      canonicalName: ex.canonicalName,
      isRecognized: false
    };
  }
  for (const [excPrefix, excDef] of EXCLUSIONS.entries()) {
    if (lower === excPrefix || lower.startsWith(excPrefix + ' ') || lower.startsWith(excPrefix + '-')) {
      return {
        canonicalKey: excDef.canonicalKey,
        canonicalName: excDef.canonicalName,
        isRecognized: false
      };
    }
  }

  // 3. Exact alias match
  if (ALIAS_TO_KEY.has(lower)) {
    const key = ALIAS_TO_KEY.get(lower);
    const def = KNOWN_CANONICAL_PEPTIDES[key];
    return {
      canonicalKey: def.canonicalKey,
      canonicalName: def.canonicalName,
      isRecognized: true
    };
  }

  // 4. Check known multi-peptide blend signatures in the name
  if (lower.includes('bpc-157') && lower.includes('tb-500') && (lower.includes('ghk') || lower.includes('copper')) && lower.includes('kpv')) {
    return {
      canonicalKey: 'klow',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['klow'].canonicalName,
      isRecognized: true
    };
  }
  if (lower.includes('klow')) {
    return {
      canonicalKey: 'klow',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['klow'].canonicalName,
      isRecognized: true
    };
  }

  if (lower.includes('glow') && !lower.includes('gloves')) {
    return {
      canonicalKey: 'glow',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['glow'].canonicalName,
      isRecognized: true
    };
  }

  if (lower.includes('cagrilintide') && lower.includes('semaglutide')) {
    return {
      canonicalKey: 'cagrilintide-semaglutide',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['cagrilintide-semaglutide'].canonicalName,
      isRecognized: true
    };
  }

  if (lower.includes('cjc') && lower.includes('ipamorelin')) {
    return {
      canonicalKey: 'cjc-ipamorelin',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['cjc-ipamorelin'].canonicalName,
      isRecognized: true
    };
  }

  if (lower.includes('bpc') && lower.includes('tb') && (lower.includes('500') || lower.includes('beta')) && lower.includes('ghk')) {
    return {
      canonicalKey: 'bpc-157-tb-500-ghk-cu',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['bpc-157-tb-500-ghk-cu'].canonicalName,
      isRecognized: true
    };
  }

  if (lower.includes('bpc') && (lower.includes('tb-500') || lower.includes('tb 500') || lower.includes('tb500'))) {
    return {
      canonicalKey: 'bpc-157-tb-500',
      canonicalName: KNOWN_CANONICAL_PEPTIDES['bpc-157-tb-500'].canonicalName,
      isRecognized: true
    };
  }

  // 5. If the product name contains '+', it represents a multi-compound combo/blend.
  // Do NOT collapse it into an individual single peptide!
  if (lower.includes('+')) {
    const cleanedCombo = rawName
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/\b\d+(\.\d+)?\s*(mg|mcg|iu|ml|g|pfs|vial|capsule|pen|cartridge|kit)\b/gi, '')
      .trim();
    const comboKey = cleanedCombo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return {
      canonicalKey: comboKey || 'blend-' + (product.id || 'item'),
      canonicalName: product.canonicalName || cleanedCombo || rawName,
      isRecognized: true,
      category: 'Peptide Blend'
    };
  }

  // 6. Check single peptide word boundaries
  for (const [key, def] of Object.entries(KNOWN_CANONICAL_PEPTIDES)) {
    for (const alias of def.aliases) {
      // Regex word-boundary check
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[\\s_(\\/+-])${escaped}([\\s_)\\/+-]|$)`, 'i');
      if (regex.test(lower)) {
        return {
          canonicalKey: def.canonicalKey,
          canonicalName: def.canonicalName,
          isRecognized: true
        };
      }
    }
  }

  // 6. Generic Fallback: clean string without punctuation or dosages
  const cleaned = rawName
    .replace(/\s*\([^)]*\)/g, '') // remove parentheticals
    .replace(/\b\d+(\.\d+)?\s*(mg|mcg|iu|ml|g|pfs|vial|capsule|pen|cartridge|kit)\b/gi, '') // remove dosage tokens
    .trim();

  const slugKey = (cleaned || rawName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    canonicalKey: slugKey || 'product-' + (product.id || 'item'),
    canonicalName: product.canonicalName || cleaned || rawName,
    isRecognized: false
  };
}
