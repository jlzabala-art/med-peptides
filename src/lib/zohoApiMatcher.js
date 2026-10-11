/**
 * zohoApiMatcher.js
 *
 * Algorithmic normalization, dosage/concentration scoring, and SKU suggestion engine
 * for bridging Atlas Prescriptions Compounded APIs with Zoho Books Inventory Items.
 * 
 * CRITICAL RULE: In compounding and pharmaceutical procurement, dosage & concentration
 * (e.g. 4% vs 2% or 40 mg/mL vs 25 mg) are essential for purchasing correct raw materials.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'for', 'in', 'to', 'with', 'by',
  'vial', 'powder', 'solution', 'vehicle', 'patented',
  'compounded', 'topical', 'oral', 'capsule', 'cream', 'foam', 'gel', 'elixir',
  'de', 'la', 'el', 'con', 'para', 'en', 'por', 'qs', 'q.s.'
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
 * Extracts all dosage and concentration signatures from a text string.
 */
export function extractDosageDetails(str) {
  if (!str || typeof str !== 'string') return { doses: [], primaryDose: '', primaryUnit: '' };

  const matches = [];

  // Match percentages: e.g. "4%", "1.5%", "0.05 %"
  const percentMatches = str.matchAll(/(\d+(?:\.\d+)?)\s*%/g);
  for (const m of percentMatches) {
    matches.push({ value: parseFloat(m[1]), unit: '%', raw: `${m[1]}%` });
  }

  // Match mg/mL or mcg/mL: e.g. "40 mg/mL", "15mg/ml"
  const mgMlMatches = str.matchAll(/(\d+(?:\.\d+)?)\s*(mg\/ml|mcg\/ml|iu\/ml|u\/ml)/gi);
  for (const m of mgMlMatches) {
    matches.push({ value: parseFloat(m[1]), unit: m[2].toLowerCase(), raw: `${m[1]} ${m[2]}` });
  }

  // Match absolute weights/volumes: e.g. "25 mg", "100 mL", "5 g"
  const absMatches = str.matchAll(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|l|g|iu)\b/gi);
  for (const m of absMatches) {
    const unit = m[2].toLowerCase();
    // Ignore if already captured as part of mg/ml
    if (!matches.some(prev => prev.raw.toLowerCase().includes(unit))) {
      matches.push({ value: parseFloat(m[1]), unit, raw: `${m[1]} ${unit}` });
    }
  }

  const primary = matches[0] || null;
  return {
    doses: matches,
    primaryDose: primary ? primary.raw : '',
    primaryUnit: primary ? primary.unit : '',
    primaryValue: primary ? primary.value : null
  };
}

/**
 * Normalizes an API raw title from a prescription into core entity components.
 */
export function normalizeApiName(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return { coreName: 'Unknown API', dose: '', slug: 'unknown-api', dosageSlug: 'unknown-api' };
  }

  const trimmed = rawName.trim();
  const dosageInfo = extractDosageDetails(trimmed);

  const percentMatch = trimmed.match(/(\d+(?:\.\d+)?\s*%)/i);
  const mgMlMatch = trimmed.match(/(\d+(?:\.\d+)?\s*(?:mg\/ml|mcg\/ml|iu\/ml|u\/ml))/i);
  const volumeMatch = trimmed.match(/(\d+(?:\.\d+)?\s*(?:ml|l|mg|mcg|g|iu)\b)/i);

  const dose = percentMatch ? percentMatch[1].replace(/\s+/g, '') : (mgMlMatch ? mgMlMatch[1] : (volumeMatch ? volumeMatch[1] : ''));
  const concentration = mgMlMatch ? mgMlMatch[1] : '';

  // Extract chemical alias inside parentheses if not just concentration
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

  const baseSlug = cleaned
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const cleanDoseTag = dose
    .toLowerCase()
    .replace(/%/g, 'pct')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const dosageSlug = cleanDoseTag ? `${baseSlug}_${cleanDoseTag}` : baseSlug;

  return {
    rawName: trimmed,
    coreName: cleaned,
    alias,
    dose,
    concentration,
    dosageInfo,
    baseSlug,
    slug: dosageSlug, // Default slug is dosage-specific!
    dosageSlug
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
 * Evaluates dosage compatibility between prescription API and Zoho Books Item.
 */
export function evaluateDosageCompatibility(apiNorm, zohoItem) {
  const zohoText = `${zohoItem.name || ''} ${zohoItem.item_name || ''} ${zohoItem.sku || ''} ${zohoItem.description || ''}`;
  const zohoDosage = extractDosageDetails(zohoText);
  const apiDosage = apiNorm.dosageInfo || extractDosageDetails(apiNorm.rawName || '');

  // Case 1: Neither has explicit dosage (e.g. excipient or general chemical)
  if (!apiDosage.primaryDose && !zohoDosage.primaryDose) {
    return { status: 'neutral', label: 'Sin dosis específica requerida', scoreDelta: 0 };
  }

  // Case 2: Zoho item is explicitly raw bulk uncompounded powder / pure API (e.g. "Minoxidil API 5kg container")
  const isBulkRaw = /api\b|powder\b|raw material|puro|pure|usp grade|materia prima/i.test(zohoText) &&
    !/solution|drops|shampoo|cream|foam|capsule/i.test(zohoText);

  if (isBulkRaw && !zohoDosage.primaryDose) {
    return {
      status: 'bulk_raw',
      label: 'Materia prima a granel (polvo puro para formulación)',
      scoreDelta: 10,
      isBulkRaw: true
    };
  }

  // Case 3: Both have dosage specified
  if (apiDosage.primaryDose && zohoDosage.primaryDose) {
    const cleanApiDose = apiDosage.primaryDose.toLowerCase().replace(/\s+/g, '');
    const cleanZohoDose = zohoDosage.primaryDose.toLowerCase().replace(/\s+/g, '');

    // Exact match: e.g. 4% vs 4% or 100ml vs 100ml
    if (cleanApiDose === cleanZohoDose) {
      return {
        status: 'exact',
        label: `✓ Dosis coincide exactamente: ${apiDosage.primaryDose}`,
        scoreDelta: 25,
        apiDose: apiDosage.primaryDose,
        zohoDose: zohoDosage.primaryDose
      };
    }

    // Number & unit match even if formatted differently
    if (apiDosage.primaryUnit === zohoDosage.primaryUnit && apiDosage.primaryValue === zohoDosage.primaryValue) {
      return {
        status: 'exact',
        label: `✓ Concentración coincide: ${apiDosage.primaryDose}`,
        scoreDelta: 25,
        apiDose: apiDosage.primaryDose,
        zohoDose: zohoDosage.primaryDose
      };
    }

    // DISCREPANCY: One has 4% and the other has 6% or 25mg
    return {
      status: 'mismatch',
      label: `⚠️ Discrepancia de dosis: Receta ${apiDosage.primaryDose} vs Zoho ${zohoDosage.primaryDose}`,
      scoreDelta: -35,
      apiDose: apiDosage.primaryDose,
      zohoDose: zohoDosage.primaryDose
    };
  }

  // Case 4: API has dose but Zoho item does not mention it
  if (apiDosage.primaryDose && !zohoDosage.primaryDose) {
    return {
      status: 'unspecified_in_zoho',
      label: `Nota: Zoho no especifica dosis (Receta pide ${apiDosage.primaryDose})`,
      scoreDelta: 0,
      apiDose: apiDosage.primaryDose
    };
  }

  return { status: 'neutral', label: '', scoreDelta: 0 };
}

/**
 * Scores an Atlas API against a Zoho Books item with high dosage sensitivity.
 */
export function scoreApiAgainstZohoItem(apiRaw, zohoItem) {
  if (!apiRaw || !zohoItem) return { score: 0, matchTier: 'none', reasons: [] };

  const norm = typeof apiRaw === 'string' ? normalizeApiName(apiRaw) : (apiRaw.coreName ? apiRaw : normalizeApiName(apiRaw.name || ''));
  const zohoName = (zohoItem.name || zohoItem.item_name || '').trim();
  const zohoSku = (zohoItem.sku || '').trim();
  const zohoDesc = (zohoItem.description || '').trim();

  const apiTokens = cleanTokens(norm.coreName + ' ' + (norm.alias || ''));
  const zohoTokens = cleanTokens(zohoName + ' ' + zohoSku + ' ' + zohoDesc);

  const lowerZoho = zohoName.toLowerCase();
  const lowerCore = norm.coreName.toLowerCase();
  const hasCoreExact = lowerZoho.includes(lowerCore) || (norm.alias && lowerZoho.includes(norm.alias.toLowerCase()));

  let score = calculateDiceSimilarity(apiTokens, zohoTokens);
  const reasons = [];

  if (hasCoreExact) {
    score = Math.max(score, 70);
    reasons.push('Nombre del principio activo coincide');
  }

  // Check SKU
  if (lowerCore.length >= 4 && zohoSku.toLowerCase().includes(lowerCore)) {
    score = Math.max(score, 80);
    reasons.push('SKU de Zoho contiene el nombre del fármaco');
  }

  // Evaluate DOSAGE COMPATIBILITY
  const dosageEval = evaluateDosageCompatibility(norm, zohoItem);
  score += dosageEval.scoreDelta;
  if (dosageEval.label) {
    reasons.push(dosageEval.label);
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // If there is an active dosage mismatch, prevent "exact" tier!
  let matchTier = 'none';
  if (score >= 90 && dosageEval.status !== 'mismatch') {
    matchTier = 'exact';
  } else if (score >= 65 && dosageEval.status !== 'mismatch') {
    matchTier = 'high';
  } else if (score >= 35) {
    matchTier = 'partial';
  }

  return {
    score,
    matchTier,
    dosageEval,
    reasons
  };
}

/**
 * Generates standardized Zoho SKU that strictly includes the dosage/concentration.
 */
export function generateSuggestedSku(coreName, dose = '', format = 'API') {
  const cleanName = (coreName || 'ING')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10);

  const cleanDose = (dose || '')
    .toUpperCase()
    .replace(/%/g, 'PCT')
    .replace(/\//g, '')
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  const prefix = format.toUpperCase().slice(0, 4);
  return `${prefix}-${cleanName}${cleanDose ? `-${cleanDose}` : ''}`;
}
