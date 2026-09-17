/**
 * clinicalTaxonomyNormalizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal Normalization & Validation Service.
 * Ensures that patient data (Goals, Countries, Allergies) conform to the
 * platform's authoritative taxonomies across all modules.
 */

import { GOAL_TYPES, GOAL_LABELS, VALID_GOALS } from '../constants/goalTypes';
import { COUNTRIES, ALL_COUNTRIES, searchCountries } from '../data/countries';
import { COMMON_ALLERGIES, NKDA_KEY, NKDA_LABEL } from '../constants/clinicalAllergies';

// ── 1. GOAL NORMALIZATION ────────────────────────────────────────────────────

const GOAL_SYNONYMS = {
  // Anti-Aging & Longevity
  'anti aging': GOAL_TYPES.ANTI_AGING,
  'anti-aging': GOAL_TYPES.ANTI_AGING,
  'antiaging': GOAL_TYPES.ANTI_AGING,
  'longevity': GOAL_TYPES.ANTI_AGING,
  'cellular renewal': GOAL_TYPES.ANTI_AGING,
  'rejuvenation': GOAL_TYPES.ANTI_AGING,
  'biological age': GOAL_TYPES.ANTI_AGING,

  // Metabolic & Weight
  'fat loss': GOAL_TYPES.FAT_LOSS,
  'weight loss': GOAL_TYPES.FAT_LOSS,
  'weight management': GOAL_TYPES.FAT_LOSS,
  'metabolic': GOAL_TYPES.FAT_LOSS,
  'metabolic health': GOAL_TYPES.FAT_LOSS,
  'glycemic control': GOAL_TYPES.FAT_LOSS,
  'insulin sensitivity': GOAL_TYPES.FAT_LOSS,

  // Tissue Repair & Recovery
  'tissue repair': GOAL_TYPES.TISSUE_REPAIR,
  'injury': GOAL_TYPES.TISSUE_REPAIR,
  'recovery': GOAL_TYPES.TISSUE_REPAIR,
  'healing': GOAL_TYPES.TISSUE_REPAIR,
  'joint': GOAL_TYPES.TISSUE_REPAIR,
  'gut health': GOAL_TYPES.TISSUE_REPAIR,
  'wound healing': GOAL_TYPES.TISSUE_REPAIR,

  // Cognitive & Neuro
  'cognitive': GOAL_TYPES.COGNITIVE,
  'neuro': GOAL_TYPES.COGNITIVE,
  'focus': GOAL_TYPES.COGNITIVE,
  'mood': GOAL_TYPES.COGNITIVE,
  'memory': GOAL_TYPES.COGNITIVE,
  'mental clarity': GOAL_TYPES.COGNITIVE,
  'sleep': GOAL_TYPES.COGNITIVE,
  'neuroprotection': GOAL_TYPES.COGNITIVE,

  // Muscle & Performance
  'muscle growth': GOAL_TYPES.MUSCLE_GROWTH,
  'muscle': GOAL_TYPES.MUSCLE_GROWTH,
  'hypertrophy': GOAL_TYPES.MUSCLE_GROWTH,
  'athletic performance': GOAL_TYPES.MUSCLE_GROWTH,
  'lean mass': GOAL_TYPES.MUSCLE_GROWTH,

  // Hormonal & Libido
  'libido': GOAL_TYPES.LIBIDO_WELLNESS,
  'sexual wellness': GOAL_TYPES.LIBIDO_WELLNESS,
  'hormonal balance': GOAL_TYPES.LIBIDO_WELLNESS,
  'hormones': GOAL_TYPES.LIBIDO_WELLNESS,
  'vitality': GOAL_TYPES.LIBIDO_WELLNESS,

  // General Health
  'general health': GOAL_TYPES.GENERAL_HEALTH,
  'wellness': GOAL_TYPES.GENERAL_HEALTH,
  'immunity': GOAL_TYPES.GENERAL_HEALTH,
  'baseline': GOAL_TYPES.GENERAL_HEALTH,
  'immune modulation': GOAL_TYPES.GENERAL_HEALTH,
};

export function normalizeGoal(rawGoal) {
  if (!rawGoal) return { key: null, label: '', isCanonical: false };
  const clean = String(rawGoal).trim().toLowerCase();

  // 1. Direct canonical key match
  if (VALID_GOALS.has(clean)) {
    return {
      key: clean,
      label: GOAL_LABELS[clean] || rawGoal,
      isCanonical: true,
    };
  }

  // 2. Direct canonical label match
  for (const [key, label] of Object.entries(GOAL_LABELS)) {
    if (label.toLowerCase() === clean) {
      return { key, label, isCanonical: true };
    }
  }

  // 3. Synonym dictionary lookup
  if (GOAL_SYNONYMS[clean]) {
    const key = GOAL_SYNONYMS[clean];
    return {
      key,
      label: GOAL_LABELS[key],
      isCanonical: true,
      originalText: rawGoal,
    };
  }

  // 4. Substring heuristics
  for (const [synonym, key] of Object.entries(GOAL_SYNONYMS)) {
    if (clean.includes(synonym)) {
      return {
        key,
        label: GOAL_LABELS[key],
        isCanonical: true,
        originalText: rawGoal,
      };
    }
  }

  // Custom / Non-standard goal
  return {
    key: 'custom',
    label: String(rawGoal).trim(),
    isCanonical: false,
    isCustom: true,
  };
}

// ── 2. COUNTRY NORMALIZATION ─────────────────────────────────────────────────

const COUNTRY_SHORTHANDS = {
  'uae': 'United Arab Emirates',
  'dubai': 'United Arab Emirates',
  'abu dhabi': 'United Arab Emirates',
  'united arab emirates': 'United Arab Emirates',
  'emirates': 'United Arab Emirates',
  'uk': 'United Kingdom',
  'great britain': 'United Kingdom',
  'england': 'United Kingdom',
  'united kingdom': 'United Kingdom',
  'usa': 'United States',
  'us': 'United States',
  'united states': 'United States',
  'united states of america': 'United States',
  'ksa': 'Saudi Arabia',
  'saudi': 'Saudi Arabia',
  'saudi arabia': 'Saudi Arabia',
  'spain': 'Spain',
  'espana': 'Spain',
  'españa': 'Spain',
  'qatar': 'Qatar',
  'kuwait': 'Kuwait',
  'oman': 'Oman',
  'bahrain': 'Bahrain',
  'germany': 'Germany',
  'france': 'France',
  'switzerland': 'Switzerland',
  'lithuania': 'Lithuania',
};

export function normalizeCountry(rawCountry) {
  if (!rawCountry) return { name: '', code: '', flag: '🌍', isValid: false };
  const clean = String(rawCountry).trim().toLowerCase();

  // Direct shorthand lookup
  const targetName = COUNTRY_SHORTHANDS[clean] || rawCountry.trim();

  // Search exact or close match in countries database
  const matched = ALL_COUNTRIES.find(
    (c) =>
      c.name.toLowerCase() === targetName.toLowerCase() ||
      c.code.toLowerCase() === clean
  );

  if (matched) {
    return {
      name: matched.name,
      code: matched.code,
      flag: matched.flag || '🌍',
      dialCode: matched.dialCode,
      isValid: true,
    };
  }

  // Fallback if not strictly found in list
  return {
    name: String(rawCountry).trim(),
    code: '',
    flag: '🌍',
    isValid: false,
    isCustom: true,
  };
}

// ── 3. ALLERGIES NORMALIZATION ───────────────────────────────────────────────

export function normalizeAllergies(rawAllergies) {
  if (!rawAllergies) return { isNKDA: false, items: [], hasExcipientRisk: false };

  let list = [];
  if (Array.isArray(rawAllergies)) {
    list = rawAllergies;
  } else if (typeof rawAllergies === 'string') {
    list = rawAllergies
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (list.length === 0) {
    return { isNKDA: false, items: [], hasExcipientRisk: false };
  }

  // Check for NKDA
  const hasNKDA = list.some((item) => {
    const s = item.toLowerCase();
    return (
      s === 'nkda' ||
      s === 'none' ||
      s === 'no' ||
      s.includes('no known') ||
      s.includes('no allergies') ||
      s.includes('none logged')
    );
  });

  if (hasNKDA && list.length === 1) {
    return { isNKDA: true, items: [NKDA_LABEL], hasExcipientRisk: false };
  }

  let hasExcipientRisk = false;
  const excipientWarnings = [];

  const items = list
    .filter((it) => {
      const s = it.toLowerCase();
      return !(s === 'nkda' || s === 'none' || s.includes('no known'));
    })
    .map((item) => {
      const cleanItem = item.trim();
      const matchedCanonical = COMMON_ALLERGIES.find(
        (a) =>
          a.name.toLowerCase() === cleanItem.toLowerCase() ||
          cleanItem.toLowerCase().includes(a.name.toLowerCase())
      );

      if (matchedCanonical?.category === 'excipient') {
        hasExcipientRisk = true;
        excipientWarnings.push(matchedCanonical.warning);
      }

      return {
        name: matchedCanonical ? matchedCanonical.name : cleanItem,
        isCanonical: Boolean(matchedCanonical),
        category: matchedCanonical?.category || 'other',
        severity: matchedCanonical?.severity || 'medium',
        warning: matchedCanonical?.warning || null,
      };
    });

  return {
    isNKDA: false,
    items,
    hasExcipientRisk,
    excipientWarnings,
  };
}

// ── 4. AGGREGATE DEMOGRAPHICS VALIDATOR ──────────────────────────────────────

export function validateDemographics(patient = {}) {
  const goalResult = normalizeGoal(patient.primaryGoal || patient.healthGoals?.[0]);
  const countryResult = normalizeCountry(patient.country);
  const allergyResult = normalizeAllergies(patient.allergies);

  const warnings = [];
  if (!goalResult.isCanonical && patient.primaryGoal) {
    warnings.push(`Non-standard goal: "${patient.primaryGoal}"`);
  }
  if (!countryResult.isValid && patient.country) {
    warnings.push(`Unrecognized territory: "${patient.country}"`);
  }
  if (allergyResult.hasExcipientRisk) {
    warnings.push(...allergyResult.excipientWarnings);
  }

  const isFullyCanonical =
    (!patient.primaryGoal || goalResult.isCanonical) &&
    (!patient.country || countryResult.isValid);

  return {
    isFullyCanonical,
    goal: goalResult,
    country: countryResult,
    allergies: allergyResult,
    warnings,
  };
}
