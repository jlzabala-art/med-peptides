/**
 * zohoApiMatcher.js
 *
 * Algorithmic normalization, token scoring, and SKU suggestion engine
 * for bridging Atlas Prescriptions Compounded APIs with Zoho Books Inventory Items.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'in', 'to', 'with', 'by',
  'mg', 'ml', 'g', 'kg', 'vial', 'powder', 'solution', 'vehicle', 'patented',
  'compounded', 'topical', 'oral', 'capsule', 'cream', 'foam', 'gel', 'elixir',
  'de', 'la', 'el', 'con', 'para', 'en', 'por', 'mg/ml', 'pct', '%', 'qs', 'q.s.'
]);

export function cleanTokens(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Normalizes an API raw title from a prescription into core entity components.
 */
export function normalizeApiName(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return { coreName: 'Unknown API', dose: '', slug: 'unknown-api' };
  }

  const trimmed = rawName.trim();

  // Extract dose/concentration patterns (e.g., "4%", "40 mg/mL", "100 mL", "5 mg", "1.5%")
  const percentMatch = trimmed.match(/(\d+(?:\.\d+)?\s*%)/i);
  const mgMlMatch = trimmed.match(/(\d+(?:\.\d+)?\s*(?:mg\/ml|mcg\/ml|iu\/ml|u\/ml))/i);
  const volumeMatch = trimmed.match(/(\d+(?:\.\d+)?\s*(?:ml|l|mg|mcg|g|iu)\b)/i);

  const dose = percentMatch ? percentMatch[1] : (volumeMatch ? volumeMatch[1] : '');
  const concentration = mgMlMatch ? mgMlMatch[1] : '';

  // Remove bracketed info (e.g. "(40 mg/mL)", "(L-Arginine)") for base extraction,
  // but capture alias if parenthesis contains an actual chemical name
  let alias = '';
  const aliasMatch = trimmed.match(/\(([^)]+)\)/);
  if (aliasMatch && !aliasMatch[1].match(/^\d/)) {
    alias = aliasMatch[1].trim();
  }

  // Strip brackets, doses, percentages, and trademark symbols
  let cleaned = trimmed
    .replace(/™|®|©/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*%/g, ' ')
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg\/ml|mcg\/ml|iu\/ml|mg|ml|mcg|g)\b/gi, ' ')
    .replace(/\b(?:vehicle|patented|compounded|active|ingredient|powder|raw)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned && alias) cleaned = alias;
  if (!cleaned) cleaned = trimmed;

  const slug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    rawName: trimmed,
    coreName: cleaned,
    alias,
    dose,
    concentration,
    slug
  };
}

/**
 * Computes Dice token similarity between 0 and 100.
 */
export function calculateDiceSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  return Math.round((2 * intersection * 100) / (setA.size + setB.size));
}

/**
 * Scores an Atlas API against a Zoho Books item.
 * Returns { score: 0..100, matchTier: 'exact' | 'high' | 'partial' | 'none', reasons: [] }
 */
export function scoreApiAgainstZohoItem(apiRaw, zohoItem) {
  if (!apiRaw || !zohoItem) return { score: 0, matchTier: 'none', reasons: [] };

  const norm = typeof apiRaw === 'string' ? normalizeApiName(apiRaw) : (apiRaw.coreName ? apiRaw : normalizeApiName(apiRaw.name || ''));
  const zohoName = (zohoItem.name || zohoItem.item_name || '').trim();
  const zohoSku = (zohoItem.sku || '').trim();
  const zohoDesc = (zohoItem.description || '').trim();

  const apiTokens = cleanTokens(norm.coreName + ' ' + (norm.alias || ''));
  const zohoTokens = cleanTokens(zohoName + ' ' + zohoSku + ' ' + zohoDesc);

  // Exact core match check
  const lowerZoho = zohoName.toLowerCase();
  const lowerCore = norm.coreName.toLowerCase();
  const hasCoreExact = lowerZoho.includes(lowerCore) || (norm.alias && lowerZoho.includes(norm.alias.toLowerCase()));

  let score = calculateDiceSimilarity(apiTokens, zohoTokens);
  const reasons = [];

  if (hasCoreExact) {
    score = Math.max(score, 75);
    reasons.push('Exact compound keyword match');
  }

  // Check if SKU directly tags the compound
  if (lowerCore.length >= 4 && zohoSku.toLowerCase().includes(lowerCore)) {
    score = Math.max(score, 85);
    reasons.push('SKU contains compound name');
  }

  // Check if dose or volume is also matching (e.g. 100ml, 4%)
  if (norm.dose) {
    const cleanDose = norm.dose.toLowerCase().replace(/\s+/g, '');
    if (lowerZoho.replace(/\s+/g, '').includes(cleanDose)) {
      score = Math.min(100, score + 15);
      reasons.push('Matching concentration / volume (' + norm.dose + ')');
    }
  }

  // Bonus for dedicated API raw material tags in Zoho
  if (lowerZoho.includes('api') || lowerZoho.includes('powder') || lowerZoho.includes('raw material') || (zohoItem.purchase_account_name || '').toLowerCase().includes('compounding')) {
    score = Math.min(100, score + 5);
    reasons.push('Zoho Compounding / API category');
  }

  let matchTier = 'none';
  if (score >= 90) matchTier = 'exact';
  else if (score >= 70) matchTier = 'high';
  else if (score >= 40) matchTier = 'partial';

  return {
    score,
    matchTier,
    reasons
  };
}

/**
 * Generates standardized Zoho SKU for new API registrations.
 */
export function generateSuggestedSku(coreName, dose = '', format = 'API') {
  const cleanName = (coreName || 'ING')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);

  const cleanDose = (dose || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6);

  const prefix = format.toUpperCase().slice(0, 4);
  return `${prefix}-${cleanName}${cleanDose ? `-${cleanDose}` : ''}`;
}
