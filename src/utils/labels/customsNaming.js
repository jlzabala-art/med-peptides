/**
 * Customs-safe naming & date formatting for Shipping labels (pure functions, no React).
 */

/**
 * Formats dates for customs and shipping bottle labels (e.g. "30 September 2026" or "September 2027").
 */
export function formatCustomsDate(dateStr, style = 'full') {
  if (!dateStr) return style === 'bud' ? 'September 2027' : '30 September 2026';
  const str = String(dateStr).trim();
  if (/[a-zA-Z]{3,}/.test(str)) return str;

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dmy = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  const ymd = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);

  let day, monthIdx, year;
  if (dmy) {
    day = parseInt(dmy[1], 10);
    monthIdx = parseInt(dmy[2], 10) - 1;
    year = dmy[3];
  } else if (ymd) {
    year = ymd[1];
    monthIdx = parseInt(ymd[2], 10) - 1;
    day = parseInt(ymd[3], 10);
  }

  if (monthIdx >= 0 && monthIdx < 12 && year) {
    const monthName = MONTHS[monthIdx];
    if (style === 'bud') {
      return `${monthName} ${year}`;
    }
    return `${day} ${monthName} ${year}`;
  }
  return str;
}

/**
 * Generates 3 customs-friendly, non-medicinal name suggestions (Aduanas-safe).
 */
export function getCustomsFriendlySuggestions(item = {}) {
  const isOral = Boolean(
    (item.dosageForm && /capsule|oral|pill|tablet|cap/i.test(item.dosageForm)) ||
    (item.volume && /cap|pill|tablet/i.test(item.volume))
  );

  const title = String(item.productTitle || item.productName || item.title || '').trim();
  const fullText = (title + ' ' + (item.formula || '')).toLowerCase();
  const isHairFocus = /hair|scalp|follicle|alopecia|minoxidil|finasteride|dutasteride/.test(fullText);
  const isMetabolicFocus = /lipid|metabolic|berberine|coq10|ubiquinol|glucose|weight|cholesterol/.test(fullText);
  const isInflammation = /proteolytic|inflamm|joint|pain|serrapeptase|nattokinase|curcumin/.test(fullText);

  let cleanQty = item.quantity || item.volume || (isOral ? '120 capsules' : '100 mL');
  if (/(\d+)\s*(caps|capsules|capsulas)/i.test(cleanQty)) {
    const m = cleanQty.match(/(\d+)\s*(caps|capsules|capsulas)/i);
    cleanQty = `${m[1]} caps`;
  } else if (/(\d+)\s*mL/i.test(cleanQty)) {
    cleanQty = `${cleanQty.match(/(\d+)\s*mL/i)[1]} mL`;
  }

  const isEvening = /evening|night|bed|sleep|melatonin|theanine|glycine/i.test(fullText);
  const moment = isEvening ? 'Evening' : 'Daily';

  if (isOral) {
    // Option 1: Dietary & Botanical · Option 2: Personal Care · Option 3: Wellness
    if (isHairFocus) {
      return [
        `${moment} Hair Vitamins ${cleanQty}`,
        `Hair & Nails Botanical Care ${cleanQty}`,
        `Daily Wellness & Vitality Complex ${cleanQty}`
      ];
    }
    if (isMetabolicFocus) {
      return [
        `${moment} Metabolic Nutrient Blend ${cleanQty}`,
        `Nutricosmetic Daily Care Capsules ${cleanQty}`,
        `Cellular Longevity & Nutrient Support ${cleanQty}`
      ];
    }
    if (isInflammation) {
      return [
        `Botanical Enzyme Complex ${cleanQty}`,
        `Nutricosmetic Daily Care Capsules ${cleanQty}`,
        `Protective Botanical Maintenance Blend ${cleanQty}`
      ];
    }
    return [
      `Botanical Nutrient Complex ${cleanQty}`,
      `Nutricosmetic Daily Care Capsules ${cleanQty}`,
      `Daily Wellness & Vitality Complex ${cleanQty}`
    ];
  }

  // Topical / solutions / creams
  if (isHairFocus) {
    return [
      `Botanical Scalp & Hair Drops ${cleanQty}`,
      `Revitalizing Scalp Care Solution ${cleanQty}`,
      `Daily Wellness & Vitality Drops ${cleanQty}`
    ];
  }
  return [
    `Essential Nutrient Scalp Blend ${cleanQty}`,
    `Advanced Dermal Botanical Serum ${cleanQty}`,
    `Protective Botanical Maintenance Serum ${cleanQty}`
  ];
}

export function getCustomsFriendlyDefault(item = {}) {
  const suggestions = getCustomsFriendlySuggestions(item);
  return suggestions[0] || 'Botanical Nutrient Complex';
}

const RISK_TERMS = [
  'rx', 'prescription', 'pharmaceutical', 'pharmacy compounded', 'compounded', 'compounding',
  'drug', 'medicine', 'medication', 'medicinal', 'api', 'injection', 'injectable',
  'formula medica', 'fórmula médica', 'receta', 'medicamento', 'fármaco', 'farmaco'
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Detects wording that can trigger customs retention on a Shipping label.
 * @param {object} item  label data (uses shippingTitle, directions, storage, apis)
 * @returns {{ field: string, term: string }[]} list of findings (empty = clean)
 */
export function findCustomsRisks(item = {}) {
  const fields = {
    shippingTitle: item.shippingTitle || item.shippingName || getCustomsFriendlyDefault(item),
    directions: item.directions || item.instructions || '',
    storage: item.storage || ''
  };

  const ingredientNames = (Array.isArray(item.apis) ? item.apis : [])
    .map((a) => (typeof a === 'string' ? a.split(':')[0] : (a.drugName || a.drug || a.name || '')))
    .map((n) => String(n).trim().toLowerCase())
    .filter((n) => n.length >= 4);

  const terms = [...RISK_TERMS, ...ingredientNames];
  const findings = [];
  Object.entries(fields).forEach(([field, value]) => {
    const text = String(value || '').toLowerCase();
    if (!text) return;
    terms.forEach((term) => {
      if (new RegExp(`(^|[^a-záéíóúñ])${escapeRe(term)}([^a-záéíóúñ]|$)`, 'i').test(text)) {
        findings.push({ field, term });
      }
    });
  });
  return findings;
}
