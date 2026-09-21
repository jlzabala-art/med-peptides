import { PRESENTATION_LABELS } from '../constants/presentationTypes.js';

export function getHumanFormatName(formatId, rawFormat) {
  if (!formatId && !rawFormat) return 'Standard Formulation';
  const cleanId = (formatId || '').toLowerCase().trim();
  if (PRESENTATION_LABELS[cleanId]) return PRESENTATION_LABELS[cleanId];
  const cleanRaw = (rawFormat || '').toLowerCase().trim();
  if (PRESENTATION_LABELS[cleanRaw]) return PRESENTATION_LABELS[cleanRaw];
  const noUnderscores = cleanId.replace(/_/g, ' ');
  if (PRESENTATION_LABELS[noUnderscores]) return PRESENTATION_LABELS[noUnderscores];
  return noUnderscores.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Normalizes strength identifiers and display names to prevent duplicate dosage
 * options caused by thousands-separator commas, trailing unit labels, or formatting variations.
 * e.g., "1,000 mg", "1000 mg / vial", "1000mg" all resolve to:
 * { id: "1000_mg", name: "1000 mg" }
 */
export function normalizeCanonicalStrength(rawVal) {
  if (!rawVal) return { id: 'unknown_strength', name: 'Standard' };
  let str = String(rawVal).trim();

  // Normalize thousand commas in numbers: e.g. 1,000 -> 1000, 10,000 -> 10000
  let cleanedName = str.replace(/(\d+),(\d{3})/g, '$1$2').trim();

  // If ends with / vial (standard single vial), strip it so "1000 mg / vial" matches "1000 mg"
  if (/\s*\/\s*vial$/i.test(cleanedName)) {
    cleanedName = cleanedName.replace(/\s*\/\s*vial$/i, '').trim();
  }

  // Generate standardized unique ID
  const normalizedId = cleanedName
    .toLowerCase()
    .replace(/,/g, '')
    .replace(/(\d+)\s*(mg|mcg|iu|g|ml|test)/gi, '$1_$2')
    .replace(/[\s/]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');

  return {
    id: normalizedId || 'unknown_strength',
    name: cleanedName || 'Standard'
  };
}

export function processProductVariants(variants) {
  if (!variants || !Array.isArray(variants)) return { suppliers: [], formats: [], strengths: [], variantIndex: {} };

  const supplierMap = new Map();
  const formatMap = new Map();
  const strengthMap = new Map();
  const variantIndex = {};

  variants.forEach(v => {
    // 1. Establish Unique IDs
    const supplierId = v.supplierId || (v.supplier ? v.supplier.toLowerCase().replace(/\s+/g, '_') : 'unknown_supplier');
    
    // Normalize format
    let rawFormat = v.formatId || v.format || v.presentation || 'vial';
    let formatId = rawFormat.toLowerCase().replace(/\s+/g, '_');
    
    // Normalize strength using canonical helper
    let rawStrength = v.strengthId || v.dosage || v.dose || v.strength || v.name || 'unknown_strength';
    let { id: strengthId, name: strengthDisplayName } = normalizeCanonicalStrength(rawStrength);

    // Pod Poland Specific fix - Data normalization (not fuzzy matching in the view layer)
    // We normalize the data at ingestion/processing time
    const sIdLower = String(supplierId).toLowerCase();
    if (sIdLower.includes('pod') && sIdLower.includes('poland')) {
      if ((v.sku && v.sku.toLowerCase().includes('pen')) || formatId === 'pen' || formatId.includes('pen')) {
        formatId = 'prefilled_pen';
        rawFormat = 'Pre-filled Pen';
      }
      if (!v.dosage && v.sku) {
        // We shouldn't guess, but we need a valid ID. Ideally the DB would be updated.
        if (strengthId === 'unknown_strength' || strengthId === 'standard') {
            strengthId = `sku_${v.sku.toLowerCase()}`;
            strengthDisplayName = v.sku;
        }
      }
    }

    // 2. Build Maps
    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        id: supplierId,
        name: v.supplierName || v.supplier || supplierId,
        formats: new Set(),
        formatStrengths: {}, // formatId -> Set of strengthIds
      });
    }

    const formatDisplayName = getHumanFormatName(formatId, rawFormat);
    if (!formatMap.has(formatId)) {
      formatMap.set(formatId, {
        id: formatId,
        name: formatDisplayName,
        strengths: new Set()
      });
    }

    if (!strengthMap.has(strengthId)) {
      strengthMap.set(strengthId, {
        id: strengthId,
        name: strengthDisplayName
      });
    }

    // 3. Establish relationships
    const suppObj = supplierMap.get(supplierId);
    suppObj.formats.add(formatId);
    if (!suppObj.formatStrengths[formatId]) {
      suppObj.formatStrengths[formatId] = new Set();
    }
    suppObj.formatStrengths[formatId].add(strengthId);

    formatMap.get(formatId).strengths.add(strengthId);

    // 4. Index the variant by the hierarchy: supplierId -> formatId -> strengthId
    const indexKey = `${supplierId}::${formatId}::${strengthId}`;
    if (!variantIndex[indexKey]) {
      variantIndex[indexKey] = v;
    } else {
      // Merge duplicate entries so pricing, SKU, and availability are preserved
      const prev = variantIndex[indexKey];
      const preferNew = v.isPreferred || (!prev.sku && v.sku) || (!prev.cost_tiers && v.cost_tiers) || (prev.unit_price == null && v.unit_price != null);
      variantIndex[indexKey] = preferNew ? { ...prev, ...v } : { ...v, ...prev };
    }
  });

  // Convert Sets to Arrays for serialization
  const suppliers = Array.from(supplierMap.values()).map(s => {
    const serializedFormatStrengths = {};
    for (const [fId, setVal] of Object.entries(s.formatStrengths || {})) {
      serializedFormatStrengths[fId] = Array.from(setVal);
    }
    return {
      ...s,
      formats: Array.from(s.formats),
      formatStrengths: serializedFormatStrengths,
    };
  });
  const formats = Array.from(formatMap.values()).map(f => ({ ...f, strengths: Array.from(f.strengths) }));
  const strengths = Array.from(strengthMap.values());

  return { suppliers, formats, strengths, variantIndex };
}

