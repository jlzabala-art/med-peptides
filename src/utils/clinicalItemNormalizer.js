/**
 * src/utils/clinicalItemNormalizer.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Normalizador universal de compuestos clínicos para el Workspace.
 * Unifica elementos procedentes de Catálogo, Protocolos, Prescripciones y Fagron
 * garantizando integridad tipológica y protegiendo datos financieros según el rol.
 */

/**
 * Normaliza cualquier ítem o compuesto para ser añadido al Workspace.
 * 
 * @param {Object} rawItem - Objeto del compuesto original
 * @param {string} sourceType - 'catalog' | 'protocol' | 'prescription' | 'fagron' | 'manual'
 * @param {Object} options - { isDoctor: boolean, defaultQuantity?: number, context?: Object }
 * @returns {Object} Compuesto normalizado para el Workspace
 */
export function normalizeWorkspaceItem(rawItem = {}, sourceType = 'catalog', options = {}) {
  const { isDoctor = false, defaultQuantity = 1, context = {} } = options;
  
  const v0 = rawItem.variants?.[0] || rawItem.variant || {};

  // Resolución robusta de precio unitario
  const rawUnitPrice = Number(
    rawItem.unitPrice || rawItem.price || rawItem.unitRate || rawItem.rate || rawItem.unit_price ||
    v0.resolvedPrice?.perUnit || v0.unitPrice || v0.price || v0.tier1Price || v0.tier1_price || v0.retailPrice ||
    rawItem.pricing?.retailPrice || rawItem.pricing?.tier1Price || rawItem.tier1_price || rawItem.tier1Price || rawItem.retailPrice || 0
  );

  // Resolución de coste de proveedor (OCULTO si es médico)
  const rawCost = Number(
    rawItem.supplierCost || rawItem.costPrice || rawItem.supplier_cost || v0.supplierCost || rawItem.pricing?.supplierCost || 0
  );

  // Formato y dosificación
  const format = rawItem.format || rawItem.dosage_form || v0.format || 'Vial';
  const dosage = rawItem.dosage || rawItem.dose || rawItem.weekly_dose || v0.dosage || 'Standard';

  // Identificadores limpios
  const productId = rawItem.productId || rawItem.id || v0.productId || `prod_${Date.now()}`;
  const variantId = rawItem.variantId || v0.id || productId;
  const canonicalName = rawItem.canonicalName || rawItem.name || rawItem.productName || rawItem.product_title || rawItem.title || 'Clinical Compound';

  return {
    id: rawItem.id && String(rawItem.id).startsWith('ws_') ? rawItem.id : `ws_${productId}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    productId,
    variantId,
    canonicalName,
    sku: rawItem.sku || v0.sku || '',
    dosage,
    format,
    quantity: Math.max(1, parseInt(rawItem.quantity || defaultQuantity, 10) || 1),
    unitPrice: isNaN(rawUnitPrice) ? 0 : rawUnitPrice,
    price: isNaN(rawUnitPrice) ? 0 : rawUnitPrice,
    unitRate: isNaN(rawUnitPrice) ? 0 : rawUnitPrice,
    // REGLA DE ORO: Los costes de compra están 100% en cero si el usuario es médico
    supplierCost: isDoctor ? 0 : (isNaN(rawCost) ? 0 : rawCost),
    supplierName: isDoctor ? '' : (rawItem.supplierName || 'Pharmapolis Ltd'),
    category: rawItem.category || rawItem.therapeutic_category || 'Clinical Peptides',
    sourceType,
    // Metadatos de prescripción/paciente si existen
    patientId: rawItem.patientId || context.patientId || '',
    patientName: rawItem.patientName || context.patientName || '',
    prescriptionId: rawItem.prescriptionId || context.prescriptionId || '',
    protocolId: rawItem.protocolId || context.protocolId || '',
    protocolName: rawItem.protocolName || context.protocolName || '',
    instructions: rawItem.instructions || rawItem.generalNotes || '',
    // Volumen de dilución si aplica a inyectables
    reconstitutionVolumeMl: rawItem.reconstitutionVolumeMl || (format.toLowerCase().includes('vial') ? 2 : null)
  };
}

/**
 * Normaliza un lote de compuestos de forma homogénea.
 */
export function normalizeWorkspaceItemsBatch(rawItems = [], sourceType = 'catalog', options = {}) {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map(item => normalizeWorkspaceItem(item, sourceType, options));
}

export const normalizeWorkspaceItemList = (rawItems = [], options = {}) => {
  const isDoctor = options.role === 'doctor' || options.isDoctor;
  return normalizeWorkspaceItemsBatch(rawItems, options.sourceType || 'catalog', { ...options, isDoctor });
};

