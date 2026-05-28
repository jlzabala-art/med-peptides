 
/**
 * productEnricher.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches normalized v2 products with data from external JSON sources
 * (clinicalData.json, researchData.json, safetyData.json).
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Enriches a normalized product object with scientific, research, and safety data.
 *
 * @param {Object} product - The canonical v2 product object to enrich.
 * @param {Object} enrichmentSources - Map of product names to enrichment data.
 * @returns {Object} - The enriched product object (mutated for efficiency in migration).
 */
export function enrichProduct(product, enrichmentSources) {
  const name = product.name;
  const data = enrichmentSources[name] || findBySynonym(product, enrichmentSources);

  if (!data) return product;

  const { clinical, research, safety } = data;

  // ── Science Block ────────────────────────────────────────────────────────
  if (clinical) {
    if (clinical.scientificName) product.science.scientificName = clinical.scientificName;
    if (clinical.molecular_weight) product.science.molecularWeight = clinical.molecular_weight;
    if (clinical.molecular_formula) product.science.molecularFormula = clinical.molecular_formula;

    if (clinical.pharmacokinetics) {
      product.science.pharmacokinetics = {
        halfLife:        clinical.pharmacokinetics.half_life        || '',
        bioavailability: clinical.pharmacokinetics.bioavailability || '',
        route:           Array.isArray(clinical.pharmacokinetics.route) ? clinical.pharmacokinetics.route : [],
        metabolism:      clinical.pharmacokinetics.metabolism      || '',
      };
    }

    if (clinical.storage_conditions) {
      product.science.storageConditions = {
        temperature: clinical.storage_conditions.temperature || '',
        light:       clinical.storage_conditions.light       || '',
        shelfLife:   clinical.storage_conditions.shelf_life   || '',
      };
    }

    if (Array.isArray(clinical.mechanisms)) {
      // Merge unique mechanisms
      const existing = new Set(product.science.mechanisms);
      clinical.mechanisms.forEach(m => existing.add(m));
      product.science.mechanisms = Array.from(existing);
    }
  }

  if (research) {
    if (research.research_status) product.science.researchStatus = research.research_status;
    if (Array.isArray(research.reference_pmids)) {
      product.science.referencePmids = research.reference_pmids;
    }
  }

  if (safety) {
    if (safety.safetyNote) product.science.safetyNote = safety.safetyNote;
    if (Array.isArray(safety.contraindications)) {
      product.science.contraindications = safety.contraindications;
    }
  }

  // ── AI Content Block ──────────────────────────────────────────────────────
  // Use clinical mechanisms to build a scientific summary if missing
  if (clinical?.mechanisms && !product.aiContent.scientificSummary) {
    product.aiContent.scientificSummary = clinical.mechanisms.join(' ');
  }

  return product;
}

/**
 * Tries to find enrichment data by checking synonyms if the main name doesn't match.
 */
function findBySynonym(product, enrichmentSources) {
  const synonyms = product.identity?.synonyms || [];
  for (const syn of synonyms) {
    if (enrichmentSources[syn]) return enrichmentSources[syn];
  }
  return null;
}
