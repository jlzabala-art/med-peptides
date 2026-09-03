/**
 * Clinical Image Resolver for Products (by Presentation/Variant) & Protocols (by Goal)
 * Strictly adheres to Atlas Health's clean pharmaceutical aesthetics.
 */

export const CLINICAL_PRODUCT_IMAGES = {
  vial_single: '/images/clinical/vial_single.jpg',
  pen_single_cartridge: '/images/clinical/pen_single_cartridge.jpg',
  pen_dual_chamber: '/images/clinical/pen_dual_chamber.jpg',
  cartridge_dual_chamber: '/images/clinical/cartridge_dual_chamber.jpg',
  subq_pen: '/images/clinical/pen_single_cartridge.jpg', // Alias for backward compatibility
  reusable_pen_device: '/images/clinical/reusable_pen_device.jpg',
  bulk_api_powder: '/images/clinical/bulk_api_powder.jpg',
  nasal_spray: '/images/clinical/nasal_spray.jpg',
  capsules_bottle: '/images/clinical/capsules_bottle.jpg',
  topical_serum: '/images/clinical/topical_serum.jpg'
};

export const CLINICAL_GOAL_IMAGES = {
  cognition: '/images/clinical/goal_cognition.jpg',
  longevity: '/images/clinical/goal_longevity.jpg',
  recovery: '/images/clinical/goal_recovery.jpg',
  metabolic: '/images/clinical/goal_metabolic.jpg',
  immunity: '/images/clinical/goal_immunity.jpg',
  hormonal: '/images/clinical/goal_hormonal.jpg',
  skin_hair: '/images/clinical/goal_skin_hair.jpg'
};

/**
 * Resolves the accurate pharmaceutical presentation image for a product variant.
 * Strictly adheres to single-unit pharmaceutical models (even when 10x tiers are selected).
 *
 * @param {Object|string} variantOrPresentation - Variant object or presentation string
 * @param {Object} [product] - Optional product parent object
 * @returns {string} Public URL of the clinical image
 */
export function resolveVariantClinicalImage(variantOrPresentation, product = {}) {
  const isRaw = (typeof variantOrPresentation === 'object' && (variantOrPresentation?.type === 'raw_material' || variantOrPresentation?.productType === 'raw_material' || variantOrPresentation?.format === 'bulk_api')) ||
                product?.type === 'raw_material' || 
                product?.primaryType === 'raw_material';

  const text = typeof variantOrPresentation === 'string' 
    ? variantOrPresentation 
    : `${variantOrPresentation?.presentation || ''} ${variantOrPresentation?.dosage || ''} ${variantOrPresentation?.format || ''} ${variantOrPresentation?.penConfig?.cartridgeType || ''} ${variantOrPresentation?.name || ''} ${product?.canonicalName || ''} ${product?.category || ''}`;
  
  const lower = text.toLowerCase();

  // 1. Bulk API / Raw Material Powder (Strict Mass/Weight)
  if (isRaw || lower.includes('bulk') || lower.includes('api') || lower.includes('raw powder') || lower.includes('granel')) {
    return CLINICAL_PRODUCT_IMAGES.bulk_api_powder;
  }

  // 2. Reusable Precision Pen Device (No Cartridge / Chassis Only)
  if (lower.includes('reusable') || lower.includes('device only') || lower.includes('injector device') || lower.includes('dispositivo')) {
    return CLINICAL_PRODUCT_IMAGES.reusable_pen_device;
  }

  // 3. Dual-Chamber / Double Cartridge Reconstitution Pen
  const isDualChamber = lower.includes('double cartridge') || 
                        lower.includes('double') || 
                        lower.includes('dual-chamber') || 
                        lower.includes('dual chamber') || 
                        lower.includes('doble') ||
                        lower.includes('bypass') ||
                        lower.includes('reconstitution pen');

  if (isDualChamber) {
    if (lower.includes('cartridge only') || lower.includes('refill') || lower.includes('recambio')) {
      return CLINICAL_PRODUCT_IMAGES.cartridge_dual_chamber;
    }
    return CLINICAL_PRODUCT_IMAGES.pen_dual_chamber;
  }

  // 4. Standalone Cartridges (Single & Dual)
  if (lower.includes('cartridge') && (lower.includes('only') || lower.includes('refill') || lower.includes('recambio'))) {
    return CLINICAL_PRODUCT_IMAGES.cartridge_dual_chamber;
  }

  // 5. Single Cartridge Prefilled Injection Pen (Standard Aqueous Liquid)
  if (lower.includes('pen') || lower.includes('cartridge') || lower.includes('autoinject') || lower.includes('pluma')) {
    return CLINICAL_PRODUCT_IMAGES.pen_single_cartridge;
  }

  // 6. Metered Nasal Spray
  if (lower.includes('spray') || lower.includes('nasal') || lower.includes('pulveriz')) {
    return CLINICAL_PRODUCT_IMAGES.nasal_spray;
  }

  // 7. Oral Capsules / Tablets / Pellets
  if (lower.includes('capsule') || lower.includes('cápsul') || lower.includes('tablet') || lower.includes('pellet') || lower.includes('oral')) {
    return CLINICAL_PRODUCT_IMAGES.capsules_bottle;
  }

  // 8. Topical Serum / Cosmetic Cream
  if (lower.includes('topical') || lower.includes('serum') || lower.includes('cream') || lower.includes('crema') || lower.includes('gel') || lower.includes('lotion')) {
    return CLINICAL_PRODUCT_IMAGES.topical_serum;
  }

  // 9. Default: Pristine Single Borosilicate Lyophilized Vial (Always 1 unit representation)
  return CLINICAL_PRODUCT_IMAGES.vial_single;
}

/**
 * Resolves the accurate medical biology illustration for a protocol by its Goal/Target System.
 * @param {Object|string} protocolOrGoal - Protocol object or goal string
 * @returns {string} Public URL of the clinical protocol goal image
 */
export function resolveProtocolClinicalImage(protocolOrGoal) {
  const text = typeof protocolOrGoal === 'string'
    ? protocolOrGoal
    : `${protocolOrGoal?.goal || ''} ${protocolOrGoal?.targetSystem || ''} ${protocolOrGoal?.title || ''} ${protocolOrGoal?.category || ''}`;
  
  const lower = text.toLowerCase();

  if (lower.includes('cognit') || lower.includes('brain') || lower.includes('mood') || lower.includes('neuro') || lower.includes('semax') || lower.includes('selank')) {
    return CLINICAL_GOAL_IMAGES.cognition;
  }

  if (lower.includes('longev') || lower.includes('aging') || lower.includes('anti-aging') || lower.includes('telomer') || lower.includes('nad') || lower.includes('epithalon')) {
    return CLINICAL_GOAL_IMAGES.longevity;
  }

  if (lower.includes('recov') || lower.includes('repair') || lower.includes('tissue') || lower.includes('muscle') || lower.includes('joint') || lower.includes('bpc') || lower.includes('tb-500')) {
    return CLINICAL_GOAL_IMAGES.recovery;
  }

  if (lower.includes('metabol') || lower.includes('weight') || lower.includes('fat') || lower.includes('glucose') || lower.includes('glp') || lower.includes('semaglutide') || lower.includes('tirzepatide')) {
    return CLINICAL_GOAL_IMAGES.metabolic;
  }

  if (lower.includes('immun') || lower.includes('thym') || lower.includes('t-cell') || lower.includes('ta1') || lower.includes('kpv') || lower.includes('infection')) {
    return CLINICAL_GOAL_IMAGES.immunity;
  }

  if (lower.includes('hormon') || lower.includes('growth hormone') || lower.includes('gh') || lower.includes('hpta') || lower.includes('cjc') || lower.includes('ipamorelin') || lower.includes('secretagogue')) {
    return CLINICAL_GOAL_IMAGES.hormonal;
  }

  if (lower.includes('skin') || lower.includes('hair') || lower.includes('dermatol') || lower.includes('collagen') || lower.includes('ghk') || lower.includes('mt2') || lower.includes('tanning')) {
    return CLINICAL_GOAL_IMAGES.skin_hair;
  }

  return CLINICAL_GOAL_IMAGES.longevity;
}
