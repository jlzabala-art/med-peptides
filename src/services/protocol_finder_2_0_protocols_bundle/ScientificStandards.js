 
/**
 * ScientificStandards.js
 * 
 * Centralized registry for scientific data standards across all protocols.
 * Used by audit scripts to ensure unit consistency and terminology accuracy.
 */

export const SCIENTIFIC_STANDARDS = {
  units: {
    PEPTIDES: ['mcg', 'mg', 'IU'],
    SUPPLEMENTS: ['mg', 'g', 'mcg', 'IU', 'capsule', 'tablet'],
  },
  
  dosage_forms: {
    INJECTABLE: 'vial',
    NASAL: 'nasal spray',
    ORAL: 'capsules', // or 'tablets'
    TOPICAL: 'cream',
  },
  
  // Mapping of Product ID to its standard clinical parameters
  registry: {
    // Peptides
    'bpc-157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'bpc157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'tb-500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'ipamorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc-1295-no-dac': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc1295': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tesamorelin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [10] },
    'sermorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tirzepatide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [15, 30, 60] },
    'semaglutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'retatrutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10, 20] },
    'cagrilintide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'aod-9604': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ghk-cu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'ghkcu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'mot-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'motsc': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'mots-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'ss-31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'ss31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'elamipretide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'nad-plus': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 500, stability_weeks: 4, available_vial_sizes: [500, 1000] },
    'foxo4-dri': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'epitalon': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50, 100] },
    'dsip': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'thymalin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'thymosin-alpha-1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ta1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tb-4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'kisspeptin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'gonadorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 10] },
    'selank': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    'semax': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    
    // Oral Peptides (Exceptions)
    'bpc-157-oral': { unit: 'mcg', route: 'oral', form: 'capsules', available_vial_sizes: [0.250] }, // 250mcg per tablet
    
    // Supplements (Common)
    'vitamin-d3': { unit: 'IU', route: 'oral', form: 'capsules' },
    'magnesium-threonate': { unit: 'mg', route: 'oral', form: 'capsules' },
    'berberine': { unit: 'mg', route: 'oral', form: 'capsules' },
    'omega-3': { unit: 'mg', route: 'oral', form: 'capsules' },
    'nac': { unit: 'mg', route: 'oral', form: 'capsules' },
    'coq10': { unit: 'mg', route: 'oral', form: 'capsules' },
  }
};

/**
 * Normalizes units and terminology based on the registry.
 * @param {string} productId 
 * @param {object} currentData 
 * @returns {object} The corrected/standardized data
 */
export function standardizeData(productId, currentData = {}) {
  const cleanId = productId.toLowerCase().replace('prd_', '');
  const standard = SCIENTIFIC_STANDARDS.registry[cleanId];
  if (!standard) return currentData;
  
  const updated = { ...currentData };
  
  // Apply standard unit if missing or mismatched
  if (standard.unit && updated.dose_unit !== standard.unit) {
    updated.dose_unit = standard.unit;
  }
  
  // Apply standard form based on route
  if (standard.form) {
    updated.dosage_form = standard.form;
  }
  
  if (standard.route) {
    updated.route = standard.route;
  }
  
  // Inject scientific metadata
  updated.stability_weeks = standard.stability_weeks || 4;
  updated.available_vial_sizes = standard.available_vial_sizes || [];
  
  return updated;
}
