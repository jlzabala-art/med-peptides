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
    
    // Normalize strength
    let rawStrength = v.strengthId || v.dosage || v.dose || v.strength || v.name || 'unknown_strength';
    let strengthId = rawStrength.toString().toLowerCase().replace(/\s+/g, '_');

    // Pod Poland Specific fix - Data normalization (not fuzzy matching in the view layer)
    // We normalize the data at ingestion/processing time
    if (supplierId === 'pod_poland') {
      if (v.sku && v.sku.toLowerCase().includes('pen')) {
        formatId = 'prefilled_pen';
        rawFormat = 'Prefilled Pen';
      }
      if (!v.dosage && v.sku) {
        // We shouldn't guess, but we need a valid ID. Ideally the DB would be updated.
        if (strengthId === 'unknown_strength' || strengthId === 'standard') {
            strengthId = `sku_${v.sku.toLowerCase()}`;
            rawStrength = v.sku;
        }
      }
    }

    // 2. Build Maps
    if (!supplierMap.has(supplierId)) {
      supplierMap.set(supplierId, {
        id: supplierId,
        name: v.supplierName || v.supplier || supplierId,
        formats: new Set(),
      });
    }

    if (!formatMap.has(formatId)) {
      formatMap.set(formatId, {
        id: formatId,
        name: rawFormat,
        strengths: new Set()
      });
    }

    if (!strengthMap.has(strengthId)) {
      strengthMap.set(strengthId, {
        id: strengthId,
        name: rawStrength
      });
    }

    // 3. Establish relationships
    supplierMap.get(supplierId).formats.add(formatId);
    formatMap.get(formatId).strengths.add(strengthId);

    // 4. Index the variant by the hierarchy: supplierId -> formatId -> strengthId
    const indexKey = `${supplierId}::${formatId}::${strengthId}`;
    if (!variantIndex[indexKey] || v.isPreferred) { // prioritize preferred if duplicates
        variantIndex[indexKey] = v;
    }
  });

  // Convert Sets to Arrays for serialization
  const suppliers = Array.from(supplierMap.values()).map(s => ({ ...s, formats: Array.from(s.formats) }));
  const formats = Array.from(formatMap.values()).map(f => ({ ...f, strengths: Array.from(f.strengths) }));
  const strengths = Array.from(strengthMap.values());

  return { suppliers, formats, strengths, variantIndex };
}
